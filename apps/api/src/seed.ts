import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  BanNhaHang,
  CAC_THUC_THE,
  DatBan,
  DonHang,
  ChiTietDon,
  NguonDon,
  TrangThaiDon,
  MonAn,
  NguoiDung,
  NhomMon,
  TonKho,
  TramBep,
  TrangThaiBan,
  TrangThaiDatBan,
  VaiTroNguoiDung,
} from './entities';

/** Seed dữ liệu demo để có thể trải nghiệm đủ 6 vai trò ngay sau khi cài đặt. */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: CAC_THUC_THE,
    synchronize: true,
  });
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(NguoiDung);
  const tableRepo = dataSource.getRepository(BanNhaHang);
  const categoryRepo = dataSource.getRepository(NhomMon);
  const menuRepo = dataSource.getRepository(MonAn);
  const stockRepo = dataSource.getRepository(TonKho);
  const bookingRepo = dataSource.getRepository(DatBan);
  const orderRepo = dataSource.getRepository(DonHang);

  const matKhauBam = await bcrypt.hash('123456', 10);
  const users = [
    ['admin', 'Quản trị hệ thống', VaiTroNguoiDung.ADMIN],
    ['quanly', 'Nguyễn Minh Anh', VaiTroNguoiDung.QUAN_LY],
    ['phucvu', 'Trần Quốc Huy', VaiTroNguoiDung.PHUC_VU],
    ['bep', 'Lê Thanh Tâm', VaiTroNguoiDung.BEP],
    ['thungan', 'Phạm Ngọc Hà', VaiTroNguoiDung.THU_NGAN],
  ] as const;
  for (const [tenDangNhap, hoTen, vaiTro] of users) {
    const co = await userRepo.findOneBy({ tenDangNhap });
    if (!co) await userRepo.save(userRepo.create({ tenDangNhap, hoTen, vaiTro, matKhauBam }));
  }

  if ((await tableRepo.count()) === 0) {
    const tables = Array.from({ length: 18 }, (_, i) => tableRepo.create({
      maBan: `B${String(i + 1).padStart(2, '0')}`,
      khuVuc: i < 10 ? 'Tầng trệt' : 'Tầng 1',
      soGhe: i % 5 === 0 ? 6 : 4,
      trangThai: [1, 4, 7].includes(i) ? TrangThaiBan.DANG_PHUC_VU : [2, 10].includes(i) ? TrangThaiBan.DA_DAT : TrangThaiBan.TRONG,
      batDauPhucVuLuc: [1, 4, 7].includes(i) ? new Date(Date.now() - (i + 1) * 12 * 60_000) : null,
    }));
    await tableRepo.save(tables);
  }

  let nhom = await categoryRepo.find();
  if (!nhom.length) {
    nhom = await categoryRepo.save([
      categoryRepo.create({ ten: 'Khai vị', thuTu: 1 }),
      categoryRepo.create({ ten: 'Món chính', thuTu: 2 }),
      categoryRepo.create({ ten: 'Đồ uống', thuTu: 3 }),
      categoryRepo.create({ ten: 'Tráng miệng', thuTu: 4 }),
    ]);
  }
  const n = Object.fromEntries(nhom.map((x) => [x.ten, x.id]));
  if ((await menuRepo.count()) === 0) {
    await menuRepo.save([
      menuRepo.create({ ten: 'Phở bò đặc biệt', moTa: 'Nước dùng hầm 12 giờ, bò tái và nạm.', gia: 89000, nhom_id: n['Món chính'], hinhAnh: '/menu/pho-bo.svg', tramBep: TramBep.BEP_NONG }),
      menuRepo.create({ ten: 'Bún bò Huế', moTa: 'Vị Huế đậm đà, cay nhẹ.', gia: 79000, nhom_id: n['Món chính'], hinhAnh: '/menu/bun-bo.svg', tramBep: TramBep.BEP_NONG }),
      menuRepo.create({ ten: 'Cơm tấm sườn bì', moTa: 'Sườn nướng mật ong, bì và chả trứng.', gia: 85000, nhom_id: n['Món chính'], hinhAnh: '/menu/com-tam.svg', tramBep: TramBep.BEP_NONG }),
      menuRepo.create({ ten: 'Gỏi cuốn tôm thịt', moTa: 'Rau tươi, tôm, thịt và sốt đậu phộng.', gia: 52000, nhom_id: n['Khai vị'], hinhAnh: '/menu/goi-cuon.svg', tramBep: TramBep.BEP_LANH }),
      menuRepo.create({ ten: 'Chả giò Bếp Việt', moTa: 'Chiên giòn, nhân thịt và rau củ.', gia: 59000, nhom_id: n['Khai vị'], hinhAnh: '/menu/cha-gio.svg', tramBep: TramBep.BEP_NONG }),
      menuRepo.create({ ten: 'Trà đào cam sả', moTa: 'Trà thanh, đào giòn, cam và sả.', gia: 45000, nhom_id: n['Đồ uống'], hinhAnh: '/menu/tra-dao.svg', tramBep: TramBep.QUAY_BAR }),
      menuRepo.create({ ten: 'Cà phê sữa đá', moTa: 'Robusta rang đậm, sữa đặc.', gia: 39000, nhom_id: n['Đồ uống'], hinhAnh: '/menu/ca-phe.svg', tramBep: TramBep.QUAY_BAR }),
      menuRepo.create({ ten: 'Chè khúc bạch', moTa: 'Khúc bạch mềm, nhãn và hạnh nhân.', gia: 49000, nhom_id: n['Tráng miệng'], hinhAnh: '/menu/che.svg', tramBep: TramBep.BEP_LANH }),
    ]);
  }

  if ((await stockRepo.count()) === 0) {
    await stockRepo.save([
      stockRepo.create({ tenNguyenLieu: 'Thịt bò', donVi: 'kg', soLuong: 4.5, mucToiThieu: 5 }),
      stockRepo.create({ tenNguyenLieu: 'Gạo tấm', donVi: 'kg', soLuong: 24, mucToiThieu: 10 }),
      stockRepo.create({ tenNguyenLieu: 'Bún tươi', donVi: 'kg', soLuong: 3, mucToiThieu: 5 }),
      stockRepo.create({ tenNguyenLieu: 'Đào ngâm', donVi: 'hộp', soLuong: 12, mucToiThieu: 6 }),
      stockRepo.create({ tenNguyenLieu: 'Cà phê hạt', donVi: 'kg', soLuong: 8.2, mucToiThieu: 4 }),
    ]);
  }

  if ((await bookingRepo.count()) === 0) {
    const ban = await tableRepo.find({ order: { maBan: 'ASC' } });
    await bookingRepo.save([
      bookingRepo.create({ tenKhach: 'Nguyễn Hoàng Yến', soDienThoai: '0901234567', soKhach: 4, batDauLuc: new Date(Date.now() + 2 * 60 * 60_000), trangThai: TrangThaiDatBan.DA_XAC_NHAN, ban_id: ban[2]?.id ?? null, ghiChu: 'Bàn gần cửa sổ' }),
      bookingRepo.create({ tenKhach: 'Trần Gia Minh', soDienThoai: '0912345678', soKhach: 6, batDauLuc: new Date(Date.now() + 4 * 60 * 60_000), trangThai: TrangThaiDatBan.DA_XAC_NHAN, ban_id: ban[10]?.id ?? null, ghiChu: 'Sinh nhật' }),
    ]);
  }

  // Tạo vài đơn mẫu để KDS và Thu ngân có dữ liệu ngay lần chạy đầu.
  if ((await orderRepo.count()) === 0) {
    const tables = await tableRepo.find({ order: { maBan: 'ASC' } });
    const menu = await menuRepo.find({ order: { ten: 'ASC' } });
    const mk = (mon: MonAn, soLuong: number) => {
      const ct = new ChiTietDon(); ct.mon_id = mon.id; ct.soLuong = soLuong; ct.donGia = mon.gia; ct.ghiChu = ''; return ct;
    };
    if (tables[1] && menu[0] && menu[1]) {
      await orderRepo.save(orderRepo.create({
        maDon: `BV-DEMO-1001`, ban_id: tables[1].id, nguon: NguonDon.PHUC_VU, trangThai: TrangThaiDon.DA_GUI_BEP, ghiChu: 'Không hành',
        chiTiet: [mk(menu[0], 2), mk(menu[1], 1)],
      }));
    }
    if (tables[4] && menu[2] && menu[3]) {
      await orderRepo.save(orderRepo.create({
        maDon: `BV-DEMO-1002`, ban_id: tables[4].id, nguon: NguonDon.PHUC_VU, trangThai: TrangThaiDon.DA_PHUC_VU, ghiChu: '',
        chiTiet: [mk(menu[2], 1), mk(menu[3], 2)],
      }));
    }
  }

  console.log('✅ Seed dữ liệu Bếp Việt POS hoàn tất. Tài khoản demo dùng mật khẩu: 123456');
  await dataSource.destroy();
}

void seed();
