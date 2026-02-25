import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
  LogOut,
  BookOpen
} from 'lucide-react';

// --- Dynamic API URL ---
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return '/api';
};
const API_BASE = getApiBase();

interface Category {
  id: number;
  name: string;
}

interface Question {
  id: number;
  category_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
}

// --- Internal Components ---

const Navbar = ({ user, isAdmin, onLogout }: any) => (
  <nav className="glass-card" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <GraduationCap size={32} color="#0ea5e9" />
      <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>DENİZ AKADEMİSİ</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <User size={20} />
        <span>{user} {isAdmin && '(Hoca)'}</span>
      </div>
      <button onClick={onLogout} className="btn" style={{ background: 'transparent', color: '#94a3b8', padding: 0 }}>
        <LogOut size={20} />
      </button>
    </div>
  </nav>
);

const QuizView = ({ category, onFinish }: any) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/questions?category_id=${category.id}`)
      .then(res => {
        setQuestions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [category.id]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Yükleniyor...</div>;
  if (!questions.length) return <div style={{ padding: '4rem', textAlign: 'center' }}>Soru bulunamadı.</div>;

  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQ.correct_option;
    const newAnswers = [...answers, { question: currentQ, selected: selectedOption, isCorrect }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const score = newAnswers.filter(a => a.isCorrect).length;
      onFinish(score, questions.length, newAnswers);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>Soru {currentIndex + 1} / {questions.length}</div>
      <h2 style={{ marginBottom: '2rem' }}>{currentQ.question_text}</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {['a', 'b', 'c', 'd'].map(opt => (
          <button
            key={opt}
            onClick={() => setSelectedOption(opt)}
            className="glass-card"
            style={{
              padding: '1rem',
              textAlign: 'left',
              borderColor: selectedOption === opt ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
              background: selectedOption === opt ? 'rgba(14, 165, 233, 0.1)' : 'transparent'
            }}
          >
            <span style={{ fontWeight: 800, marginRight: '1rem' }}>{opt.toUpperCase()}</span>
            {(currentQ as any)[`option_${opt}`]}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '2rem', opacity: selectedOption ? 1 : 0.5 }}
        disabled={!selectedOption}
        onClick={handleNext}
      >
        {currentIndex === questions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
      </button>
    </div>
  );
};

const ResultsView = ({ score, total, answers, onBack }: any) => (
  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '3rem' }}>%{Math.round((score / total) * 100)}</h1>
      <p style={{ color: '#94a3b8' }}>{total} Soruda {score} Doğru</p>
      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onBack}>Geri Dön</button>
    </div>
    <div style={{ display: 'grid', gap: '1rem' }}>
      {answers.map((ans: any, i: number) => (
        <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {ans.isCorrect ? <CheckCircle color="#10b981" /> : <XCircle color="#f43f5e" />}
            <h3>{ans.question.question_text}</h3>
          </div>
          <p style={{ marginLeft: '2.5rem', marginBottom: '1rem' }}>
            Cevabınız: <span style={{ color: ans.isCorrect ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{ans.selected.toUpperCase()}</span> |
            Doğru: <span style={{ color: '#10b981', fontWeight: 700 }}>{ans.question.correct_option.toUpperCase()}</span>
          </p>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', marginLeft: '2.5rem' }}>
            <strong>Neden?</strong><br />{ans.question.explanation || 'Açıklama mevcut değil.'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminPanel = ({ categories, fetchCategories }: any) => {
  const [newCat, setNewCat] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [q, setQ] = useState({ text: '', a: '', b: '', c: '', d: '', correct: 'a', expl: '' });

  const addCat = () => {
    if (!newCat) return;
    axios.post(`${API_BASE}/categories`, { name: newCat }).then(() => { setNewCat(''); fetchCategories(); });
  };

  const addQ = () => {
    if (!selectedCat || !q.text) return;
    axios.post(`${API_BASE}/questions`, {
      category_id: selectedCat,
      question_text: q.text,
      option_a: q.a, option_b: q.b, option_c: q.c, option_d: q.d,
      correct_option: q.correct,
      explanation: q.expl
    }).then(() => { alert('Soru eklendi'); setQ({ text: '', a: '', b: '', c: '', d: '', correct: 'a', expl: '' }); });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3>Kategori Ekle</h3>
        <input className="input-field" style={{ margin: '1rem 0' }} placeholder="Adı" value={newCat} onChange={e => setNewCat(e.target.value)} />
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={addCat}>Ekle</button>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3>Soru Ekle</h3>
        <select className="input-field" style={{ margin: '1rem 0', background: '#0f172a' }} value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
          <option value="">Kategori Seçin</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea className="input-field" placeholder="Soru" value={q.text} onChange={e => setQ({ ...q, text: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '1rem 0' }}>
          <input className="input-field" placeholder="A" value={q.a} onChange={e => setQ({ ...q, a: e.target.value })} />
          <input className="input-field" placeholder="B" value={q.b} onChange={e => setQ({ ...q, b: e.target.value })} />
          <input className="input-field" placeholder="C" value={q.c} onChange={e => setQ({ ...q, c: e.target.value })} />
          <input className="input-field" placeholder="D" value={q.d} onChange={e => setQ({ ...q, d: e.target.value })} />
        </div>
        <select className="input-field" style={{ margin: '0 0 1rem 0', background: '#0f172a' }} value={q.correct} onChange={e => setQ({ ...q, correct: e.target.value })}>
          <option value="a">Doğru: A</option><option value="b">Doğru: B</option><option value="c">Doğru: C</option><option value="d">Doğru: D</option>
        </select>
        <textarea className="input-field" placeholder="Açıklama" value={q.expl} onChange={e => setQ({ ...q, expl: e.target.value })} />
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={addQ}>Soru Kaydet</button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('studentName'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'dash' | 'quiz' | 'res' | 'admin'>('dash');
  const [loginVal, setLoginVal] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selCat, setSelCat] = useState<Category | null>(null);
  const [result, setResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchCats = () => {
    setApiError(null);
    axios.get(`${API_BASE}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => {
        console.error('Fetch error:', err);
        setApiError(err.message + (err.response ? ': ' + JSON.stringify(err.response.data) : ''));
      });
  };

  useEffect(() => {
    if (user) fetchCats();
  }, [user]);

  const onLogout = () => {
    localStorage.removeItem('studentName');
    setUser(null);
    setIsAdmin(false);
    setView('dash');
  };

  const onLogin = (e: any) => {
    e.preventDefault();
    if (!loginVal.trim()) return;
    if (loginVal === 'admin_deniz') {
      setIsAdmin(true);
      setUser('Hoca');
      setView('admin');
    } else {
      setUser(loginVal);
      localStorage.setItem('studentName', loginVal);
      setView('dash');
    }
  };

  if (!user) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '3rem', width: '400px', textAlign: 'center' }}>
          <GraduationCap size={64} color="#0ea5e9" style={{ marginBottom: '1rem' }} />
          <h1>Deniz Akademisi</h1>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>Soru Bankasına Giriş Yapın</p>
          <form onSubmit={onLogin}>
            <input className="input-field" placeholder="Ad Soyad" value={loginVal} onChange={e => setLoginVal(e.target.value)} />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar user={user} isAdmin={isAdmin} onLogout={onLogout} />
      <main className="container">
        {view === 'dash' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Eğitim Kategorileri</h2>
            {apiError && (
              <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong>Bağlantı Hatası:</strong> {apiError}<br />
                <small>Hedef: {API_BASE}/categories</small>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {categories.map(c => (
                <div key={c.id} className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}
                  onClick={() => { setSelCat(c); setView('quiz'); }}>
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
          <QuizView category={selCat} onFinish={(score: any, total: any, answers: any) => {
            setResult({ score, total, answers });
            setView('res');
          }} />
        )}

        {view === 'res' && result && (
          <ResultsView {...result} onBack={() => setView('dash')} />
        )}

        {isAdmin && view === 'admin' && (
          <AdminPanel categories={categories} fetchCategories={fetchCats} />
        )}
      </main>
    </div>
  );
}
