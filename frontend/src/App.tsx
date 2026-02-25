import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap,
  CheckCircle,
  XCircle,
  ChevronRight,
  LogOut,
  BookOpen
} from 'lucide-react';

const getApiBase = () => {
  const saved = localStorage.getItem('customApiUrl');
  if (saved) return saved;
  // Vercel deployment uses /api rewrite, local development uses port 5000
  return window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';
};

const API_BASE = getApiBase();

const Navbar = ({ user, onLogout }: any) => (
  <nav className="glass-card" style={{ margin: '0.5rem', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <GraduationCap size={24} color="#0ea5e9" />
      <span style={{ fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap' }}>QUIZ OF THE SEAS</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
      <span style={{ display: 'inline-block', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user}</span>
      <button onClick={onLogout} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <LogOut size={18} />
      </button>
    </div>
  </nav>
);

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('studentName'));
  const [view, setView] = useState('dash');
  const [loginVal, setLoginVal] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selCat, setSelCat] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchCats = () => {
    setApiError(null);
    axios.get(`${API_BASE}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error('API Error:', err);
        setApiError(err.message + (err.response ? ': ' + JSON.stringify(err.response.data) : ''));
      });
  };

  useEffect(() => {
    if (user) fetchCats();
  }, [user]);

  const onLogin = (e: any) => {
    e.preventDefault();
    if (!loginVal.trim()) return;
    if (loginVal === 'admin_deniz') {
      setUser('Admin');
      setView('admin');
    } else {
      setUser(loginVal);
      localStorage.setItem('studentName', loginVal);
      setView('dash');
    }
  };

  const onLogout = () => {
    localStorage.removeItem('studentName');
    setUser(null);
    setView('dash');
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', padding: '1rem' }}>
        <div className="glass-card" style={{ padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <GraduationCap size={48} color="#0ea5e9" style={{ marginBottom: '1rem' }} />
          <h1>Quiz of the Seas</h1>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 1.5rem 0' }}>Soru Bankasına Giriş Yapın</p>
          <form onSubmit={onLogin}>
            <input
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #334155', background: '#1e293b', color: 'white', marginBottom: '1rem' }}
              placeholder="Ad Soyad"
              value={loginVal}
              onChange={e => setLoginVal(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      <Navbar user={user} onLogout={onLogout} />

      <main className="container">
        {view === 'dash' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Eğitim Kategorileri</h2>
            {apiError && (
              <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong>API Hatası:</strong> {apiError}<br />
                <small>URL: {API_BASE}/categories</small>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {categories.map((c: any) => (
                <div key={c.id} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }} onClick={() => { setSelCat(c); setView('quiz'); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <BookOpen color="#0ea5e9" />
                      <h3 style={{ fontSize: '1.25rem' }}>{c.name}</h3>
                    </div>
                    <ChevronRight color="#94a3b8" />
                  </div>
                </div>
              ))}
              {categories.length === 0 && !apiError && <p style={{ color: '#94a3b8' }}>Henüz kategori eklenmemiş.</p>}
            </div>
          </div>
        )}

        {view === 'quiz' && selCat && (
          <QuizView_Internal category={selCat} onFinish={(s: any, t: any, a: any) => { setResult({ score: s, total: t, answers: a }); setView('res'); }} />
        )}

        {view === 'res' && result && (
          <ResultsView_Internal {...result} onBack={() => setView('dash')} />
        )}

        {view === 'admin' && (
          <AdminPanel_Internal categories={categories} fetchCategories={fetchCats} />
        )}
      </main>
    </div>
  );
}

// --- Internal View Components ---

function QuizView_Internal({ category, onFinish }: any) {
  const [qs, setQs] = useState([]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/questions?category_id=${category.id}`)
      .then(res => { setQs(res.data); setLoad(false); })
      .catch(() => setLoad(false));
  }, [category.id]);

  if (load) return <div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>;
  if (!qs.length) return <div style={{ textAlign: 'center', padding: '4rem' }}>Soru yok.</div>;

  const current = qs[idx] as any;

  const next = () => {
    if (!sel) return;
    const isCorr = sel === current.correct_option;
    const nextAns = [...ans, { question: current, selected: sel, isCorrect: isCorr }] as any;
    setAns(nextAns);
    if (idx < qs.length - 1) { setIdx(idx + 1); setSel(null); }
    else { onFinish(nextAns.filter((a: any) => a.isCorrect).length, qs.length, nextAns); }
  };

  return (
    <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>Soru {idx + 1} / {qs.length}</div>
      <h2 style={{ marginBottom: '2rem' }}>{current.question_text}</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {['a', 'b', 'c', 'd'].map(o => (
          <button key={o} onClick={() => setSel(o as any)} className="glass-card" style={{ padding: '1.25rem', textAlign: 'left', borderColor: sel === o ? '#0ea5e9' : 'rgba(255,255,255,0.1)', background: sel === o ? 'rgba(14, 165, 233, 0.1)' : 'transparent', color: 'white', cursor: 'pointer' }}>
            <span style={{ fontWeight: 800, marginRight: '1rem' }}>{o.toUpperCase()}</span> {current[`option_${o}`]}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '2.5rem', opacity: sel ? 1 : 0.5 }} disabled={!sel} onClick={next}>
        {idx === qs.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
      </button>
    </div>
  );
}

function ResultsView_Internal({ score, total, answers, onBack }: any) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem' }}>%{Math.round((score / total) * 100)}</h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8' }}>{total} Soruda {score} Doğru</p>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={onBack}>Dashboard'a Dön</button>
      </div>
      {answers.map((a: any, i: number) => (
        <div key={i} className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {a.isCorrect ? <CheckCircle color="#10b981" /> : <XCircle color="#f43f5e" />}
            <h3>{a.question.question_text}</h3>
          </div>
          <div style={{ marginLeft: '2.5rem' }}>
            <p>Cevabınız: <span style={{ color: a.isCorrect ? '#10b981' : '#f43f5e', fontWeight: 600 }}>{a.selected.toUpperCase()}</span></p>
            {!a.isCorrect && <p>Doğru Cevap: <span style={{ color: '#10b981', fontWeight: 600 }}>{a.question.correct_option.toUpperCase()}</span></p>}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', borderLeft: '4px solid #0ea5e9' }}>
              <strong>Neden?</strong><br />{a.question.explanation || 'Açıklama yok.'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminPanel_Internal({ categories, fetchCategories }: any) {
  const [nc, setNc] = useState('');
  const [sc, setSc] = useState('');
  const [q, setQ] = useState({ t: '', a: '', b: '', c: '', d: '', k: 'a', e: '' });
  const [qs, setQs] = useState<any[]>([]);
  const [editingQId, setEditingQId] = useState<any>(null);

  const fetchQs = (catId: any) => {
    if (!catId) { setQs([]); return; }
    axios.get(`${API_BASE}/questions?category_id=${catId}`)
      .then(res => setQs(res.data))
      .catch(err => console.error('Qs Error:', err));
  };

  useEffect(() => {
    fetchQs(sc);
    setEditingQId(null);
    setQ({ t: '', a: '', b: '', c: '', d: '', k: 'a', e: '' });
  }, [sc]);

  const delCat = (id: any, name: string) => {
    if (confirm(`'${name}' kategorisini ve içindeki tüm soruları silmek istediğinize emin misiniz?`)) {
      axios.delete(`${API_BASE}/categories/${id}`).then(() => fetchCategories());
    }
  };

  const editCat = (id: any, oldName: string) => {
    const newName = prompt('Yeni kategori adı:', oldName);
    if (newName && newName !== oldName) {
      axios.put(`${API_BASE}/categories/${id}`, { name: newName }).then(() => fetchCategories());
    }
  };

  const delQ = (id: any) => {
    if (confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
      axios.delete(`${API_BASE}/questions/${id}`).then(() => fetchQs(sc));
    }
  };

  const startEditQ = (orig: any) => {
    setEditingQId(orig.id);
    setQ({
      t: orig.question_text,
      a: orig.option_a,
      b: orig.option_b,
      c: orig.option_c,
      d: orig.option_d,
      k: orig.correct_option,
      e: orig.explanation || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveQ = () => {
    if (!sc || !q.t.trim() || !q.a.trim() || !q.b.trim() || !q.c.trim() || !q.d.trim()) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }
    const payload = { category_id: sc, question_text: q.t, option_a: q.a, option_b: q.b, option_c: q.c, option_d: q.d, correct_option: q.k, explanation: q.e };

    if (editingQId) {
      axios.put(`${API_BASE}/questions/${editingQId}`, payload).then(() => {
        alert('Soru Güncellendi');
        setEditingQId(null);
        setQ({ t: '', a: '', b: '', c: '', d: '', k: 'a', e: '' });
        fetchQs(sc);
      });
    } else {
      axios.post(`${API_BASE}/questions`, payload).then(() => {
        alert('Soru Kaydedildi');
        setQ({ t: '', a: '', b: '', c: '', d: '', k: 'a', e: '' });
        fetchQs(sc);
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 900 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3>Kategorileri Yönet</h3>
            <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
              <input className="input-field" style={{ flex: 1 }} placeholder="Yeni Kategori" value={nc} onChange={e => setNc(e.target.value)} />
              <button className="btn btn-primary" onClick={() => axios.post(`${API_BASE}/categories`, { name: nc }).then(() => { setNc(''); fetchCategories(); })}>Ekle</button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gap: '0.5rem' }}>
              {categories.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                  <span>{c.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => editCat(c.id, c.name)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', border: '1px solid #0ea5e9', borderRadius: '4px', cursor: 'pointer' }}>Düzelt</button>
                    <button onClick={() => delCat(c.id, c.name)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', border: '1px solid #f43f5e', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sc && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3>Soruları Düzenle ({qs.length})</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                {qs.map((item: any) => (
                  <div key={item.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: item.id === editingQId ? '1px solid #0ea5e9' : 'none' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 600 }}>{item.question_text}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => startEditQ(item)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#0ea5e9', color: 'white' }}>Düzenle</button>
                      <button onClick={() => delQ(item.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: '#f43f5e', color: 'white' }}>Sil</button>
                    </div>
                  </div>
                ))}
                {qs.length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Bu kategoride soru bulunamadı.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3>{editingQId ? 'Soruyu Güncelle' : 'Soru Ekle'}</h3>
          <select className="input-field" style={{ margin: '1rem 0', background: '#0f172a' }} value={sc} onChange={e => setSc(e.target.value)}>
            <option value="">Kategori Seçin</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea className="input-field" placeholder="Soru Metni" value={q.t} onChange={e => setQ({ ...q, t: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
            <input className="input-field" placeholder="A" value={q.a} onChange={e => setQ({ ...q, a: e.target.value })} />
            <input className="input-field" placeholder="B" value={q.b} onChange={e => setQ({ ...q, b: e.target.value })} />
            <input className="input-field" placeholder="C" value={q.c} onChange={e => setQ({ ...q, c: e.target.value })} />
            <input className="input-field" placeholder="D" value={q.d} onChange={e => setQ({ ...q, d: e.target.value })} />
          </div>
          <select className="input-field" style={{ margin: '0 0 1rem 0', background: '#0f172a' }} value={q.k} onChange={e => setQ({ ...q, k: e.target.value })}>
            <option value="a">Cevap: A</option><option value="b">Cevap: B</option><option value="c">Cevap: C</option><option value="d">Cevap: D</option>
          </select>
          <textarea className="input-field" placeholder="Neden? / Açıklama" value={q.e} onChange={e => setQ({ ...q, e: e.target.value })} />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveQ}>
              {editingQId ? 'Güncelle' : 'Soru Kaydet'}
            </button>
            {editingQId && (
              <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => { setEditingQId(null); setQ({ t: '', a: '', b: '', c: '', d: '', k: 'a', e: '' }); }}>İptal</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
