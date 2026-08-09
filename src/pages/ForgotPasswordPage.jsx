import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const validate = () => {
    if (!email.trim()) return 'Emel diperlukan'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Format emel tidak sah'
    return ''
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const err = validate()
  if (err) { setError(err); return }
  setLoading(true)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5173/reset-password',
  })

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  setLoading(false)
  setSent(true)
}

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", margin: 0, padding: 0, width: '100%', minHeight: '100vh', background: '#0a0a0f' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; display: block; text-align: left; border: none; min-height: 100vh; }

        .fp-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100%; }

        /* LEFT */
        .fp-left { background: linear-gradient(135deg, rgba(29,158,117,0.12) 0%, transparent 60%), #0d0d14; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.06); position: relative; overflow: hidden; }
        .fp-left::before { content: ''; position: absolute; width: 500px; height: 500px; background: radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%); top: -100px; left: -100px; pointer-events: none; }
        .fp-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; cursor: pointer; width: fit-content; }
        .fp-logo-dot { width: 32px; height: 32px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
        .fp-left-content { position: relative; z-index: 1; }
        .fp-left-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(29,158,117,0.12); color: #4ecca3; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 999px; margin-bottom: 20px; border: 1px solid rgba(29,158,117,0.25); letter-spacing: 0.06em; text-transform: uppercase; }
        .fp-left-h1 { font-size: 32px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 14px; }
        .fp-left-h1 span { background: linear-gradient(135deg, #1D9E75, #4ecca3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fp-left-p { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 40px; max-width: 340px; }

        /* Steps */
        .fp-steps { display: flex; flex-direction: column; gap: 0; }
        .fp-step { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .fp-step:last-child { border-bottom: none; }
        .fp-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(29,158,117,0.15); border: 1px solid rgba(29,158,117,0.3); color: #4ecca3; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .fp-step-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .fp-step-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }
        .fp-left-footer { font-size: 12px; color: rgba(255,255,255,0.2); }

        /* RIGHT */
        .fp-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #0a0a0f; }
        .fp-form-wrap { width: 100%; max-width: 400px; }

        /* Back button */
        .fp-back { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: rgba(255,255,255,0.4); font-size: 13px; cursor: pointer; padding: 0; margin-bottom: 32px; font-family: inherit; transition: color 0.2s; }
        .fp-back:hover { color: rgba(255,255,255,0.7); }

        .fp-form-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 8px; }
        .fp-form-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 32px; line-height: 1.6; }

        .form-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; display: block; }
        .form-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s, background 0.2s; margin-bottom: 6px; }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: rgba(29,158,117,0.6); background: rgba(29,158,117,0.04); }
        .form-input-error { border-color: rgba(239,68,68,0.5) !important; background: rgba(239,68,68,0.04) !important; }
        .form-error { font-size: 11px; color: #f87171; margin-bottom: 16px; display: flex; align-items: center; gap: 4px; }
        .form-hint { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 20px; line-height: 1.5; }

        .btn-submit { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; transition: background 0.2s, opacity 0.2s; font-family: inherit; }
        .btn-submit:hover:not(:disabled) { background: #178763; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .fp-login-prompt { text-align: center; font-size: 13px; color: rgba(255,255,255,0.3); }
        .fp-login-prompt a { color: #4ecca3; text-decoration: none; cursor: pointer; font-weight: 600; }
        .fp-login-prompt a:hover { text-decoration: underline; }

        /* SUCCESS STATE */
        .fp-success { text-align: center; }
        .fp-success-icon { width: 72px; height: 72px; background: rgba(29,158,117,0.15); border: 1px solid rgba(29,158,117,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 24px; }
        .fp-success-title { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 12px; }
        .fp-success-p { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 8px; }
        .fp-success-email { font-size: 15px; font-weight: 700; color: #4ecca3; margin-bottom: 32px; }
        .fp-success-note { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 16px; font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.6; margin-bottom: 28px; text-align: left; }
        .fp-success-note strong { color: rgba(255,255,255,0.6); }
        .btn-back-login { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 14px; font-family: inherit; transition: background 0.2s; }
        .btn-back-login:hover { background: #178763; }
        .btn-resend { width: 100%; padding: 12px; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.09); font-size: 14px; cursor: pointer; font-family: inherit; transition: border-color 0.2s, color 0.2s; }
        .btn-resend:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }

        /* MOBILE */
        @media (max-width: 768px) {
          .fp-wrap { grid-template-columns: 1fr; }
          .fp-left { display: none; }
          .fp-right { padding: 32px 24px; align-items: flex-start; min-height: 100vh; }
          .fp-form-wrap { max-width: 100%; }
          .fp-mobile-logo { display: flex !important; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 24px; cursor: pointer; }
        }
        .fp-mobile-logo { display: none; }
      `}</style>

      <div className="fp-wrap">

        {/* ── LEFT PANEL ── */}
        <div className="fp-left">
          <div className="fp-logo" onClick={() => navigate('/')}>
            <div className="fp-logo-dot">💧</div>
            SuHu
          </div>
          <div className="fp-left-content">
            <div className="fp-left-badge">🔒 Keselamatan Akaun</div>
            <h1 className="fp-left-h1">
              Tetapkan semula<br />
              kata laluan <span>anda.</span>
            </h1>
            <p className="fp-left-p">
              Ikuti tiga langkah mudah untuk mendapatkan
              semula akses ke dashboard SuHu anda.
            </p>
            <div className="fp-steps">
              {[
                { num: '1', title: 'Masukkan emel anda', desc: 'Emel yang didaftarkan semasa membuat akaun SuHu.' },
                { num: '2', title: 'Semak peti masuk', desc: 'Kami akan hantar pautan tetapan semula ke emel anda dalam masa 5 minit.' },
                { num: '3', title: 'Tetapkan kata laluan baru', desc: 'Klik pautan dalam emel dan masukkan kata laluan baharu anda.' },
              ].map((s, i) => (
                <div key={i} className="fp-step">
                  <div className="fp-step-num">{s.num}</div>
                  <div>
                    <div className="fp-step-title">{s.title}</div>
                    <div className="fp-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fp-left-footer">© SuHu 2026 · Dasar Privasi · Terma Penggunaan</div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="fp-right">
          <div className="fp-form-wrap">

            {/* Mobile logo */}
            <div className="fp-mobile-logo" onClick={() => navigate('/')}>
              <div className="fp-logo-dot">💧</div>
              SuHu
            </div>

            {!sent ? (
              <>
                {/* Back button */}
                <button className="fp-back" onClick={() => navigate('/login')}>
                  ← Kembali ke log masuk
                </button>

                <div className="fp-form-title">Lupa kata laluan?</div>
                <div className="fp-form-sub">
                  Masukkan alamat emel yang anda gunakan semasa mendaftar.
                  Kami akan hantar pautan untuk tetapkan semula kata laluan anda.
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <label className="form-label">Alamat Emel</label>
                  <input
                    className={`form-input${error ? ' form-input-error' : ''}`}
                    type="email"
                    placeholder="ahmad@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    autoComplete="email"
                  />
                  {error
                    ? <div className="form-error">⚠ {error}</div>
                    : <div className="form-hint">Pautan akan dihantar ke emel ini. Sila semak folder spam jika tidak diterima.</div>
                  }

                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Menghantar...' : 'Hantar Pautan Reset →'}
                  </button>
                </form>

                <div className="fp-login-prompt">
                  Ingat kata laluan?{' '}
                  <a onClick={() => navigate('/login')}>Log masuk di sini</a>
                </div>
              </>
            ) : (
              /* ── SUCCESS STATE ── */
              <div className="fp-success">
                <div className="fp-success-icon">📧</div>
                <div className="fp-success-title">Emel dihantar!</div>
                <p className="fp-success-p">Pautan tetapan semula telah dihantar ke:</p>
                <div className="fp-success-email">{email}</div>
                <div className="fp-success-note">
                  <strong>Langkah seterusnya:</strong><br />
                  Buka emel anda dan klik pautan yang dihantar. Pautan ini sah selama <strong>1 jam</strong> sahaja.
                  Jika tidak nampak dalam peti masuk, sila semak folder <strong>Spam</strong> atau <strong>Junk</strong>.
                </div>
                <button className="btn-back-login" onClick={() => navigate('/login')}>
                  Kembali ke Log Masuk
                </button>
                <button className="btn-resend" onClick={() => { setSent(false) }}>
                  Hantar semula emel
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}