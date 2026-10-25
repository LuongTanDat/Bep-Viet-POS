import {
  BarChart3, CalendarDays, ChefHat, ClipboardList, CreditCard, FileClock, LayoutDashboard,
  PackageOpen, ReceiptText, Settings2, ShieldCheck, Soup, Table2, UsersRound, WalletCards,
} from 'lucide-react';

export const VAI_TRO: Record<string, { nhan: string; trangMacDinh: string }> = {
  admin: { nhan: 'Admin', trangMacDinh: 'tong-quan' },
  'quan-ly': { nhan: 'Quản lý', trangMacDinh: 'tong-quan' },
  'phuc-vu': { nhan: 'Phục vụ', trangMacDinh: 'so-do-ban' },
  bep: { nhan: 'Bếp', trangMacDinh: 'kds' },
  'thu-ngan': { nhan: 'Thu ngân', trangMacDinh: 'hoa-don' },
  khach: { nhan: 'Khách hàng', trangMacDinh: 'thuc-don' },
};

/** Menu sidebar theo đúng nhiệm vụ từng vai trò. */
export const MENU: Record<string, Array<{ slug: string; nhan: string; icon: any }>> = {
  admin: [
    { slug: 'tong-quan', nhan: 'Tổng quan', icon: LayoutDashboard },
    { slug: 'nguoi-dung', nhan: 'Người dùng', icon: UsersRound },
    { slug: 'phan-quyen', nhan: 'Phân quyền', icon: ShieldCheck },
    { slug: 'cai-dat', nhan: 'Cài đặt', icon: Settings2 },
  ],
  'quan-ly': [
    { slug: 'tong-quan', nhan: 'Tổng quan', icon: LayoutDashboard },
    { slug: 'so-do-ban', nhan: 'Sơ đồ bàn', icon: Table2 },
    { slug: 'dat-ban', nhan: 'Đặt bàn', icon: CalendarDays },
    { slug: 'thuc-don', nhan: 'Thực đơn', icon: Soup },
    { slug: 'kho', nhan: 'Kho nguyên liệu', icon: PackageOpen },
    { slug: 'bao-cao', nhan: 'Báo cáo', icon: BarChart3 },
  ],
  'phuc-vu': [
    { slug: 'so-do-ban', nhan: 'Sơ đồ bàn', icon: Table2 },
    { slug: 'goi-mon', nhan: 'Gọi món / POS', icon: ClipboardList },
    { slug: 'theo-doi', nhan: 'Theo dõi món', icon: FileClock },
  ],
  bep: [
    { slug: 'kds', nhan: 'Màn hình bếp', icon: ChefHat },
    { slug: 'lich-su', nhan: 'Đã hoàn thành', icon: FileClock },
  ],
  'thu-ngan': [
    { slug: 'hoa-don', nhan: 'Hóa đơn', icon: ReceiptText },
    { slug: 'thanh-toan', nhan: 'Thanh toán', icon: CreditCard },
    { slug: 'giao-dich', nhan: 'Lịch sử giao dịch', icon: WalletCards },
  ],
  khach: [
    { slug: 'thuc-don', nhan: 'Thực đơn QR', icon: Soup },
    { slug: 'gio-hang', nhan: 'Giỏ hàng', icon: ClipboardList },
    { slug: 'theo-doi', nhan: 'Theo dõi đơn', icon: FileClock },
  ],
};

export const ROLE_TO_PATH: Record<string, string> = {
  ADMIN: 'admin', QUAN_LY: 'quan-ly', PHUC_VU: 'phuc-vu', BEP: 'bep', THU_NGAN: 'thu-ngan',
};
