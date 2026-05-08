import { useMemo, useState } from 'react';
import { AlertTriangle, Calendar, CheckCircle2, Clock, FileText, Plus, RotateCcw, Send, ShieldCheck, Star, Upload, User, X } from 'lucide-react';

const initialTasks = [
  {
    id: 1,
    title: 'DB 스키마 설계서 작성',
    assignee: '홍주은',
    status: 'approved',
    file: 'schema_v1.pdf',
    deadline: '2026-05-10',
    points: 15,
    earned: 15,
    submissionText: 'ERD와 테이블 명세 초안 제출',
    feedback: '승인 완료',
  },
  {
    id: 2,
    title: '로그인/회원가입 API 구현',
    assignee: '김철수',
    status: 'submitted',
    file: 'auth_api.zip',
    deadline: '2026-05-15',
    points: 20,
    earned: 0,
    submissionText: '학번 기반 회원가입과 로그인 검증 API 초안입니다.',
    feedback: '',
  },
  {
    id: 3,
    title: 'UI 프로토타입 시연 영상',
    assignee: '이영희',
    status: 'pending',
    file: null,
    deadline: '2026-05-20',
    points: 30,
    earned: 0,
    submissionText: '',
    feedback: '',
  },
];

const members = ['홍주은', '김철수', '이영희', '박민수'];

const statusMeta = {
  pending: { label: '제출 대기', color: 'var(--text-muted)', icon: Clock },
  submitted: { label: '검토 대기', color: '#fde68a', icon: Upload },
  approved: { label: '승인 완료', color: 'var(--primary-light)', icon: CheckCircle2 },
};

