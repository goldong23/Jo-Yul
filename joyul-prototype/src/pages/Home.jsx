import React from 'react';
import { BellRing, Users, ChevronRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>환영합니다,</h2>
          <h1 className="page-title" style={{ marginBottom: 0 }}>홍주은 님 👋</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            padding: '0.75rem', 
            borderRadius: '50%',
            cursor: 'pointer'
          }}>
            <BellRing size={24} color="var(--primary-light)" />
          </div>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '10px',
            height: '10px',
            background: 'var(--accent)',
            borderRadius: '50%',
            border: '2px solid var(--bg-dark)'
          }} />
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '12px' }}>
            <BellRing size={20} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>새로운 이벤트 투표</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>종강 파티 참석 여부 조사</p>
          </div>
        </div>
        <button className="btn-primary" style={{ padding: '0.75rem', fontSize: '0.875rem' }}>투표하러 가기</button>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>내 팀 목록</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--primary-light)', cursor: 'pointer' }}>+ 팀 생성</span>
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <TeamCard 
          name="캡스톤 디자인 3조" 
          members={4} 
          nextMeeting="오늘 19:00"
          progress={75}
        />
        <TeamCard 
          name="알고리즘 스터디" 
          members={6} 
          nextMeeting="금요일 20:00"
          progress={40}
        />
        <TeamCard 
          name="모바일 프로그래밍" 
          members={3} 
          nextMeeting="미정 (일정 조율 중)"
          progress={10}
          needsSchedule={true}
        />
      </div>
    </div>
  );
};

const TeamCard = ({ name, members, nextMeeting, progress, needsSchedule }) => (
  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <Users size={16} />
          <span>{members}명 참여중</span>
        </div>
      </div>
      <ChevronRight size={20} color="var(--text-muted)" />
    </div>
    
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ color: needsSchedule ? 'var(--accent)' : 'var(--text-main)' }}>{nextMeeting}</span>
        <span style={{ color: 'var(--primary-light)' }}>진척도 {progress}%</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '3px' }} />
      </div>
    </div>
  </div>
);

export default Home;
