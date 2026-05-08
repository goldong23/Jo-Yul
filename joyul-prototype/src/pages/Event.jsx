import { useMemo, useState } from 'react';
import { BellRing, CalendarHeart, Check, ClipboardList, Megaphone, MessageCircle, Plus, Send, UserCheck, Users, X } from 'lucide-react';

const initialEvent = {
  title: '종강 기념 친목 도모 회식',
  description: '한 학기 동안 고생한 팀원들과 저녁 식사를 하며 회고와 다음 프로젝트 아이디어를 나눕니다.',
  deadline: '2026-05-17 18:00',
  place: '학교 앞 고깃집',
};

const baseVotes = {
  김철수: 'join',
  이영희: 'join',
  박민수: null,
  최서연: 'decline',
};

const channelConfig = {
  command: { label: '지시', icon: ClipboardList, helper: '역할, 시간, 장소처럼 실행해야 할 내용을 모읍니다.' },
  notice: { label: '공지방', icon: Megaphone, helper: '확정된 공지만 정리해 불필요한 대화를 줄입니다.' },
  chat: { label: '대화방', icon: MessageCircle, helper: '참여자끼리 자유롭게 세부 내용을 조율합니다.' },
  anonymous: { label: '익명방', icon: Users, helper: '이름 없이 의견을 남겨 부담을 낮춥니다.' },
};

const initialMessages = {
  command: [
    { sender: '관리자', text: '금요일 18:00까지 정문 앞에서 모여주세요.' },
    { sender: '관리자', text: '예약자명은 홍주은입니다.' },
  ],
  notice: [
    { sender: '시스템 알림', text: '참여자 전용 워크스페이스가 생성되었습니다.' },
    { sender: '관리자', text: '최종 장소와 시간 공지는 이 채널에만 게시됩니다.' },
  ],
  chat: [
    { sender: '김철수', text: '저는 10분 정도 늦을 수도 있어요.' },
    { sender: '홍주은', text: '도착 시간 공유해 주면 자리 먼저 잡아둘게요.' },
  ],
  anonymous: [
    { sender: '익명', text: '회비 안내도 공지방에 같이 올려주면 좋겠습니다.' },
  ],
};

