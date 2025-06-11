import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterUserDto } from '../../common/dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../../common/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // This endpoint is protected for admin access only
  @Post('register')
  @UseGuards(JwtAuthGuard)
  async register(@Body() registerDto: RegisterUserDto, @Req() req: any) {
    // Check if requesting user is admin
    if (req.user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized: Only admin can register new users');
    }
    
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    return req.user;
  }
}
