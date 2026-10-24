import React, { useEffect, useState } from 'react';
import { Bell, Sun } from 'lucide-react';

export function SettingsPage({ dark, setDark, flash, currency = 'LKR', setCurrency }) {
  const [monthlySummary, setMonthlySummary] = useState(() => window.localStorage.getItem('finora.monthlySummary') !== 'false');

  const handleCurrencyChange = (newCurrency) => {
    window.localStorage.setItem('finora.currency', newCurrency);
    if (setCurrency) setCurrency(newCurrency);
    flash(`Display currency updated to ${newCurrency}`);
  };

  useEffect(() => {
    window.localStorage.setItem('finora.monthlySummary', String(monthlySummary));
  }, [monthlySummary]);

  return <>
    <div className="page-title-row">
      <div>
        <div className="eyebrow"><span className="live-dot" /> YOUR PREFERENCES</div>
        <h1>Settings</h1>
        <p>Make Finora feel a little more like yours.</p>
      </div>
    </div>
    <div className="settings-layout">
      <section className="panel settings-section">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><Sun size={18} /></span>
          <div>
            <h2>Appearance</h2>
            <p>Personalise the way Finora looks on your device.</p>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Dark mode</strong>
            <small>Easy on the eyes, especially at night.</small>
          </div>
          <button
            className={`toggle-switch${dark ? ' on' : ''}`}
            aria-label="Toggle dark mode"
            role="switch"
            aria-checked={dark}
            onClick={() => setDark(!dark)}
          >
            <span />
          </button>
        </div>

        <div className="settings-section-heading section-spaced">
          <span className="settings-section-icon currency-icon">Rs</span>
          <div>
            <h2>Currency Formatting</h2>
            <p>Choose how currency symbols appear across your transactions and reports.</p>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Display currency</strong>
            <small>Changes formatting only; amounts are not converted between currencies.</small>
          </div>
          <select
            className="settings-select"
            value={currency}
            onChange={(event) => handleCurrencyChange(event.target.value)}
            aria-label="Select display currency"
          >
            <option value="LKR">LKR — Sri Lankan Rupee (Rs.)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
          </select>
        </div>

        <div className="settings-section-heading section-spaced">
          <span className="settings-section-icon"><Bell size={18} /></span>
          <div>
            <h2>Local preferences</h2>
            <p>Saved in this browser. Finora does not send notifications.</p>
          </div>
        </div>
        <div className="setting-row">
          <div>
            <strong>Monthly summary preference</strong>
            <small>Remember whether you want a monthly summary reminder.</small>
          </div>
          <button
            className={`toggle-switch${monthlySummary ? ' on' : ''}`}
            role="switch"
            aria-checked={monthlySummary}
            aria-label="Toggle monthly summary preference"
            onClick={() => {
              setMonthlySummary((value) => !value);
              flash('Preference saved in this browser');
            }}
          >
            <span />
          </button>
        </div>
      </section>
    </div>
  </>;
}
