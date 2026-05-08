import { Fragment, useMemo, useState } from 'react';
import { CheckCircle2, Info, RotateCcw, Sparkles, Users } from 'lucide-react';

const days = ['월', '화', '수', '목', '금'];
const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const presetUnavailable = {
  김철수: ['0-0', '0-1', '1-5', '2-6', '4-8'],
  이영희: ['0-3', '1-4', '2-6', '3-7', '4-8'],
  박민수: ['0-7', '1-2', '2-3', '3-4', '4-5'],
};

const Schedule = () => {
  const [selectedCells, setSelectedCells] = useState(new Set(['0-2', '2-4', '4-7']));
  const [isRecommended, setIsRecommended] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState(null);

  const scheduleMap = useMemo(() => ({
    홍주은: [...selectedCells],
    ...presetUnavailable,
  }), [selectedCells]);

  const rankedSlots = useMemo(() => {
    const entries = [];

    days.forEach((day, dayIndex) => {
      times.forEach((time, timeIndex) => {
        const key = `${dayIndex}-${timeIndex}`;
        const unavailableMembers = Object.entries(scheduleMap)
          .filter(([, cells]) => cells.includes(key))
          .map(([name]) => name);

        entries.push({
          key,
          day,
          time,
          unavailableMembers,
          availableCount: Object.keys(scheduleMap).length - unavailableMembers.length,
        });
      });
    });

    return entries.sort((a, b) => b.availableCount - a.availableCount || a.key.localeCompare(b.key));
  }, [scheduleMap]);

  const topSlots = rankedSlots.slice(0, 3);
  const hasAllAvailable = topSlots.some((slot) => slot.unavailableMembers.length === 0);

  const toggleCell = (dayIndex, timeIndex) => {
    if (isRecommended) return;
    const key = `${dayIndex}-${timeIndex}`;
    const next = new Set(selectedCells);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    setSelectedCells(next);
    setConfirmedSlot(null);
  };

  const recommendTime = () => {
    setIsRecommended(true);
    setConfirmedSlot(null);
  };

  const resetSchedule = () => {
    setIsRecommended(false);
    setConfirmedSlot(null);
  };

  const confirmTopSlot = () => {
    setConfirmedSlot(topSlots[0]);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">일정 조율</h1>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Info size={20} color="var(--primary-light)" style={{ flex: '0 0 auto', marginTop: '0.1rem' }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {isRecommended
            ? '조원들의 불가 시간을 교차 분석했습니다. 초록색은 전원 참석 가능 시간이며, 전원 가능 시간이 없으면 최다 인원 참석 시간이 차선으로 표시됩니다.'
            : '본인이 참석 불가능한 시간대를 터치해 블록 처리해 주세요. 저장된 조원 일정과 합쳐 추천 시간이 계산됩니다.'}
        </p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.85rem' }}>
          <div>
            <p className="eyebrow">Input schedule</p>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.15rem' }}>캡스톤 디자인 3조</h2>
          </div>
          <span className="status-pill" style={{ color: 'var(--primary-light)' }}>
            <Users size={14} />
            4/4 입력
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.55rem' }}>
          {Object.keys(scheduleMap).map((member) => (
            <div key={member} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.65rem', minHeight: '72px' }}>
              <CheckCircle2 size={17} color="var(--success)" />
              <div style={{ fontWeight: 700, fontSize: '0.82rem', marginTop: '0.35rem' }}>{member}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.15rem' }}>{scheduleMap[member].length}개 블록</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <div style={{ minWidth: '390px', display: 'grid', gridTemplateColumns: '46px repeat(5, minmax(58px, 1fr))', gap: '4px' }}>
          <div />
          {days.map((day) => (
            <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingBottom: '0.5rem', fontWeight: 700 }}>
              {day}
            </div>
          ))}

          {times.map((time, timeIndex) => (
            <Fragment key={time}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {time}
              </div>
              {days.map((day, dayIndex) => {
                const key = `${dayIndex}-${timeIndex}`;
                const isSelected = selectedCells.has(key);
                const candidate = topSlots.find((slot) => slot.key === key);
                const isTopCandidate = isRecommended && Boolean(candidate);
                const isPerfect = isTopCandidate && candidate.unavailableMembers.length === 0;
                const hasConflict = isRecommended && rankedSlots.find((slot) => slot.key === key)?.unavailableMembers.length > 0;

                let background = 'rgba(255, 255, 255, 0.05)';
                let border = '1px solid rgba(255,255,255,0.06)';
                let color = 'transparent';

                if (isSelected) {
                  background = 'rgba(251, 113, 133, 0.38)';
                  border = '1px solid rgba(251, 113, 133, 0.55)';
                }

                if (hasConflict && !isSelected) {
                  background = 'rgba(245, 158, 11, 0.08)';
                }

                if (isTopCandidate) {
                  background = isPerfect ? 'rgba(20, 184, 166, 0.85)' : 'rgba(245, 158, 11, 0.85)';
                  border = '1px solid rgba(255,255,255,0.35)';
                  color = '#fff';
                }

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCell(dayIndex, timeIndex)}
                    aria-label={`${day}요일 ${time}`}
                    style={{
                      alignItems: 'center',
                      background,
                      border,
                      borderRadius: '6px',
                      color,
                      cursor: isRecommended ? 'default' : 'pointer',
                      display: 'flex',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      height: '42px',
                      justifyContent: 'center',
                      minWidth: 0,
                      transition: 'all 0.2s ease',
                      boxShadow: isTopCandidate ? '0 0 16px rgba(20, 184, 166, 0.25)' : 'none',
                    }}
                  >
                    {isTopCandidate ? `${candidate.availableCount}명` : ' '}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        <span className="status-pill" style={{ color: '#fecdd3', background: 'rgba(251, 113, 133, 0.1)' }}>내 불가 시간</span>
        <span className="status-pill" style={{ color: 'var(--primary-light)', background: 'rgba(20, 184, 166, 0.1)' }}>전원 가능 추천</span>
        <span className="status-pill" style={{ color: '#fde68a', background: 'rgba(245, 158, 11, 0.1)' }}>차선 후보</span>
      </div>

      {isRecommended && (
        <div className="glass-panel" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <p className="eyebrow">{hasAllAvailable ? 'Recommended slots' : 'Alternative slots'}</p>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.2rem 0 0.85rem' }}>
            {hasAllAvailable ? '전원 참석 가능한 시간' : '전원 가능 시간이 없어 최다 인원 시간을 추천'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topSlots.map((slot, index) => (
              <div key={slot.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: index === 0 ? 'rgba(20, 184, 166, 0.12)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{slot.day}요일 {slot.time}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {slot.unavailableMembers.length === 0
                      ? '불가 인원 없음'
                      : `불가 인원: ${slot.unavailableMembers.join(', ')}`}
                  </div>
                </div>
                <span className="status-pill" style={{ color: slot.unavailableMembers.length === 0 ? 'var(--primary-light)' : '#fde68a' }}>
                  {slot.availableCount}명 가능
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmedSlot && (
        <div style={{ border: '1px solid rgba(34, 197, 94, 0.35)', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', padding: '0.9rem', marginBottom: '1rem', color: '#bbf7d0', fontSize: '0.875rem', lineHeight: 1.5 }}>
          최종 회의 시간이 {confirmedSlot.day}요일 {confirmedSlot.time}로 확정되어 조원들에게 내부 알림이 발송되었습니다.
        </div>
      )}

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: isRecommended ? '1fr 1fr' : '1fr' }}>
        <button
          className="btn-primary"
          onClick={isRecommended ? confirmTopSlot : recommendTime}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Sparkles size={20} />
          <span>{isRecommended ? '관리자 일정 확정' : '최적 시간 추천받기'}</span>
        </button>
        {isRecommended && (
          <button
            type="button"
            onClick={resetSchedule}
            style={{ border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: 700 }}
          >
            <RotateCcw size={18} />
            다시 입력
          </button>
        )}
      </div>
    </div>
  );
};

export default Schedule;
