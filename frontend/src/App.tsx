import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GraduationCap,
  User,
  CheckCircle,
  XCircle,
  ChevronRight,
  LogOut,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Save,
  ChevronLeft,
  ImageIcon
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
  image_url?: string;
}

// --- UI Components ---

const Navbar = ({ user, isAdmin, onLogout, onGoHome }: any) => (
  <nav className="glass-card" style={{ margin: '1rem', padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={onGoHome}>
      <GraduationCap size={28} color="hsl(var(--primary))" />
      <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>DENİZ AKADEMİSİ</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'hsla(var(--foreground), 0.7)' }}>
        <User size={18} />
        <span>{user} {isAdmin && <span className="badge badge-primary" style={{ marginLeft: '0.25rem' }}>Hoca</span>}</span>
      </div>
      <button onClick={onLogout} className="btn btn-ghost" style={{ padding: '0.25rem' }}>
        <LogOut size={18} />
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
  if (!questions.length) return <div className="glass-card animate-fade-in" style={{ padding: '4rem', textAlign: 'center' }}>Bu kategoride soru bulunamadı.</div>;

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
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-primary">{category.name}</span>
          <span style={{ fontSize: '0.85rem', color: 'hsla(var(--foreground), 0.5)' }}>Soru {currentIndex + 1} / {questions.length}</span>
        </div>

        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>{currentQ.question_text}</h2>

        {currentQ.image_url && (
          <div style={{ marginBottom: '2rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid hsla(var(--foreground), 0.1)' }}>
            <img src={currentQ.image_url} alt="Soru Görseli" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {['a', 'b', 'c', 'd'].map(opt => (
            <button
              key={opt}
              onClick={() => setSelectedOption(opt)}
              className={`option-btn ${selectedOption === opt ? 'selected' : ''}`}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: selectedOption === opt ? 'hsl(var(--primary))' : 'hsla(var(--foreground), 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: selectedOption === opt ? 'white' : 'inherit'
              }}>
                {opt.toUpperCase()}
              </div>
              <span style={{ fontSize: '1.05rem' }}>{(currentQ as any)[`option_${opt}`]}</span>
            </button>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '2.5rem', opacity: selectedOption ? 1 : 0.5 }}
          disabled={!selectedOption}
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1 ? 'Testi Bitir' : 'Sonraki Soru'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

const ResultsView = ({ score, total, answers, onBack }: any) => {
  const percentage = Math.round((score / total) * 100);
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
          background: 'hsla(var(--primary), 0.1)', borderRadius: '50%', filter: 'blur(40px)'
        }}></div>
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          %{percentage}
        </h1>
        <p style={{ color: 'hsla(var(--foreground), 0.6)', fontSize: '1.1rem', marginBottom: '2rem' }}>{total} Soruda {score} Doğru</p>
        <button className="btn btn-primary" onClick={onBack}>
          <ChevronLeft size={20} />
          Ana Sayfaya Dön
        </button>
      </div>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {answers.map((ans: any, i: number) => (
          <div key={i} className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ marginTop: '0.25rem' }}>{ans.isCorrect ? <CheckCircle size={24} color="#10b981" /> : <XCircle size={24} color="hsl(var(--accent))" />}</div>
              <h3 style={{ fontSize: '1.15rem' }}>{ans.question.question_text}</h3>
            </div>
            <div style={{ marginLeft: '2.5rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', fontSize: '0.95rem' }}>
              <div>Cevabınız: <span style={{ color: ans.isCorrect ? '#10b981' : 'hsl(var(--accent))', fontWeight: 700 }}>{ans.selected.toUpperCase()}</span></div>
              <div>Doğru: <span style={{ color: '#10b981', fontWeight: 700 }}>{ans.question.correct_option.toUpperCase()}</span></div>
            </div>
            <div style={{ background: 'hsla(var(--foreground), 0.05)', padding: '1.25rem', borderRadius: '1rem', marginLeft: '2.5rem', borderLeft: '4px solid hsl(var(--primary))' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.9rem', opacity: 0.6 }}>AÇIKLAMA</div>
              <div style={{ fontSize: '0.95rem' }}>{ans.question.explanation || 'Açıklama mevcut değil.'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const AdminPanel = ({ categories, fetchCategories }: any) => {
  const [newCat, setNewCat] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [catQuestions, setCatQuestions] = useState<Question[]>([]);

  const [isEditingQ, setIsEditingQ] = useState(false);
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [qForm, setQForm] = useState({
    text: '', a: '', b: '', c: '', d: '', correct: 'a', expl: '', img: ''
  });

  const fetchQs = (cid: number) => {
    axios.get(`${API_BASE}/questions?category_id=${cid}`).then(res => setCatQuestions(res.data));
  };

  const addCat = () => {
    if (!newCat) return;
    axios.post(`${API_BASE}/categories`, { name: newCat }).then(() => { setNewCat(''); fetchCategories(); });
  };

  const updateCat = (id: number) => {
    axios.put(`${API_BASE}/categories/${id}`, { name: editingCatName }).then(() => {
      setEditingCatId(null);
      fetchCategories();
    });
  };

  const deleteCat = (id: number) => {
    if (!confirm('Bu kategoriyi ve içindeki tüm soruları silmek istediğinize emin misiniz?')) return;
    axios.delete(`${API_BASE}/categories/${id}`).then(() => fetchCategories());
  };

  const saveQuestion = () => {
    if (!selectedCatId || !qForm.text) return;
    const payload = {
      category_id: selectedCatId,
      question_text: qForm.text,
      option_a: qForm.a, option_b: qForm.b, option_c: qForm.c, option_d: qForm.d,
      correct_option: qForm.correct,
      explanation: qForm.expl,
      image_url: qForm.img
    };

    if (isEditingQ && editingQId) {
      axios.put(`${API_BASE}/questions/${editingQId}`, payload).then(() => {
        alert('Soru güncellendi');
        setIsEditingQ(false);
        setEditingQId(null);
        fetchQs(selectedCatId);
        resetQForm();
      });
    } else {
      axios.post(`${API_BASE}/questions`, payload).then(() => {
        alert('Soru eklendi');
        fetchQs(selectedCatId);
        resetQForm();
      });
    }
  };

  const deleteQ = (id: number) => {
    if (!confirm('Soru silinsin mi?')) return;
    axios.delete(`${API_BASE}/questions/${id}`).then(() => selectedCatId && fetchQs(selectedCatId));
  };

  const startEditQ = (sq: Question) => {
    setIsEditingQ(true);
    setEditingQId(sq.id);
    setQForm({
      text: sq.question_text,
      a: sq.option_a, b: sq.option_b, c: sq.option_c, d: sq.option_d,
      correct: sq.correct_option,
      expl: sq.explanation,
      img: sq.image_url || ''
    });
  };

  const resetQForm = () => {
    setIsEditingQ(false);
    setEditingQId(null);
    setQForm({ text: '', a: '', b: '', c: '', d: '', correct: 'a', expl: '', img: '' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

      {/* Category Management */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} color="hsl(var(--primary))" />
          Kategoriler
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input className="input-field" placeholder="Yeni Kategori" value={newCat} onChange={e => setNewCat(e.target.value)} />
          <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={addCat}><Plus size={20} /></button>
        </div>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {categories.map((c: any) => (
            <div key={c.id} className={`glass-card ${selectedCatId === c.id ? 'animate-fade-in' : ''}`}
              style={{ padding: '1rem', background: selectedCatId === c.id ? 'hsla(var(--primary), 0.1)' : 'hsla(var(--foreground), 0.03)', borderColor: selectedCatId === c.id ? 'hsl(var(--primary))' : 'hsla(var(--foreground), 0.1)' }}>
              {editingCatId === c.id ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="input-field" value={editingCatName} onChange={e => setEditingCatName(e.target.value)} />
                  <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => updateCat(c.id)}><Save size={18} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ cursor: 'pointer', fontWeight: selectedCatId === c.id ? 700 : 500 }} onClick={() => { setSelectedCatId(c.id); fetchQs(c.id); }}>{c.name}</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => { setEditingCatId(c.id); setEditingCatName(c.name); }}><Edit size={16} /></button>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'hsl(var(--accent))' }} onClick={() => deleteCat(c.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Question Management */}
      <div style={{ display: 'grid', gap: '2rem' }}>

        {/* Question Form */}
        {selectedCatId && (
          <div className="glass-card animate-fade-in" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{isEditingQ ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</h3>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsla(var(--foreground), 0.5)', marginBottom: '0.5rem' }}>SORU METNİ</label>
              <textarea className="input-field" style={{ minHeight: '100px' }} placeholder="Soruyu buraya yazın..." value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsla(var(--foreground), 0.5)', marginBottom: '0.5rem' }}>GÖRSEL URL (OPSİYONEL)</label>
              <div style={{ position: 'relative' }}>
                <ImageIcon size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', opacity: 0.5 }} />
                <input className="input-field" style={{ paddingLeft: '3rem' }} placeholder="https://example.com/image.png" value={qForm.img} onChange={e => setQForm({ ...qForm, img: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsla(var(--foreground), 0.5)', marginBottom: '0.5rem' }}>SEÇENEKLER</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['a', 'b', 'c', 'd'].map(opt => (
                  <input key={opt} className="input-field" placeholder={`Seçenek ${opt.toUpperCase()}`} value={(qForm as any)[opt]} onChange={e => setQForm({ ...qForm, [opt]: e.target.value })} />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsla(var(--foreground), 0.5)', marginBottom: '0.5rem' }}>DOĞRU CEVAP</label>
                <select className="input-field" value={qForm.correct} onChange={e => setQForm({ ...qForm, correct: e.target.value })}>
                  <option value="a">A Seçeneği</option><option value="b">B Seçeneği</option><option value="c">C Seçeneği</option><option value="d">D Seçeneği</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'hsla(var(--foreground), 0.5)', marginBottom: '0.5rem' }}>AÇIKLAMA (OPSİYONEL)</label>
                <input className="input-field" placeholder="Çözüm veya bilgilendirme..." value={qForm.expl} onChange={e => setQForm({ ...qForm, expl: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveQuestion}>{isEditingQ ? 'Güncelle' : 'Soru Kaydet'}</button>
              {isEditingQ && <button className="btn btn-ghost" onClick={resetQForm}>İptal</button>}
            </div>
          </div>
        )}

        {/* Question List */}
        {selectedCatId && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Ekli Sorular</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {catQuestions.map(sq => (
                <div key={sq.id} className="glass-card" style={{ padding: '1.25rem', background: 'hsla(var(--foreground), 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{sq.question_text}</p>
                      <div style={{ fontSize: '0.85rem', color: 'hsla(var(--foreground), 0.6)' }}>
                        Doğru: {sq.correct_option.toUpperCase()} | {sq.explanation ? 'Açıklama var' : 'Açıklama yok'}
                        {sq.image_url && ' | Görsel var'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={() => startEditQ(sq)}><Edit size={16} /></button>
                      <button className="btn btn-ghost" style={{ padding: '0.4rem', color: 'hsl(var(--accent))' }} onClick={() => deleteQ(sq.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {catQuestions.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, padding: '2rem' }}>Henüz soru eklenmemiş.</p>}
            </div>
          </div>
        )}

        {!selectedCatId && (
          <div className="glass-card animate-fade-in" style={{ padding: '4rem', textAlign: 'center', opacity: 0.6 }}>
            Soru yönetimi için soldan bir kategori seçin.
          </div>
        )}
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
        setApiError(err.message);
      });
  };

  useEffect(() => {
    if (user) {
      if (user === 'Hoca') {
        setIsAdmin(true);
        setView('admin');
      }
      fetchCats();
    }
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-card animate-fade-in" style={{ padding: '3.5rem', width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', inset: '-20px', background: 'hsla(var(--primary), 0.2)', filter: 'blur(20px)', borderRadius: '50%' }}></div>
            <GraduationCap size={72} color="hsl(var(--primary))" style={{ position: 'relative' }} />
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Deniz Akademisi</h1>
          <p style={{ color: 'hsla(var(--foreground), 0.5)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Eğitim ve Soru Bankası Platformu</p>
          <form onSubmit={onLogin}>
            <input className="input-field" style={{ marginBottom: '1rem' }} placeholder="Ad Soyad" value={loginVal} onChange={e => setLoginVal(e.target.value)} />
            <button className="btn btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar user={user} isAdmin={isAdmin} onLogout={onLogout} onGoHome={() => setView(isAdmin ? 'admin' : 'dash')} />
      <main className="container">
        {view === 'dash' && (
          <div className="animate-fade-in">
            <h2 style={{ marginBottom: '2.5rem', fontSize: '1.75rem' }}>Eğitim Kategorileri</h2>
            {apiError && (
              <div style={{ padding: '1.25rem', background: 'hsla(var(--accent), 0.1)', color: 'hsl(var(--accent))', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid hsla(var(--accent), 0.2)' }}>
                <strong>Bağlantı Hatası:</strong> {apiError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {categories.map(c => (
                <div key={c.id} className="glass-card animate-fade-in" style={{ padding: '1.75rem', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={() => { setSelCat(c); setView('quiz'); }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen color="hsl(var(--primary))" />
                      </div>
                      <h3 style={{ fontSize: '1.25rem' }}>{c.name}</h3>
                    </div>
                    <ChevronRight color="hsla(var(--foreground), 0.3)" />
                  </div>
                </div>
              ))}
              {categories.length === 0 && !apiError && <div className="glass-card" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>Henüz kategori eklenmemiş.</div>}
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
