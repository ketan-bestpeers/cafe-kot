import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateTableDto {
  @ApiPropertyOptional({
    example: 'Table 1',
    description: 'Updated identifier or number of the dining table',
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Updated seating capacity of the dining table',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({
    example: 'Indoor',
    description: 'Updated section or location where the table is placed',
  })
  @IsOptional()
  @IsString()
  section?: string;
}
