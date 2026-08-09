import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', password: '', confirmPassword: '',
    consentPdpa: false, consentData: false,
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const err = {}
    if (!form.firstName.trim()) err.firstName = 'Nama pertama diperlukan'
    if (!form.lastName.trim()) err.lastName = 'Nama akhir diperlukan'
    if (!form.email.trim()) err.email = 'Emel diperlukan'
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Format emel tidak sah'
    if (!form.phone.trim()) err.phone = 'Nombor telefon diperlukan'
    if (!form.password) err.password = 'Kata laluan diperlukan'
    else if (form.password.length < 8) err.password = 'Minimum 8 aksara'
    if (!form.confirmPassword) err.confirmPassword = 'Sila sahkan kata laluan'
    else if (form.password !== form.confirmPassword) err.confirmPassword = 'Kata laluan tidak sepadan'
    if (!form.consentPdpa) err.consentPdpa = 'Persetujuan PDPA diperlukan'
    return err
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  const err = validate()
  if (Object.keys(err).length > 0) { setErrors(err); return }
  setLoading(true)

  const { error } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      data: {
        full_name: form.firstName + ' ' + form.lastName,
        phone: form.phone,
        consent_pdpa: form.consentPdpa,
        consent_data_sharing: form.consentData,
      }
    }
  })

  if (error) {
    setErrors({ email: error.message })
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

        .reg-wrap { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; width: 100%; }

        .reg-left { background: linear-gradient(135deg, rgba(29,158,117,0.12) 0%, transparent 60%), #0d0d14; padding: 48px; display: flex; flex-direction: column; justify-content: space-between; border-right: 1px solid rgba(255,255,255,0.06); }
        .reg-left-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; cursor: pointer; width: fit-content; }
        .reg-logo-dot { width: 32px; height: 32px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
        .reg-left-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(29,158,117,0.12); color: #4ecca3; font-size: 11px; font-weight: 700; padding: 5px 14px; border-radius: 999px; margin-bottom: 20px; border: 1px solid rgba(29,158,117,0.25); letter-spacing: 0.06em; text-transform: uppercase; }
        .reg-left-h1 { font-size: 32px; font-weight: 800; color: #fff; line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 14px; }
        .reg-left-h1 span { background: linear-gradient(135deg, #1D9E75, #4ecca3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .reg-left-p { font-size: 15px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 36px; max-width: 360px; }
        .reg-feats { display: flex; flex-direction: column; gap: 16px; }
        .reg-feat { display: flex; align-items: flex-start; gap: 12px; }
        .reg-feat-icon { width: 34px; height: 34px; background: rgba(29,158,117,0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; margin-top: 1px; }
        .reg-feat-title { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .reg-feat-desc { font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.5; }
        .reg-left-footer { font-size: 12px; color: rgba(255,255,255,0.2); }

        .reg-right { display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #0a0a0f; overflow-y: auto; }
        .reg-form-wrap { width: 100%; max-width: 420px; }
        .reg-form-title { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
        .reg-form-sub { font-size: 14px; color: rgba(255,255,255,0.4); margin-bottom: 28px; }
        .reg-form-sub a { color: #4ecca3; text-decoration: none; cursor: pointer; }
        .reg-form-sub a:hover { text-decoration: underline; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .form-group { margin-bottom: 16px; }
        .form-label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 7px; display: block; }
        .form-input-wrap { position: relative; }
        .form-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; color: #fff; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s, background 0.2s; }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus { border-color: rgba(29,158,117,0.6); background: rgba(29,158,117,0.04); }
        .form-input-error { border-color: rgba(239,68,68,0.5) !important; background: rgba(239,68,68,0.04) !important; }
        .form-error { font-size: 11px; color: #f87171; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
        .form-input-pass { padding-right: 44px !important; }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 13px; padding: 4px; transition: color 0.2s; }
        .pass-toggle:hover { color: rgba(255,255,255,0.6); }

        .consent-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px; }
        .consent-item { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .consent-checkbox { width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid rgba(255,255,255,0.2); background: transparent; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all 0.2s; cursor: pointer; appearance: none; -webkit-appearance: none; }
        .consent-checkbox:checked { background: #1D9E75; border-color: #1D9E75; }
        .consent-checkbox:checked::after { content: '✓'; color: #fff; font-size: 11px; font-weight: 700; }
        .consent-text { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.6; }
        .consent-text a { color: #4ecca3; text-decoration: none; }
        .consent-text strong { color: rgba(255,255,255,0.75); }
        .badge-req { font-size: 10px; background: rgba(239,68,68,0.15); color: #f87171; padding: 2px 7px; border-radius: 4px; margin-left: 6px; font-weight: 700; letter-spacing: 0.04em; }
        .badge-opt { font-size: 10px; background: rgba(29,158,117,0.12); color: #4ecca3; padding: 2px 7px; border-radius: 4px; margin-left: 6px; font-weight: 700; letter-spacing: 0.04em; }
        .consent-error { font-size: 11px; color: #f87171; margin-top: 4px; padding-left: 28px; }

        .btn-submit { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 16px; transition: background 0.2s, opacity 0.2s; font-family: inherit; }
        .btn-submit:hover:not(:disabled) { background: #178763; }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .form-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .form-divider-text { font-size: 12px; color: rgba(255,255,255,0.25); }
        .btn-google { width: 100%; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.2s, border-color 0.2s; font-family: inherit; }
        .btn-google:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.18); }
        .google-icon { width: 18px; height: 18px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #4285F4; flex-shrink: 0; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .reg-wrap { grid-template-columns: 1fr; min-height: 100vh; }
          .reg-left { display: none; }
          .reg-right { padding: 32px 24px; align-items: flex-start; min-height: 100vh; }
          .reg-form-wrap { max-width: 100%; }
          .reg-mobile-logo { display: flex !important; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 28px; cursor: pointer; }
          .form-row { grid-template-columns: 1fr; gap: 0; }
        }
        .reg-mobile-logo { display: none; }
      `}</style>

      <div className="reg-wrap">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left">
          <div>
            <div className="reg-left-logo" onClick={() => navigate('/')}>
              <div className="reg-logo-dot">💧</div>
              SuHu
            </div>
          </div>
          <div>
            <div className="reg-left-badge">🌿 Sistem Penuaian Air Hujan</div>
            <h1 className="reg-left-h1">
              Pantau tangki anda<br />dari <span>mana sahaja.</span>
            </h1>
            <p className="reg-left-p">
              Daftar sekarang dan mulakan pemantauan tangki air hujan
              dan tenaga solar anda dalam masa 2 minit.
            </p>
            <div className="reg-feats">
              {[
                { icon: '💧', title: 'Paras air masa nyata', desc: 'Pantau tangki dari telefon anda bila-bila masa.' },
                { icon: '☀️', title: 'Status solar & bateri', desc: 'Tahu bila sistem solar berfungsi optimum.' },
                { icon: '🌧️', title: 'Ramalan cuaca 7 hari', desc: 'Rancang penggunaan air berdasarkan ramalan hujan.' },
                { icon: '🔒', title: 'Data selamat & PDPA', desc: 'Data anda dilindungi. Hanya anda boleh akses.' },
              ].map((f, i) => (
                <div key={i} className="reg-feat">
                  <div className="reg-feat-icon">{f.icon}</div>
                  <div>
                    <div className="reg-feat-title">{f.title}</div>
                    <div className="reg-feat-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reg-left-footer">© SuHu 2026 · Dasar Privasi · Terma Penggunaan</div>
        </div>

        {/* ── RIGHT PANEL — FORM ── */}
        <div className="reg-right">
          <div className="reg-form-wrap">

            {/* Mobile logo */}
            <div className="reg-mobile-logo" onClick={() => navigate('/')}>
              <div className="reg-logo-dot">💧</div>
              SuHu
            </div>

            <div className="reg-form-title">Buat akaun baharu</div>
            <div className="reg-form-sub">
              Sudah ada akaun?{' '}
              <a onClick={() => navigate('/login')}>Log masuk di sini</a>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Nama */}
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Pertama</label>
                  <input
                    className={`form-input${errors.firstName ? ' form-input-error' : ''}`}
                    type="text" name="firstName" placeholder="Ahmad"
                    value={form.firstName} onChange={handleChange}
                  />
                  {errors.firstName && <div className="form-error">⚠ {errors.firstName}</div>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nama Akhir</label>
                  <input
                    className={`form-input${errors.lastName ? ' form-input-error' : ''}`}
                    type="text" name="lastName" placeholder="Khalil"
                    value={form.lastName} onChange={handleChange}
                  />
                  {errors.lastName && <div className="form-error">⚠ {errors.lastName}</div>}
                </div>
              </div>

              {/* Emel */}
              <div className="form-group">
                <label className="form-label">Alamat Emel</label>
                <input
                  className={`form-input${errors.email ? ' form-input-error' : ''}`}
                  type="email" name="email" placeholder="ahmad@email.com"
                  value={form.email} onChange={handleChange}
                />
                {errors.email && <div className="form-error">⚠ {errors.email}</div>}
              </div>

              {/* Telefon */}
              <div className="form-group">
                <label className="form-label">Nombor Telefon</label>
                <input
                  className={`form-input${errors.phone ? ' form-input-error' : ''}`}
                  type="tel" name="phone" placeholder="+60 12-345 6789"
                  value={form.phone} onChange={handleChange}
                />
                {errors.phone && <div className="form-error">⚠ {errors.phone}</div>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Kata Laluan</label>
                <div className="form-input-wrap">
                  <input
                    className={`form-input form-input-pass${errors.password ? ' form-input-error' : ''}`}
                    type={showPass ? 'text' : 'password'} name="password"
                    placeholder="Minimum 8 aksara"
                    value={form.password} onChange={handleChange}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <div className="form-error">⚠ {errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Sahkan Kata Laluan</label>
                <div className="form-input-wrap">
                  <input
                    className={`form-input form-input-pass${errors.confirmPassword ? ' form-input-error' : ''}`}
                    type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                    placeholder="Ulang kata laluan"
                    value={form.confirmPassword} onChange={handleChange}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
              </div>

              {/* Consent */}
              <div className="consent-box">
                <label className="consent-item">
                  <input
                    type="checkbox" name="consentPdpa"
                    className="consent-checkbox"
                    checked={form.consentPdpa} onChange={handleChange}
                  />
                  <div className="consent-text">
                    <strong>Saya bersetuju dengan{' '}
                      <a href="#">Dasar Privasi</a> dan{' '}
                      <a href="#">Terma Penggunaan</a> SuHu.
                    </strong>
                    <span className="badge-req">WAJIB</span>
                  </div>
                </label>
                {errors.consentPdpa && <div className="consent-error">⚠ {errors.consentPdpa}</div>}

                <label className="consent-item">
                  <input
                    type="checkbox" name="consentData"
                    className="consent-checkbox"
                    checked={form.consentData} onChange={handleChange}
                  />
                  <div className="consent-text">
                    Saya bersetuju data penggunaan dikongsi secara{' '}
                    <strong>agregat dan tanpa maklumat peribadi</strong>{' '}
                    untuk tujuan penyelidikan air negara.
                    <span className="badge-opt">SUKARELA</span>
                  </div>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Mendaftar...' : 'Daftar Sekarang →'}
              </button>

              <div className="form-divider">
                <div className="form-divider-line" />
                <div className="form-divider-text">atau</div>
                <div className="form-divider-line" />
              </div>

              <button type="button" className="btn-google">
                <div className="google-icon">G</div>
                Daftar dengan Google
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}