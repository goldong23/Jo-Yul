import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CalendarClock, CheckCircle2, ChevronRight, ClipboardList, MessageCircle, Plus, Search, UserPlus, Users, X } from 'lucide-react';

const initialTeams = [
  { id: 1, name: '캡스톤 디자인 3조', description: '요구사항 분석 및 UI 프로토타입', members: ['홍주은', '김철수', '이영희', '박민수'], nextMeeting: '오늘 19:00', progress: 75, needsSchedule: false },
  { id: 2, name: '알고리즘 스터디', description: '주차별 문제 풀이 인증', members: ['홍주은', '최서연', '정도윤', '한유진', '오지훈', '문하늘'], nextMeeting: '금요일 20:00', progress: 40, needsSchedule: false },
  { id: 3, name: '모바일 프로그래밍', description: '기말 앱 프로젝트', members: ['홍주은', '강지민', '윤태호'], nextMeeting: '미정', progress: 10, needsSchedule: true },
];

const memberPool = ['김철수', '이영희', '박민수', '최서연', '정도윤', '한유진', '오지훈', '문하늘'];

const Home = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(initialTeams);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamDraft, setTeamDraft] = useState({ name: '', description: '' });
  const [selectedMembers, setSelectedMembers] = useState(['김철수', '이영희']);

  const toggleMember = (member) => {
    setSelectedMembers((current) => (
      current.includes(member)
        ? current.filter((item) => item !== member)
        : [...current, member]
    ));
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!teamDraft.name || selectedMembers.length === 0) return;

    setTeams((current) => [
      {
        id: Math.max(...current.map((team) => team.id)) + 1,
        name: teamDraft.name,
        description: teamDraft.description || '새로 생성된 프로젝트 조',
        members: ['홍주은', ...selectedMembers],
        nextMeeting: '일정 조율 필요',
        progress: 0,
        needsSchedule: true,
      },
      ...current,
    ]);
    setTeamDraft({ name: '', description: '' });
    setSelectedMembers(['김철수', '이영희']);
    setShowTeamForm(false);
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>환영합니다</h2>
          <h1 className="page-title" style={{ marginBottom: 0 }}>홍주은 님</h1>
        </div>
        <button className="icon-button" aria-label="내부 알림 확인" style={{ position: 'relative' }}>
          <BellRing size={23} color="var(--primary-light)" />
          <span className="notification-dot">3</span>
        </button>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1.25rem', border: '1px solid rgba(20, 184, 166, 0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.18)', padding: '0.55rem', borderRadius: '8px' }}>
              <MessageCircle size={22} color="var(--primary-light)" />
            </div>
            <div>
              <p className="eyebrow">System notification</p>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.15rem' }}>종강 파티 참석 여부 조사</h3>
            </div>
          </div>
          <span className="status-pill" style={{ color: 'var(--accent)', borderColor: 'rgba(251, 113, 133, 0.35)' }}>미투표</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          이벤트 투표가 열렸습니다. 투표 마감 후 참여자만 볼 수 있는 전용 워크스페이스가 자동 생성됩니다.
        </p>
        <button className="btn-primary" onClick={() => navigate('/event')} style={{ padding: '0.8rem', fontSize: '0.9rem' }}>
          투표하러 가기
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <QuickAction icon={<CalendarClock size={20} />} label="일정 추천" detail="전원 가능 시간" onClick={() => navigate('/schedule')} />
        <QuickAction icon={<ClipboardList size={20} />} label="미션 관리" detail="승인 대기 1건" onClick={() => navigate('/task')} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>내 팀 목록</h2>
        <button
          type="button"
          onClick={() => setShowTeamForm(true)}
          style={{ background: 'transparent', border: 0, color: 'var(--primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}
        >
          <Plus size={17} />
          <span>팀 생성</span>
        </button>
      </div>

      {showTeamForm && (
        <div className="glass-panel" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow">Create team</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>프로젝트 조 생성 및 초대</h3>
            </div>
            <button className="icon-button" type="button" onClick={() => setShowTeamForm(false)} aria-label="팀 생성 닫기">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <input
              className="form-input"
              value={teamDraft.name}
              onChange={(e) => setTeamDraft({ ...teamDraft, name: e.target.value })}
              placeholder="조 이름"
              required
            />
            <textarea
              className="form-textarea"
              value={teamDraft.description}
              onChange={(e) => setTeamDraft({ ...teamDraft, description: e.target.value })}
              placeholder="조 설명"
            />
            <div style={{ background: 'rgba(0, 0, 0, 0.18)', borderRadius: '8px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                <Search size={15} />
                <span>등록된 회원 검색 및 초대</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {memberPool.map((member) => {
                  const selected = selectedMembers.includes(member);
                  return (
                    <button
                      key={member}
                      type="button"
                      onClick={() => toggleMember(member)}
                      className="status-pill"
                      style={{
                        background: selected ? 'rgba(20, 184, 166, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                        color: selected ? 'var(--primary-light)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {selected ? <CheckCircle2 size={14} /> : <UserPlus size={14} />}
                      {member}
                    </button>
                  );
                })}
              </div>
            </div>
            <button className="btn-primary" type="submit" style={{ padding: '0.85rem' }}>팀 생성 및 초대 알림 보내기</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} onSchedule={() => navigate('/schedule')} />
        ))}
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, detail, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="glass-card"
    style={{ color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '104px' }}
  >
    <div style={{ color: 'var(--primary-light)' }}>{icon}</div>
    <div style={{ fontWeight: 700 }}>{label}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{detail}</div>
  </button>
);

const TeamCard = ({ team, onSchedule }) => (
  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.3rem' }}>{team.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45, marginBottom: '0.6rem' }}>{team.description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={15} />
            {team.members.length}명
          </span>
          <span style={{ color: team.needsSchedule ? 'var(--accent)' : 'var(--primary-light)' }}>{team.nextMeeting}</span>
        </div>
      </div>
      <ChevronRight size={20} color="var(--text-muted)" />
    </div>

    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>프로젝트 진척도</span>
        <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>{team.progress}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${team.progress}%` }} />
      </div>
    </div>

    {team.needsSchedule && (
      <button
        type="button"
        onClick={onSchedule}
        style={{ border: '1px dashed rgba(251, 113, 133, 0.45)', background: 'rgba(251, 113, 133, 0.08)', borderRadius: '8px', color: '#fecdd3', cursor: 'pointer', padding: '0.75rem', fontWeight: 700 }}
      >
        정기 모임 시간 조율하기
      </button>
    )}
  </div>
);

export default Home;
