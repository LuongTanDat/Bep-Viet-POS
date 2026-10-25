import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Vai trò đăng nhập của nhân sự trong Bếp Việt POS. */
export enum VaiTroNguoiDung {
  ADMIN = 'ADMIN',
  QUAN_LY = 'QUAN_LY',
  PHUC_VU = 'PHUC_VU',
  BEP = 'BEP',
  THU_NGAN = 'THU_NGAN',
}

/** Trạng thái vận hành của một bàn. */
export enum TrangThaiBan {
  TRONG = 'TRONG',
  DA_DAT = 'DA_DAT',
  DANG_PHUC_VU = 'DANG_PHUC_VU',
  CHO_THANH_TOAN = 'CHO_THANH_TOAN',
  CHO_DON = 'CHO_DON',
}

/** Vòng đời một đơn hàng. */
export enum TrangThaiDon {
  NHAP = 'NHAP',
  DA_GUI_BEP = 'DA_GUI_BEP',
  DANG_CHE_BIEN = 'DANG_CHE_BIEN',
  SAN_SANG = 'SAN_SANG',
  DA_PHUC_VU = 'DA_PHUC_VU',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
  DA_HUY = 'DA_HUY',
}

export enum NguonDon {
  PHUC_VU = 'PHUC_VU',
  QR_KHACH = 'QR_KHACH',
  THU_NGAN = 'THU_NGAN',
}

export enum TramBep {
  BEP_NONG = 'BEP_NONG',
  BEP_LANH = 'BEP_LANH',
  QUAY_BAR = 'QUAY_BAR',
}

export enum PhuongThucThanhToan {
  TIEN_MAT = 'TIEN_MAT',
  QR = 'QR',
  THE = 'THE',
}

export enum TrangThaiThanhToan {
  THANH_CONG = 'THANH_CONG',
  HOAN_TIEN = 'HOAN_TIEN',
}

export enum TrangThaiDatBan {
  CHO_XAC_NHAN = 'CHO_XAC_NHAN',
  DA_XAC_NHAN = 'DA_XAC_NHAN',
  DA_NHAN_BAN = 'DA_NHAN_BAN',
  VANG_MAT = 'VANG_MAT',
  DA_HUY = 'DA_HUY',
}

@Entity('nguoi_dung')
export class NguoiDung {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) tenDangNhap!: string;
  @Column() matKhauBam!: string;
  @Column() hoTen!: string;
  @Column({ type: 'enum', enum: VaiTroNguoiDung }) vaiTro!: VaiTroNguoiDung;
  @Column({ default: true }) dangHoatDong!: boolean;
  @CreateDateColumn() taoLuc!: Date;
  @UpdateDateColumn() capNhatLuc!: Date;
}

@Entity('ban_nha_hang')
export class BanNhaHang {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) maBan!: string;
  @Column({ default: 'Tầng trệt' }) khuVuc!: string;
  @Column({ default: 4 }) soGhe!: number;
  @Column({ type: 'enum', enum: TrangThaiBan, default: TrangThaiBan.TRONG }) trangThai!: TrangThaiBan;
  @Column({ type: 'timestamptz', nullable: true }) batDauPhucVuLuc!: Date | null;
  @OneToMany(() => DonHang, (don) => don.ban) donHang!: DonHang[];
}

@Entity('nhom_mon')
export class NhomMon {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) ten!: string;
  @Column({ default: 0 }) thuTu!: number;
  @OneToMany(() => MonAn, (mon) => mon.nhom) monAn!: MonAn[];
}

@Entity('mon_an')
export class MonAn {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() ten!: string;
  @Column({ default: '' }) moTa!: string;
  /** Giá lưu bằng đồng Việt Nam để tránh sai số số thực. */
  @Column({ type: 'integer' }) gia!: number;
  @Column({ default: '' }) hinhAnh!: string;
  @Column({ default: true }) dangBan!: boolean;
  @Column({ type: 'enum', enum: TramBep, default: TramBep.BEP_NONG }) tramBep!: TramBep;
  @ManyToOne(() => NhomMon, (nhom) => nhom.monAn, { eager: true })
  @JoinColumn({ name: 'nhom_id' }) nhom!: NhomMon;
  @Column() nhom_id!: string;
}

