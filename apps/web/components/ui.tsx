'use client';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PageHead({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="bv-page-head"><div><h1 className="bv-page-title">{title}</h1><div className="bv-page-desc">{description}</div></div>{actions ? <div className="bv-actions">{actions}</div> : null}</div>;
}

export function Card({ title, sub, right, children, className = '' }: { title?: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`bv-card ${className}`}>{title ? <div className="bv-card-header"><div><div className="bv-card-title">{title}</div>{sub ? <div className="bv-card-sub">{sub}</div> : null}</div>{right}</div> : null}{children}</section>;
}

export function StatCard({ label, value, foot, icon: Icon }: { label: string; value: ReactNode; foot: string; icon: LucideIcon }) {
  return <div className="bv-card bv-stat"><div className="bv-stat-top"><span>{label}</span><span className="bv-stat-icon"><Icon size={18}/></span></div><div className="bv-stat-value">{value}</div><div className="bv-stat-foot">{foot}</div></div>;
}

export function Badge({ type = 'neutral', children }: { type?: 'success'|'warning'|'danger'|'info'|'gold'|'neutral'; children: ReactNode }) {
  return <span className={`bv-badge ${type}`}><i className="bv-dot"/>{children}</span>;
}

export function Loading() {
  return <div className="bv-loader"><div><div className="bv-spinner"/><p>Đang tải dữ liệu…</p></div></div>;
}

export function Empty({ text }: { text: string }) {
  return <div className="bv-empty">{text}</div>;
}

/** Toast nhỏ dùng chung cho thao tác thành công/lỗi trong prototype. */
export function useToast() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2800);
    return () => clearTimeout(timer);
  }, [message]);
  return { show: setMessage, toast: message ? <div className="bv-toast">{message}</div> : null };
}
