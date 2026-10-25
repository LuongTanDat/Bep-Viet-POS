import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { BanNhaHang, DatBan, TrangThaiBan, TrangThaiDatBan, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

class TaoDatBanDto {
  @IsString() tenKhach!: string;
  @IsOptional() @IsString() soDienThoai?: string;
  @IsInt() @Min(1) soKhach!: number;
  @IsDateString() batDauLuc!: string;
  @IsOptional() @IsString() banId?: string;
  @IsOptional() @IsString() ghiChu?: string;
}
class CapNhatDatBanDto {
  @IsOptional() @IsEnum(TrangThaiDatBan) trangThai?: TrangThaiDatBan;
  @IsOptional() @IsString() banId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dat-ban')
export class BookingsController {
  constructor(
    @InjectRepository(DatBan) private readonly repo: Repository<DatBan>,
    @InjectRepository(BanNhaHang) private readonly banRepo: Repository<BanNhaHang>,
  ) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.THU_NGAN)
  danhSach() { return this.repo.find({ order: { batDauLuc: 'ASC' } }); }

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU)
  async tao(@Body() dto: TaoDatBanDto) {
    const dat = this.repo.create({
      tenKhach: dto.tenKhach,
      soDienThoai: dto.soDienThoai ?? '',
      soKhach: dto.soKhach,
      batDauLuc: new Date(dto.batDauLuc),
      ban_id: dto.banId ?? null,
      ghiChu: dto.ghiChu ?? '',
      trangThai: TrangThaiDatBan.DA_XAC_NHAN,
    });
    if (dto.banId) {
      const ban = await this.banRepo.findOneBy({ id: dto.banId });
      if (ban) { ban.trangThai = TrangThaiBan.DA_DAT; await this.banRepo.save(ban); }
    }
    return this.repo.save(dat);
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU)
  async capNhat(@Param('id') id: string, @Body() dto: CapNhatDatBanDto) {
    const dat = await this.repo.findOneByOrFail({ id });
    if (dto.trangThai) dat.trangThai = dto.trangThai;
    if (dto.banId !== undefined) dat.ban_id = dto.banId;
    if (dto.trangThai === TrangThaiDatBan.DA_NHAN_BAN && dat.ban_id) {
      const ban = await this.banRepo.findOneBy({ id: dat.ban_id });
      if (ban) { ban.trangThai = TrangThaiBan.DANG_PHUC_VU; ban.batDauPhucVuLuc = new Date(); await this.banRepo.save(ban); }
    }
    return this.repo.save(dat);
  }
}
