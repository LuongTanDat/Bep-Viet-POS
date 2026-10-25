import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsEnum, IsString } from 'class-validator';
import { Repository } from 'typeorm';
import { BanNhaHang, TrangThaiBan, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';
import { RealtimeGateway } from '../realtime/realtime.gateway';

class DoiTrangThaiBanDto { @IsEnum(TrangThaiBan) trangThai!: TrangThaiBan; }
class ChuyenBanDto { @IsString() banDichId!: string; }

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ban')
export class TablesController {
  constructor(
    @InjectRepository(BanNhaHang) private readonly repo: Repository<BanNhaHang>,
    private readonly realtime: RealtimeGateway,
  ) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.THU_NGAN)
  danhSach() {
    return this.repo.find({ order: { maBan: 'ASC' } });
  }

  @Patch(':id/trang-thai')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU, VaiTroNguoiDung.THU_NGAN)
  async doiTrangThai(@Param('id') id: string, @Body() dto: DoiTrangThaiBanDto) {
    const ban = await this.repo.findOneByOrFail({ id });
    ban.trangThai = dto.trangThai;
    ban.batDauPhucVuLuc = dto.trangThai === TrangThaiBan.DANG_PHUC_VU ? (ban.batDauPhucVuLuc ?? new Date()) : ban.batDauPhucVuLuc;
    if (dto.trangThai === TrangThaiBan.TRONG) ban.batDauPhucVuLuc = null;
    const ketQua = await this.repo.save(ban);
    this.realtime.phat('ban.trang-thai.thay-doi', ketQua);
    return ketQua;
  }

  /** Chuyển trạng thái phiên phục vụ sang bàn đích; đơn hàng được chuyển ở module đơn hàng. */
  @Post(':id/chuyen-ban')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY, VaiTroNguoiDung.PHUC_VU)
  async chuyenBan(@Param('id') id: string, @Body() dto: ChuyenBanDto) {
    const [nguon, dich] = await Promise.all([this.repo.findOneByOrFail({ id }), this.repo.findOneByOrFail({ id: dto.banDichId })]);
    if (dich.trangThai !== TrangThaiBan.TRONG) throw new Error('Bàn đích không trống.');
    dich.trangThai = nguon.trangThai;
    dich.batDauPhucVuLuc = nguon.batDauPhucVuLuc;
    nguon.trangThai = TrangThaiBan.TRONG;
    nguon.batDauPhucVuLuc = null;
    await this.repo.save([nguon, dich]);
    this.realtime.phat('ban.chuyen', { nguon, dich });
    return { nguon, dich };
  }
}
