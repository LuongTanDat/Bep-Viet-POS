import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NguonDon, TrangThaiDon, VaiTroNguoiDung } from '../entities';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

class DongMonDto {
  @IsString() monId!: string;
  @IsInt() @Min(1) soLuong!: number;
  @IsOptional() @IsString() ghiChu?: string;
}
class TaoDonDto {
  @IsString() banId!: string;
  @IsEnum(NguonDon) nguon!: NguonDon;
  @IsArray() @ValidateNested({ each: true }) @Type(() => DongMonDto) chiTiet!: DongMonDto[];
  @IsOptional() @IsString() ghiChu?: string;
}
class DoiTrangThaiDonDto {
  @IsEnum(TrangThaiDon) trangThai!: TrangThaiDon;
  @IsOptional() @IsInt() phienBanKyVong?: number;
}
class ChuyenDonDto { @IsString() banNguonId!: string; @IsString() banDichId!: string; }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('don-hang')
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.BEP, VaiTroNguoiDung.THU_NGAN)
  danhSach() { return this.service.danhSach(); }

  @Get(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.BEP, VaiTroNguoiDung.THU_NGAN)
  lay(@Param('id') id: string) { return this.service.layTheoId(id); }

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.THU_NGAN)
  tao(@Body() dto: TaoDonDto, @Req() req: any) {
    return this.service.taoDon(dto.banId, dto.nguon, dto.chiTiet, dto.ghiChu, req.user?.sub);
  }

  @Patch(':id/trang-thai')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.BEP, VaiTroNguoiDung.THU_NGAN)
  doiTrangThai(@Param('id') id: string, @Body() dto: DoiTrangThaiDonDto) {
    return this.service.doiTrangThai(id, dto.trangThai, dto.phienBanKyVong);
  }

  @Post('chuyen-ban')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU)
  chuyenBan(@Body() dto: ChuyenDonDto) {
    return this.service.chuyenDonTheoBan(dto.banNguonId, dto.banDichId);
  }
}
