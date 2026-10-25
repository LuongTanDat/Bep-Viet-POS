import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BanNhaHang, DonHang, ThanhToan, TrangThaiBan, VaiTroNguoiDung } from '../entities';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VaiTro } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.QUAN_LY)
@Controller('bao-cao')
export class ReportsController {
  constructor(
    @InjectRepository(ThanhToan) private readonly thanhToanRepo: Repository<ThanhToan>,
    @InjectRepository(DonHang) private readonly donRepo: Repository<DonHang>,
    @InjectRepository(BanNhaHang) private readonly banRepo: Repository<BanNhaHang>,
  ) {}

  @Get('tong-quan')
  async tongQuan() {
    const dauNgay = new Date(); dauNgay.setHours(0, 0, 0, 0);
    const cuoiNgay = new Date(); cuoiNgay.setHours(23, 59, 59, 999);
    const [thanhToan, soDon, ban] = await Promise.all([
      this.thanhToanRepo.find({ where: { taoLuc: Between(dauNgay, cuoiNgay) } }),
      this.donRepo.count({ where: { taoLuc: Between(dauNgay, cuoiNgay) } }),
      this.banRepo.find(),
    ]);
    const doanhThu = thanhToan.reduce((tong, giaoDich) => tong + giaoDich.soTien, 0);
    return {
      doanhThu,
      soDon,
      hoaDonDaThanhToan: thanhToan.length,
      giaTriTrungBinh: thanhToan.length ? Math.round(doanhThu / thanhToan.length) : 0,
      banDangPhucVu: ban.filter((x) => x.trangThai === TrangThaiBan.DANG_PHUC_VU).length,
      tongSoBan: ban.length,
    };
  }
}
