import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState(false)

  // Semak session — Supabase auto-set session bila user klik link emel
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true)
      } else {
        setSessionError(true)
      }
    })
  }, [])

  const validate = () => {
    const err = {}
    if (!password) err.password = 'Kata laluan diperlukan'
    else if (password.length < 8) err.password = 'Minimum 8 aksara'
    if (!confirmPassword) err.confirmPassword = 'Sila sahkan kata laluan'
    else if (password !== confirmPassword) err.confirmPassword = 'Kata laluan tidak sepadan'
    return err
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setErrors({ password: error.message })
      setLoading(false)
      return
    }

    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", margin: 0, padding: 0, width: '100%', minHeight: '100vh', background: '#0a0a0f' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; display: block; text-align: left; border: none; min-height: 100vh; }

        .rp-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100%; }

        .rp-left { background: linear-gradient(135deg, rgba(29,158,117,0.12) 0%, transparent 60%), #0d0d14; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; }
        .rp-left::before { content: ''; position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; }
        .rp-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; cursor: pointer; width: fit-content; }
        .rp-logo-dot { width: 32px; height: 32px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
        .rp-left-content { position: relative; z-index: 1; }
        .rp-left-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(29,158,117,0.12); color: #4ecca3; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 999px; margin-bottom: 20px; border: 1px solid rgba(29,158,117,0.25); letter-spacing: 0.06em; text-transform: uppercase; }
        .rp-left-h1 { font-size: 32px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 14px; }
        .rp-left-h1 span { background: linear-gradient(135deg, #1D9E75, #4ecca3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rp-left-p { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 40px; max-width: 340px; }
        .rp-tips { display: flex; flex-direction: column; gap: 14px; }
        .rp-tip { display: flex; align-items: flex-start; gap: 12px; }
        .rp-tip-icon { width: 32px; height: 32px; background: rgba(29,158,117,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; margin-top: 1px; }
        .rp-tip-text { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.5; }
        .rp-left-footer { font-size: 12px; color: rgba(255,255,255,0.2); }

        .rp-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #0a0a0f; }
        .rp-form-wrap { width: 100%; max-width: 400px; }
        .rp-form-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px; }
        .rp-form-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 32px; line-height: 1.6; }

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

        .btn-submit { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s, opacity 0.2s; font-family: inherit; }
        .btn-submit:hover:not(:disabled) { background: #178763; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Success state */
        .rp-success { text-align: center; }
        .rp-success-icon { width: 72px; height: 72px; background: rgba(29,158,117,0.15); border: 1px solid rgba(29,158,117,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px; }
        .rp-success-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 12px; }
        .rp-success-p { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.7; }

        /* Error/loading state */
        .rp-error-box { text-align: center; padding: 24px; }
        .rp-error-icon { width: 64px; height: 64px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
        .rp-error-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .rp-error-p { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 24px; }
        .btn-secondary { padding: 12px 24px; border-radius: 10px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; font-family: inherit; }

        @media (max-width: 768px) {
          .rp-wrap { grid-template-columns: 1fr; }
          .rp-left { display: none; }
          .rp-right { padding: 32px 24px; align-items: flex-start; min-height: 100vh; }
          .rp-form-wrap { max-width: 100%; }
          .rp-mobile-logo { display: flex !important; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 28px; cursor: pointer; }
        }
        .rp-mobile-logo { display: none; }
      `}</style>

      <div className="rp-wrap">

        {/* LEFT */}
        <div className="rp-left">
          <div className="rp-logo" onClick={() => navigate('/')}>
            <div className="rp-logo-dot">💧</div>
            SuHu
          </div>
          <div className="rp-left-content">
            <div className="rp-left-badge">🔒 Keselamatan Akaun</div>
            <h1 className="rp-left-h1">Cipta kata laluan<br/>yang <span>kukuh.</span></h1>
            <p className="rp-left-p">Kata laluan baharu anda akan melindungi akses ke dashboard tangki SuHu.</p>
            <div className="rp-tips">
              <div className="rp-tip">
                <div className="rp-tip-icon">🔢</div>
                <div className="rp-tip-text">Minimum 8 aksara — gabungan huruf dan nombor lebih kukuh.</div>
              </div>
              <div className="rp-tip">
                <div className="rp-tip-icon">🚫</div>
                <div className="rp-tip-text">Elakkan kata laluan yang sama dengan akaun lain anda.</div>
              </div>
              <div className="rp-tip">
                <div className="rp-tip-icon">🔐</div>
                <div className="rp-tip-text">Kata laluan anda dienkripsi — kami sendiri tidak dapat melihatnya.</div>
              </div>
            </div>
          </div>
          <div className="rp-left-footer">© SuHu 2026 · Dasar Privasi · Terma Penggunaan</div>
        </div>

        {/* RIGHT */}
        <div className="rp-right">
          <div className="rp-form-wrap">

            <div className="rp-mobile-logo" onClick={() => navigate('/')}>
              <div className="rp-logo-dot">💧</div>
              SuHu
            </div>

            {/* Loading session */}
            {!sessionReady && !sessionError && (
              <div className="rp-error-box">
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Mengesahkan pautan...</div>
              </div>
            )}

            {/* Invalid / expired link */}
            {sessionError && (
              <div className="rp-error-box">
                <div className="rp-error-icon">⚠</div>
                <div className="rp-error-title">Pautan tidak sah</div>
                <p className="rp-error-p">
                  Pautan tetapan semula ini telah luput atau tidak sah.
                  Sila mohon pautan baharu.
                </p>
                <button className="btn-secondary" onClick={() => navigate('/forgot-password')}>
                  Mohon pautan baharu
                </button>
              </div>
            )}

            {/* Success */}
            {sessionReady && success && (
              <div className="rp-success">
                <div className="rp-success-icon">✅</div>
                <div className="rp-success-title">Kata laluan dikemaskini!</div>
                <p className="rp-success-p">
                  Kata laluan anda telah berjaya ditetapkan semula.
                  Mengalihkan ke log masuk...
                </p>
              </div>
            )}

            {/* Form */}
            {sessionReady && !success && (
              <>
                <div className="rp-form-title">Tetapkan kata laluan baharu</div>
                <div className="rp-form-sub">
                  Masukkan kata laluan baharu untuk akaun SuHu anda.
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label">Kata Laluan Baharu</label>
                    <div className="form-input-wrap">
                      <input
                        className={`form-input form-input-pass${errors.password ? ' form-input-error' : ''}`}
                        type={showPass ? 'text' : 'password'}
                        placeholder="Minimum 8 aksara"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })) }}
                      />
                      <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sahkan Kata Laluan</label>
                    <div className="form-input-wrap">
                      <input
                        className={`form-input form-input-pass${errors.confirmPassword ? ' form-input-error' : ''}`}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Ulang kata laluan"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })) }}
                      />
                      <button type="button" className="pass-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
                  </div>

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Mengemaskini...' : 'Tetapkan Kata Laluan →'}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}