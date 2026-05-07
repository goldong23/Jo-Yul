import React, { useState } from 'react';
import { CalendarHeart, Users, Check, X } from 'lucide-react';

const Event = () => {
  const [voted, setVoted] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const handleVote = () => {
    setVoted(true);
    setTimeout(() => {
      setShowWorkspace(true);
    }, 1000);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">이벤트 및 소통</h1>

      {!showWorkspace ? (
        <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--secondary)', padding: '0.5rem', borderRadius: '12px' }}>
              <CalendarHeart size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.25rem' }}>D-3 투표 마감</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>종강 기념 친목 도모 회식</h2>
            </div>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            한 학기 동안 고생 많으셨습니다! 가벼운 마음으로 저녁 식사를 하며 회포를 푸는 자리를 마련하고자 합니다. 참석 여부를 투표해 주세요. (참여자에 한해 세부 공지방이 생성됩니다.)
          </p>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleVote}
              disabled={voted}
              style={{ 
                flex: 1, padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: voted ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                border: voted ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: 'white', cursor: voted ? 'default' : 'pointer', transition: 'all 0.3s'
              }}
            >
              <Check size={20} />
              <span>참여할게요</span>
            </button>
            <button 
              disabled={voted}
              style={{ 
                flex: 1, padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)', cursor: voted ? 'default' : 'pointer', opacity: voted ? 0.5 : 1
              }}
            >
              <X size={20} />
              <span>어려워요</span>
            </button>
          </div>

          {voted && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--primary-light)', fontSize: '0.875rem', animation: 'fadeIn 0.5s ease' }}>
              투표가 완료되었습니다! 워크스페이스를 생성 중입니다...
            </div>
          )}
        </div>
      ) : (
        <div style={{ animation: 'slideUp 0.5s ease' }}>
          <div className="glass-panel" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 27, 75, 0.5) 100%)', border: '1px solid var(--primary-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%' }} />
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>종강 회식 참여자 전용 그룹</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Users size={14} />
                <span>12명</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>시스템 알림</div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', borderTopLeftRadius: 0, fontSize: '0.875rem' }}>
                  투표 '참여' 인원들로 구성된 전용 워크스페이스가 생성되었습니다. 이제부터 불필요한 전체 알림 없이 이곳에서 소통할 수 있습니다!
                </div>
              </div>

              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>관리자 (팀장)</div>
                <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px', borderTopLeftRadius: 0, fontSize: '0.875rem' }}>
                  장소는 학교 앞 고깃집으로 예약했습니다. 금요일 18:00까지 모여주세요~
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <input type="text" className="input-glass" placeholder="메시지 입력..." style={{ flex: 1, padding: '0.75rem' }} />
              <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>전송</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;
