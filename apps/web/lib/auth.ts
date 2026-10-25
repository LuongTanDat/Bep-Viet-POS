export type Phien = {
  accessToken: string;
  nguoiDung: { id: string; hoTen: string; tenDangNhap: string; vaiTro: string };
};

const KHOA_PHIEN = 'bep-viet-pos-phien';

/** Lưu phiên ở localStorage cho bản demo web; production nên bổ sung refresh token HttpOnly. */
export function luuPhien(phien: Phien) {
  localStorage.setItem(KHOA_PHIEN, JSON.stringify(phien));
}

export function docPhien(): Phien | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(KHOA_PHIEN) ?? 'null'); } catch { return null; }
}

export function xoaPhien() {
  localStorage.removeItem(KHOA_PHIEN);
}
