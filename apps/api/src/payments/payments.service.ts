import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import {
  BanNhaHang,
  DonHang,
  PhuongThucThanhToan,
  ThanhToan,
  TrangThaiBan,
  TrangThaiDon,
  TrangThaiThanhToan,
} from '../entities';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class PaymentsService {
  constructor(private readonly dataSource: DataSource, private readonly realtime: RealtimeGateway) {}

  /** Tính tiền trên server, tuyệt đối không tin tổng tiền do frontend gửi lên. */
  private tinhTongDon(don: DonHang) {
    return don.chiTiet.reduce((tong, dong) => tong + dong.donGia * dong.soLuong, 0);
  }

  async hoaDonChoThanhToan() {
    const repo = this.dataSource.getRepository(DonHang);
    return repo.find({
      where: { trangThai: In([TrangThaiDon.DA_PHUC_VU, TrangThaiDon.SAN_SANG]) },
      order: { taoLuc: 'ASC' },
    });
  }

  /**
   * Thanh toán trong transaction và khóa pessimistic_write để tránh hai thu ngân
   * cùng thanh toán một đơn tại cùng thời điểm.
   */
  async thanhToan(donId: string, phuongThuc: PhuongThucThanhToan) {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      const don = await runner.manager.getRepository(DonHang).findOne({
        where: { id: donId },
        relations: { chiTiet: { mon: true }, ban: true, thanhToan: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!don) throw new BadRequestException('Không tìm thấy đơn hàng.');
      if (don.trangThai === TrangThaiDon.DA_THANH_TOAN) throw new BadRequestException('Đơn này đã được thanh toán.');
      if (![TrangThaiDon.DA_PHUC_VU, TrangThaiDon.SAN_SANG].includes(don.trangThai)) {
        throw new BadRequestException('Đơn chưa sẵn sàng thanh toán.');
      }

      const soTien = this.tinhTongDon(don);
      const payment = runner.manager.getRepository(ThanhToan).create({
        don_id: don.id,
        soTien,
        phuongThuc,
        trangThai: TrangThaiThanhToan.THANH_CONG,
        maThamChieu: `PAY-${Date.now()}`,
      });
      await runner.manager.save(payment);

      don.trangThai = TrangThaiDon.DA_THANH_TOAN;
      don.phienBan += 1;
      await runner.manager.save(don);

      const ban = await runner.manager.getRepository(BanNhaHang).findOneBy({ id: don.ban_id });
      if (ban) {
        ban.trangThai = TrangThaiBan.CHO_DON;
        await runner.manager.save(ban);
      }

      await runner.commitTransaction();
      this.realtime.phat('thanh-toan.hoan-tat', { donId, soTien, phuongThuc });
      if (ban) this.realtime.phat('ban.trang-thai.thay-doi', ban);
      return { thanhCong: true, payment, soTien };
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  async lichSu() {
    return this.dataSource.getRepository(ThanhToan).find({ relations: { don: { ban: true } }, order: { taoLuc: 'DESC' }, take: 300 });
  }
}