@Entity('don_hang')
export class DonHang {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) maDon!: string;
  @ManyToOne(() => BanNhaHang, (ban) => ban.donHang, { eager: true })
  @JoinColumn({ name: 'ban_id' }) ban!: BanNhaHang;
  @Column() ban_id!: string;
  @ManyToOne(() => NguoiDung, { eager: true, nullable: true })
  @JoinColumn({ name: 'nguoi_tao_id' }) nguoiTao!: NguoiDung | null;
  @Column({ nullable: true }) nguoi_tao_id!: string | null;
  @Column({ type: 'enum', enum: NguonDon }) nguon!: NguonDon;
  @Column({ type: 'enum', enum: TrangThaiDon, default: TrangThaiDon.DA_GUI_BEP }) trangThai!: TrangThaiDon;
  @Column({ default: '' }) ghiChu!: string;
  @Column({ default: 0 }) phienBan!: number;
  @OneToMany(() => ChiTietDon, (ct) => ct.don, { cascade: true, eager: true }) chiTiet!: ChiTietDon[];
  @OneToMany(() => ThanhToan, (tt) => tt.don, { eager: true }) thanhToan!: ThanhToan[];
  @CreateDateColumn() taoLuc!: Date;
  @UpdateDateColumn() capNhatLuc!: Date;
}

@Entity('chi_tiet_don')
export class ChiTietDon {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => DonHang, (don) => don.chiTiet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'don_id' }) don!: DonHang;
  @Column() don_id!: string;
  @ManyToOne(() => MonAn, { eager: true })
  @JoinColumn({ name: 'mon_id' }) mon!: MonAn;
  @Column() mon_id!: string;
  @Column({ type: 'integer' }) soLuong!: number;
  @Column({ type: 'integer' }) donGia!: number;
  @Column({ default: '' }) ghiChu!: string;
}

@Entity('thanh_toan')
export class ThanhToan {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => DonHang, (don) => don.thanhToan)
  @JoinColumn({ name: 'don_id' }) don!: DonHang;
  @Column() don_id!: string;
  @Column({ type: 'integer' }) soTien!: number;
  @Column({ type: 'enum', enum: PhuongThucThanhToan }) phuongThuc!: PhuongThucThanhToan;
  @Column({ type: 'enum', enum: TrangThaiThanhToan, default: TrangThaiThanhToan.THANH_CONG }) trangThai!: TrangThaiThanhToan;
  @Column({ default: '' }) maThamChieu!: string;
  @CreateDateColumn() taoLuc!: Date;
}

@Entity('dat_ban')
export class DatBan {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() tenKhach!: string;
  @Column({ default: '' }) soDienThoai!: string;
  @Column({ default: 2 }) soKhach!: number;
  @Column({ type: 'timestamptz' }) batDauLuc!: Date;
  @Column({ type: 'enum', enum: TrangThaiDatBan, default: TrangThaiDatBan.DA_XAC_NHAN }) trangThai!: TrangThaiDatBan;
  @ManyToOne(() => BanNhaHang, { eager: true, nullable: true })
  @JoinColumn({ name: 'ban_id' }) ban!: BanNhaHang | null;
  @Column({ nullable: true }) ban_id!: string | null;
  @Column({ default: '' }) ghiChu!: string;
  @CreateDateColumn() taoLuc!: Date;
}

@Entity('ton_kho')
export class TonKho {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) tenNguyenLieu!: string;
  @Column() donVi!: string;
  @Column({ type: 'double precision', default: 0 }) soLuong!: number;
  @Column({ type: 'double precision', default: 0 }) mucToiThieu!: number;
  @UpdateDateColumn() capNhatLuc!: Date;
}

@Entity('ca_lam_viec')
export class CaLamViec {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => NguoiDung, { eager: true })
  @JoinColumn({ name: 'nguoi_dung_id' }) nguoiDung!: NguoiDung;
  @Column() nguoi_dung_id!: string;
  @CreateDateColumn() moLuc!: Date;
  @Column({ type: 'timestamptz', nullable: true }) dongLuc!: Date | null;
  @Column({ type: 'integer', default: 0 }) tienDauCa!: number;
  @Column({ type: 'integer', default: 0 }) tienDuKien!: number;
  @Column({ type: 'integer', nullable: true }) tienThucTe!: number | null;
}

@Entity('nhat_ky_he_thong')
export class NhatKyHeThong {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => NguoiDung, { eager: true, nullable: true })
  @JoinColumn({ name: 'nguoi_thuc_hien_id' }) nguoiThucHien!: NguoiDung | null;
  @Column({ nullable: true }) nguoi_thuc_hien_id!: string | null;
  @Column() hanhDong!: string;
  @Column() loaiDoiTuong!: string;
  @Column({ default: '' }) doiTuongId!: string;
  @Column({ type: 'jsonb', nullable: true }) truoc!: Record<string, unknown> | null;
  @Column({ type: 'jsonb', nullable: true }) sau!: Record<string, unknown> | null;
  @CreateDateColumn() taoLuc!: Date;
}

export const CAC_THUC_THE = [
  NguoiDung,
  BanNhaHang,
  NhomMon,
  MonAn,
  DonHang,
  ChiTietDon,
  ThanhToan,
  DatBan,
  TonKho,
  CaLamViec,
  NhatKyHeThong,
];
