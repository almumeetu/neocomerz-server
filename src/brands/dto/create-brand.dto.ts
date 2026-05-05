import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrandDto {
    @ApiProperty({ description: 'Brand Name' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Brand Slug' })
    @IsString()
    @IsNotEmpty()
    slug: string;

    @ApiProperty({ description: 'Brand Logo URL' })
    @IsString()
    @IsNotEmpty()
    logoUrl: string;
}
