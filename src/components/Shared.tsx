import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const Badge = ({ text, color }: { text: string, color: string }) => (
  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}40`, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
    {text}
  </span>
);

export const StatCard = ({ label, value, color, icon: Icon }: { label: string, value: string, color: string, icon: LucideIcon }) => (
  <div className="glass-panel stat-card">
    <div className="stat-label"><Icon size={14} style={{ marginRight: 6 }} />{label}</div>
    <div className="stat-value" style={{ color }}>{value}</div>
  </div>
);

export const SectionHeader = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{title}</h3>
    {action}
  </div>
);
