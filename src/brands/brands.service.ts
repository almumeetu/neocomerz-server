import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) { }
  
  create(createBrandDto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: createBrandDto,
    });
  }

  findAll() {
    return this.prisma.brand.findMany();
  }

  findOne(id: number) {
    return this.prisma.brand.findUnique({
      where: {
        id : id.toString()
      },
    });
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return this.prisma.brand.update({
      where: {
        id: id.toString(),
      },
      data: updateBrandDto,
    });
  }

  remove(id: number) {
    return this.prisma.brand.delete({
      where: {
        id: id.toString(),
      },
    });
  }
}
