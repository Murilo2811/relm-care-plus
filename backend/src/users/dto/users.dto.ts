import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  storeId?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
