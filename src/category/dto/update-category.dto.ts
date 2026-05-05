import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @ApiProperty({
        description: 'Updated category name',
        example: 'Updated Electronics',
        required: false
    })
    name?: string;

    @ApiProperty({
        description: 'Updated category slug for URL',
        example: 'updated-electronics',
        required: false
    })
    slug?: string;

    @ApiProperty({
        description: 'Updated parent category ID for nested categories',
        example: '2',
        required: false,
        nullable: true
    })
    parentId?: string;
}
