import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const IMAGES = {
  rainwater: 'https://images.unsplash.com/photo-1634853982486-c06f0e17940f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  solar: 'https://images.unsplash.com/photo-1694327672187-74aa0605314d?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rain: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85',
}

const FEATURES = [
  { icon: '💧', title: 'Tangki Air Hujan', desc: 'Kumpul dan simpan air hujan dari bumbung rumah anda secara automatik dan efisien.' },
  { icon: '⚡', title: 'Pam Solar Automatik', desc: 'Pam dikuasakan panel solar — jimat bil elektrik, beroperasi siang dan malam.' },
  { icon: '📡', title: 'Pemantauan IoT 24/7', desc: 'Sensor pintar pantau paras air, solar, dan bateri secara masa nyata dari telefon.' },
  { icon: '🌧️', title: 'Pengesan Hujan', desc: 'Tahu bila hujan mula turun dan tangki mula mengisi — automatik tanpa perlu check manual.' },
  { icon: '⛅', title: 'Ramalan Cuaca 7 Hari', desc: 'Rancang penggunaan air berdasarkan ramalan hujan tepat kawasan anda.' },
  { icon: '🔒', title: 'Data Selamat PDPA', desc: 'Login peribadi. Data anda dilindungi dan mematuhi Akta PDPA Malaysia.' },
]

