import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';

const Schedule = () => {
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isRecommended, setIsRecommended] = useState(false);

  const days = ['월', '화', '수', '목', '금'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const toggleCell = (dayIndex, timeIndex) => {
    if (isRecommended) return;
    const key = `${dayIndex}-${timeIndex}`;
    const newSet = new Set(selectedCells);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedCells(newSet);
  };

  const recommendTime = () => {
    setIsRecommended(true);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">일정 조율</h1>
      
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <Info size={20} color="var(--primary-light)" />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          {isRecommended ? 
            <span>시스템이 조원들의 일정을 분석하여 <b>전원 참석 가능한 최적의 시간</b>을 하이라이트 했습니다.</span> : 
            <span>본인이 참석 <b>불가능한 시간</b>을 터치하여 블록 처리해 주세요.</span>
          }
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(5, 1fr)', gap: '4px' }}>
          <div /> {/* Empty top-left */}
          {days.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingBottom: '0.5rem' }}>
              {day}
            </div>
          ))}
          
          {times.map((time, tIndex) => (
            <React.Fragment key={time}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {time.split(':')[0]}
              </div>
              {days.map((day, dIndex) => {
                const isSelected = selectedCells.has(`${dIndex}-${tIndex}`);
                // Mock recommendation: Tuesday 14:00 and Wednesday 16:00
                const isHighlight = isRecommended && ((dIndex === 1 && tIndex === 5) || (dIndex === 2 && tIndex === 7));
                
                return (
                  <div 
                    key={`${dIndex}-${tIndex}`}
                    onClick={() => toggleCell(dIndex, tIndex)}
                    style={{
                      height: '40px',
                      background: isHighlight ? 'var(--primary)' : (isSelected ? 'rgba(244, 63, 94, 0.5)' : 'rgba(255, 255, 255, 0.05)'),
                      border: isHighlight ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isHighlight ? '0 0 15px var(--primary)' : 'none',
                      animation: isHighlight ? 'popIn 0.5s ease' : 'none'
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={isRecommended ? () => setIsRecommended(false) : recommendTime}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: isRecommended ? 'rgba(255,255,255,0.1)' : '' }}
      >
        <Sparkles size={20} />
        <span>{isRecommended ? '내 불가 시간 다시 설정하기' : '최적의 시간 추천받기'}</span>
      </button>
    </div>
  );
};

export default Schedule;
