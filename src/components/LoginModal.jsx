import { useState } from 'react';
import { Coffee, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signUpUser, signInUser, supabase } from '../lib/supabaseClient.js';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSuccessMsg(`Password reset link sent to ${email}`);
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 3000);
      } else if (mode === 'signup') {
        const data = await signUpUser(email, password, name);
        if (data?.user) {
          // Explicitly upsert initial profile entry in Supabase public.profiles table
          const username = email.split('@')[0] || `user_${Math.floor(Math.random() * 10000)}`;
          const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          
          await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              email: email,
              name: name,
              username: username,
              avatar_url: defaultAvatar,
              tier: 'Bean Explorer',
              level: 'Level 1: Novice'
            }
          ]).catch(console.warn);

          const userData = {
            id: data.user.id,
            name: name,
            email: email,
            username: username,
            avatar: defaultAvatar,
            joined: 'Just now',
            tier: 'Bean Explorer'
          };
          
          if (onLoginSuccess) onLoginSuccess(userData);
          setSuccessMsg('Account created successfully! Welcome to Kapehan ☕');
          setTimeout(() => onClose(), 1500);
        }
      } else if (mode === 'login') {
        const data = await signInUser(email, password);
        if (data?.user) {
          const userData = {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || (email.split('@')[0] || 'Coffee Explorer'),
            email: email,
            avatar: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            joined: 'Active Member',
            tier: 'Bean Explorer'
          };
          if (onLoginSuccess) onLoginSuccess(userData);
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        name: `Maria Santos (${provider})`,
        email: `maria.santos@${provider.toLowerCase()}.com`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        joined: 'Just now',
        tier: 'VIP Connoisseur'
      };
      if (onLoginSuccess) onLoginSuccess(userData);
      onClose();
    }, 800);
  };

  const handleFillDemo = () => {
    setEmail('klydeyabo@gmail.com');
    setPassword('CoffeePassword123!');
    setName('Klyde Joseph Yabo');
    setMode('login');
  };


  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header decoration */}
        <div className="login-header">
          <button className="login-close-btn" onClick={onClose} aria-label="Close modal">×</button>
          <div className="login-brand-badge">
            <div className="login-logo-icon">
              <img src="/icon-192.png" alt="Kapehan Icon" style={{ width: 28, height: 28, borderRadius: 6 }} />
            </div>
          </div>
          <h2 className="login-title">
            {mode === 'login' && 'Welcome Back to Kapehan'}
            {mode === 'signup' && 'Join Malaybalay Coffee Trail'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="login-subtitle">
            {mode === 'login' && 'Log in to collect passport stamps & unlock rewards'}
            {mode === 'signup' && 'Create your passport account & start exploring local cafes'}
            {mode === 'forgot' && 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Content Body */}
        <div className="login-body">
          {errorMsg && (
            <div className="login-alert error">
              <span>⚠️ {errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-alert success">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="auth-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="e.g. Maria Santos"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="form-group">
                <div className="label-with-link">
                  <label htmlFor="auth-password">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setMode('forgot')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="remember-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-text">Authenticating…</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In'}
                    {mode === 'signup' && 'Create Passport'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Modal Footer switcher */}
        <div className="login-footer">
          {mode === 'login' && (
            <p>
              Don't have a coffee passport yet?{' '}
              <button className="text-link-bold" onClick={() => setMode('signup')}>
                Sign up free
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button className="text-link-bold" onClick={() => setMode('login')}>
                Log in here
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              Remembered your password?{' '}
              <button className="text-link-bold" onClick={() => setMode('login')}>
                Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
