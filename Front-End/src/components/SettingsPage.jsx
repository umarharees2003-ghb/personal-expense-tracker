import React, { useEffect, useState } from 'react';
import { ArrowRight, Bell, CircleHelp, ShieldCheck, Sun } from 'lucide-react';

export function SettingsPage({ dark, setDark, flash }) {
  const [currency, setCurrency] = useState(() => window.localStorage.getItem('finora.currency') || 'LKR');
  const [monthlySummary, setMonthlySummary] = useState(() => window.localStorage.getItem('finora.monthlySummary') !== 'false');

  useEffect(() => {
    window.localStorage.setItem('finora.currency', currency);
  }, [currency]);

  useEffect(() => {
    window.localStorage.setItem('finora.monthlySummary', String(monthlySummary));
  }, [monthlySummary]);

  return <><div className="page-title-row"><div><div className="eyebrow"><span className="live-dot" /> YOUR PREFERENCES</div><h1>Settings</h1><p>Make Finora feel a little more like yours.</p></div></div>
    <div className="settings-layout"><section className="panel settings-section"><div className="settings-section-heading"><span className="settings-section-icon"><Sun size={18} /></span><div><h2>Appearance</h2><p>Personalise the way Finora looks on your device.</p></div></div><div className="setting-row"><div><strong>Dark mode</strong><small>Easy on the eyes, especially at night.</small></div><button className={`toggle-switch${dark ? ' on' : ''}`} aria-label="Toggle dark mode" role="switch" aria-checked={dark} onClick={() => setDark(!dark)}><span /></button></div>
      <div className="settings-section-heading section-spaced"><span className="settings-section-icon currency-icon">Rs</span><div><h2>Currency</h2><p>Choose how amounts appear throughout your account.</p></div></div><div className="setting-row"><div><strong>Display currency</strong><small>Used for all amounts and reports.</small></div><select className="settings-select" value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="LKR">LKR — Sri Lankan Rupee (Rs.)</option><option value="USD">USD — US Dollar ($)</option><option value="EUR">EUR — Euro (€)</option><option value="GBP">GBP — British Pound (£)</option></select></div>
      <div className="settings-section-heading section-spaced"><span className="settings-section-icon"><Bell size={18} /></span><div><h2>Notifications</h2><p>Stay in the loop, only when it matters.</p></div></div><div className="setting-row"><div><strong>Monthly spending summary</strong><small>A gentle reminder of how your month went.</small></div><button className={`toggle-switch${monthlySummary ? ' on' : ''}`} role="switch" aria-checked={monthlySummary} aria-label="Toggle monthly summary" onClick={() => { setMonthlySummary((value) => !value); flash('Notification preference updated'); }}><span /></button></div>
    </section><section className="panel danger-zone"><span><ShieldCheck size={17} /></span><div><h3>Your account, your choice.</h3><p>Your financial information stays private and secure. Need a hand with anything?</p><button onClick={() => flash('Support is here for you at hello@finora.app')}>Get a little help <ArrowRight size={14} /></button></div><CircleHelp className="danger-decoration" size={47} /></section></div>
  </>;
}
