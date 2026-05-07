import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category data to create',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    console.log('Hello Create category api', createCategoryDto)
    return this.categoryService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update category by ID' })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Category data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or category ID',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
