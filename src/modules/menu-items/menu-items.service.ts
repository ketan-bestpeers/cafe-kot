import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { PaginatedMenuItemsDto } from './dto/paginated-menu-items.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const trimmedName = createMenuItemDto.name.trim();

    // Check name uniqueness case-insensitively (including soft-deleted items)
    const existingItem = await this.menuItemRepository.findOne({
      where: { name: ILike(trimmedName) },
      withDeleted: true,
    });

    if (existingItem) {
      throw new ConflictException('A menu item with this name already exists');
    }

    const menuItem = this.menuItemRepository.create({
      name: trimmedName,
      description: createMenuItemDto.description,
      price: createMenuItemDto.price,
      isAvailable: createMenuItemDto.isAvailable ?? true,
    });

    const savedItem = await this.menuItemRepository.save(menuItem);
    return MenuItemResponseDto.fromEntity(savedItem);
  }

  async findAll(queryDto: MenuItemQueryDto): Promise<PaginatedMenuItemsDto> {
    const { page, limit, search, isAvailable, sortBy, sortOrder } = queryDto;

    const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem');

    if (search) {
      queryBuilder.andWhere(
        '(menuItem.name ILIKE :search OR menuItem.description ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (isAvailable !== undefined) {
      queryBuilder.andWhere('menuItem.isAvailable = :isAvailable', {
        isAvailable,
      });
    }

    // Dynamic sorting (sortBy is already restricted by IsIn in query DTO)
    const validSortFields = ['name', 'price', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`menuItem.${orderField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: MenuItemResponseDto.fromEntities(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<MenuItemResponseDto> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    return MenuItemResponseDto.fromEntity(item);
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }

    if (updateMenuItemDto.name) {
      const trimmedName = updateMenuItemDto.name.trim();
      if (trimmedName.toLowerCase() !== item.name.toLowerCase()) {
        const nameTaken = await this.menuItemRepository.findOne({
          where: { name: ILike(trimmedName) },
          withDeleted: true,
        });

        if (nameTaken) {
          throw new ConflictException(
            'A menu item with this name already exists',
          );
        }
        item.name = trimmedName;
      }
    }

    if (updateMenuItemDto.description !== undefined) {
      item.description = updateMenuItemDto.description;
    }

    if (updateMenuItemDto.price !== undefined) {
      item.price = updateMenuItemDto.price;
    }

    if (updateMenuItemDto.isAvailable !== undefined) {
      item.isAvailable = updateMenuItemDto.isAvailable;
    }

    const updatedItem = await this.menuItemRepository.save(item);
    return MenuItemResponseDto.fromEntity(updatedItem);
  }

  async remove(id: string): Promise<void> {
    const item = await this.menuItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Menu item with ID "${id}" not found`);
    }
    await this.menuItemRepository.softDelete(id);
  }
}
