import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponResponseDto } from './dto/coupon-response.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto): Promise<CouponResponseDto> {
    const code = createCouponDto.code.trim().toUpperCase();

    // Check if code already exists (including soft-deleted codes, or we just look up active ones)
    const existing = await this.couponRepository.findOne({
      where: { code },
      withDeleted: true,
    });

    if (existing) {
      if (existing.deletedAt) {
        // If soft-deleted, restore it or throw error
        throw new BadRequestException(
          `Coupon code "${code}" already existed and was deleted. Please use another code.`,
        );
      }
      throw new BadRequestException(`Coupon code "${code}" already exists`);
    }

    const coupon = this.couponRepository.create({
      ...createCouponDto,
      code,
      expirationDate: createCouponDto.expirationDate
        ? new Date(createCouponDto.expirationDate)
        : null,
    });

    const saved = await this.couponRepository.save(coupon);
    return CouponResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<CouponResponseDto[]> {
    const coupons = await this.couponRepository.find();
    return CouponResponseDto.fromEntities(coupons);
  }

  async findByCode(code: string): Promise<CouponResponseDto> {
    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.couponRepository.findOne({
      where: { code: cleanCode },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${cleanCode}" not found`);
    }

    return CouponResponseDto.fromEntity(coupon);
  }

  async validateCoupon(code: string): Promise<Coupon> {
    const cleanCode = code.trim().toUpperCase();
    const coupon = await this.couponRepository.findOne({
      where: { code: cleanCode },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with code "${cleanCode}" not found`);
    }

    if (!coupon.isActive) {
      throw new BadRequestException(`Coupon "${cleanCode}" is inactive`);
    }

    if (coupon.expirationDate && new Date() > coupon.expirationDate) {
      throw new BadRequestException(`Coupon "${cleanCode}" has expired`);
    }

    return coupon;
  }

  async remove(id: string): Promise<void> {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    await this.couponRepository.softRemove(coupon);
  }
}
