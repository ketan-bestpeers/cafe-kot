import { ApiProperty } from '@nestjs/swagger';
import { Table, TableStatus } from '../entities/table.entity';

export class TableResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the table (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Table 1',
    description: 'Unique number/name of the dining table',
  })
  number: string;

  @ApiProperty({
    example: 4,
    description: 'Seating capacity of the table',
  })
  capacity: number;

  @ApiProperty({
    example: TableStatus.AVAILABLE,
    description: 'Current status of the table',
    enum: TableStatus,
  })
  status: TableStatus;

  @ApiProperty({
    example: 'Indoor',
    description: 'Section or location of the table',
    nullable: true,
  })
  section: string | null;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when the table was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when the table was last updated',
  })
  updatedAt: Date;

  static fromEntity(table: Table): TableResponseDto {
    if (!table) return null;
    const dto = new TableResponseDto();
    dto.id = table.id;
    dto.number = table.number;
    dto.capacity = table.capacity;
    dto.status = table.status;
    dto.section = table.section;
    dto.createdAt = table.createdAt;
    dto.updatedAt = table.updatedAt;
    return dto;
  }

  static fromEntities(tables: Table[]): TableResponseDto[] {
    return (tables || []).map((table) => TableResponseDto.fromEntity(table));
  }
}
