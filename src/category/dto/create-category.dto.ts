import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    default: 'New Category',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category slug for URL',
    example: 'electronics',
    default: 'new-category',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Parent category ID for nested categories',
    example: '1',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}