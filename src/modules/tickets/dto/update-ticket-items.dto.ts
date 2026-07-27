import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTicketItemDto } from './create-ticket.dto';

export class UpdateTicketItemsDto {
  @ApiProperty({
    type: [CreateTicketItemDto],
    description: 'Updated list of menu items for this ticket',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketItemDto)
  items: CreateTicketItemDto[];
}
