import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { NguoiDung, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

class TaoNguoiDungDto {
  @IsString() tenDangNhap!: string;
  @IsString() hoTen!: string;
  @IsString() @MinLength(6) matKhau!: string;
  @IsEnum(VaiTroNguoiDung) vaiTro!: VaiTroNguoiDung;
}

class SuaNguoiDungDto {
  @IsOptional() @IsString() hoTen?: string;
  @IsOptional() @IsEnum(VaiTroNguoiDung) vaiTro?: VaiTroNguoiDung;
  @IsOptional() @IsBoolean() dangHoatDong?: boolean;
  @IsOptional() @IsString() @MinLength(6) matKhauMoi?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nguoi-dung')
export class UsersController {
  constructor(@InjectRepository(NguoiDung) private readonly repo: Repository<NguoiDung>) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY)
  async danhSach() {
    const ds = await this.repo.find({ order: { taoLuc: 'DESC' } });
    return ds.map(({ matKhauBam, ...nguoiDung }) => nguoiDung);
  }

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN)
  async tao(@Body() dto: TaoNguoiDungDto) {
    const nguoiDung = this.repo.create({
      tenDangNhap: dto.tenDangNhap,
      hoTen: dto.hoTen,
      matKhauBam: await bcrypt.hash(dto.matKhau, 10),
      vaiTro: dto.vaiTro,
    });
    const daLuu = await this.repo.save(nguoiDung);
    const { matKhauBam, ...ketQua } = daLuu;
    return ketQua;
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  async sua(@Param('id') id: string, @Body() dto: SuaNguoiDungDto) {
    const nguoiDung = await this.repo.findOneByOrFail({ id });
    if (dto.hoTen !== undefined) nguoiDung.hoTen = dto.hoTen;
    if (dto.vaiTro !== undefined) nguoiDung.vaiTro = dto.vaiTro;
    if (dto.dangHoatDong !== undefined) nguoiDung.dangHoatDong = dto.dangHoatDong;
    if (dto.matKhauMoi) nguoiDung.matKhauBam = await bcrypt.hash(dto.matKhauMoi, 10);
    const daLuu = await this.repo.save(nguoiDung);
    const { matKhauBam, ...ketQua } = daLuu;
    return ketQua;
  }
}
