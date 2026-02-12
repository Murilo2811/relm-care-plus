import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserQueryDto } from './dto/users.dto';

// Assuming you have an AuthGuard, add @UseGuards(JwtAuthGuard) here if needed
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }
}
