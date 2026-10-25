import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  BanNhaHang,
  ChiTietDon,
  DonHang,
  MonAn,
  NguonDon,
  TrangThaiBan,
  TrangThaiDon,
} from '../entities';
import { RealtimeGateway } from '../realtime/realtime.gateway';

export interface DongMonInput {
  monId: string;
  soLuong: number;
  ghiChu?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(DonHang) private readonly donRepo: Repository<DonHang>,
    @InjectRepository(MonAn) private readonly monRepo: Repository<MonAn>,
    @InjectRepository(BanNhaHang) private readonly banRepo: Repository<BanNhaHang>,
    private readonly realtime: RealtimeGateway,
  ) {}

  /** Sinh mã đơn ngắn gọn dùng để hiển thị trên POS và KDS. */
  private taoMaDon() {
    const ngay = new Date();
    const stem = `${ngay.getFullYear()}${String(ngay.getMonth() + 1).padStart(2, '0')}${String(ngay.getDate()).padStart(2, '0')}`;
    return `BV-${stem}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  /** Tính tổng tiền từ snapshot đơn giá trong chi tiết đơn. */
  tinhTong(don: DonHang) {
    return (don.chiTiet ?? []).reduce((tong, dong) => tong + dong.donGia * dong.soLuong, 0);
  }

  async danhSach() {
    return this.donRepo.find({ order: { taoLuc: 'DESC' }, take: 300 });
  }

  async layTheoId(id: string) {
    const don = await this.donRepo.findOne({ where: { id } });
    if (!don) throw new NotFoundException('Không tìm thấy đơn hàng.');
    return don;
  }

  /** Tra cứu công khai theo mã đơn để khách theo dõi đơn QR của chính phiên bàn. */
  async layTheoMa(maDon: string) {
    const don = await this.donRepo.findOne({ where: { maDon } });
    if (!don) throw new NotFoundException('Không tìm thấy đơn hàng.');
    return don;
  }

  /** Tạo đơn từ QR bằng mã bàn thay vì yêu cầu tài khoản nhân viên. */
  async taoDonKhach(maBan: string, chiTiet: DongMonInput[], ghiChu = '') {
    const ban = await this.banRepo.findOneBy({ maBan });
    if (!ban) throw new NotFoundException('Mã bàn không hợp lệ.');
    return this.taoDon(ban.id, NguonDon.QR_KHACH, chiTiet, ghiChu);
  }

  /** Tạo đơn và đồng thời đưa bàn sang trạng thái đang phục vụ. */
  async taoDon(banId: string, nguon: NguonDon, chiTiet: DongMonInput[], ghiChu = '', nguoiTaoId?: string) {
    if (!chiTiet.length) throw new BadRequestException('Đơn hàng phải có ít nhất một món.');
    const ban = await this.banRepo.findOneBy({ id: banId });
    if (!ban) throw new NotFoundException('Không tìm thấy bàn.');
    if ([TrangThaiBan.CHO_DON, TrangThaiBan.DA_DAT].includes(ban.trangThai)) {
      throw new BadRequestException('Bàn chưa sẵn sàng nhận đơn mới.');
    }

    const ids = chiTiet.map((dong) => dong.monId);
    const mon = await this.monRepo.findBy({ id: In(ids), dangBan: true });
    if (mon.length !== new Set(ids).size) throw new BadRequestException('Có món không tồn tại hoặc đang tạm hết.');
    const mapMon = new Map(mon.map((m) => [m.id, m]));

    const don = this.donRepo.create({
      maDon: this.taoMaDon(),
      ban_id: banId,
      nguoi_tao_id: nguoiTaoId ?? null,
      nguon,
      trangThai: TrangThaiDon.DA_GUI_BEP,
      ghiChu,
      chiTiet: chiTiet.map((dong) => {
        const m = mapMon.get(dong.monId)!;
        const ct = new ChiTietDon();
        ct.mon_id = m.id;
        ct.soLuong = dong.soLuong;
        ct.donGia = m.gia;
        ct.ghiChu = dong.ghiChu ?? '';
        return ct;
      }),
    });

    const daLuu = await this.donRepo.save(don);
    ban.trangThai = TrangThaiBan.DANG_PHUC_VU;
    ban.batDauPhucVuLuc = ban.batDauPhucVuLuc ?? new Date();
    await this.banRepo.save(ban);

    const dayDu = await this.layTheoId(daLuu.id);
    this.realtime.phat('don-hang.tao', dayDu);
    this.realtime.phat('ban.trang-thai.thay-doi', ban);
    return dayDu;
  }

  /** Chỉ cho phép các bước chuyển hợp lệ để tránh nhảy sai vòng đời đơn. */
  async doiTrangThai(id: string, trangThaiMoi: TrangThaiDon, phienBanKyVong?: number) {
    const don = await this.layTheoId(id);
    if (phienBanKyVong !== undefined && don.phienBan !== phienBanKyVong) {
      throw new BadRequestException('Đơn đã thay đổi ở thiết bị khác. Vui lòng tải lại dữ liệu.');
    }
    const hopLe: Record<TrangThaiDon, TrangThaiDon[]> = {
      [TrangThaiDon.NHAP]: [TrangThaiDon.DA_GUI_BEP, TrangThaiDon.DA_HUY],
      [TrangThaiDon.DA_GUI_BEP]: [TrangThaiDon.DANG_CHE_BIEN, TrangThaiDon.DA_HUY],
      [TrangThaiDon.DANG_CHE_BIEN]: [TrangThaiDon.SAN_SANG, TrangThaiDon.DA_HUY],
      [TrangThaiDon.SAN_SANG]: [TrangThaiDon.DA_PHUC_VU],
      [TrangThaiDon.DA_PHUC_VU]: [TrangThaiDon.DA_THANH_TOAN],
      [TrangThaiDon.DA_THANH_TOAN]: [],
      [TrangThaiDon.DA_HUY]: [],
    };
    if (!hopLe[don.trangThai].includes(trangThaiMoi)) {
      throw new BadRequestException(`Không thể chuyển ${don.trangThai} → ${trangThaiMoi}.`);
    }
    don.trangThai = trangThaiMoi;
    don.phienBan += 1;
    const ketQua = await this.donRepo.save(don);
    this.realtime.phat('don-hang.trang-thai.thay-doi', ketQua);
    return ketQua;
  }

  /** Chuyển tất cả đơn chưa thanh toán từ bàn nguồn sang bàn đích. */
  async chuyenDonTheoBan(banNguonId: string, banDichId: string) {
    const donMo = await this.donRepo.find({
      where: {
        ban_id: banNguonId,
        trangThai: In([
          TrangThaiDon.DA_GUI_BEP,
          TrangThaiDon.DANG_CHE_BIEN,
          TrangThaiDon.SAN_SANG,
          TrangThaiDon.DA_PHUC_VU,
        ]),
      },
    });
    for (const don of donMo) don.ban_id = banDichId;
    await this.donRepo.save(donMo);
    this.realtime.phat('don-hang.chuyen-ban', { banNguonId, banDichId, soDon: donMo.length });
    return { soDon: donMo.length };
  }
}
