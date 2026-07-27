import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { TableQueryDto } from './dto/table-query.dto';
import { TableResponseDto } from './dto/table-response.dto';
import { PaginatedTablesDto } from './dto/paginated-tables.dto';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<TableResponseDto> {
    const trimmedNumber = createTableDto.number.trim();

    // Check table number uniqueness case-insensitively (including soft-deleted items)
    const existingTable = await this.tableRepository.findOne({
      where: { number: ILike(trimmedNumber) },
      withDeleted: true,
    });

    if (existingTable) {
      throw new ConflictException('A table with this number already exists');
    }

    const table = this.tableRepository.create({
      number: trimmedNumber,
      capacity: createTableDto.capacity,
      status: createTableDto.status ?? TableStatus.AVAILABLE,
      section: createTableDto.section ? createTableDto.section.trim() : null,
    });

    const savedTable = await this.tableRepository.save(table);
    return TableResponseDto.fromEntity(savedTable);
  }

  async findAll(queryDto: TableQueryDto): Promise<PaginatedTablesDto> {
    const {
      page,
      limit,
      search,
      status,
      section,
      minCapacity,
      sortBy,
      sortOrder,
    } = queryDto;

    const queryBuilder = this.tableRepository.createQueryBuilder('table');

    if (search) {
      queryBuilder.andWhere('table.number ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('table.status = :status', { status });
    }

    if (section) {
      queryBuilder.andWhere('table.section ILIKE :section', {
        section: `%${section.trim()}%`,
      });
    }

    if (minCapacity) {
      queryBuilder.andWhere('table.capacity >= :minCapacity', { minCapacity });
    }

    const validSortFields = ['number', 'capacity', 'createdAt'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'number';
    queryBuilder.orderBy(`table.${orderField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: TableResponseDto.fromEntities(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<TableResponseDto> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    return TableResponseDto.fromEntity(table);
  }

  async update(
    id: string,
    updateTableDto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }

    if (updateTableDto.number) {
      const trimmedNumber = updateTableDto.number.trim();
      if (trimmedNumber.toLowerCase() !== table.number.toLowerCase()) {
        const nameTaken = await this.tableRepository.findOne({
          where: { number: ILike(trimmedNumber) },
          withDeleted: true,
        });

        if (nameTaken) {
          throw new ConflictException(
            'A table with this number already exists',
          );
        }
        table.number = trimmedNumber;
      }
    }

    if (updateTableDto.capacity !== undefined) {
      table.capacity = updateTableDto.capacity;
    }

    if (updateTableDto.section !== undefined) {
      table.section = updateTableDto.section
        ? updateTableDto.section.trim()
        : null;
    }

    const updatedTable = await this.tableRepository.save(table);
    return TableResponseDto.fromEntity(updatedTable);
  }

  async updateStatus(
    id: string,
    updateTableStatusDto: UpdateTableStatusDto,
  ): Promise<TableResponseDto> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }

    table.status = updateTableStatusDto.status;
    const updatedTable = await this.tableRepository.save(table);
    return TableResponseDto.fromEntity(updatedTable);
  }

  async remove(id: string): Promise<void> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID "${id}" not found`);
    }
    await this.tableRepository.softDelete(id);
  }
}
