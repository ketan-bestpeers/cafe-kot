import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the table (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  tableId: string;
}
