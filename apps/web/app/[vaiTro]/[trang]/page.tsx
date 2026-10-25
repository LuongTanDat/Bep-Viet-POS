import { notFound } from 'next/navigation';
import { RolePage } from '@/components/RolePage';
import { MENU, VAI_TRO } from '@/lib/navigation';

export default async function Page({ params }: { params: Promise<{ vaiTro: string; trang: string }> }) {
  const { vaiTro, trang } = await params;
  if (!VAI_TRO[vaiTro] || !MENU[vaiTro]?.some((m) => m.slug === trang)) notFound();
  return <RolePage vaiTro={vaiTro} trang={trang}/>;
}
