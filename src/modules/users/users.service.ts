import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async create(
    createUserDto: CreateUserDto,
    creator: User,
  ): Promise<UserResponseDto> {
    // Role Hierarchy Checks
    if (creator.role === Role.MANAGER) {
      if (
        createUserDto.role === Role.ADMIN ||
        createUserDto.role === Role.MANAGER
      ) {
        throw new ForbiddenException(
          'Managers are not authorized to create Admin or Manager accounts',
        );
      }
    } else if (creator.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create users',
      );
    }

    // Check email uniqueness
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase() },
      withDeleted: true,
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(createUserDto.password);

    // Save entity
    const user = this.userRepository.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return UserResponseDto.fromEntities(users);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return UserResponseDto.fromEntity(user);
  }

  async findRawById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updater: User,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Hierarchy check
    if (updater.role === Role.MANAGER) {
      // Manager cannot update Admin or other Manager accounts
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        throw new ForbiddenException(
          'Managers cannot update Administrator or Manager accounts',
        );
      }
      // Manager cannot escalate a user to Admin or Manager roles
      if (
        updateUserDto.role &&
        (updateUserDto.role === Role.ADMIN ||
          updateUserDto.role === Role.MANAGER)
      ) {
        throw new ForbiddenException(
          'Managers cannot assign Admin or Manager roles',
        );
      }
    } else if (updater.role !== Role.ADMIN) {
      // Regular users/staff can only update themselves
      if (updater.id !== id) {
        throw new ForbiddenException('You can only update your own profile');
      }
      // Regular users/staff cannot change their own roles or active status
      if (updateUserDto.role || updateUserDto.isActive !== undefined) {
        throw new ForbiddenException(
          'You are not authorized to update user roles or activation status',
        );
      }
    }

    // Email check
    if (
      updateUserDto.email &&
      updateUserDto.email.toLowerCase() !== user.email
    ) {
      const emailTaken = await this.userRepository.findOne({
        where: { email: updateUserDto.email.toLowerCase() },
        withDeleted: true,
      });
      if (emailTaken) {
        throw new ConflictException('A user with this email already exists');
      }
      user.email = updateUserDto.email.toLowerCase();
    }

    // Full name update
    if (updateUserDto.fullName) {
      user.fullName = updateUserDto.fullName;
    }

    // Password update
    if (updateUserDto.password) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    // Role update
    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    // Active status update
    if (updateUserDto.isActive !== undefined) {
      user.isActive = updateUserDto.isActive;
    }

    const updatedUser = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(updatedUser);
  }

  async remove(id: string, deleter: User): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Hierarchy check
    if (deleter.role === Role.MANAGER) {
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        throw new ForbiddenException(
          'Managers cannot delete Admin or Manager accounts',
        );
      }
    } else if (deleter.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }

    // Prevent deleting self if last admin
    if (deleter.id === id) {
      if (deleter.role === Role.ADMIN) {
        const adminsCount = await this.userRepository.count({
          where: { role: Role.ADMIN },
        });
        if (adminsCount <= 1) {
          throw new ForbiddenException(
            'Cannot delete the last Administrator account in the system',
          );
        }
      }
    }

    await this.userRepository.softDelete(id);
  }
}
