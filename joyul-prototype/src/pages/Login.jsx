import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, LogIn, ShieldCheck, UserPlus, WifiOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [role, setRole] = useState('member');
  const [notice, setNotice] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      if (!studentId || !password || !name || !contact) return;
      setNotice('회원가입 정보가 저장되었습니다. 이제 로그인할 수 있습니다.');
      setMode('login');
      return;
    }

    if (studentId && password) {
      navigate('/home');
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setNotice('');
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem',
      animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '78px',
          height: '78px',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 12px 28px rgba(20, 184, 166, 0.28)'
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>J</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, var(--primary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Jo:YUl
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>모임 생성부터 일정, 산출물, 이벤트까지 한 번에 조율</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="segmented" aria-label="로그인 회원가입 전환">
          <button type="button" className={!isRegister ? 'active' : ''} onClick={() => switchMode('login')}>
            로그인
          </button>
          <button type="button" className={isRegister ? 'active' : ''} onClick={() => switchMode('register')}>
            회원가입
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p className="eyebrow">{isRegister ? 'Register member' : 'Authorized access'}</p>
            <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem', fontWeight: 700 }}>
              {isRegister ? '학번으로 계정 만들기' : '학번으로 시작하기'}
            </h2>
          </div>
          <ShieldCheck size={28} color="var(--primary-light)" />
        </div>

        {notice && (
          <div style={{ border: '1px solid rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', color: '#bbf7d0' }}>
            {notice}
          </div>
        )}

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="이름"
              className="input-glass"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="연락처"
              className="input-glass"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </>
        )}

        <input
          type="text"
          placeholder="학번 (ID)"
          className="input-glass"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="input-glass"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isRegister && (
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)} aria-label="사용자 권한">
            <option value="member">회원</option>
            <option value="admin">관리자</option>
          </select>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.45 }}>
          <WifiOff size={16} color="var(--warning)" />
          <span>프로토타입에서는 인터넷 연결 오류와 DB 대조 과정을 내부 안내로 시뮬레이션합니다.</span>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {isRegister ? <UserPlus size={20} /> : <Fingerprint size={20} />}
          <span>{isRegister ? '회원가입 완료' : '로그인'}</span>
        </button>

        {!isRegister && (
          <button
            type="button"
            onClick={() => switchMode('register')}
            style={{ background: 'transparent', border: 0, color: 'var(--primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.25rem' }}
          >
            <LogIn size={16} />
            <span>신규 멤버 등록하기</span>
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;
