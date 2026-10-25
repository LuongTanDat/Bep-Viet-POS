import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class DangNhapDto {
  @IsString() tenDangNhap!: string;
  @IsString() @MinLength(4) matKhau!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('dang-nhap')
  dangNhap(@Body() dto: DangNhapDto) {
    return this.auth.dangNhap(dto.tenDangNhap, dto.matKhau);
  }

  @UseGuards(JwtAuthGuard)
  @Get('toi')
  toi(@Req() req: any) {
    return req.user;
  }
}
