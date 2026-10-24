import React from 'react';
import { ChevronDown, ChevronRight, Menu, Search } from 'lucide-react';

export default function Topbar({ page, setPage, search, setSearch, setMobileNav, profile }) {
  const initials = profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';
  return <header className="topbar">
    <button className="mobile-menu icon-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
    <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{page}</strong></div>
    <div className="topbar-actions">
      <label className="global-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search transactions..." aria-label="Search transactions by description" /></label>
      <button className="topbar-profile" onClick={() => setPage('Profile')}><span className="user-avatar">{initials}</span><ChevronDown size={15} /></button>
    </div>
  </header>;
}
