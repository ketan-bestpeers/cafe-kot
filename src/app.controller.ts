import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
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

class DatabaseHealthIndicatorResult {
  @ApiProperty({
    example: 'up',
    description: 'The status of the database connection',
  })
  status: string;
}

class HealthCheckInfo {
  @ApiProperty({
    type: DatabaseHealthIndicatorResult,
    description: 'Status of the database health indicator',
  })
  database: DatabaseHealthIndicatorResult;
}

class HealthCheckResultDto {
  @ApiProperty({
    example: 'ok',
    description:
      'The overall health status ("ok", "error", or "shutting_down")',
  })
  status: string;

  @ApiPropertyOptional({
    type: HealthCheckInfo,
    description: 'Details of the healthy indicators',
  })
  info?: HealthCheckInfo;

  @ApiPropertyOptional({
    type: Object,
    description: 'Details of the unhealthy indicators',
  })
  error?: any;

  @ApiProperty({
    type: HealthCheckInfo,
    description: 'Detailed health status map of all indicators',
  })
  details: HealthCheckInfo;
}

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Get API and database health status',
    description:
      'Checks the health of the application and its connection to the PostgreSQL database.',
  })
  @ApiOkResponse({
    description: 'Application and database are healthy',
    type: HealthCheckResultDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'Database or application is unhealthy',
    type: HealthCheckResultDto,
  })
  getHealth() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
