import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Wallet } from 'lucide-react';

export function AuthScreen({ onLogin, onRegister, loading, error, onClearError }) {
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setValidationError('');
    onClearError();
    const form = new FormData(event.currentTarget);
    const email = form.get('email').trim();
    const password = form.get('password');
    try {
      if (register) {
        const name = form.get('name').trim();
        if (password !== form.get('confirmPassword')) {
          setValidationError('Passwords do not match.');
          return;
        }
        await onRegister({ name, email, password });
      } else {
        await onLogin({ email, password });
      }
    } catch {
      // The context exposes the backend's safe error message to this form.
    }
  }

  function toggleMode() {
    setRegister((value) => !value);
    setValidationError('');
    onClearError();
  }

  return <div className="auth-screen">
    <div className="auth-decoration">
      <div className="auth-brand"><span className="brand-mark"><Wallet size={20} /></span>finora<span className="brand-period">.</span></div>
      <div className="auth-quote">
        <span className="eyebrow">A LITTLE MORE CLARITY</span>
        <h1>Feel good<br />about your<br /><em>money.</em></h1>
        <p>A calmer, clearer way to understand your spending — one small step at a time.</p>
        <div className="auth-decoration-donut" />
        <span className="auth-footnote">Your money story, beautifully told.</span>
      </div>
    </div>
    <div className="auth-form-side">
      <div className="auth-form-wrap">
        <span className="auth-welcome">{register ? 'A FRESH START' : 'YOUR MONEY, MADE SIMPLE'}</span>
        <h2>{register ? 'Create your account' : 'Welcome back'}</h2>
        <p>{register ? 'Start your journey toward a little more clarity.' : 'Good to see you again. Let’s pick up where you left off.'}</p>
        <form onSubmit={submit}>
          {register && <label className="form-field">Full name<input name="name" autoComplete="name" maxLength="100" placeholder="Your name" required /></label>}
          <label className="form-field">Email address<span className="auth-input"><Mail size={16} /><input name="email" type="email" autoComplete="email" maxLength="254" placeholder="you@example.com" required /></span></label>
          <label className="form-field">Password<span className="auth-input"><LockKeyhole size={16} /><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} placeholder={register ? 'At least 8 characters' : 'Your password'} minLength={register ? 8 : undefined} required /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
          {register && <label className="form-field">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" placeholder="One more time" minLength="8" required /></label>}
          {register && <small className="field-hint">Password must be at least 8 characters.</small>}
          {!register && <button type="button" className="forgot-link" onClick={() => setValidationError('Password reset is not available yet.')}>Forgot password?</button>}
          {(validationError || error) && <div className="form-error" role="alert">{validationError || error}</div>}
          <button className="button-primary auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : register ? 'Create account' : 'Log in'} {!loading && <ArrowRight size={16} />}</button>
        </form>
        <div className="auth-switch">{register ? 'Already have an account?' : "Don't have an account yet?"} <button onClick={toggleMode} disabled={loading}>{register ? 'Log in' : 'Create one'}</button></div>
        <div className="auth-security"><ShieldCheck size={15} /> Your information is private and secure.</div>
      </div>
    </div>
  </div>;
}
