import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import {
  CreateProductDto,
  CreateProductMediaDto,
  CreateVariantDto,
  ProductQueryDto,
  UpdateProductDto,
  UpdateProductMediaDto,
  UpdateVariantDto,
} from './dto/product.dto';

const productInclude = {
  brand: true,
  category: true,
  unit: true,
  media: { include: { media: true }, orderBy: { sortOrder: 'asc' as const } },
  variants: { include: { attributes: { include: { attributeValue: true } } } },
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateProductDto) {
    await this.ensureBrandCategoryAndUnit(dto.brandId, dto.categoryId, dto.unitId);
    return this.prisma.product.create({
      data: dto,
      include: productInclude,
    });
  }

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.brandId) where.brandId = query.brandId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: productInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: productInclude,
    });
    if (!product) throw new NotFoundException(`Product with slug ${slug} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.brandId || dto.categoryId || dto.unitId) {
      const current = await this.prisma.product.findUniqueOrThrow({ where: { id } });
      await this.ensureBrandCategoryAndUnit(
        dto.brandId ?? current.brandId,
        dto.categoryId ?? current.categoryId,
        dto.unitId ?? (current as any).unitId,
      );
    }
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: productInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
    return { message: 'Product deleted successfully' };
  }

  async addMedia(productId: string, dto: CreateProductMediaDto, file: Express.Multer.File) {
    await this.findOne(productId);
    if (!file) throw new BadRequestException('Media file is required');

    const url = await this.uploadService.uploadFile(file, 'products');

    return this.prisma.$transaction(async (tx) => {
      if (dto.isFeatured) {
        await tx.productMedia.updateMany({
          where: { productId },
          data: { isFeatured: false },
        });
      }

      const media = await tx.media.create({
        data: {
          url,
          type: dto.type ?? 'image',
          provider: process.env.STORAGE_PROVIDER === 's3' ? 's3' : 'local',
        },
      });

      return tx.productMedia.create({
        data: {
          productId,
          mediaId: media.id,
          isFeatured: dto.isFeatured ?? false,
          sortOrder: dto.sortOrder ?? 0,
        },
        include: { media: true },
      });
    });
  }

  listMedia(productId: string) {
    return this.prisma.productMedia.findMany({
      where: { productId },
      include: { media: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateMedia(id: string, dto: UpdateProductMediaDto) {
    const existing = await this.prisma.productMedia.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Product media with ID ${id} not found`);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isFeatured) {
        await tx.productMedia.updateMany({
          where: { productId: existing.productId },
          data: { isFeatured: false },
        });
      }
      return tx.productMedia.update({
        where: { id },
        data: dto,
        include: { media: true },
      });
    });
  }

  async removeMedia(id: string) {
    const existing = await this.prisma.productMedia.findUnique({
      where: { id },
      include: { media: true },
    });
    if (!existing) throw new NotFoundException(`Product media with ID ${id} not found`);

    await this.prisma.productMedia.delete({ where: { id } });
    await this.prisma.media.delete({ where: { id: existing.mediaId } });
    await this.uploadService.deleteFile(existing.media.url);
    return { message: 'Product media deleted successfully' };
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.findOne(productId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId },
          data: { isDefault: false },
        });
      }

      return tx.productVariant.create({
        data: {
          sku: dto.sku,
          price: dto.price,
          cost: dto.cost,
          stockQuantity: dto.stockQuantity ?? 0,
          stockAlertThreshold: dto.stockAlertThreshold ?? 10,
          isDefault: dto.isDefault ?? false,
          productId,
          attributes: dto.attributeValueIds?.length
            ? {
                create: dto.attributeValueIds.map((attributeValueId) => ({
                  attributeValueId,
                })),
              }
            : undefined,
        },
        include: { attributes: { include: { attributeValue: true } } },
      });
    });
  }

  listVariants(productId: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      include: { attributes: { include: { attributeValue: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: true, attributes: { include: { attributeValue: true } } },
    });
    if (!variant) throw new NotFoundException(`Variant with ID ${id} not found`);
    return variant;
  }

  async updateVariant(id: string, dto: UpdateVariantDto) {
    const existing = await this.findVariant(id);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId: existing.productId },
          data: { isDefault: false },
        });
      }
      if (dto.attributeValueIds) {
        await tx.productVariantAttribute.deleteMany({ where: { variantId: id } });
      }
      return tx.productVariant.update({
        where: { id },
        data: {
          sku: dto.sku,
          price: dto.price,
          cost: dto.cost,
          stockQuantity: dto.stockQuantity,
          stockAlertThreshold: dto.stockAlertThreshold,
          isDefault: dto.isDefault,
          attributes: dto.attributeValueIds
            ? {
                create: dto.attributeValueIds.map((attributeValueId) => ({
                  attributeValueId,
                })),
              }
            : undefined,
        },
        include: { attributes: { include: { attributeValue: true } } },
      });
    });
  }

  async removeVariant(id: string) {
    await this.findVariant(id);
    await this.prisma.productVariant.delete({ where: { id } });
    return { message: 'Variant deleted successfully' };
  }

  private async ensureBrandCategoryAndUnit(brandId: string, categoryId: string, unitId?: string) {
    const [brand, category, unit] = await Promise.all([
      this.prisma.brand.findUnique({ where: { id: brandId } }),
      this.prisma.category.findUnique({ where: { id: categoryId } }),
      unitId ? (this.prisma as any).unit.findUnique({ where: { id: unitId } }) : null,
    ]);
    if (!brand) throw new BadRequestException(`Brand with ID ${brandId} not found`);
    if (!category) throw new BadRequestException(`Category with ID ${categoryId} not found`);
    if (unitId && !unit) throw new BadRequestException(`Unit with ID ${unitId} not found`);
  }
}
