'use client';
import { AppShell } from './AppShell';
import {
  BaoCaoView, CaiDatView, DatBanView, KhoView, NguoiDungView, PhanQuyenView,
  QuanLyThucDonView, SoDoBanView, TongQuanView,
} from './views/AdminManagerViews';
import { PosView, SoDoBanPhucVuView, TheoDoiPhucVuView } from './views/WaiterViews';
import { GiaoDichView, HoaDonView, KdsView, ThanhToanView } from './views/KitchenCashierViews';
import { GuestCartView, GuestMenuView, GuestTrackingView } from './views/GuestViews';

/** Bộ định tuyến view ở cấp UI; App Router đã xử lý URL, đây là map trang → component. */
function NoiDung({ vaiTro, trang }: { vaiTro: string; trang: string }) {
  if (vaiTro === 'admin') {
    if (trang === 'tong-quan') return <TongQuanView admin/>;
    if (trang === 'nguoi-dung') return <NguoiDungView/>;
    if (trang === 'phan-quyen') return <PhanQuyenView/>;
    if (trang === 'cai-dat') return <CaiDatView/>;
  }
  if (vaiTro === 'quan-ly') {
    if (trang === 'tong-quan') return <TongQuanView/>;
    if (trang === 'so-do-ban') return <SoDoBanView/>;
    if (trang === 'dat-ban') return <DatBanView/>;
    if (trang === 'thuc-don') return <QuanLyThucDonView/>;
    if (trang === 'kho') return <KhoView/>;
    if (trang === 'bao-cao') return <BaoCaoView/>;
  }
  if (vaiTro === 'phuc-vu') {
    if (trang === 'so-do-ban') return <SoDoBanPhucVuView/>;
    if (trang === 'goi-mon') return <PosView/>;
    if (trang === 'theo-doi') return <TheoDoiPhucVuView/>;
  }
  if (vaiTro === 'bep') {
    if (trang === 'kds') return <KdsView/>;
    if (trang === 'lich-su') return <KdsView lichSu/>;
  }
  if (vaiTro === 'thu-ngan') {
    if (trang === 'hoa-don') return <HoaDonView/>;
    if (trang === 'thanh-toan') return <ThanhToanView/>;
    if (trang === 'giao-dich') return <GiaoDichView/>;
  }
  if (vaiTro === 'khach') {
    if (trang === 'thuc-don') return <GuestMenuView/>;
    if (trang === 'gio-hang') return <GuestCartView/>;
    if (trang === 'theo-doi') return <GuestTrackingView/>;
  }
  return <div>Trang chưa được cấu hình.</div>;
}

export function RolePage({ vaiTro, trang }: { vaiTro: string; trang: string }) {
  return <AppShell vaiTro={vaiTro} trang={trang}><NoiDung vaiTro={vaiTro} trang={trang}/></AppShell>;
}
