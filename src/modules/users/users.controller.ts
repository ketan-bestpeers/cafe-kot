import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, Role } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Create a new user account',
    description:
      'Enables administrators and managers to create user accounts. Managers can only create staff roles (Chef, Waiter, Cashier).',
  })
  @ApiCreatedResponse({
    description: 'User has been successfully created.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiConflictResponse({ description: 'Email address is already in use.' })
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() creator: User,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, creator);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Get all user accounts',
    description:
      'Retrieves a list of all active user accounts. Restricted to Admins and Managers.',
  })
  @ApiOkResponse({
    description: 'List of users returned.',
    type: [UserResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user account by ID',
    description:
      'Retrieves user details. Users can retrieve their own profiles. Admins and Managers can retrieve any profile.',
  })
  @ApiOkResponse({
    description: 'User details returned.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({ description: 'Access denied.' })
  @ApiNotFoundResponse({ description: 'User not found.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<UserResponseDto> {
    if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.MANAGER &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user account details',
    description:
      'Enables users to edit their own profile info/passwords. Admins and Managers can update any profile (with hierarchy constraints).',
  })
  @ApiOkResponse({
    description: 'User profile updated.',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role or hierarchy restrictions.',
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiConflictResponse({ description: 'Email address is already in use.' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() updater: User,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, updater);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user account (Soft Delete)',
    description:
      'Soft-deletes a user account. Managers cannot delete Admins/Managers. Admins cannot delete their own final account.',
  })
  @ApiOkResponse({ description: 'User successfully deleted.' })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to hierarchy constraints.',
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  remove(@Param('id') id: string, @CurrentUser() deleter: User): Promise<void> {
    return this.usersService.remove(id, deleter);
  }
}
