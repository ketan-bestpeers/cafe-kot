import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
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
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponResponseDto } from './dto/coupon-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new coupon',
    description:
      'Creates a discount coupon code with FLAT or PERCENTAGE value.',
  })
  @ApiCreatedResponse({
    description: 'Coupon created successfully.',
    type: CouponResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Coupon code already exists or invalid input data.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  create(@Body() createCouponDto: CreateCouponDto): Promise<CouponResponseDto> {
    return this.couponsService.create(createCouponDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all coupons',
    description: 'Retrieves a list of all discount coupons.',
  })
  @ApiOkResponse({
    description: 'List of coupons returned.',
    type: [CouponResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  findAll(): Promise<CouponResponseDto[]> {
    return this.couponsService.findAll();
  }

  @Get(':code/validate')
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.WAITER)
  @ApiOperation({
    summary: 'Validate a coupon code',
    description:
      'Checks if a coupon is valid (exists, active, and not expired) and returns its details.',
  })
  @ApiOkResponse({
    description: 'Coupon is valid and returned.',
    type: CouponResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Coupon is inactive or expired.',
  })
  @ApiNotFoundResponse({
    description: 'Coupon not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is missing or invalid.',
  })
  validate(@Param('code') code: string): Promise<CouponResponseDto> {
    return this.couponsService
      .validateCoupon(code)
      .then((c) => CouponResponseDto.fromEntity(c));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Delete a coupon',
    description: 'Soft deletes the coupon by its unique ID.',
  })
  @ApiOkResponse({
    description: 'Coupon deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Coupon not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.couponsService.remove(id);
  }
}
