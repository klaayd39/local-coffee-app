import { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle2, User, Loader2
} from 'lucide-react';
import {
  signInUser,
  signUpUser,
  resetPassword,
  signInWithGoogle,
  upsertProfile,
} from '../lib/supabaseClient.js';

/* ─────────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const has8 = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const score = [has8, hasUpper, hasNum].filter(Boolean).length;
  const levels = [
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#22C55E' },
  ];
  const { label, color } = levels[score - 1] || { label: '', color: '#E5E7EB' };
  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="auth-strength-bar"
            style={{ background: i < score ? color : undefined }}
          />
        ))}
      </div>
      {label && <span className="auth-strength-label" style={{ color }}>{label}</span>}
    </div>
  );
}

function CoffeeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────── */
export default function AuthLandingPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [screenState, setScreenState] = useState('form'); // 'form' | 'confirm_email'

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* ── Helpers ── */
  const switchMode = (next) => {
    setMode(next);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  /* ── Validation ── */
  const validate = () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }
    if (mode !== 'forgot') {
      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return false;
      }
    }
    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  /* ── Main Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'forgot') {
        await resetPassword(email);
        setScreenState('confirm_email');
        return;
      }

      if (mode === 'signup') {
        const data = await signUpUser(email, password, name.trim());
        // Try to create profile (safe even if trigger already does this)
        if (data?.user?.id) {
          await upsertProfile(data.user.id, { fullName: name.trim(), email });
        }
        // Supabase requires email confirmation by default
        setScreenState('confirm_email');
        return;
      }

      if (mode === 'login') {
        const data = await signInUser(email, password);
        if (onLoginSuccess && data?.user) {
          onLoginSuccess({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name
              || data.user.email.split('@')[0],
          });
        }
      }
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      // Surface friendly Supabase error messages
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Incorrect email or password. Please try again.');
      } else if (msg.includes('Email not confirmed')) {
        setErrorMsg('Please confirm your email before signing in.');
      } else if (msg.includes('User already registered')) {
        setErrorMsg('An account with this email already exists. Try signing in.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Google OAuth ── */
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      // Page will redirect — no further action needed
    } catch (err) {
      setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  /* ────────────────────────────────────────────────
     EMAIL CONFIRMATION SCREEN
  ──────────────────────────────────────────────── */
  if (screenState === 'confirm_email') {
    return (
      <div className="passport-landing-wrapper">
        <div className="passport-card auth-anim-fadein">
          <div className="auth-confirm-screen">
            <div className="auth-confirm-icon">
              <CheckCircle2 size={40} strokeWidth={1.5} />
            </div>
            <h1 className="passport-title">
              {mode === 'forgot' ? 'Check Your Inbox' : 'Almost There!'}
            </h1>
            <p className="passport-subtitle auth-confirm-body">
              {mode === 'forgot'
                ? `We sent a password reset link to `
                : `We sent a confirmation email to `}
              <strong>{email}</strong>.
              {mode === 'forgot'
                ? ' Follow the link in your email to reset your password.'
                : ' Click the link to activate your account, then sign in.'}
            </p>
            <div className="auth-confirm-tip">
              ☕ Didn't get it? Check your spam folder or&nbsp;
              <button
                className="passport-link-bold"
                onClick={() => {
                  setScreenState('form');
                  setErrorMsg('');
                }}
              >
                try again
              </button>
              .
            </div>
            <button
              className="passport-submit-btn"
              style={{ marginTop: 28 }}
              onClick={() => { setScreenState('form'); switchMode('login'); }}
            >
              <span>Back to Sign In</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────
     MAIN FORM
  ──────────────────────────────────────────────── */
  const titles = {
    login: 'KapeGram',
    signup: 'Create Your Account',
    forgot: 'Reset Password',
  };
  const subtitles = {
    login: '',
    signup: 'Join the Malaybalay coffee trail & start collecting',
    forgot: 'Enter your email to receive recovery instructions',
  };

  return (
    <div className="passport-landing-wrapper">
      {/* Decorative background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      <div className="passport-card auth-anim-fadein">

        {/* ── Header ── */}
        <div className="passport-card-header">
          <div className="passport-icon-badge auth-icon-float">
            <CoffeeIcon />
          </div>
          <h1 className="passport-title">{titles[mode]}</h1>
          <p className="passport-subtitle">{subtitles[mode]}</p>
        </div>

        {/* ── Alerts ── */}
        {errorMsg && (
          <div className="passport-alert error auth-anim-fadein">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="passport-alert success auth-anim-fadein">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Google OAuth (login + signup only) ── */}
        {mode !== 'forgot' && (
          <>
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? (
                <Loader2 size={18} className="auth-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Connecting…'
                  : mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
            </button>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
          </>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="passport-form" noValidate>

          {/* Full Name — signup only */}
          {mode === 'signup' && (
            <div className="passport-field auth-anim-fadein">
              <label htmlFor="auth-name">Full Name</label>
              <div className="passport-input-box">
                <User size={18} className="passport-input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Maria Santos"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="passport-field">
            <label htmlFor="auth-email">Email Address</label>
            <div className="passport-input-box">
              <Mail size={18} className="passport-input-icon" />
              <input
                id="auth-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div className="passport-field auth-anim-fadein">
              <div className="passport-field-header">
                <label htmlFor="auth-password">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="passport-link"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="passport-input-box">
                <Lock size={18} className="passport-input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className="passport-eye-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'signup' && <PasswordStrength password={password} />}
            </div>
          )}

          {/* Confirm Password — signup only */}
          {mode === 'signup' && (
            <div className="passport-field auth-anim-fadein">
              <label htmlFor="auth-confirm">Confirm Password</label>
              <div
                className={`passport-input-box ${confirmPassword && confirmPassword !== password
                  ? 'auth-input-mismatch'
                  : confirmPassword && confirmPassword === password
                    ? 'auth-input-match'
                    : ''
                  }`}
              >
                <Lock size={18} className="passport-input-icon" />
                <input
                  id="auth-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="passport-eye-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="auth-field-hint auth-field-hint--error">
                  Passwords don't match
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="auth-field-hint auth-field-hint--ok">
                  ✓ Passwords match
                </p>
              )}
            </div>
          )}

          {/* Remember me — login only */}
          {mode === 'login' && (
            <div className="passport-checkbox-row">
              <label className="passport-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span className="passport-checkbox-custom">
                  {rememberMe && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1.5 5 4.5 8 10.5 1.5" />
                    </svg>
                  )}
                </span>
                <span className="passport-checkbox-text">Remember this device</span>
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="passport-submit-btn"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="auth-spin" />
                <span>
                  {mode === 'login' && 'Signing in…'}
                  {mode === 'signup' && 'Creating account…'}
                  {mode === 'forgot' && 'Sending email…'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Passport'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Recovery Email'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <div className="passport-card-footer">
          {mode === 'login' && (
            <p>
              Don&apos;t have a coffee passport?{' '}
              <button className="passport-link-bold" onClick={() => switchMode('signup')}>
                Sign up free
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button className="passport-link-bold" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button className="passport-link-bold" onClick={() => switchMode('login')}>
                Back to Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
