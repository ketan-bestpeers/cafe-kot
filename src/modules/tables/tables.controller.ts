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
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { TableQueryDto } from './dto/table-query.dto';
import { TableResponseDto } from './dto/table-response.dto';
import { PaginatedTablesDto } from './dto/paginated-tables.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new table',
    description:
      'Enables administrators and managers to create a new dining table. The number/name must be unique.',
  })
  @ApiCreatedResponse({
    description: 'Table has been successfully created.',
    type: TableResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiConflictResponse({
    description: 'A table with this number already exists.',
  })
  create(@Body() createTableDto: CreateTableDto): Promise<TableResponseDto> {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tables (Paginated)',
    description:
      'Retrieves a list of all tables matching query filters and search. Accessible by all authenticated roles.',
  })
  @ApiOkResponse({
    description: 'List of tables returned with pagination metadata.',
    type: PaginatedTablesDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  findAll(@Query() queryDto: TableQueryDto): Promise<PaginatedTablesDto> {
    return this.tablesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get table by ID',
    description:
      'Retrieves table details by its UUID. Accessible by all authenticated roles.',
  })
  @ApiOkResponse({
    description: 'Table details returned.',
    type: TableResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiNotFoundResponse({ description: 'Table not found.' })
  findOne(@Param('id') id: string): Promise<TableResponseDto> {
    return this.tablesService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Update table details',
    description:
      'Enables administrators and managers to update a table by its UUID.',
  })
  @ApiOkResponse({
    description: 'Table updated successfully.',
    type: TableResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Table not found.' })
  @ApiConflictResponse({
    description: 'A table with this number already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<TableResponseDto> {
    return this.tablesService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({
    summary: 'Update table status',
    description:
      'Enables administrators, managers, and waiters to update the status of a table by its UUID.',
  })
  @ApiOkResponse({
    description: 'Table status updated successfully.',
    type: TableResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Table not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ): Promise<TableResponseDto> {
    return this.tablesService.updateStatus(id, updateTableStatusDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete table (Soft Delete)',
    description:
      'Soft-deletes a table by its UUID. Restricted to Admins and Managers.',
  })
  @ApiOkResponse({ description: 'Table successfully deleted.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Table not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.tablesService.remove(id);
  }
}
