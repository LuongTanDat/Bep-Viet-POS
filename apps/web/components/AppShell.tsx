'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChefHat, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MENU, ROLE_TO_PATH, VAI_TRO } from '@/lib/navigation';
import { docPhien, xoaPhien, type Phien } from '@/lib/auth';
import { useTheme } from './ThemeProvider';

export function AppShell({ vaiTro, trang, children }: { vaiTro: string; trang: string; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { cheDo, doiCheDo } = useTheme();
  const [phien, setPhien] = useState<Phien | null>(null);
  const [moMenu, setMoMenu] = useState(false);
  const laKhach = vaiTro === 'khach';

  useEffect(() => {
    if (laKhach) return;
    const p = docPhien();
    if (!p) { router.replace('/dang-nhap'); return; }
    const pathDung = ROLE_TO_PATH[p.nguoiDung.vaiTro];
    if (pathDung && pathDung !== vaiTro) {
      router.replace(`/${pathDung}/${VAI_TRO[pathDung]?.trangMacDinh ?? 'tong-quan'}`);
      return;
    }
    setPhien(p);
  }, [laKhach, router, vaiTro]);

  const tenTrang = useMemo(() => MENU[vaiTro]?.find((x) => x.slug === trang)?.nhan ?? 'Bếp Việt POS', [vaiTro, trang]);
  const cacMenu = MENU[vaiTro] ?? [];

  useEffect(() => setMoMenu(false), [pathname]);

  useEffect(() => {
    if (!moMenu) return;
    const dongBangEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoMenu(false);
    };
    document.addEventListener('keydown', dongBangEscape);
    return () => document.removeEventListener('keydown', dongBangEscape);
  }, [moMenu]);

  if (!laKhach && !phien) return <div className="bv-loader"><div><div className="bv-spinner"/><p>Đang xác minh phiên đăng nhập…</p></div></div>;

  return (
    <div className="bv-app">
      <button className={`bv-sidebar-overlay ${moMenu ? 'open' : ''}`} aria-label="Đóng menu" onClick={() => setMoMenu(false)}/>
      <aside className={`bv-sidebar ${moMenu ? 'open' : ''}`} aria-label="Điều hướng chính">
        <button className="bv-sidebar-close" aria-label="Đóng menu" onClick={() => setMoMenu(false)}><X size={20}/></button>
        <Link href={laKhach ? '/khach/thuc-don?ban=B02' : `/${vaiTro}/${VAI_TRO[vaiTro]?.trangMacDinh}`} className="bv-brand">
          <div className="bv-brand-mark"><ChefHat size={21}/></div>
          <div><div className="bv-brand-name">Bếp Việt</div><div className="bv-brand-sub">Hệ thống nhà hàng</div></div>
        </Link>
        <div className="bv-nav-caption">Không gian làm việc</div>
        <nav className="bv-nav">
          {cacMenu.map(({ slug, nhan, icon: Icon }) => {
            const href = `/${vaiTro}/${slug}${vaiTro === 'khach' ? '?ban=B02' : ''}`;
            return <Link key={slug} href={href} className={`bv-nav-link ${pathname.startsWith(`/${vaiTro}/${slug}`) ? 'active' : ''}`} title={nhan}><Icon size={18}/><span>{nhan}</span></Link>;
          })}
        </nav>
        <div className="bv-side-user">
          <div className="bv-user-line">
            <div className="bv-avatar">{laKhach ? 'K' : (phien?.nguoiDung.hoTen?.slice(0, 1) ?? 'BV')}</div>
            <div><div className="bv-user-name">{laKhach ? 'Khách tại bàn' : phien?.nguoiDung.hoTen}</div><div className="bv-user-role">{VAI_TRO[vaiTro]?.nhan}</div></div>
          </div>
        </div>
      </aside>
      <main className="bv-main">
        <header className="bv-topbar">
          <div className="bv-topbar-leading">
            <button className="bv-icon-btn bv-menu-button" aria-label="Mở menu" aria-expanded={moMenu} onClick={() => setMoMenu(true)}><Menu size={19}/></button>
            <div className="bv-breadcrumb">Bếp Việt POS &nbsp;/&nbsp; {VAI_TRO[vaiTro]?.nhan} &nbsp;/&nbsp; <strong>{tenTrang}</strong></div>
            <div className="bv-mobile-title">{tenTrang}</div>
          </div>
          <div className="bv-top-actions">
            <span className="bv-badge success"><i className="bv-dot"/>Đang hoạt động</span>
            <button className="bv-icon-btn" onClick={doiCheDo} title={cheDo === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}>{cheDo === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button>
            {!laKhach && <button className="bv-icon-btn" title="Thông báo"><Bell size={17}/></button>}
            {!laKhach && <button className="bv-icon-btn" title="Đăng xuất" onClick={() => { xoaPhien(); router.replace('/dang-nhap'); }}><LogOut size={17}/></button>}
          </div>
        </header>
        <div className="bv-content">{children}</div>
      </main>
    </div>
  );
}