const Event = () => {
  const [eventInfo, setEventInfo] = useState(initialEvent);
  const [eventDraft, setEventDraft] = useState(initialEvent);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(true);
  const [vote, setVote] = useState(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [activeChannel, setActiveChannel] = useState('command');
  const [messages, setMessages] = useState(initialMessages);
  const [messageDraft, setMessageDraft] = useState('');

  const voteStats = useMemo(() => {
    const votes = { 홍주은: vote, ...baseVotes };
    const entries = Object.entries(votes);
    const join = entries.filter(([, value]) => value === 'join').map(([name]) => name);
    const decline = entries.filter(([, value]) => value === 'decline').map(([name]) => name);
    const pending = entries.filter(([, value]) => value === null).map(([name]) => name);

    return { entries, join, decline, pending };
  }, [vote]);

  const canSeeWorkspace = isFinalized && vote === 'join';

  const submitEvent = (e) => {
    e.preventDefault();
    setEventInfo(eventDraft);
    setVote(null);
    setIsFinalized(false);
    setReminderSent(false);
    setShowVoteModal(true);
    setShowEventForm(false);
  };

  const handleVote = (choice) => {
    setVote(choice);
    setShowVoteModal(false);
    setReminderSent(false);
  };

  const finalizeEvent = () => {
    setIsFinalized(true);
    setShowVoteModal(false);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageDraft.trim()) return;

    setMessages((current) => ({
      ...current,
      [activeChannel]: [
        ...current[activeChannel],
        {
          sender: activeChannel === 'anonymous' ? '익명' : '홍주은',
          text: messageDraft.trim(),
        },
      ],
    }));
    setMessageDraft('');
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <p className="eyebrow">Event voting</p>
          <h1 className="page-title" style={{ marginBottom: 0 }}>이벤트 조율</h1>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowEventForm(true)}
          style={{ width: 'auto', padding: '0.65rem 0.85rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          등록
        </button>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1rem', border: vote ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(251,113,133,0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.18)', padding: '0.55rem', borderRadius: '8px' }}>
              <CalendarHeart size={24} color="var(--secondary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800, marginBottom: '0.25rem' }}>{eventInfo.deadline} 마감</p>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{eventInfo.title}</h2>
            </div>
          </div>
          {!vote && <span className="status-pill" style={{ color: 'var(--accent)' }}>미투표</span>}
          {vote === 'join' && <span className="status-pill" style={{ color: 'var(--primary-light)' }}>참여</span>}
          {vote === 'decline' && <span className="status-pill" style={{ color: 'var(--text-muted)' }}>불참</span>}
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
          {eventInfo.description} 참여 투표가 마감되면 참여자만 포함된 팀 워크스페이스가 자동 생성됩니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => handleVote('join')}
            style={{
              padding: '0.85rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: vote === 'join' ? 'rgba(20,184,166,0.24)' : 'rgba(255,255,255,0.06)',
              border: vote === 'join' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
              color: vote === 'join' ? 'var(--primary-light)' : 'white',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            <Check size={18} />
            참여
          </button>
          <button
            type="button"
            onClick={() => handleVote('decline')}
            style={{
              padding: '0.85rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: vote === 'decline' ? 'rgba(148,163,184,0.16)' : 'rgba(255,255,255,0.06)',
              border: '1px solid var(--glass-border)',
              color: vote === 'decline' ? 'var(--text-main)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            <X size={18} />
            불참
          </button>
        </div>
      </div>

      {showEventForm && (
        <div className="glass-panel" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow">Administrator</p>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>새 이벤트 등록</h2>
            </div>
            <button type="button" className="icon-button" onClick={() => setShowEventForm(false)} aria-label="이벤트 등록 닫기">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={submitEvent} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <input className="form-input" value={eventDraft.title} onChange={(e) => setEventDraft({ ...eventDraft, title: e.target.value })} placeholder="이벤트 제목" required />
            <textarea className="form-textarea" value={eventDraft.description} onChange={(e) => setEventDraft({ ...eventDraft, description: e.target.value })} placeholder="이벤트 설명" required />
            <div className="form-grid">
              <input className="form-input" value={eventDraft.place} onChange={(e) => setEventDraft({ ...eventDraft, place: e.target.value })} placeholder="장소" required />
              <input className="form-input" value={eventDraft.deadline} onChange={(e) => setEventDraft({ ...eventDraft, deadline: e.target.value })} placeholder="마감 시간" required />
            </div>
            <button className="btn-primary" type="submit" style={{ padding: '0.85rem' }}>등록하고 전체 알림 보내기</button>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p className="eyebrow">Vote status</p>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>참여 통계</h2>
          </div>
          <span className="status-pill" style={{ color: voteStats.pending.length ? 'var(--accent)' : 'var(--primary-light)' }}>
            {voteStats.pending.length ? `미투표 ${voteStats.pending.length}` : '투표 완료'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem', marginBottom: '1rem' }}>
          <StatCard label="참여" value={voteStats.join.length} color="var(--primary-light)" />
          <StatCard label="불참" value={voteStats.decline.length} color="var(--text-muted)" />
          <StatCard label="미투표" value={voteStats.pending.length} color="var(--accent)" />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
          {voteStats.entries.map(([name, value]) => (
            <span key={name} className="status-pill" style={{ color: value === 'join' ? 'var(--primary-light)' : value === 'decline' ? 'var(--text-muted)' : 'var(--accent)' }}>
              {name} {value === 'join' ? '참여' : value === 'decline' ? '불참' : '미투표'}
            </span>
          ))}
        </div>

        {reminderSent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251,113,133,0.1)', borderRadius: '8px', color: '#fecdd3', padding: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
            <BellRing size={17} />
            <span>{voteStats.pending.join(', ')}님에게 투표 독려 알림을 보냈습니다.</span>
          </div>
        )}

        <div className="form-grid">
          <button
            type="button"
            onClick={() => setReminderSent(true)}
            disabled={voteStats.pending.length === 0}
            style={{ border: '1px solid rgba(251,113,133,0.35)', background: 'rgba(251,113,133,0.1)', borderRadius: '8px', color: voteStats.pending.length ? '#fecdd3' : 'var(--text-muted)', cursor: voteStats.pending.length ? 'pointer' : 'default', fontWeight: 800, padding: '0.75rem' }}
          >
            미투표 알림
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={finalizeEvent}
            style={{ padding: '0.75rem' }}
          >
            투표 마감
          </button>
        </div>
      </div>

      {isFinalized && !canSeeWorkspace && (
        <div style={{ border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(148,163,184,0.08)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          이벤트가 확정되었습니다. 현재 계정은 참여자로 선택되지 않아 전용 워크스페이스 알림을 받지 않습니다.
        </div>
      )}

      {canSeeWorkspace && (
        <Workspace
          eventInfo={eventInfo}
          participants={voteStats.join}
          activeChannel={activeChannel}
          setActiveChannel={setActiveChannel}
          messages={messages}
          messageDraft={messageDraft}
          setMessageDraft={setMessageDraft}
          sendMessage={sendMessage}
        />
      )}

      {showVoteModal && !isFinalized && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="event-vote-title">
          <div className="modal-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p className="eyebrow">Vote popup</p>
                <h2 id="event-vote-title" style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>{eventInfo.title}</h2>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowVoteModal(false)} aria-label="투표 팝업 닫기">
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              투표하지 않은 회원에게는 알림 배지가 유지됩니다. 참여를 선택하면 마감 후 자동 생성되는 워크스페이스에 포함됩니다.
            </p>
            <div className="form-grid">
              <button className="btn-primary" type="button" onClick={() => handleVote('join')} style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <UserCheck size={18} />
                참여
              </button>
              <button type="button" onClick={() => handleVote('decline')} style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 800, padding: '0.85rem' }}>
                불참
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', textAlign: 'center' }}>
    <div style={{ color, fontSize: '1.25rem', fontWeight: 900 }}>{value}</div>
    <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>{label}</div>
  </div>
);

const Workspace = ({ eventInfo, participants, activeChannel, setActiveChannel, messages, messageDraft, setMessageDraft, sendMessage }) => {
  const ActiveIcon = channelConfig[activeChannel].icon;

  return (
    <div style={{ animation: 'slideUp 0.5s ease' }}>
      <div className="glass-panel" style={{ border: '1px solid rgba(20,184,166,0.38)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p className="eyebrow">Team workspace</p>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>{eventInfo.title} 전용</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>참여자에게만 알림이 전송됩니다.</p>
          </div>
          <span className="status-pill" style={{ color: 'var(--primary-light)' }}>
            <Users size={14} />
            {participants.length}명
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {Object.entries(channelConfig).map(([key, channel]) => {
            const Icon = channel.icon;
            const active = key === activeChannel;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveChannel(key)}
                className="status-pill"
                style={{
                  background: active ? 'rgba(20,184,166,0.18)' : 'rgba(255,255,255,0.04)',
                  borderColor: active ? 'rgba(20,184,166,0.45)' : 'var(--glass-border)',
                  color: active ? 'var(--primary-light)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <Icon size={14} />
                {channel.label}
              </button>
            );
          })}
        </div>

        <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: '8px', padding: '0.85rem', minHeight: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: 'var(--primary-light)', fontWeight: 800 }}>
            <ActiveIcon size={18} />
            <span>{channelConfig[activeChannel].label}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.45, marginBottom: '0.9rem' }}>{channelConfig[activeChannel].helper}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages[activeChannel].map((message, index) => (
              <div key={`${message.sender}-${index}`} style={{ alignSelf: message.sender === '홍주은' ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.22rem' }}>{message.sender}</div>
                <div style={{ background: message.sender === '홍주은' ? 'rgba(20,184,166,0.28)' : 'rgba(255,255,255,0.09)', padding: '0.7rem', borderRadius: '8px', fontSize: '0.86rem', lineHeight: 1.45 }}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input
            type="text"
            className="input-glass"
            placeholder={`${channelConfig[activeChannel].label} 메시지 입력`}
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            style={{ flex: 1, padding: '0.75rem' }}
          />
          <button className="btn-primary" type="submit" aria-label="메시지 전송" style={{ width: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Event;
