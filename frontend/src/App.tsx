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
  Monitor,
  Sparkles,
  Activity,
  History
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
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://utammtangicjaseucyhd.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_VsoaC3k3K4rzPPPJTBNAGw_m8KUh2fF';
const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_KEY);

const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/question-images`;

const getImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${STORAGE_BASE_URL}/${url}`;
};

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface Question {
  id: number;
  category_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: string;
  explanation: string;
  image_url?: string;
  video_url?: string;
  audio_url?: string;
}

// --- UI Components ---

const Navbar = ({ user, isAdmin, onLogout, onGoHome, students, fetchStudents, showToast }: any) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="glass-card" style={{
      margin: '1.5rem',
      padding: '1rem',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      border: '1px solid hsla(var(--primary), 0.25)',
      background: 'hsla(var(--card), 0.7)',
      position: 'relative',
      zIndex: 1000,
      overflow: 'visible'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={onGoHome}>
        <div style={{ background: 'hsla(var(--primary), 0.15)', padding: '0.4rem', borderRadius: '10px' }}>
          <GraduationCap size={22} color="hsl(var(--primary))" />
        </div>
        <span style={{ fontSize: 'min(5vw, 1.2rem)', fontWeight: 900, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>QUIZ OF THE SEAS</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '0.4rem 0.8rem',
            borderRadius: '12px',
            background: showDropdown ? 'hsla(var(--primary), 0.1)' : 'transparent',
            transition: 'all 0.3s'
          }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsla(var(--foreground), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="hsla(var(--foreground), 0.6)" />
          </div>
          <span style={{ color: 'hsla(var(--foreground), 0.95)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            {user}
            {isAdmin && <span className="badge badge-primary" style={{ marginLeft: '0.5rem', fontSize: '0.6rem', border: '1px solid hsla(var(--primary), 0.4)', padding: '2px 6px' }}>HOCA</span>}
          </span>
          <ChevronRight size={16} style={{ transform: showDropdown ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s', opacity: 0.5 }} />
        </div>
        <button onClick={onLogout} className="btn btn-ghost" style={{ padding: '0.5rem', minWidth: 'auto', width: 'auto', color: 'hsl(var(--accent))' }}>
          <LogOut size={18} />
        </button>
      </div>

      {showDropdown && isAdmin && (
        <div className="glass-card animate-fade-in admin-dropdown" style={{
          position: 'absolute',
          top: '110%',
          right: '1rem',
          width: 'min(90vw, 400px)',
          padding: '1.5rem',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid hsla(var(--primary), 0.3)',
          background: 'hsla(var(--card), 0.95)',
          backdropFilter: 'blur(30px)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))' }}>
              <User size={18} /> Öğrenci Yönetimi
            </h3>
            <StudentManager students={students} fetchStudents={fetchStudents} showToast={showToast} />
          </div>

          <div style={{ borderTop: '1px solid hsla(var(--foreground), 0.1)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))' }}>
              <Edit size={18} /> Şifre İşlemleri
            </h3>
            <PasswordChanger showToast={showToast} />
          </div>
        </div>
      )}
    </nav>
  );
};

const StudentManager = ({ students, fetchStudents, showToast }: any) => {
  const [newStudent, setNewStudent] = useState({ name: '', password: '' });
  const [duration, setDuration] = useState(30); // Default 30 days

  const getDurationLabel = (days: number) => {
    if (days === 365) return '1 Yıl';
    if (days >= 30) return `${Math.floor(days / 30)} Ay ${days % 30 > 0 ? (days % 30) + ' Gün' : ''}`;
    return `${days} Gün`;
  };

  const getRemainingDays = (dateStr: string) => {
    if (!dateStr) return 'Süresiz';
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} gün kaldı` : 'Süresi doldu';
  };

  return (
    <>
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        <input className="input-field" style={{ padding: '0.75rem 1rem' }} placeholder="Öğrenci Adı..." value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
        <input className="input-field" style={{ padding: '0.75rem 1rem' }} placeholder="Şifre..." value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} />

        <div style={{ padding: '0.5rem', background: 'hsla(var(--foreground), 0.03)', borderRadius: '12px', border: '1px solid hsla(var(--primary), 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <span style={{ opacity: 0.6 }}>ERİŞİM SÜRESİ</span>
            <span style={{ color: 'hsl(var(--primary))' }}>{getDurationLabel(duration)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="365"
            value={duration}
            onChange={e => setDuration(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'hsl(var(--primary))', cursor: 'pointer' }}
          />
        </div>

        <button className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '0.9rem' }} onClick={() => {
          if (!newStudent.name || !newStudent.password) return;
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + duration);

          axios.post(`${API_BASE}/students`, {
            name: newStudent.name.trim(),
            password: newStudent.password.trim(),
            expires_at: expiryDate.toISOString()
          }).then(() => {
            setNewStudent({ name: '', password: '' });
            fetchStudents();
            showToast('Öğrenci eklendi!');
          });
        }}>
          <Plus size={18} /> Öğrenciyi Kaydet
        </button>
      </div>
      <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }} className="admin-dropdown">
        {students.map((s: any) => {
          const remaining = getRemainingDays(s.expires_at);
          const isExpired = remaining === 'Süresi doldu';
          return (
            <div key={s.id} className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsla(var(--foreground), 0.03)', borderRadius: '12px', opacity: isExpired ? 0.6 : 1 }}>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {s.name}
                  {isExpired && <span style={{ fontSize: '0.6rem', background: 'hsl(var(--accent))', color: 'white', padding: '1px 4px', borderRadius: '4px' }}>PASİF</span>}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, display: 'flex', gap: '0.5rem' }}>
                  <span>Şifre: {s.password}</span>
                  <span style={{ color: isExpired ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}>• {remaining}</span>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ color: 'hsl(var(--accent))', width: 'auto', padding: '0.4rem' }} onClick={() => {
                axios.delete(`${API_BASE}/students/${s.id}`).then(() => {
                  fetchStudents();
                  showToast('Öğrenci silindi');
                });
              }}><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </>
  );
};

const PasswordChanger = ({ showToast }: any) => {
  const [curr, setCurr] = useState('');
  const [next, setNext] = useState('');

  const handleChange = async () => {
    const username = localStorage.getItem('adminUsername') || 'admin';
    if (!curr || !next) return showToast('Tüm alanları doldurun', 'error');
    try {
      const res = await axios.post(`${API_BASE}/admin/change-password`, {
        username, currentPassword: curr, newPassword: next
      });
      if (res.data.success) {
        showToast('Şifreniz güncellendi ✨');
        setCurr(''); setNext('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Hata oluştu', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <input className="input-field" style={{ padding: '0.75rem 1rem' }} type="password" placeholder="Mevcut Şifre" value={curr} onChange={e => setCurr(e.target.value)} />
      <input className="input-field" style={{ padding: '0.75rem 1rem' }} type="password" placeholder="Yeni Şifre" value={next} onChange={e => setNext(e.target.value)} />
      <button className="btn btn-primary" style={{ padding: '0.75rem', fontSize: '0.9rem' }} onClick={handleChange}>Şifreyi Güncelle</button>
    </div>
  );
};

const FileUpload = ({ currentFile, onUpload, showToast, accept = 'image/*', type = 'image' }: any) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const bucketName = 'question-images';

  const handleFile = async (file: File) => {
    // Basic type check based on 'type' prop
    if (type === 'image' && !file.type.startsWith('image/')) {
      showToast('Lütfen sadece resim dosyası yükleyin', 'error');
      return;
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      showToast('Lütfen sadece video dosyası yükleyin', 'error');
      return;
    }
    if (type === 'audio' && !file.type.startsWith('audio/')) {
      showToast('Lütfen sadece ses dosyası yükleyin', 'error');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Sanitize filename: remove non-ascii/special characters and ensure unique name
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.]/g, '_')
        .replace(/_{2,}/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}`;

      console.log(`Uploading ${type} to bucket: ${bucketName} as ${fileName}`);

      const { data, error } = await supabaseStorage.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message.includes('bucket not found')) {
          throw new Error('Depolama alanı (bucket) bulunamadı. Lütfen Supabase panelinden "question-images" adında bir bucket oluşturup "Public" olarak ayarlayın.');
        }
        throw error;
      }

      const { data: { publicUrl } } = supabaseStorage.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      onUpload(publicUrl);
      setProgress(100);
      showToast(`${type === 'video' ? 'Video' : (type === 'audio' ? 'Ses' : 'Görsel')} başarıyla yüklendi 🎉`);
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
          input.accept = accept;
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
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'hsl(var(--foreground))' }}>
              {type === 'video' ? 'Videoyu' : (type === 'audio' ? 'Ses Dosyasını' : 'Görseli')} Buraya Sürükleyin
            </h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.7, color: 'hsla(var(--foreground), 0.7)' }}>veya bilgisayarınızdan seçmek için tıklayın</p>
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

      {currentFile && (
        <div className="upload-preview animate-fade-in" style={{ height: 'auto', minHeight: '100px' }}>
          {type === 'image' && <img src={currentFile} alt="Preview" />}
          {type === 'video' && <video src={currentFile} controls style={{ width: '100%', borderRadius: '12px' }} />}
          {type === 'audio' && <audio src={currentFile} controls style={{ width: '100%', marginTop: '1rem' }} />}
          <button className="remove-img" onClick={(e) => { e.stopPropagation(); onUpload(''); }}>
            <XCircle size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
    }} onClick={onCancel}>
      <div className="glass-card animate-fade-in" style={{
        width: '90%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center',
        border: '1px solid hsla(var(--primary), 0.3)',
        boxShadow: '0 0 50px hsla(var(--primary), 0.2)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: title.includes('Sil') ? 'hsla(var(--accent), 0.1)' : 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          {title.includes('Sil') ? <Trash2 size={32} color="hsl(var(--accent))" /> : <Monitor size={32} color="hsl(var(--primary))" />}
        </div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>{title}</h3>
        <p style={{ color: 'hsla(var(--foreground), 0.7)', marginBottom: '2.5rem', lineHeight: '1.6' }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>Vazgeç</button>
          <button
            className="btn"
            style={{
              flex: 1,
              background: title.includes('Sil') ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
              boxShadow: title.includes('Sil') ? '0 8px 25px -5px hsla(var(--accent), 0.4)' : '0 8px 25px -5px hsla(var(--primary), 0.4)',
              color: '#fff'
            }}
            onClick={onConfirm}
          >
            {title.includes('Sil') ? 'Evet, Sil' : 'İndir & Hazırla'}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizView = ({ category, onFinish }: any) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/questions?category_id=${category.id}`)
      .then(res => setQuestions(res.data))
      .finally(() => setLoading(false));
  }, [category]);

  const handleNext = () => {
    if (!selectedOption) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correct_option;
    const newScore = isCorrect ? score + 1 : score;
    const newAnswers = [...answers, { question: currentQ, selected: selectedOption, isCorrect }];

    if (currentIndex < questions.length - 1) {
      setScore(newScore);
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      const studentName = localStorage.getItem('studentName');
      const isAdminFlag = localStorage.getItem('isAdmin') === 'true';

      if (studentName && !isAdminFlag) {
        axios.post(`${API_BASE}/results`, {
          student_name: studentName,
          category_id: category.id,
          score: newScore,
          total: questions.length
        }).catch(err => console.error('Failed to save result:', err));
      }

      onFinish(newScore, questions.length, newAnswers);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid hsla(var(--primary), 0.2)', borderTopColor: 'hsl(var(--primary))' }}></div>
      <p style={{ opacity: 0.6 }}>Sorular Kaptan Tarafından Hazırlanıyor...</p>
    </div>
  );

  if (questions.length === 0) return (
    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
      <p style={{ opacity: 0.6 }}>Bu kategoride henüz soru bulunmuyor.</p>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>


      <div className="glass-card" style={{ padding: '3.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.4 }}>SORU {currentIndex + 1} / {questions.length}</span>
            <div style={{ height: '4px', width: '100px', background: 'hsla(var(--primary), 0.2)', borderRadius: '2px', marginTop: '0.5rem' }}>
              <div style={{ height: '100%', width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'hsl(var(--primary))', borderRadius: '2px', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', lineHeight: '1.4', marginBottom: '3rem', fontWeight: 500 }}>{currentQ.question_text}</h2>

        {currentQ.image_url && (
          <div style={{ marginBottom: '2.5rem', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid hsla(var(--foreground), 0.1)' }}>
            <img src={getImageUrl(currentQ.image_url)} alt="Soru görseli" style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {currentQ.video_url && (
          <div style={{ marginBottom: '2.5rem', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid hsla(var(--foreground), 0.1)' }}>
            <video src={currentQ.video_url} controls style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {currentQ.audio_url && (
          <div style={{
            marginBottom: '2rem',
            padding: '1.5rem',
            borderRadius: '1.5rem',
            background: 'hsla(var(--primary), 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsla(var(--primary), 0.3)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} color="hsl(var(--primary))" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', opacity: 0.8 }}>SESLİ SORU</span>
            </div>
            <audio
              src={currentQ.audio_url}
              controls
              style={{ width: '100%', height: '40px', filter: 'invert(0.1) hue-rotate(180deg) brightness(1.2)' }}
            />
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {['a', 'b', 'c', 'd', 'e'].map(opt => (
            (currentQ as any)[`option_${opt}`] && (
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
            )
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '2.5rem', opacity: selectedOption ? 1 : 0.5 }}
          disabled={!selectedOption}
          onClick={() => { handleNext(); }}
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
        <p style={{ color: 'hsla(var(--foreground), 0.85)', fontSize: '1.1rem', marginBottom: '2rem', fontWeight: 500 }}>{total} Soruda {score} Doğru</p>
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
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} /> AÇIKLAMA & ÇÖZÜM
              </div>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                {ans.question.explanation || (
                  <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Bu soru için henüz bir açıklama girilmemiş.</p>
                )}
              </div>
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
    text: '', a: '', b: '', c: '', d: '', e: '', correct: 'a', expl: '', img: '', video: '', audio: ''
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cat' | 'q';
    id: number | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'cat',
    id: null,
    title: '',
    message: ''
  });

  const [parentCatId, setParentCatId] = useState<number | null>(null);

  const fetchQs = (cid: number) => {
    axios.get(`${API_BASE}/questions?category_id=${cid}`).then(res => setCatQuestions(res.data));
  };

  // Students logic moved to App level for Navbar dropdown


  const addCat = () => {
    if (!newCat.trim()) return;
    axios.post(`${API_BASE}/categories`, { name: newCat, parent_id: parentCatId })
      .then(() => {
        setNewCat('');
        setParentCatId(null);
        fetchCategories();
        showToast(parentCatId ? 'Alt kategori eklendi!' : 'Kategori başarıyla eklendi!');
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
    setConfirmModal({
      isOpen: true,
      type: 'cat',
      id,
      title: 'Kategoriyi Sil',
      message: 'Bu kategoriyi ve içindeki tüm soruları (varsa alt kategorileri dahil) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'
    });
  };

  const deleteQ = (id: number) => {
    setConfirmModal({
      isOpen: true,
      type: 'q',
      id,
      title: 'Soruyu Sil',
      message: 'Bu soruyu kalıcı olarak silmek istediğinize emin misiniz?'
    });
  };

  const handleConfirmDelete = () => {
    const { id, type } = confirmModal;
    if (!id) return;

    if (type === 'cat') {
      axios.delete(`${API_BASE}/categories/${id}`)
        .then(() => {
          fetchCategories();
          if (selectedCatId === id) {
            setSelectedCatId(null);
            setCatQuestions([]);
          }
          showToast('Kategori silindi');
        })
        .catch(err => showToast('Silme hatası: ' + err.message, 'error'))
        .finally(() => setConfirmModal({ ...confirmModal, isOpen: false }));
    } else if (type === 'q') {
      axios.delete(`${API_BASE}/questions/${id}`)
        .then(() => {
          if (selectedCatId) fetchQs(selectedCatId);
          showToast('Soru başarıyla silindi');
        })
        .catch(() => showToast('Soru silinirken hata oluştu', 'error'))
        .finally(() => setConfirmModal({ ...confirmModal, isOpen: false }));
    } else {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };


  const saveQuestion = () => {
    if (!selectedCatId || !qForm.text) return;

    const qData = {
      category_id: selectedCatId,
      question_text: qForm.text,
      option_a: qForm.a,
      option_b: qForm.b,
      option_c: qForm.c,
      option_d: qForm.d,
      option_e: qForm.e,
      correct_option: qForm.correct,
      explanation: qForm.expl,
      image_url: qForm.img,
      video_url: qForm.video,
      audio_url: qForm.audio
    };

    if (isEditingQ && editingQId) {
      axios.put(`${API_BASE}/questions/${editingQId}`, qData)
        .then(() => {
          showToast('Soru başarıyla güncellendi ✨');
          setIsEditingQ(false);
          setEditingQId(null);
          fetchQs(selectedCatId);
          resetQForm();
        })
        .catch(() => showToast('Soru güncellenirken hata oluştu', 'error'));
    } else {
      axios.post(`${API_BASE}/questions`, qData)
        .then(() => {
          showToast('İşlem başarılı! Yeni soru eklendi 🎉');
          fetchQs(selectedCatId);
          resetQForm();
        })
        .catch(() => showToast('Soru kaydedilirken hata oluştu', 'error'));
    }
  };

  const startEditQ = (sq: Question) => {
    setIsEditingQ(true);
    setEditingQId(sq.id);
    setQForm({
      text: sq.question_text,
      a: sq.option_a, b: sq.option_b, c: sq.option_c, d: sq.option_d, e: sq.option_e || '',
      correct: sq.correct_option,
      expl: sq.explanation,
      img: sq.image_url || '',
      video: sq.video_url || '',
      audio: sq.audio_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetQForm = () => {
    setIsEditingQ(false);
    setEditingQId(null);
    setQForm({ text: '', a: '', b: '', c: '', d: '', e: '', correct: 'a', expl: '', img: '', video: '', audio: '' });
  };

  // Helper to render hierarchical categories
  const renderCats = (parentId: number | null = null, depth: number = 0) => {
    const list = categories.filter((c: any) => c.parent_id === parentId);
    return list.map((c: any) => (
      <div key={c.id} style={{ marginLeft: `${depth * 1.5}rem` }}>
        <div
          className="glass-card"
          style={{
            padding: '1rem',
            marginBottom: '0.5rem',
            background: selectedCatId === c.id ? 'hsla(var(--primary), 0.15)' : 'hsla(var(--foreground), 0.03)',
            cursor: 'pointer',
            borderLeft: depth > 0 ? '2px solid hsla(var(--primary), 0.3)' : 'none'
          }}
          onClick={() => { setSelectedCatId(c.id); fetchQs(c.id); }}
        >
          {editingCatId === c.id ? (
            <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
              <input className="input-field" value={editingCatName} onChange={e => setEditingCatName(e.target.value)} autoFocus />
              <button className="btn btn-primary" onClick={() => updateCat(c.id)}><Save size={16} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: depth === 0 ? 700 : 400 }}>{c.name}</span>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                {depth === 0 && (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '0.4rem', width: 'auto', color: 'hsl(var(--primary))' }}
                    onClick={(e) => { e.stopPropagation(); setParentCatId(c.id); setNewCat(''); }}
                    title="Alt Kategori Ekle"
                  >
                    <Plus size={14} />
                  </button>
                )}
                <button className="btn btn-ghost" style={{ padding: '0.4rem', width: 'auto' }} onClick={(e) => { e.stopPropagation(); setEditingCatId(c.id); setEditingCatName(c.name); }}><Edit size={14} /></button>
                <button className="btn btn-ghost" style={{ padding: '0.4rem', width: 'auto', color: 'hsl(var(--accent))' }} onClick={(e) => { e.stopPropagation(); deleteCat(c.id); }}><Trash2 size={14} /></button>
              </div>
            </div>
          )}
        </div>
        {renderCats(c.id, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="animate-fade-in dash-layout">
      <aside className="dash-sidebar" style={{ position: 'sticky', top: '2rem' }}>
        <div className="glass-card shadow-lg" style={{ padding: '1.75rem', background: 'rgba(2, 6, 10, 0.6)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
            <BookOpen size={22} color="hsl(var(--primary))" />
            Kategoriler
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {parentCatId && (
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))', display: 'flex', justifyContent: 'space-between' }}>
                <span>{categories.find((cat: any) => cat.id === parentCatId)?.name} altına ekleniyor</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setParentCatId(null)}>Vazgeç</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input className="input-field" placeholder={parentCatId ? "Alt Kategori Adı..." : "Yeni Kategori..."} value={newCat} onChange={e => setNewCat(e.target.value)} />
              <button className="btn btn-primary" style={{ width: '50px', height: '50px', padding: 0, borderRadius: '14px', flexShrink: 0 }} onClick={addCat}>
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
            {renderCats()}
          </div>



        </div>
      </aside>

      <div>
        {selectedCatId ? (
          <>
            <div className="glass-card glow-primary" style={{ padding: '3rem' }}>
              <h3 style={{ fontSize: '1.75rem', marginBottom: '3.5rem' }}>{isEditingQ ? 'Soruyu Düzenle' : 'Yeni Soru Ekle'}</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <textarea className="input-field" placeholder="Soru metni..." value={qForm.text} onChange={e => setQForm({ ...qForm, text: e.target.value })} style={{ minHeight: '140px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>GÖRSEL</label>
                    <FileUpload currentFile={qForm.img} onUpload={(url: string) => setQForm({ ...qForm, img: url })} showToast={showToast} accept="image/*" type="image" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>VİDEO</label>
                    <FileUpload currentFile={qForm.video} onUpload={(url: string) => setQForm({ ...qForm, video: url })} showToast={showToast} accept="video/*" type="video" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 600 }}>SES</label>
                    <FileUpload currentFile={qForm.audio} onUpload={(url: string) => setQForm({ ...qForm, audio: url })} showToast={showToast} accept="audio/*" type="audio" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {['a', 'b', 'c', 'd', 'e'].map(opt => (
                    <input key={opt} className="input-field" placeholder={`Seçenek ${opt.toUpperCase()}`} value={(qForm as any)[opt]} onChange={e => setQForm({ ...qForm, [opt]: e.target.value })} />
                  ))}
                </div>
                <select className="input-field" value={qForm.correct} onChange={e => setQForm({ ...qForm, correct: e.target.value })}>
                  <option value="a">A SEÇENEĞİ</option>
                  <option value="b">B SEÇENEĞİ</option>
                  <option value="c">C SEÇENEĞİ</option>
                  <option value="d">D SEÇENEĞİ</option>
                  <option value="e">E SEÇENEĞİ</option>
                </select>
                <input className="input-field" placeholder="Açıklama / Çözüm..." value={qForm.expl} onChange={e => setQForm({ ...qForm, expl: e.target.value })} />
                <button className="btn btn-primary" style={{ height: '4rem' }} onClick={saveQuestion}>
                  <Save size={24} /> {isEditingQ ? 'Soruyu Güncelle' : 'Soruyu Kaydet'}
                </button>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '3rem', marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>Mevcut Sorular</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {catQuestions.map((sq, idx) => (
                  <div key={sq.id} className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ opacity: 0.4 }}>#{idx + 1}</span>
                        <p style={{ fontWeight: 600 }}>{sq.question_text}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost" onClick={() => startEditQ(sq)}><Edit size={18} /></button>
                        <button className="btn btn-ghost" style={{ color: 'hsl(var(--accent))' }} onClick={() => deleteQ(sq.id)}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="glass-card" style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>Bir kategori seçin.</div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem('studentName'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'dash' | 'quiz' | 'res' | 'admin'>('dash');
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selCat, setSelCat] = useState<Category | null>(null);
  const [result, setResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentResults, setStudentResults] = useState<any[]>([]);

  const fetchStudents = () => {
    axios.get(`${API_BASE}/students`).then(res => setStudents(res.data));
  };

  const fetchStudentResults = (name: string) => {
    axios.get(`${API_BASE}/results?student_name=${name}`).then(res => setStudentResults(res.data));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const fetchCats = () => {
    axios.get(`${API_BASE}/categories`)
      .then(res => setCategories(res.data))
      .catch(err => {
        setApiError('API Bağlantı Hatası: ' + err.message);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchCats();
    fetchStudents();
    const storedAdmin = localStorage.getItem('isAdmin') === 'true';
    if (storedAdmin) setIsAdmin(true);
    if (user && !storedAdmin) fetchStudentResults(user);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedVal = loginVal.trim();

    if (loginRole === 'admin') {
      try {
        const res = await axios.post(`${API_BASE}/admin/login`, { username: trimmedVal, password });
        if (res.data.success) {
          setIsAdmin(true);
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminUsername', trimmedVal); // Store for later use in password change
          localStorage.setItem('adminRole', res.data.role || 'admin');
          setUser(res.data.role === 'superadmin' ? 'Süper Admin' : 'Admin Hoca');
          localStorage.setItem('studentName', res.data.role === 'superadmin' ? 'Süper Admin' : 'Admin Hoca');
          showToast(res.data.message || 'Hoş geldiniz! ⚓');
          setView('admin');
        } else {
          showToast('Hatalı admin girişi!', 'error');
        }
      } catch (err: any) {
        showToast(err.response?.data?.error || 'Hatalı admin girişi!', 'error');
      }
    } else {
      if (trimmedVal) {
        try {
          // Check student credentials via API
          const res = await axios.get(`${API_BASE}/students`);
          const student = res.data.find((s: any) => s.name.toLowerCase() === trimmedVal.toLowerCase());

          if (student && student.password === password) {
            // Access Duration Check
            if (student.expires_at) {
              const expiry = new Date(student.expires_at);
              if (expiry < new Date()) {
                return showToast('Erişim süreniz dolmuş. Lütfen hocanızla iletişime geçin.', 'error');
              }
            }

            setUser(student.name);
            localStorage.setItem('studentName', student.name);
            fetchStudentResults(student.name);
            showToast(`Hoş geldin, ${student.name}! Başarılar dileriz. 🌊`);
            setView('dash');
          } else if (student) {
            showToast('Hatalı öğrenci şifresi!', 'error');
          } else {
            showToast('Böyle bir öğrenci kaydı bulunamadı. Lütfen hocanıza danışın.', 'error');
          }
        } catch (err) {
          console.error('Login error:', err);
          showToast('Bağlantı hatası!', 'error');
        }
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('studentName');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUsername');
    setView('dash');
  };

  if (!user) {
    return (
      <div className="login-container animate-fade-in">
        <div className="glass-card login-card">
          <div className="hero-icon-container">
            <GraduationCap size={42} color="hsl(var(--primary))" />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>QUIZ OF THE SEAS</h1>
            <p style={{ opacity: 0.6, fontWeight: 500 }}>Bilgi deryasında bir yolculuğa hazır mısın?</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'hsla(var(--foreground), 0.05)', padding: '0.5rem', borderRadius: '1.25rem', marginBottom: '2.5rem' }}>
            <button className={`btn ${loginRole === 'student' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, textTransform: 'uppercase' }} onClick={() => setLoginRole('student')}>Öğrenci</button>
            <button className={`btn ${loginRole === 'admin' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, textTransform: 'uppercase' }} onClick={() => setLoginRole('admin')}>Hoca</button>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-heading">
              <label>{loginRole === 'student' ? 'Adınız Soyadınız' : 'Hoca Kullanıcı Adı'}</label>
            </div>
            <input className="input-field" placeholder={loginRole === 'student' ? 'Ahmet Yılmaz' : 'Kullanıcı adı'} value={loginVal} onChange={e => setLoginVal(e.target.value)} required />

            {(loginRole === 'admin' || loginRole === 'student') && (
              <>
                <div className="form-heading">
                  <label>Şifre</label>
                </div>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ height: '4.5rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
              {loginRole === 'admin' ? 'YÖNETİM PANELİNE GİR' : 'DERSE KATIL'}
              <ChevronRight size={22} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentCats = categories.filter((cat: any) => cat.parent_id === selectedParentId);
  const parentCat = categories.find((cat: any) => cat.id === selectedParentId);

  // Dashboard Stats
  const completedCategoryIds = new Set(studentResults.map(r => r.category_id));
  const leafCategories = categories.filter(cat => !categories.some(c => c.parent_id === cat.id));
  const progressPercent = leafCategories.length > 0 ? Math.round((completedCategoryIds.size / leafCategories.length) * 100) : 0;
  const lastFiveResults = studentResults.slice(0, 5);

  return (
    <div className="app-container">
      <Navbar
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onGoHome={() => { setView('dash'); setSelectedParentId(null); }}
        students={students}
        fetchStudents={fetchStudents}
        showToast={showToast}
      />

      <main style={{ padding: '0 1.5rem 3rem' }}>
        {view === 'dash' && (
          <div className="animate-fade-in">
            {!isAdmin && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-card" style={{ padding: '2rem', borderLeft: '6px solid hsl(var(--primary))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Activity size={22} color="hsl(var(--primary))" /> Başarı Karnesi
                    </h3>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>%{progressPercent}</span>
                  </div>
                  <div style={{ background: 'hsla(var(--foreground), 0.05)', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))', transition: 'width 1s ease' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>
                    <span>{completedCategoryIds.size} Tamamlanan Konu</span>
                    <span>{leafCategories.length - completedCategoryIds.size} Kalan</span>
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History size={18} opacity={0.6} /> Son Başarılar
                  </h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {lastFiveResults.length > 0 ? lastFiveResults.map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderBottom: '1px solid hsla(var(--foreground), 0.05)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{r.categories?.name || 'Genel Test'}</span>
                        <span style={{ fontWeight: 800, color: r.score / r.total >= 0.7 ? '#10b981' : 'hsl(var(--accent))' }}>{r.score}/{r.total}</span>
                      </div>
                    )) : (
                      <div style={{ textAlign: 'center', opacity: 0.4, padding: '1rem' }}>Henüz test çözülmemiş.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  {selectedParentId && (
                    <button className="btn btn-ghost" style={{ padding: '0.5rem', width: 'auto' }} onClick={() => setSelectedParentId(parentCat?.parent_id || null)}>
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                    {selectedParentId ? parentCat?.name : 'Ders Kategorileri'}
                  </h2>
                </div>
                <p style={{ opacity: 0.6 }}>Test etmek istediğin konuyu seç ve başla.</p>
              </div>
              {isAdmin && (
                <button className="btn btn-primary" onClick={() => setView('admin')}>
                  <Monitor size={20} />
                  Hoca Paneli
                </button>
              )}
            </div>

            <div className="category-grid">
              {currentCats.map((cat: any) => {
                const hasSubs = categories.some((c: any) => c.parent_id === cat.id);
                return (
                  <div key={cat.id} className="category-card" onClick={() => {
                    if (hasSubs) {
                      setSelectedParentId(cat.id);
                    } else {
                      setSelCat(cat);
                      setView('quiz');
                    }
                  }}>
                    <div className="category-icon shadow-lg">
                      <BookOpen size={28} color="white" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{cat.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '0.9rem' }}>
                      {hasSubs ? 'ALT KATEGORİLER' : 'ŞİMDİ BAŞLA'}
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
              {currentCats.length === 0 && !apiError && (
                <div className="glass-card" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center', opacity: 0.5 }}>
                  Bu kategoride henüz içerik bulunmuyor.
                </div>
              )}
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
          <ResultsView {...result} onBack={() => {
            setView('dash');
            if (user && !isAdmin) fetchStudentResults(user);
          }} />
        )}

        {isAdmin && view === 'admin' && (
          <AdminPanel categories={categories} fetchCategories={fetchCats} showToast={showToast} />
        )}
      </main>
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={24} color="hsl(var(--primary))" /> : <XCircle size={24} color="hsl(var(--accent))" />}
            <span style={{ fontWeight: 600 }}>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
