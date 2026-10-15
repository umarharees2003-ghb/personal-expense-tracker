import React from 'react';
import { IconBox, money } from './common.jsx';

export function SummaryCard({ title, amount, icon: Icon, color, detail }) {
  return <div className="summary-card"><div className="summary-top"><span>{title}</span><IconBox icon={Icon} color={color} /></div><strong className="summary-amount">{money(amount)}</strong><div className="summary-change"><small>{detail}</small></div></div>;
}