const TaskBoard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignee: '홍주은', deadline: '', points: '' });
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadForm, setUploadForm] = useState({ text: '', fileName: '', fileSize: 0 });
  const [uploadError, setUploadError] = useState('');

  const stats = useMemo(() => {
    const approvedCount = tasks.filter((task) => task.status === 'approved').length;
    const submittedCount = tasks.filter((task) => task.status === 'submitted').length;
    const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
    const earnedPoints = tasks.reduce((sum, task) => sum + task.earned, 0);

    return {
      approvedCount,
      submittedCount,
      totalPoints,
      earnedPoints,
      progress: tasks.length ? Math.round((approvedCount / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  const memberScores = useMemo(() => members.map((member) => {
    const assignedTasks = tasks.filter((task) => task.assignee === member);
    const possible = assignedTasks.reduce((sum, task) => sum + task.points, 0);
    const earned = assignedTasks.reduce((sum, task) => sum + task.earned, 0);

    return {
      member,
      earned,
      possible,
      percent: possible ? Math.round((earned / possible) * 100) : 0,
    };
  }), [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignee || !newTask.deadline || !newTask.points) return;

    setTasks((current) => [
      {
        id: Math.max(...current.map((task) => task.id)) + 1,
        title: newTask.title,
        assignee: newTask.assignee,
        status: 'pending',
        file: null,
        deadline: newTask.deadline,
        points: Number(newTask.points),
        earned: 0,
        submissionText: '',
        feedback: '',
      },
      ...current,
    ]);
    setNewTask({ title: '', assignee: '홍주은', deadline: '', points: '' });
    setShowAddForm(false);
  };

  const openUploadModal = (task) => {
    setUploadTarget(task);
    setUploadForm({ text: task.submissionText || '', fileName: task.file || '', fileSize: 0 });
    setUploadError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > 50) {
      setUploadError('대용량 영상 파일은 제한됩니다. 50MB 이하의 문서 또는 압축 파일로 제출해 주세요.');
      setUploadForm((current) => ({ ...current, fileName: '', fileSize: 0 }));
      return;
    }

    setUploadError('');
    setUploadForm((current) => ({ ...current, fileName: file.name, fileSize: fileSizeMb }));
  };

  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!uploadTarget || (!uploadForm.text && !uploadForm.fileName)) return;

    setTasks((current) => current.map((task) => (
      task.id === uploadTarget.id
        ? {
          ...task,
          status: 'submitted',
          file: uploadForm.fileName || 'text_submission.txt',
          submissionText: uploadForm.text || '텍스트 설명 없이 파일만 제출',
          feedback: '',
        }
        : task
    )));
    setUploadTarget(null);
    setUploadForm({ text: '', fileName: '', fileSize: 0 });
  };

  const handleApprove = (id) => {
    setTasks((current) => current.map((task) => (
      task.id === id
        ? { ...task, status: 'approved', earned: task.points, feedback: '관리자 검토 후 승인되었습니다.' }
        : task
    )));
  };

  const handleReject = (id) => {
    setTasks((current) => current.map((task) => (
      task.id === id
        ? { ...task, status: 'pending', file: null, earned: 0, feedback: '기준 미달로 재제출이 요청되었습니다.' }
        : task
    )));
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <p className="eyebrow">Task / Mission</p>
          <h1 className="page-title" style={{ marginBottom: 0 }}>미션 관리</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
          style={{ width: 'auto', padding: '0.65rem 0.85rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} />
          공지
        </button>
      </div>

      <div className="glass-panel" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>캡스톤 디자인 3조 진행 상황</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>승인된 산출물을 기준으로 전체 진척도와 기여도를 계산합니다.</p>
          </div>
          <span className="status-pill" style={{ color: 'var(--primary-light)' }}>{stats.earnedPoints}/{stats.totalPoints} P</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>총 진척도</span>
          <span style={{ color: 'var(--primary-light)', fontWeight: 800 }}>{stats.progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${stats.progress}%` }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <span className="status-pill" style={{ color: 'var(--primary-light)' }}>승인 {stats.approvedCount}건</span>
          <span className="status-pill" style={{ color: '#fde68a' }}>검토 대기 {stats.submittedCount}건</span>
          <span className="status-pill" style={{ color: 'var(--text-muted)' }}>미션 {tasks.length}개</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ marginBottom: '0.85rem' }}>팀원 기여도</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {memberScores.map((score) => (
            <div key={score.member}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} />{score.member}</span>
                <span style={{ color: 'var(--text-muted)' }}>{score.earned}/{score.possible || 0} P</span>
              </div>
              <div className="progress-track" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${score.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ marginBottom: '1rem', border: '1px solid rgba(20, 184, 166, 0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p className="eyebrow">Administrator</p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>새 미션 공지</h3>
            </div>
            <button className="icon-button" type="button" onClick={() => setShowAddForm(false)} aria-label="미션 공지 닫기">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="미션 제목"
              className="form-input"
              required
            />
            <div className="form-grid">
              <select
                className="form-select"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                aria-label="담당자"
              >
                {members.map((member) => <option key={member} value={member}>{member}</option>)}
              </select>
              <input
                type="number"
                value={newTask.points}
                onChange={(e) => setNewTask({ ...newTask, points: e.target.value })}
                placeholder="포인트"
                className="form-input"
                min="1"
                required
              />
            </div>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="form-input"
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.85rem' }}>공지 등록 및 알림 발송</button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpload={() => openUploadModal(task)}
            onApprove={() => handleApprove(task.id)}
            onReject={() => handleReject(task.id)}
          />
        ))}
      </div>

      {uploadTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="upload-title">
          <div className="modal-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p className="eyebrow">Upload deliverable</p>
                <h2 id="upload-title" style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>{uploadTarget.title}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setUploadTarget(null)} aria-label="업로드 닫기">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                className="form-textarea"
                value={uploadForm.text}
                onChange={(e) => setUploadForm({ ...uploadForm, text: e.target.value })}
                placeholder="제출 설명 또는 산출물 요약"
              />
              <input className="form-input" type="file" onChange={handleFileChange} />
              {uploadForm.fileName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-light)', fontSize: '0.85rem' }}>
                  <FileText size={17} />
                  <span>{uploadForm.fileName}</span>
                </div>
              )}
              {uploadError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#fecdd3', background: 'rgba(251, 113, 133, 0.1)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
                  <AlertTriangle size={17} style={{ flex: '0 0 auto' }} />
                  <span>{uploadError}</span>
                </div>
              )}
              <button className="btn-primary" type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                <Send size={18} />
                제출하고 관리자에게 알림 보내기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({ task, onUpload, onApprove, onReject }) => {
  const StatusIcon = statusMeta[task.status].icon;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: task.status === 'approved' ? '4px solid var(--primary-light)' : '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.55rem' }}>{task.title}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={15} />
              {task.assignee}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: task.status === 'approved' ? 'var(--text-muted)' : 'var(--accent)' }}>
              <Calendar size={15} />
              {task.deadline}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fde68a' }}>
              <Star size={15} fill="currentColor" />
              {task.points} P
            </span>
          </div>
        </div>
        <span className="status-pill" style={{ color: statusMeta[task.status].color }}>
          <StatusIcon size={14} />
          {statusMeta[task.status].label}
        </span>
      </div>

      {task.file && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.875rem' }}>
          <FileText size={18} color="var(--secondary)" />
          <div>
            <div>{task.file}</div>
            {task.submissionText && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>{task.submissionText}</div>}
          </div>
        </div>
      )}

      {task.feedback && (
        <div style={{ color: task.status === 'approved' ? '#bbf7d0' : '#fecdd3', background: task.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(251,113,133,0.1)', borderRadius: '8px', padding: '0.7rem', fontSize: '0.8rem' }}>
          {task.feedback}
        </div>
      )}

      {task.status === 'submitted' ? (
        <div className="form-grid">
          <button
            type="button"
            onClick={onApprove}
            className="btn-primary"
            style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
          >
            <ShieldCheck size={17} />
            승인
          </button>
          <button
            type="button"
            onClick={onReject}
            style={{ border: '1px solid rgba(251,113,133,0.35)', background: 'rgba(251,113,133,0.1)', borderRadius: '8px', color: '#fecdd3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', fontWeight: 800 }}
          >
            <RotateCcw size={17} />
            재제출
          </button>
        </div>
      ) : (
        <button
          onClick={onUpload}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: task.status === 'approved' ? 'rgba(255,255,255,0.06)' : 'rgba(20, 184, 166, 0.1)',
            border: task.status === 'approved' ? '1px solid var(--glass-border)' : '1px dashed var(--primary)',
            borderRadius: '8px',
            color: task.status === 'approved' ? 'var(--text-muted)' : 'var(--primary-light)',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          <Upload size={18} />
          <span>{task.status === 'approved' ? '수정 제출' : '산출물 업로드'}</span>
        </button>
      )}
    </div>
  );
};

export default TaskBoard;
