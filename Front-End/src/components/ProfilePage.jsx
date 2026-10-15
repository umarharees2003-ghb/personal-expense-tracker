import React, { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react';

export function ProfilePage({ profile, onSave, onLogout, loading, error }) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const initials = name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
  }, [profile.name, profile.email]);

  return <>
    <div className="page-title-row"><div><div className="eyebrow"><span className="live-dot" /> YOUR SPACE, YOUR WAY</div><h1>My profile</h1><p>Keep your personal details up to date.</p></div></div>
    <div className="profile-layout">
      <div className="panel profile-card"><div className="profile-cover"><span className="profile-avatar-large">{initials}</span></div><strong>{profile.name}</strong><span>{profile.email}</span><div className="profile-plan"><ShieldCheck size={15} /> Personal account</div><button className="button-quiet profile-logout" onClick={onLogout}><LogOut size={15} /> Sign out</button></div>
      <div className="panel profile-form-panel">
        <h2>Personal information</h2><p>Update the name and email address on your account.</p>
        <form onSubmit={(event) => onSave(event, { name, email })}>
          <label className="form-field">Full name<input value={name} maxLength="100" onChange={(event) => setName(event.target.value)} required /></label>
          <label className="form-field">Email address<input type="email" value={email} maxLength="254" onChange={(event) => setEmail(event.target.value)} required /></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="profile-divider" /><h3>Password & security</h3>
          <div className="password-row"><span className="security-icon"><LockKeyhole size={17} /></span><div><strong>Password</strong><small>Password changes are managed separately.</small></div></div>
          <div className="profile-form-actions"><button className="button-primary" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save changes'} {!loading && <ArrowRight size={15} />}</button></div>
        </form>
      </div>
    </div>
  </>;
}
