import React, { useState } from 'react';
import { CheckCircle2, Upload, FileText, User } from 'lucide-react';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'DB 스키마 설계서 작성', assignee: '홍주은', status: 'completed', file: 'schema_v1.pdf' },
    { id: 2, title: '로그인/회원가입 API 구현', assignee: '김철수', status: 'in-progress', file: null },
    { id: 3, title: 'UI 프로토타입 시연 영상', assignee: '이영희', status: 'pending', file: null },
  ]);

  const progress = Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100);

  const handleUpload = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed', file: 'uploaded_file.zip' } : t));
  };

  return (
    <div className="page-container">
      <h1 className="page-title">과제 (산출물) 관리</h1>

      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>캡스톤 디자인 3조 진행 상황</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>총 진척도</span>
          <span style={{ color: 'var(--primary-light)', fontWeight: 'bold' }}>{progress}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map(task => (
          <div key={task.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: task.status === 'completed' ? '4px solid var(--primary-light)' : '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem', color: task.status === 'completed' ? 'var(--text-main)' : 'var(--text-main)' }}>
                  {task.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <User size={14} />
                  <span>담당자: {task.assignee}</span>
                </div>
              </div>
              {task.status === 'completed' ? (
                <CheckCircle2 size={24} color="var(--primary-light)" />
              ) : (
                <div style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {task.status === 'in-progress' ? '진행중' : '대기중'}
                </div>
              )}
            </div>

            {task.file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.875rem' }}>
                <FileText size={18} color="var(--secondary)" />
                <span>{task.file}</span>
              </div>
            ) : (
              <button 
                onClick={() => handleUpload(task.id)}
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                  padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px dashed var(--primary)', 
                  borderRadius: '8px', color: 'var(--primary-light)', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Upload size={18} />
                <span>산출물 업로드</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
