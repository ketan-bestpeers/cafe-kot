import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
} from '@nestjs/terminus';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

class HealthCheckResultDto {
  @ApiProperty({
    example: 'ok',
    description:
      'The overall health status ("ok", "error", or "shutting_down")',
  })
  status: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Details of the healthy indicators',
  })
  info?: any;

  @ApiPropertyOptional({
    type: Object,
    description: 'Details of the unhealthy indicators',
  })
  error?: any;

  @ApiProperty({
    type: Object,
    description: 'Detailed health status map of all indicators',
  })
  details: any;
}

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Get API health status',
    description:
      'Checks the health of the application.',
  })
  @ApiOkResponse({
    description: 'Application is healthy',
    type: HealthCheckResultDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Application is unhealthy',
    type: HealthCheckResultDto,
  })
  getHealth() {
    return this.health.check([]);
  }
}
