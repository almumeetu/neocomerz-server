import { ApiProperty } from "@nestjs/swagger";

export class CategoryResponseDto {
    @ApiProperty({
        description: 'Category Name'
    })
    name: string;

    @ApiProperty({ description: 'Slug' })
    slug: string;

    @ApiProperty({ description: 'Parent ID', nullable: true })
    parentId?: string;
}
