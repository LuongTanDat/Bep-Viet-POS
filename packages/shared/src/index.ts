/** Các vai trò nghiệp vụ dùng chung giữa frontend và backend. */
export enum VaiTro {
  ADMIN = 'ADMIN',
  QUAN_LY = 'QUAN_LY',
  PHUC_VU = 'PHUC_VU',
  BEP = 'BEP',
  THU_NGAN = 'THU_NGAN',
  KHACH = 'KHACH',
}

/** Trạng thái bàn chuẩn trong toàn hệ thống. */
export enum TrangThaiBan {
  TRONG = 'TRONG',
  DA_DAT = 'DA_DAT',
  DANG_PHUC_VU = 'DANG_PHUC_VU',
  CHO_THANH_TOAN = 'CHO_THANH_TOAN',
  CHO_DON = 'CHO_DON',
}

/** Vòng đời đơn hàng. */
export enum TrangThaiDon {
  NHAP = 'NHAP',
  DA_GUI_BEP = 'DA_GUI_BEP',
  DANG_CHE_BIEN = 'DANG_CHE_BIEN',
  SAN_SANG = 'SAN_SANG',
  DA_PHUC_VU = 'DA_PHUC_VU',
  DA_THANH_TOAN = 'DA_THANH_TOAN',
  DA_HUY = 'DA_HUY',
}

/** Payload đăng nhập trả về cho giao diện. */
export interface PhienDangNhap {
  accessToken: string;
  nguoiDung: {
    id: string;
    hoTen: string;
    tenDangNhap: string;
    vaiTro: VaiTro;
  };
}
