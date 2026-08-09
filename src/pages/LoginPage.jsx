import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setAuthError('')
  }

  const validate = () => {
    const err = {}
    if (!form.email.trim()) err.email = 'Emel diperlukan'
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Format emel tidak sah'
    if (!form.password) err.password = 'Kata laluan diperlukan'
    return err
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const err = validate()
  if (Object.keys(err).length > 0) { setErrors(err); return }
  setLoading(true)

  const { error } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })

  if (error) {
    setAuthError('Emel atau kata laluan tidak sah.')
    setLoading(false)
    return
  }

  setLoading(false)
  navigate('/dashboard')
}

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", margin: 0, padding: 0, width: '100%', minHeight: '100vh', background: '#0a0a0f' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; display: block; text-align: left; border: none; min-height: 100vh; }

        .login-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100%; }

        /* LEFT PANEL */
        .login-left { background: linear-gradient(135deg, rgba(29,158,117,0.12) 0%, transparent 60%), #0d0d14; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; }
        .login-left::before { content: ''; position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 70%); bottom: -100px; right: -100px; pointer-events: none; }
        .login-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; cursor: pointer; width: fit-content; }
        .login-logo-dot { width: 32px; height: 32px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
        .login-left-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(29,158,117,0.12); color: #4ecca3; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 999px; margin-bottom: 20px; border: 1px solid rgba(29,158,117,0.25); letter-spacing: 0.06em; text-transform: uppercase; }
        .login-left-h1 { font-size: 34px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 14px; }
        .login-left-h1 span { background: linear-gradient(135deg, #1D9E75, #4ecca3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .login-left-p { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 40px; max-width: 340px; }

        /* Stats card */
        .login-stats { display: flex; flex-direction: column; gap: 12px; }
        .login-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; }
        .login-stat-icon { width: 38px; height: 38px; background: rgba(29,158,117,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .login-stat-val { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1; margin-bottom: 3px; }
        .login-stat-label { font-size: 12px; color: rgba(255,255,255,0.4); }
        .login-left-footer { font-size: 12px; color: rgba(255,255,255,0.2); }

        /* RIGHT PANEL */
        .login-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #0a0a0f; }
        .login-form-wrap { width: 100%; max-width: 400px; }
        .login-form-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
        .login-form-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 32px; }
        .login-form-sub a { color: #4ecca3; text-decoration: none; cursor: pointer; }
        .login-form-sub a:hover { text-decoration: underline; }

        .form-group { margin-bottom: 18px; }
        .form-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; display: block; }
        .form-input-wrap { position: relative; }
        .form-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s, background 0.2s; }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: rgba(29,158,117,0.6); background: rgba(29,158,117,0.04); }
        .form-input-error { border-color: rgba(239,68,68,0.5) !important; background: rgba(239,68,68,0.04) !important; }
        .form-input-pass { padding-right: 44px !important; }
        .form-error { font-size: 11px; color: #f87171; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 13px; padding: 4px; transition: color 0.2s; }
        .pass-toggle:hover { color: rgba(255,255,255,0.6); }

        .forgot-row { display: flex; justify-content: flex-end; margin-top: -10px; margin-bottom: 18px; }
        .forgot-link { font-size: 12px; color: #4ecca3; background: none; border: none; cursor: pointer; padding: 0; }
        .forgot-link:hover { text-decoration: underline; }

        .auth-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #f87171; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }

        .btn-submit { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; transition: background 0.2s, opacity 0.2s; font-family: inherit; }
        .btn-submit:hover:not(:disabled) { background: #178763; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .form-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .form-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .form-divider-text { font-size: 12px; color: rgba(255,255,255,0.25); }

        .btn-google { width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, border-color 0.2s; font-family: inherit; margin-bottom: 24px; }
        .btn-google:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); }
        .google-icon { width: 18px; height: 18px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #4285F4; flex-shrink: 0; }

        .register-prompt { text-align: center; padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; font-size: 13px; color: rgba(255,255,255,0.4); }
        .register-prompt a { color: #4ecca3; text-decoration: none; font-weight: 600; cursor: pointer; }
        .register-prompt a:hover { text-decoration: underline; }

        /* MOBILE */
        @media (max-width: 768px) {
          .login-wrap { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 32px 24px; align-items: flex-start; min-height: 100vh; }
          .login-form-wrap { max-width: 100%; }
          .login-mobile-logo { display: flex !important; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 28px; cursor: pointer; }
        }
        .login-mobile-logo { display: none; }
      `}</style>

      <div className="login-wrap">

        {/* ── LEFT PANEL ── */}
        <div className="login-left">
          <div className="login-logo" onClick={() => navigate('/')}>
            <div className="login-logo-dot">💧</div>
            SuHu
          </div>
          <div>
            <div className="login-left-badge">🌿 Sistem Penuaian Air Hujan</div>
            <h1 className="login-left-h1">
              Selamat kembali.<br />
              Tangki anda <span>menanti.</span>
            </h1>
            <p className="login-left-p">
              Log masuk untuk pantau paras air, status solar,
              dan ramalan hujan kawasan anda secara masa nyata.
            </p>
            <div className="login-stats">
              {[
                { icon: '💧', val: '73%', label: 'Paras tangki semasa' },
                { icon: '☀️', val: '18.4V', label: 'Output solar semasa' },
                { icon: '🌧️', val: 'Esok', label: 'Jangkaan hujan seterusnya' },
              ].map((s, i) => (
                <div key={i} className="login-stat-card">
                  <div className="login-stat-icon">{s.icon}</div>
                  <div>
                    <div className="login-stat-val">{s.val}</div>
                    <div className="login-stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="login-left-footer">© SuHu 2026 · Dasar Privasi · Terma Penggunaan</div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="login-right">
          <div className="login-form-wrap">

            {/* Mobile logo */}
            <div className="login-mobile-logo" onClick={() => navigate('/')}>
              <div className="login-logo-dot">💧</div>
              SuHu
            </div>

            <div className="login-form-title">Log masuk</div>
            <div className="login-form-sub">
              Belum ada akaun?{' '}
              <a onClick={() => navigate('/register')}>Daftar percuma</a>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Auth error */}
              {authError && (
                <div className="auth-error">
                  ⚠ {authError}
                </div>
              )}

              {/* Emel */}
              <div className="form-group">
                <label className="form-label">Alamat Emel</label>
                <input
                  className={`form-input${errors.email ? ' form-input-error' : ''}`}
                  type="email" name="email" placeholder="ahmad@email.com"
                  value={form.email} onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Kata Laluan</label>
                <div className="form-input-wrap">
                  <input
                    className={`form-input form-input-pass${errors.password ? ' form-input-error' : ''}`}
                    type={showPass ? 'text' : 'password'} name="password"
                    placeholder="Masukkan kata laluan"
                    value={form.password} onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>

              {/* Forgot password */}
              <div className="forgot-row">
                <button type="button" className="forgot-link" onClick={() => navigate('/forgot-password')}>
                  Lupa kata laluan?
                </button>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Mengesahkan...' : 'Log Masuk →'}
              </button>

              <div className="form-divider">
                <div className="form-divider-line" />
                <div className="form-divider-text">atau</div>
                <div className="form-divider-line" />
              </div>

              <button type="button" className="btn-google">
                <div className="google-icon">G</div>
                Log masuk dengan Google
              </button>

            </form>

            <div className="register-prompt">
              Belum ada unit SuHu?{' '}
              <a onClick={() => navigate('/')}>Ketahui lebih lanjut →</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}