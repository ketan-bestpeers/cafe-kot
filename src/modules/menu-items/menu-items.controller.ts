import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { PaginatedMenuItemsDto } from './dto/paginated-menu-items.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Menu Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new menu item',
    description:
      'Enables administrators and managers to create a new menu item. The name must be unique.',
  })
  @ApiCreatedResponse({
    description: 'Menu item has been successfully created.',
    type: MenuItemResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiConflictResponse({
    description: 'A menu item with this name already exists.',
  })
  create(
    @Body() createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all menu items (Paginated)',
    description:
      'Retrieves a list of all menu items matching query filters and search. Accessible by all authenticated roles.',
  })
  @ApiOkResponse({
    description: 'List of menu items returned with pagination metadata.',
    type: PaginatedMenuItemsDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  findAll(@Query() queryDto: MenuItemQueryDto): Promise<PaginatedMenuItemsDto> {
    return this.menuItemsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get menu item by ID',
    description:
      'Retrieves a menu item details by its UUID. Accessible by all authenticated roles.',
  })
  @ApiOkResponse({
    description: 'Menu item details returned.',
    type: MenuItemResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  findOne(@Param('id') id: string): Promise<MenuItemResponseDto> {
    return this.menuItemsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update menu item details',
    description:
      'Enables administrators and managers to update a menu item by its UUID.',
  })
  @ApiOkResponse({
    description: 'Menu item updated successfully.',
    type: MenuItemResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  @ApiConflictResponse({
    description: 'A menu item with this name already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete menu item (Soft Delete)',
    description:
      'Soft-deletes a menu item by its UUID. Restricted to Admins and Managers.',
  })
  @ApiOkResponse({ description: 'Menu item successfully deleted.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Menu item not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.menuItemsService.remove(id);
  }
}
