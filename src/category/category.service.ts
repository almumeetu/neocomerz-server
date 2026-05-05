import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../src/prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createCategoryDto: CreateCategoryDto) {
    const { parentId, ...data } = createCategoryDto;

    // If parentId is provided, validate that the parent category exists
    if (parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId }
      });

      if (!parentCategory) {
        throw new BadRequestException(`Parent category with ID ${parentId} not found`);
      }
    }

    return this.prisma.category.create({
      data: {
        ...data,
        parent: parentId ? {
          connect: { id: parentId }
        } : undefined
      }
    });
  }

  findAll() {
    return this.prisma.category.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          include: {
            children: true
          }
        }
      }
    })
  }

  findOne(id: number) {
    return this.prisma.category.findUnique({
      where: {
        id: id.toString()
      }
    })
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.prisma.category.update({
      where: {
        id: id.toString()
      },
      data: updateCategoryDto
    })
  }

  remove(id: number) {
    return this.prisma.category.delete({
      where: {
        id: id.toString()
      }
    })
  }
}
