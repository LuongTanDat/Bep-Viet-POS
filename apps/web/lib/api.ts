import { docPhien } from './auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Wrapper fetch dùng chung: tự gắn JWT và chuẩn hóa thông báo lỗi tiếng Việt. */
export async function api<T>(duongDan: string, tuyChon: RequestInit = {}): Promise<T> {
  const phien = typeof window !== 'undefined' ? docPhien() : null;
  const headers = new Headers(tuyChon.headers);
  headers.set('Content-Type', 'application/json');
  if (phien?.accessToken) headers.set('Authorization', `Bearer ${phien.accessToken}`);

  const response = await fetch(`${API_URL}${duongDan}`, { ...tuyChon, headers, cache: 'no-store' });
  if (!response.ok) {
    let message = 'Có lỗi khi kết nối máy chủ.';
    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : body.message ?? message;
    } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function tienVietNam(soTien = 0) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(soTien);
}

export function ngayGioVietNam(value: string | Date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}
