'use client';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type CheDo = 'dark' | 'light';
const ThemeContext = createContext<{ cheDo: CheDo; doiCheDo: () => void }>({ cheDo: 'dark', doiCheDo: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [cheDo, setCheDo] = useState<CheDo>('dark');

  useEffect(() => {
    const daLuu = localStorage.getItem('bep-viet-theme') as CheDo | null;
    const macDinh: CheDo = daLuu ?? 'dark';
    setCheDo(macDinh);
    document.documentElement.dataset.theme = macDinh;
  }, []);

  /** Đổi Light/Dark và ghi nhớ lựa chọn trên máy người dùng. */
  const doiCheDo = () => setCheDo((hienTai) => {
    const moi = hienTai === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = moi;
    localStorage.setItem('bep-viet-theme', moi);
    return moi;
  });

  const value = useMemo(() => ({ cheDo, doiCheDo }), [cheDo]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
