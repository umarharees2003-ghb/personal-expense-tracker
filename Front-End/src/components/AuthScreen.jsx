import React, { useState } from 'react';
import {
  ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Moon, ShieldCheck, Sun, User, Wallet,
} from 'lucide-react';

export function AuthScreen({
  onLogin, onRegister, loading, error, onClearError, dark, setDark,
}) {
  const [register, setRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setValidationError('');
    onClearError();

    const form = new FormData(event.currentTarget);
    const email = (form.get('email') || '').trim();
    const password = form.get('password') || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      if (register) {
        const name = (form.get('name') || '').trim();
        const confirmPassword = form.get('confirmPassword') || '';

        if (!name) {
          setValidationError('Please enter your full name.');
          return;
        }
        if (name.length > 100) {
          setValidationError('Name must be 100 characters or fewer.');
          return;
        }
        if (password.length < 8) {
          setValidationError('Password must be at least 8 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setValidationError('Passwords do not match.');
          return;
        }

        await onRegister({ name, email, password });
      } else {
        if (!password) {
          setValidationError('Please enter your password.');
          return;
        }
        await onLogin({ email, password });
      }
    } catch {
      // Backend error is propagated through context and passed via error prop
    }
  }

  function toggleMode() {
    setRegister((value) => !value);
    setValidationError('');
    onClearError();
  }

  return (
    <div className={`auth-screen${dark ? ' dark-mode' : ''}`}>
      <div className="auth-decoration">
        <div className="auth-brand">
          <span className="brand-mark">
            <Wallet size={20} strokeWidth={2.2} />
          </span>
          <span>finora<span className="brand-period">.</span></span>
        </div>
        <div className="auth-quote">
          <span className="eyebrow">PERSONAL FINANCE PLATFORM</span>
          <h1>
            Clear, confident<br />
            control of your<br />
            <em>finances.</em>
          </h1>
          <p>
            Track your income and expenses, monitor monthly cash flow, and build
            disciplined spending habits with real financial data.
          </p>
          <div className="auth-decoration-donut" />
          <span className="auth-footnote">Enterprise-grade security · JWT authentication</span>
        </div>
      </div>

      <div className="auth-form-side">
        <button
          className="auth-theme-toggle"
          type="button"
          onClick={() => setDark(!dark)}
          aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <div className="auth-form-wrap">
          <span className="auth-welcome">
            {register ? 'GET STARTED' : 'WELCOME BACK'}
          </span>
          <h2>{register ? 'Create your account' : 'Sign in to Finora'}</h2>
          <p>
            {register
              ? 'Enter your details below to create your personal finance workspace.'
              : 'Enter your credentials to access your financial dashboard.'}
          </p>

          <form onSubmit={submit} noValidate>
            {register && (
              <label className="form-field">
                Full name
                <span className="auth-input">
                  <User size={16} aria-hidden="true" />
                  <input
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength="100"
                    placeholder="e.g. Alex Rivera"
                    required
                    aria-label="Full name"
                  />
                </span>
              </label>
            )}

            <label className="form-field">
              Email address
              <span className="auth-input">
                <Mail size={16} aria-hidden="true" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength="254"
                  placeholder="you@example.com"
                  required
                  aria-label="Email address"
                />
              </span>
            </label>

            <label className="form-field">
              Password
              <span className="auth-input">
                <LockKeyhole size={16} aria-hidden="true" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  placeholder={register ? 'At least 8 characters' : 'Enter your password'}
                  minLength={register ? 8 : undefined}
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {register && (
              <label className="form-field">
                Confirm password
                <span className="auth-input">
                  <LockKeyhole size={16} aria-hidden="true" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    minLength="8"
                    required
                    aria-label="Confirm password"
                  />
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
            )}

            {register && (
              <small className="field-hint">
                Password must be at least 8 characters with letters, numbers, or symbols.
              </small>
            )}

            {!register && (
              <button
                type="button"
                className="forgot-link"
                onClick={() => setValidationError('Password reset is not implemented in this demo.')}
              >
                Forgot password?
              </button>
            )}

            {(validationError || error) && (
              <div className="form-error" role="alert">
                {validationError || error}
              </div>
            )}

            <button
              className="button-primary auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="auth-switch">
            {register ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button type="button" onClick={toggleMode} disabled={loading}>
              {register ? 'Sign in' : 'Create an account'}
            </button>
          </div>

          <div className="auth-security">
            <ShieldCheck size={15} /> Passwords hashed with BCrypt · Stateless JWT sessions
          </div>
        </div>
      </div>
    </div>
  );
}