const FAQS = [
  { q: 'Apa yang termasuk dalam pakej SuHu?', a: 'Pakej SuHu merangkumi tangki penuaian air hujan, pam solar, panel solar, bateri, unit sensor IoT lengkap (paras air, hujan, solar), dan akses dashboard dalam talian.' },
  { q: 'Perlukah saya langgan internet baru?', a: 'Tidak. SuHu menggunakan WiFi rumah sedia ada anda. Tiada kontrak atau langganan internet tambahan diperlukan.' },
  { q: 'Apa jadi kalau WiFi rumah terputus?', a: 'Data disimpan dalam kad SD 64GB dalam unit IoT. Apabila WiFi kembali, semua data disinkronkan ke dashboard anda secara automatik — zero data loss.' },
  { q: 'Berapa lama untuk pemasangan?', a: 'Pemasangan lengkap mengambil masa 1-2 hari. Pasukan kami akan membantu pemasangan dan konfigurasi di rumah anda.' },
  { q: 'Adakah sistem ini sesuai untuk semua rumah?', a: 'SuHu direka khas untuk rumah landed Malaysia — teres, berkembar, atau banglo — dengan kawasan bumbung yang mencukupi untuk panel solar.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState(null)

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", margin: 0, padding: 0, width: '100%', overflowX: 'hidden', background: '#0a0a0f', color: '#fff' }}>

      {/* ── GLOBAL STYLES via style tag ── */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; margin: 0; padding: 0; background: #0a0a0f; }
        #root { display: block; text-align: left; border: none; min-height: 100vh; }
        h1, h2, h3, h4 { margin: 0; padding: 0; }
        p { margin: 0; }
        button { font-family: inherit; cursor: pointer; }
        img { display: block; max-width: 100%; }

        .suhu-nav { display: flex; justify-content: space-between; align-items: center; padding: 18px 48px; position: sticky; top: 0; z-index: 100; background: rgba(10,10,15,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .suhu-nav-logo { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
        .suhu-nav-logodot { width: 32px; height: 32px; background: linear-gradient(135deg, #1D9E75, #0d6e50); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 17px; }
        .suhu-nav-links { display: flex; align-items: center; gap: 32px; }
        .suhu-nav-link { font-size: 14px; color: rgba(255,255,255,0.6); background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 0; }
        .suhu-nav-link:hover { color: #fff; }
        .suhu-nav-right { display: flex; gap: 10px; align-items: center; }
        .btn-ghost-dark { padding: 9px 18px; border-radius: 8px; background: transparent; border: 1px solid rgba(255,255,255,0.15); font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500; transition: border-color 0.2s; }
        .btn-ghost-dark:hover { border-color: rgba(255,255,255,0.4); }
        .btn-green { padding: 9px 20px; border-radius: 8px; background: #1D9E75; border: none; color: #fff; font-size: 14px; font-weight: 600; transition: background 0.2s; }
        .btn-green:hover { background: #17876     3; }
        .suhu-hamburger { display: none; background: none; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 10px; color: #fff; font-size: 18px; }

        /* HERO */
        .suhu-hero { padding: 100px 48px 80px; text-align: center; background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,158,117,0.18) 0%, transparent 70%), #0a0a0f; position: relative; overflow: hidden; }
        .suhu-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 40% at 50% 100%, rgba(29,158,117,0.06) 0%, transparent 70%); pointer-events: none; }
        .suhu-hero-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(29,158,117,0.12); color: #4ecca3; font-size: 12px; font-weight: 600; padding: 6px 16px; border-radius: 999px; margin-bottom: 28px; border: 1px solid rgba(29,158,117,0.3); letter-spacing: 0.05em; text-transform: uppercase; }
        .suhu-hero-h1 { font-size: clamp(36px, 6vw, 68px); font-weight: 800; line-height: 1.08; letter-spacing: -2px; color: #fff; margin-bottom: 24px; max-width: 800px; margin-left: auto; margin-right: auto; }
        .suhu-hero-h1 span { background: linear-gradient(135deg, #1D9E75, #4ecca3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .suhu-hero-p { font-size: 18px; color: rgba(255,255,255,0.55); line-height: 1.7; max-width: 520px; margin: 0 auto 36px; }
        .suhu-hero-btns { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
        .btn-hero-main { padding: 15px 32px; border-radius: 10px; background: #1D9E75; border: none; color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; transition: background 0.2s, transform 0.15s; }
        .btn-hero-main:hover { background: #178763; transform: translateY(-1px); }
        .btn-hero-sec { padding: 15px 32px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 500; transition: background 0.2s; }
        .btn-hero-sec:hover { background: rgba(255,255,255,0.1); }
        .suhu-hero-trust { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .suhu-trust-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: rgba(255,255,255,0.45); }
        .suhu-trust-check { width: 18px; height: 18px; background: rgba(29,158,117,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #4ecca3; flex-shrink: 0; }

        /* HERO IMAGE */
        .suhu-hero-img-wrap { margin: 60px auto 0; max-width: 900px; position: relative; }
        .suhu-hero-img-wrap::before { content: ''; position: absolute; inset: -2px; border-radius: 18px; background: linear-gradient(135deg, rgba(29,158,117,0.4), rgba(29,158,117,0.05)); z-index: 0; }
        .suhu-hero-img { width: 100%; border-radius: 16px; object-fit: cover; height: 420px; position: relative; z-index: 1; overflow: hidden; }
        .suhu-hero-img iframe { position: absolute; top: 50%; left: 50%; width: 180%; height: 180%; transform: translate(-50%, -50%); border: 0; pointer-events: none; }
        .suhu-hero-float { position: absolute; bottom: -20px; left: 32px; background: rgba(15,15,22,0.95); border: 1px solid rgba(29,158,117,0.3); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; backdrop-filter: blur(12px); z-index: 2; }
        .suhu-hero-float2 { position: absolute; top: 20px; right: 24px; background: rgba(15,15,22,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(12px); z-index: 2; }
        .float-icon { width: 36px; height: 36px; background: rgba(29,158,117,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .float-val { font-size: 17px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 3px; }
        .float-label { font-size: 11px; color: rgba(255,255,255,0.5); }

        /* STATS */
        .suhu-stats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
        .suhu-stat { padding: 32px 24px; border-right: 1px solid rgba(255,255,255,0.06); text-align: center; }
        .suhu-stat:last-child { border-right: none; }
        .suhu-stat-num { font-size: 36px; font-weight: 800; color: #1D9E75; letter-spacing: -1px; margin-bottom: 6px; }
        .suhu-stat-label { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.4; }

        /* SECTIONS */
        .suhu-section-dark { padding: 80px 48px; background: #0a0a0f; }
        .suhu-section-light { padding: 80px 48px; background: #111118; }
        .suhu-eyebrow { font-size: 12px; font-weight: 700; color: #1D9E75; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
        .suhu-sec-h2 { font-size: clamp(24px, 3.5vw, 38px); font-weight: 800; color: #fff; margin-bottom: 14px; letter-spacing: -0.8px; max-width: 560px; line-height: 1.15; }
        .suhu-sec-p { font-size: 16px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 500px; margin-bottom: 48px; }

        /* KOMPONEN IMG */
        .suhu-img-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .suhu-img-card { border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.07); background: #111118; }
        .suhu-img-card img { width: 100%; height: 200px; object-fit: cover; }
        .suhu-img-body { padding: 18px 20px; }
        .suhu-img-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 7px; }
        .suhu-img-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }

        /* FEATURES */
        .suhu-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .suhu-feat-item { background: #0f0f17; padding: 32px 26px; transition: background 0.2s; }
        .suhu-feat-item:hover { background: #131320; }
        .suhu-feat-icon { width: 44px; height: 44px; border-radius: 10px; background: rgba(29,158,117,0.15); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 16px; }
        .suhu-feat-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .suhu-feat-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }

        /* STEPS */
        .suhu-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .suhu-step { position: relative; }
        .suhu-step-num { width: 40px; height: 40px; border-radius: 50%; background: rgba(29,158,117,0.15); border: 1px solid rgba(29,158,117,0.3); color: #4ecca3; font-size: 15px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .suhu-step-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .suhu-step-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; }

        /* PRICING */
        .suhu-price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 620px; }
        .suhu-price-card { border-radius: 20px; padding: 32px 28px; background: #111118; border: 1px solid rgba(255,255,255,0.08); }
        .suhu-price-card-feat { border-radius: 20px; padding: 32px 28px; background: linear-gradient(135deg, rgba(29,158,117,0.12), rgba(29,158,117,0.04)); border: 1px solid rgba(29,158,117,0.3); }
        .suhu-pop-badge { display: inline-block; background: rgba(29,158,117,0.2); color: #4ecca3; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; letter-spacing: 0.04em; }
        .suhu-price-name { font-size: 16px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 8px; }
        .suhu-price-num { font-size: 38px; font-weight: 800; color: #fff; letter-spacing: -1.5px; margin: 12px 0 6px; }
        .suhu-price-sub { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 24px; line-height: 1.5; }
        .suhu-price-feats { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .suhu-price-feat { font-size: 13px; color: rgba(255,255,255,0.6); display: flex; align-items: flex-start; gap: 8px; }
        .suhu-price-check { color: #1D9E75; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
        .btn-price-green { width: 100%; padding: 13px; border-radius: 10px; background: #1D9E75; color: #fff; border: none; font-size: 14px; font-weight: 700; transition: background 0.2s; }
        .btn-price-green:hover { background: #178763; }
        .btn-price-outline { width: 100%; padding: 13px; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.15); font-size: 14px; font-weight: 500; transition: border-color 0.2s; }
        .btn-price-outline:hover { border-color: rgba(255,255,255,0.35); }

        /* FAQ */
        .suhu-faq { max-width: 640px; display: flex; flex-direction: column; gap: 0; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .suhu-faq-item { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); background: #0f0f17; cursor: pointer; transition: background 0.2s; }
        .suhu-faq-item:last-child { border-bottom: none; }
        .suhu-faq-item:hover { background: #131320; }
        .suhu-faq-q { font-size: 15px; font-weight: 600; color: #fff; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .suhu-faq-icon { font-size: 20px; color: rgba(255,255,255,0.3); flex-shrink: 0; transition: transform 0.2s; line-height: 1; }
        .suhu-faq-a { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 12px; line-height: 1.7; }

        /* CTA */
        .suhu-cta { padding: 100px 48px; background: radial-gradient(ellipse 70% 70% at 50% 0%, rgba(29,158,117,0.2) 0%, transparent 70%), #0a0a0f; text-align: center; border-top: 1px solid rgba(255,255,255,0.06); }
        .suhu-cta-h2 { font-size: clamp(28px, 4vw, 48px); font-weight: 800; color: #fff; margin-bottom: 16px; letter-spacing: -1px; max-width: 560px; margin-left: auto; margin-right: auto; line-height: 1.15; }
        .suhu-cta-p { font-size: 17px; color: rgba(255,255,255,0.5); margin-bottom: 36px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.7; }

        /* FOOTER */
        .suhu-footer { padding: 32px 48px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; background: #0a0a0f; }
        .suhu-footer-logo { font-size: 15px; font-weight: 700; color: rgba(255,255,255,0.5); display: flex; align-items: center; gap: 8px; }
        .suhu-footer-links { display: flex; gap: 24px; }
        .suhu-footer-link { font-size: 13px; color: rgba(255,255,255,0.35); cursor: pointer; transition: color 0.2s; background: none; border: none; }
        .suhu-footer-link:hover { color: rgba(255,255,255,0.7); }

        /* MOBILE MENU */
        .suhu-mobile-menu { display: none; flex-direction: column; gap: 0; background: #111118; border-top: 1px solid rgba(255,255,255,0.06); padding: 16px 0; }
        .suhu-mobile-link { padding: 14px 24px; font-size: 15px; color: rgba(255,255,255,0.7); background: none; border: none; text-align: left; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .suhu-mobile-btns { padding: 16px 24px; display: flex; flex-direction: column; gap: 10px; }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .suhu-nav { padding: 16px 24px; }
          .suhu-nav-links { display: none; }
          .suhu-nav-right { display: none; }
          .suhu-hamburger { display: flex; align-items: center; justify-content: center; }
          .suhu-mobile-menu { display: flex; }

          .suhu-hero { padding: 64px 24px 56px; }
          .suhu-hero-img { height: 220px; }
          .suhu-hero-float, .suhu-hero-float2 { display: none; }

          .suhu-stats { grid-template-columns: repeat(2, 1fr); }
          .suhu-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .suhu-stat:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.06); }
          .suhu-stat:last-child { border-bottom: none; }
          .suhu-stat:nth-last-child(2) { border-bottom: none; }

          .suhu-section-dark, .suhu-section-light { padding: 56px 24px; }
          .suhu-cta { padding: 64px 24px; }
          .suhu-footer { padding: 24px; flex-direction: column; align-items: flex-start; }

          .suhu-img-grid { grid-template-columns: 1fr; }
          .suhu-feat-grid { grid-template-columns: 1fr; }
          .suhu-steps { grid-template-columns: 1fr 1fr; gap: 20px; }
          .suhu-price-grid { grid-template-columns: 1fr; max-width: 100%; }
          .suhu-footer-links { flex-wrap: wrap; gap: 16px; }
        }

        @media (max-width: 560px) {
          .suhu-steps { grid-template-columns: 1fr; }
          .suhu-stats { grid-template-columns: 1fr 1fr; }
          .suhu-hero-trust { flex-direction: column; align-items: center; gap: 10px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="suhu-nav">
        <div className="suhu-nav-logo">
          <div className="suhu-nav-logodot">💧</div>
          SuHu
        </div>
        <div className="suhu-nav-links">
          {['Produk', 'Cara Kerja', 'Harga', 'FAQ'].map(l => (
            <button key={l} className="suhu-nav-link">{l}</button>
          ))}
        </div>
        <div className="suhu-nav-right">
          <button className="btn-ghost-dark" onClick={() => navigate('/login')}>Log masuk</button>
          <button className="btn-green" onClick={() => navigate('/register')}>Daftar percuma</button>
        </div>
        <button className="suhu-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="suhu-mobile-menu">
          {['Produk', 'Cara Kerja', 'Harga', 'FAQ'].map(l => (
            <button key={l} className="suhu-mobile-link" onClick={() => setMenuOpen(false)}>{l}</button>
          ))}
          <div className="suhu-mobile-btns">
            <button className="btn-ghost-dark" onClick={() => navigate('/login')}>Log masuk</button>
            <button className="btn-green" onClick={() => navigate('/register')}>Daftar percuma</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="suhu-hero">
        <div className="suhu-hero-badge">🌿 Sistem Penuaian Air Hujan Malaysia</div>
        <h1 className="suhu-hero-h1">
          Air hujan anda terlalu<br />
          berharga untuk <span>dibazirkan.</span>
        </h1>
        <p className="suhu-hero-p">
          SuHu ialah sistem lengkap tangki air hujan berkuasa solar dengan pemantauan IoT —
          kumpul, simpan, dan guna semula air hujan dengan bijak.
        </p>
        <div className="suhu-hero-btns">
          <button className="btn-hero-main" onClick={() => navigate('/register')}>
            🛒 Dapatkan SuHu — RM 4,999.99
          </button>
          <button className="btn-hero-sec" onClick={() => navigate('/login')}>
            Lihat demo →
          </button>
        </div>
        <div className="suhu-hero-trust">
          {['Tangki + pam solar + IoT dalam satu pakej', 'Tanpa langganan internet tambahan', 'Pemasangan profesional 1–2 hari'].map((t, i) => (
            <div key={i} className="suhu-trust-item">
              <div className="suhu-trust-check">✓</div>
              {t}
            </div>
          ))}
        </div>

        {/* Hero Image */}
        <div className="suhu-hero-img-wrap">
          <div className="suhu-hero-img" style={{ position: 'relative' }}>
            <iframe
              src="https://www.youtube.com/embed/A6qaiolIAbk?autoplay=1&mute=1&loop=1&playlist=A6qaiolIAbk&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1"
              title="Rain window background"
              allow="autoplay; encrypted-media"
            />
          </div>
          <div className="suhu-hero-float">
            <div className="float-icon">💧</div>
            <div>
              <div className="float-val">73% penuh</div>
              <div className="float-label">Paras tangki semasa</div>
            </div>
          </div>
          <div className="suhu-hero-float2">
            <div className="float-icon">☀️</div>
            <div>
              <div className="float-val">18.4V</div>
              <div className="float-label">Output solar</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="suhu-stats">
        {[
          { num: 'RM 0', label: 'Kos langganan internet tambahan' },
          { num: '< 2 hari', label: 'Pemasangan lengkap oleh pasukan kami' },
          { num: '24/7', label: 'Pemantauan IoT masa nyata' },
          { num: '64GB', label: 'Storan data tempatan tanpa wayar' },
        ].map((s, i) => (
          <div key={i} className="suhu-stat">
            <div className="suhu-stat-num">{s.num}</div>
            <div className="suhu-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── KOMPONEN SISTEM ── */}
      <section className="suhu-section-light">
        <div className="suhu-eyebrow">Komponen Sistem</div>
        <h2 className="suhu-sec-h2">Tiga komponen utama, satu sistem lengkap</h2>
        <p className="suhu-sec-p">Setiap komponen SuHu direka untuk berfungsi bersama — dari bumbung anda ke dashboard di telefon.</p>
        <div className="suhu-img-grid">
          {[
            { img: IMAGES.rainwater, title: '💧 Tangki Air Hujan', desc: 'Tangki berkualiti tinggi kumpul air hujan dari bumbung rumah anda secara automatik.' },
            { img: IMAGES.solar, title: '☀️ Pam Solar & Bateri', desc: 'Pam dikuasakan panel solar dengan bateri — beroperasi walaupun cuaca mendung.' },
            { img: IMAGES.rain, title: '📡 Pemantauan IoT', desc: 'Sensor pintar hantar data paras air, hujan, dan solar ke dashboard anda 24/7.' },
          ].map((c, i) => (
            <div key={i} className="suhu-img-card">
              <img src={c.img} alt={c.title} />
              <div className="suhu-img-body">
                <div className="suhu-img-title">{c.title}</div>
                <div className="suhu-img-desc">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="suhu-section-dark">
        <div className="suhu-eyebrow">Ciri-ciri</div>
        <h2 className="suhu-sec-h2">Semua yang anda perlukan dalam satu sistem</h2>
        <p className="suhu-sec-p">Dari perkakasan hingga perisian — SuHu uruskan semuanya untuk anda.</p>
        <div className="suhu-feat-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="suhu-feat-item">
              <div className="suhu-feat-icon">{f.icon}</div>
              <div className="suhu-feat-title">{f.title}</div>
              <div className="suhu-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CARA KERJA ── */}
      <section className="suhu-section-light">
        <div className="suhu-eyebrow">Cara Kerja</div>
        <h2 className="suhu-sec-h2">Empat langkah dari kotak ke dashboard</h2>
        <p className="suhu-sec-p">Pasukan kami uruskan pemasangan. Anda hanya perlu daftar dan pantau.</p>
        <div className="suhu-steps">
          {[
            { num: '1', title: 'Pasang sistem', desc: 'Pasang tangki, pam, dan panel solar di kawasan yang sesuai di rumah anda.' },
            { num: '2', title: 'Sambung WiFi', desc: 'Hubungkan unit IoT ke WiFi rumah melalui telefon — tiada kabel diperlukan.' },
            { num: '3', title: 'Daftar akaun', desc: 'Buat akaun di suhu.com.my dalam masa 2 minit sahaja.' },
            { num: '4', title: 'Pantau dari mana sahaja', desc: 'Dashboard aktif sepenuhnya. Data tangki masuk secara langsung.' },
          ].map((s, i) => (
            <div key={i} className="suhu-step">
              <div className="suhu-step-num">{s.num}</div>
              <div className="suhu-step-title">{s.title}</div>
              <div className="suhu-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="suhu-section-dark">
        <div className="suhu-eyebrow">Harga</div>
        <h2 className="suhu-sec-h2">Pelaburan sekali, penjimatan seumur hidup</h2>
        <p className="suhu-sec-p">Tiada kos tersembunyi. Dashboard percuma untuk tahun pertama.</p>
        <div className="suhu-price-grid">
          {[
            {
              name: 'SuHu Starter', price: 'RM 4,999.99', featured: false,
              sub: 'Pakej asas dengan dashboard 1 tahun percuma',
              features: ['Tangki air hujan', 'Pam solar + panel + bateri', 'Unit sensor IoT lengkap', 'Dashboard 1 tahun percuma', 'Sokongan pemasangan', 'RM 59 / tahun selepas itu'],
            },
            {
              name: 'SuHu Pro', price: 'RM 5,199.99', featured: true,
              sub: 'Pakej lengkap dengan dashboard 2 tahun percuma',
              features: ['Tangki kapasiti lebih besar', 'Pam solar + panel + bateri', 'Unit sensor IoT lengkap', 'Dashboard 2 tahun percuma', 'Sokongan keutamaan 24/7', 'RM 59 / tahun selepas itu'],
            },
          ].map((p, i) => (
            <div key={i} className={p.featured ? 'suhu-price-card-feat' : 'suhu-price-card'}>
              {p.featured && <div className="suhu-pop-badge">✨ PALING POPULAR</div>}
              <div className="suhu-price-name">{p.name}</div>
              <div className="suhu-price-num">{p.price}</div>
              <div className="suhu-price-sub">{p.sub}</div>
              <ul className="suhu-price-feats">
                {p.features.map((f, j) => (
                  <li key={j} className="suhu-price-feat">
                    <span className="suhu-price-check">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.featured ? 'btn-price-green' : 'btn-price-outline'}
                onClick={() => navigate('/register')}
              >
                {p.featured ? 'Dapatkan Pro sekarang' : 'Pilih Starter'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="suhu-section-light">
        <div className="suhu-eyebrow">FAQ</div>
        <h2 className="suhu-sec-h2">Soalan lazim</h2>
        <p className="suhu-sec-p">Ada soalan lain? Hubungi kami di <strong style={{ color: '#4ecca3' }}>hello@suhu.com.my</strong></p>
        <div className="suhu-faq">
          {FAQS.map((f, i) => (
            <div key={i} className="suhu-faq-item" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
              <div className="suhu-faq-q">
                {f.q}
                <span className="suhu-faq-icon" style={{ transform: activeFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </div>
              {activeFaq === i && <div className="suhu-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="suhu-cta">
        <div className="suhu-eyebrow" style={{ textAlign: 'center' }}>Mula sekarang</div>
        <h2 className="suhu-cta-h2">Jangan biarkan air hujan anda mengalir sia-sia lagi.</h2>
        <p className="suhu-cta-p">Sertai pemilik rumah Malaysia yang bijak menguruskan air hujan dan tenaga solar dengan SuHu.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn-hero-main" onClick={() => navigate('/register')}>
            Dapatkan SuHu sekarang →
          </button>
          <button className="btn-hero-sec" onClick={() => navigate('/login')}>
            Log masuk
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="suhu-footer">
        <div className="suhu-footer-logo">
          💧 SuHu &copy; 2026
        </div>
        <div className="suhu-footer-links">
          {['Dasar Privasi', 'Terma Penggunaan', 'Hubungi Kami'].map((l, i) => (
            <button key={i} className="suhu-footer-link">{l}</button>
          ))}
        </div>
      </footer>

    </div>
  )
}