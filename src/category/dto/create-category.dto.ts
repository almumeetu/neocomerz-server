import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
    default: 'New Category',
    required: true
  })
  name: string;

  @ApiProperty({
    description: 'Category slug for URL',
    example: 'electronics',
    default: 'new-category',
    required: true
  })
  slug: string;

  @ApiProperty({
    description: 'Parent category ID for nested categories',
    example: '1',
    required: false,
    nullable: true
  })
  parentId?: string;
}