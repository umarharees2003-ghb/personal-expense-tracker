import React from 'react';
import {
  ArrowRight, ChevronDown, FileText, Grid2X2, LayoutDashboard, LogOut,
  Receipt, Settings, ShoppingBag, Sparkles, UserRound, Wallet,
} from 'lucide-react';

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, section: 'main' },
  { label: 'Transactions', icon: Receipt, section: 'main' },
  { label: 'Categories', icon: Grid2X2, section: 'manage' },
  { label: 'Reports', icon: FileText, section: 'manage' },
];

export default function Sidebar({ page, setPage, mobileNav, setMobileNav, transactions, profile, setLoggedIn, flash }) {
  const initials = profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';
  return <aside className={`sidebar${mobileNav ? ' nav-open' : ''}`}>
    <a className="brand" href="#" onClick={(event) => { event.preventDefault(); setPage('Overview'); }}>
      <span className="brand-mark"><Wallet size={20} strokeWidth={2.2} /></span>
      <span>finora<span className="brand-period">.</span></span>
    </a>
    <div className="workspace-switch">
      <span className="workspace-avatar">U</span>
      <span className="workspace-copy"><strong>Personal workspace</strong><small>Personal account</small></span>
      <ChevronDown size={15} className="workspace-chevron" />
    </div>
    <span className="nav-caption">WORKSPACE</span>
    <nav className="side-nav" aria-label="Main navigation">
      {navigation.map(({ label, icon: Icon, section }) => (
        <div key={label}>
          {section === 'manage' && label === 'Categories' && <span className="nav-caption manage-caption">MANAGE</span>}
          <button className={`nav-link${page === label ? ' active' : ''}`} onClick={() => { setPage(label); setMobileNav(false); }}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            {label === 'Transactions' && <span className="nav-count">{transactions.length}</span>}
          </button>
        </div>
      ))}
    </nav>
    <div className="sidebar-bottom">
      <div className="upgrade-card">
        <span className="upgrade-icon"><Sparkles size={16} /></span>
        <strong>A little more clarity?</strong>
        <p>Get more insights with Finora Plus.</p>
        <button onClick={() => flash('You’re already making great progress!')}>Explore Plus <ArrowRight size={14} /></button>
      </div>
      <button className={`nav-link${page === 'Settings' ? ' active' : ''}`} onClick={() => { setPage('Settings'); setMobileNav(false); }}><Settings size={18} /><span>Settings</span></button>
      <button className={`nav-link${page === 'Profile' ? ' active' : ''}`} onClick={() => { setPage('Profile'); setMobileNav(false); }}><UserRound size={18} /><span>My profile</span></button>
      <div className="sidebar-user">
        <span className="user-avatar">{initials}</span>
        <span className="user-copy"><strong>{profile.name}</strong><small>Free plan</small></span>
      </div>
      <button className="nav-link signout-link" onClick={() => setLoggedIn(false)}><LogOut size={18} /><span>Sign out</span></button>
    </div>
  </aside>;
}
