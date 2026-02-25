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
  ChevronLeft
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

// --- Supabase Client ---
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  <nav className="glass-card" style={{
    margin: '1.5rem',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid hsla(var(--foreground), 0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onGoHome}>
      <div style={{ background: 'hsla(var(--primary), 0.15)', padding: '0.6rem', borderRadius: '12px' }}>
        <GraduationCap size={26} color="hsl(var(--primary))" />
      </div>
      <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em' }}>QUIZ OF THE SEAS</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', fontWeight: 500 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'hsla(var(--foreground), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={20} color="hsla(var(--foreground), 0.6)" />
        </div>
        <span style={{ color: 'hsla(var(--foreground), 0.8)' }}>
          {user}
          {isAdmin && <span className="badge badge-primary" style={{ marginLeft: '0.75rem', fontSize: '0.65rem' }}>HOCA</span>}
        </span>
      </div>
      <button onClick={onLogout} className="btn btn-ghost" style={{ padding: '0.6rem', color: 'hsl(var(--accent))' }}>
        <LogOut size={20} />
      </button>
    </div>
  </nav>
);

const FileUpload = ({ currentImage, onUpload, showToast }: any) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen sadece resim dosyası yükleyin', 'error');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabaseStorage.storage
        .from('question-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabaseStorage.storage
        .from('question-images')
        .getPublicUrl(data.path);

      onUpload(publicUrl);
      setProgress(100);
      showToast('Görsel başarıyla yüklendi 🎉');
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast('Yükleme başarısız: ' + err.message, 'error');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          };
          input.click();
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', opacity: uploading ? 0.3 : 1 }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={32} color="hsl(var(--primary))" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Görseli Buraya Sürükleyin</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>veya bilgisayarınızdan seçmek için tıklayın</p>
          </div>
        </div>
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ width: '80%', height: '8px', background: 'hsla(var(--foreground), 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.3s' }} />
            </div>
          </div>
        )}
      </div>

      {currentImage && (
        <div className="upload-preview animate-fade-in">
          <img src={currentImage} alt="Preview" />
          <button className="remove-img" onClick={(e) => { e.stopPropagation(); onUpload(''); }}>
            <XCircle size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
  <div className="toast-container">
    <div className={`toast ${type}`}>
      {type === 'success' ? <CheckCircle size={24} color="hsl(var(--primary))" /> : <XCircle size={24} color="hsl(var(--accent))" />}
      <span style={{ fontWeight: 600, letterSpacing: '0.01em' }}>{message}</span>
    </div>
  </div>
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

const AdminPanel = ({ categories, fetchCategories, showToast }: any) => {
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
    if (!newCat.trim()) return;
    axios.post(`${API_BASE}/categories`, { name: newCat })
      .then(() => {
        setNewCat('');
        fetchCategories();
        showToast('Kategori başarıyla eklendi!');
      })
      .catch(err => {
        console.error('Category error:', err);
        showToast('Kategori eklenemedi: ' + (err.response?.data?.message || err.message), 'error');
      });
  };

  const updateCat = (id: number) => {
    const name = editingCatName.trim();
    if (!name) return;
    axios.put(`${API_BASE}/categories/${id}`, { name }).then(() => {
      setEditingCatId(null);
      fetchCategories();
      showToast('Kategori güncellendi');
    }).catch(err => showToast('Güncelleme hatası: ' + err.message, 'error'));
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
        showToast('Soru başarıyla güncellendi ✨');
        setIsEditingQ(false);
        setEditingQId(null);
        fetchQs(selectedCatId);
        resetQForm();
      }).catch(() => showToast('Soru güncellenirken hata oluştu', 'error'));
    } else {
      axios.post(`${API_BASE}/questions`, payload).then(() => {
        showToast('İşlem başarılı! Yeni soru eklendi 🎉');
        fetchQs(selectedCatId);
        resetQForm();
      }).catch(() => showToast('Soru kaydedilirken hata oluştu', 'error'));
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetQForm = () => {
    setIsEditingQ(false);
    setEditingQId(null);
    setQForm({ text: '', a: '', b: '', c: '', d: '', correct: 'a', expl: '', img: '' });
  };

  return (
    <div className="animate-fade-in dash-layout">

      {/* Sidebar: Categories */}
      <aside className="dash-sidebar" style={{ position: 'sticky', top: '2rem' }}>
        <div className="glass-card shadow-lg" style={{ padding: '1.75rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
            <BookOpen size={22} color="hsl(var(--primary))" />
            Kategoriler
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input className="input-field" placeholder="Yeni Kategori..." value={newCat} onChange={e => setNewCat(e.target.value)} />
            <button
              className="btn btn-primary"
              style={{ width: '52px', height: '52px', padding: 0, borderRadius: '14px', flexShrink: 0 }}
              onClick={addCat}
            >
              <Plus size={24} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {categories.map((c: any) => (
              <div key={c.id}
                className="glass-card"
                style={{
                  padding: '1rem',
                  background: selectedCatId === c.id ? 'hsla(var(--primary), 0.15)' : 'hsla(var(--foreground), 0.03)',
                  borderColor: selectedCatId === c.id ? 'hsl(var(--primary))' : 'hsla(var(--foreground), 0.08)',
                  cursor: 'pointer'
                }}
                onClick={() => { setSelectedCatId(c.id); fetchQs(c.id); }}
              >
                {editingCatId === c.id ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                    <input className="input-field" style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }} value={editingCatName} onChange={e => setEditingCatName(e.target.value)} autoFocus />
                    <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={() => updateCat(c.id)}><Save size={16} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: selectedCatId === c.id ? 700 : 500 }}>{c.name}</span>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={(e) => { e.stopPropagation(); setEditingCatId(c.id); setEditingCatName(c.name); }}><Edit size={14} /></button>
                      <button className="btn btn-ghost" style={{ padding: '0.25rem', color: 'hsl(var(--accent))' }} onClick={(e) => { e.stopPropagation(); deleteCat(c.id); }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gap: '0.5rem' }}>

        {selectedCatId ? (
          <>
            {/* Question Form */}
            <div className="glass-card glow-primary" style={{ padding: '3rem', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={24} color="hsl(var(--primary))" />
                  </div>
                  <h3 style={{ fontSize: '1.75rem' }}>{isEditingQ ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</h3>
                </div>
                {isEditingQ && (
                  <button className="badge badge-primary cursor-pointer hover:scale-105 transition-transform" onClick={resetQForm}>
                    YENİ SORU MODUNA DÖN
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-block animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="form-heading">
                    <label>SORU METNİ</label>
                  </div>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '140px', fontSize: '1.1rem', lineHeight: '1.6' }}
                    placeholder="Soruyu buraya detaylıca yazın..."
                    value={qForm.text}
                    onChange={e => setQForm({ ...qForm, text: e.target.value })}
                  />
                </div>

                <div className="form-block animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="form-heading">
                    <label>SORU GÖRSELİ</label>
                  </div>
                  <FileUpload
                    currentImage={qForm.img}
                    onUpload={(url: string) => setQForm({ ...qForm, img: url })}
                    showToast={showToast}
                  />
                </div>

                <div className="form-block animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <div className="form-heading">
                    <label>SEÇENEKLER</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {['a', 'b', 'c', 'd'].map(opt => (
                      <div key={opt} style={{ position: 'relative', transition: 'all 0.3s' }}>
                        <div style={{
                          position: 'absolute', left: '1.5rem', top: '1.1rem',
                          fontWeight: 900, fontSize: '1.25rem',
                          color: 'hsl(var(--primary))', opacity: 0.3
                        }}>
                          {opt.toUpperCase()}
                        </div>
                        <input
                          className="input-field"
                          style={{ paddingLeft: '4rem', background: 'hsla(var(--foreground), 0.02)' }}
                          placeholder={`Seçenek ${opt.toUpperCase()}`}
                          value={(qForm as any)[opt]}
                          onChange={e => setQForm({ ...qForm, [opt]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-block animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
                    <div>
                      <div className="form-heading">
                        <label>DOĞRU CEVAP</label>
                      </div>
                      <select className="input-field" value={qForm.correct} onChange={e => setQForm({ ...qForm, correct: e.target.value })}>
                        <option value="a">A SEÇENEĞİ</option>
                        <option value="b">B SEÇENEĞİ</option>
                        <option value="c">C SEÇENEĞİ</option>
                        <option value="d">D SEÇENEĞİ</option>
                      </select>
                    </div>
                    <div>
                      <div className="form-heading">
                        <label>AÇIKLAMA / ÇÖZÜM</label>
                      </div>
                      <input
                        className="input-field"
                        placeholder="Çözüm detaylarını buraya ekleyin..."
                        value={qForm.expl}
                        onChange={e => setQForm({ ...qForm, expl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: '4rem', fontSize: '1.1rem' }} onClick={saveQuestion}>
                    <Save size={24} />
                    {isEditingQ ? 'Soruyu Güncelle' : 'Soruyu Kaydet'}
                  </button>
                  {isEditingQ && (
                    <button className="btn btn-ghost" onClick={resetQForm} style={{ flex: 0.3, height: '4rem' }}>
                      İptal
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question List Area */}
            <div className="glass-card" style={{ padding: '3rem', marginTop: '3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>Mevcut Sorular</h3>
                <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>{catQuestions.length} SORU BULUNDU</span>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {catQuestions.map((sq, idx) => (
                  <div key={sq.id} className="glass-card" style={{ padding: '1.5rem', background: 'hsla(var(--foreground), 0.02)', border: '1px solid hsla(var(--foreground), 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 900, color: 'hsla(var(--primary), 0.3)', fontSize: '0.9rem', marginTop: '0.2rem' }}>#{idx + 1}</span>
                          <p style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.5 }}>{sq.question_text}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>Doğru: {sq.correct_option.toUpperCase()}</span>
                          {sq.image_url && <span className="badge" style={{ background: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))' }}>Görselli</span>}
                          {sq.explanation && <span className="badge" style={{ background: 'hsla(var(--foreground), 0.05)', color: 'hsla(var(--foreground), 0.5)' }}>Açıklamalı</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => startEditQ(sq)}><Edit size={18} /></button>
                        <button className="btn btn-ghost" style={{ padding: '0.5rem', color: 'hsl(var(--accent))' }} onClick={() => deleteQ(sq.id)}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {catQuestions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.4 }}>
                    <BookOpen size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem' }}>Henüz hiç soru eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card animate-fade-in" style={{ padding: '8rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <BookOpen size={48} color="hsl(var(--primary))" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Yönetime Başlayın</h3>
              <p style={{ color: 'hsla(var(--foreground), 0.5)', maxWidth: '450px', margin: '0 auto', fontSize: '1.1rem' }}>
                Soruları yönetmek veya yenilerini eklemek için sol taraftaki panelden bir kategori seçin.
              </p>
            </div>
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'hsl(var(--background))', position: 'relative', overflow: 'hidden' }}>
        {/* Login Specific Marine Blobs */}
        <div className="marine-blob" style={{ width: '300px', height: '300px', top: '-10%', right: '-10%', opacity: 0.5 }}></div>
        <div className="marine-blob" style={{ width: '400px', height: '400px', bottom: '-20%', left: '-10%', opacity: 0.5, animationDelay: '-8s' }}></div>

        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'white', marginBottom: '2.5rem', letterSpacing: '-0.04em', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          Quiz of the <span style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Seas</span>
        </h2>
        <div className="login-card-white animate-fade-in">
          <h1 className="login-header-text">Giriş Yap</h1>
          <p className="login-subtitle">Hesabınıza giriş yaparak devam edin.</p>

          <form onSubmit={onLogin}>
            <div className="login-input-group">
              <label className="login-label">Ad Soyad</label>
              <div className="login-field-wrapper">
                <User className="login-field-icon" size={22} />
                <input
                  className="login-input-white"
                  placeholder="Kullanıcı adınızı girin"
                  value={loginVal}
                  onChange={e => setLoginVal(e.target.value)}
                />
              </div>
            </div>

            <button className="login-btn-dark">
              <span>Giriş Yap</span>
              <ChevronRight size={22} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
      {/* Marine Blobs Background Decor */}
      <div className="marine-blob" style={{ width: '400px', height: '400px', top: '10%', left: '-10%' }}></div>
      <div className="marine-blob" style={{ width: '600px', height: '600px', bottom: '10%', right: '-10%', animationDelay: '-5s' }}></div>
      <div className="marine-blob" style={{ width: '300px', height: '300px', top: '50%', right: '5%', animationDelay: '-10s' }}></div>

      <Navbar user={user} isAdmin={isAdmin} onLogout={onLogout} onGoHome={() => setView(isAdmin ? 'admin' : 'dash')} />
      <main className="container" style={{ position: 'relative', zIndex: 1 }}>
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
          <AdminPanel categories={categories} fetchCategories={fetchCats} showToast={showToast} />
        )}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
