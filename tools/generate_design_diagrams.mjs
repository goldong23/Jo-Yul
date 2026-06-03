import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "design_diagrams");
fs.mkdirSync(outDir, { recursive: true });

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function writeSvg(file, svg) {
  fs.writeFileSync(path.join(outDir, file), svg, "utf8");
}

function lines(value, max = 24) {
  const parts = String(value).split(/(\s+)/);
  const out = [];
  let current = "";
  for (const part of parts) {
    const next = current + part;
    if (next.length > max && current.trim()) {
      out.push(current.trim());
      current = part.trimStart();
    } else {
      current = next;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out.length ? out : [""];
}

function classBox({ x, y, w = 230, name, stereo = "", attrs = [], ops = [] }) {
  const lineH = 17;
  const headerH = 42;
  const attrH = Math.max(24, attrs.length * lineH + 12);
  const opH = Math.max(24, ops.length * lineH + 12);
  const h = headerH + attrH + opH;
  let svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0" fill="#fff" stroke="#111827" stroke-width="1.2"/>`;
  svg += `<line x1="${x}" y1="${y + headerH}" x2="${x + w}" y2="${y + headerH}" stroke="#111827" stroke-width="1"/>`;
  svg += `<line x1="${x}" y1="${y + headerH + attrH}" x2="${x + w}" y2="${y + headerH + attrH}" stroke="#111827" stroke-width="1"/>`;
  if (stereo) svg += `<text x="${x + w / 2}" y="${y + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#475569">&lt;&lt;${esc(stereo)}&gt;&gt;</text>`;
  svg += `<text x="${x + w / 2}" y="${y + (stereo ? 32 : 25)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#111827">${esc(name)}</text>`;
  attrs.forEach((attr, i) => {
    svg += `<text x="${x + 10}" y="${y + headerH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11" fill="#111827">${esc(attr)}</text>`;
  });
  ops.forEach((op, i) => {
    svg += `<text x="${x + 10}" y="${y + headerH + attrH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11" fill="#111827">${esc(op)}</text>`;
  });
  return { svg, h };
}

function renderClassDiagram() {
  const classes = [
    { name: "LoginUI", stereo: "boundary", x: 40, y: 70, attrs: [], ops: ["+requestLogin()", "+showError()"] },
    { name: "RegisterUI", stereo: "boundary", x: 40, y: 210, attrs: [], ops: ["+submitRegister()", "+showSuccess()", "+showError()"] },
    { name: "HomeUI", stereo: "boundary", x: 40, y: 370, attrs: [], ops: ["+showHome()", "+updateTeamList()"] },
    { name: "ScheduleUI", stereo: "boundary", x: 40, y: 510, attrs: [], ops: ["+selectUnavailableTime()", "+requestRecommendation()", "+confirmSchedule()"] },
    { name: "TaskBoardUI", stereo: "boundary", x: 40, y: 690, attrs: [], ops: ["+requestUpload()", "+requestApproval()", "+requestRejection()"] },
    { name: "EventUI", stereo: "boundary", x: 40, y: 870, attrs: [], ops: ["+submitVote()", "+requestDecision()"] },
    { name: "WorkspaceUI", stereo: "boundary", x: 40, y: 1030, attrs: [], ops: ["+submitMessage()", "+updateMessageList()"] },

    { name: "AuthService", stereo: "control", x: 370, y: 100, attrs: [], ops: ["+registerMember()", "+login()", "+validateInput()", "+createMemberProfile()"] },
    { name: "TeamService", stereo: "control", x: 370, y: 285, attrs: [], ops: ["+createTeam()", "+inviteMember()"] },
    { name: "ScheduleService", stereo: "control", x: 370, y: 455, attrs: [], ops: ["+saveUnavailableTime()", "+recommendTime()", "+confirmSchedule()"] },
    { name: "TaskService", stereo: "control", x: 370, y: 645, attrs: [], ops: ["+uploadSubmission()", "+approveSubmission()", "+rejectSubmission()", "+calculateProgress()"] },
    { name: "EventService", stereo: "control", x: 370, y: 845, attrs: [], ops: ["+createEvent()", "+vote()", "+decideEvent()"] },
    { name: "WorkspaceService", stereo: "control", x: 370, y: 1020, attrs: [], ops: ["+createWorkspace()", "+sendMessage()"] },

    { name: "SupabaseAuthClient", stereo: "control", x: 700, y: 70, attrs: ["-supabaseUrl", "-anonKey"], ops: ["+signUp()", "+signIn()", "+handleAuthResponse()"] },
    { name: "NotificationService", stereo: "control", x: 700, y: 265, attrs: [], ops: ["+sendInvite()", "+sendVoteRequest()", "+sendVoteReminder()", "+sendWorkspaceNotice()"] },
    { name: "DataStore", stereo: "storage", x: 700, y: 490, attrs: [], ops: ["+save()", "+findById()", "+findAll()", "+update()"] },
    { name: "FileStorage", stereo: "storage", x: 700, y: 690, attrs: [], ops: ["+upload()"] },
    { name: "SupabaseAuthAPI", stereo: "external", x: 700, y: 850, attrs: [], ops: ["+signUpEndpoint()", "+passwordLoginEndpoint()", "+returnSession()"] },

    { name: "Member", stereo: "entity", x: 1030, y: 70, attrs: ["+memberId", "+supabaseUserId", "+studentNo", "+name", "+email", "+role"], ops: [] },
    { name: "Team", stereo: "entity", x: 1030, y: 255, attrs: ["+teamId", "+teamName", "+description", "+adminId", "+createdAt"], ops: [] },
    { name: "TeamMember", stereo: "entity", x: 1290, y: 255, attrs: ["+teamMemberId", "+teamId", "+memberId", "+joinedAt"], ops: [] },
    { name: "ScheduleBlock", stereo: "entity", x: 1030, y: 455, attrs: ["+scheduleId", "+teamId", "+memberId", "+day", "+startTime", "+endTime"], ops: [] },
    { name: "Task", stereo: "entity", x: 1030, y: 655, attrs: ["+taskId", "+teamId", "+title", "+assigneeId", "+dueDate", "+status"], ops: [] },
    { name: "Submission", stereo: "entity", x: 1290, y: 655, attrs: ["+submissionId", "+taskId", "+memberId", "+fileUrl", "+status", "+submittedAt"], ops: [] },
    { name: "Event", stereo: "entity", x: 1030, y: 865, attrs: ["+eventId", "+teamId", "+title", "+voteDeadline", "+status"], ops: [] },
    { name: "Vote", stereo: "entity", x: 1290, y: 865, attrs: ["+voteId", "+eventId", "+memberId", "+status", "+votedAt"], ops: [] },
    { name: "TeamWorkspace", stereo: "entity", x: 1030, y: 1060, attrs: ["+workspaceId", "+eventId", "+workspaceName", "+participants", "+createdAt"], ops: [] },
  ];
  const boxes = new Map();
  const width = 1560;
  const height = 1220;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#111827"/></marker>
  <marker id="diamond" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="11" markerHeight="9" orient="auto"><path d="M1 5 L8 1 L15 5 L8 9 z" fill="#111827" stroke="#111827"/></marker>
</defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="40" y="34" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#111827">Jo:YUl Class Diagram</text>`;
  let boxLayer = "";
  for (const c of classes) {
    const rendered = classBox(c);
    boxLayer += rendered.svg;
    boxes.set(c.name, { ...c, w: 230, h: rendered.h });
  }

  function center(name) {
    const b = boxes.get(name);
    return { x: b.x + b.w / 2, y: b.y + b.h / 2, b };
  }
  function dep(a, b, label = "") {
    const from = center(a), to = center(b);
    svg += `<line x1="${from.x + 115}" y1="${from.y}" x2="${to.x - 115}" y2="${to.y}" stroke="#334155" stroke-width="1.1" stroke-dasharray="5 4" marker-end="url(#arrow)"/>`;
    if (label) svg += `<text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#334155">${esc(label)}</text>`;
  }
  function assoc(a, b, label = "") {
    const from = center(a), to = center(b);
    svg += `<line x1="${from.x + 115}" y1="${from.y}" x2="${to.x - 115}" y2="${to.y}" stroke="#111827" stroke-width="1.1" marker-end="url(#arrow)"/>`;
    if (label) svg += `<text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#111827">${esc(label)}</text>`;
  }
  function comp(a, b, label = "") {
    const from = center(a), to = center(b);
    svg += `<line x1="${from.x + 115}" y1="${from.y}" x2="${to.x - 115}" y2="${to.y}" stroke="#111827" stroke-width="1.1" marker-start="url(#diamond)" marker-end="url(#arrow)"/>`;
    if (label) svg += `<text x="${(from.x + to.x) / 2}" y="${(from.y + to.y) / 2 - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#111827">${esc(label)}</text>`;
  }

  dep("LoginUI", "AuthService");
  dep("RegisterUI", "AuthService");
  dep("AuthService", "SupabaseAuthClient");
  dep("SupabaseAuthClient", "SupabaseAuthAPI");
  assoc("AuthService", "Member");
  dep("AuthService", "DataStore");
  dep("HomeUI", "TeamService");
  dep("ScheduleUI", "ScheduleService");
  dep("TaskBoardUI", "TaskService");
  dep("EventUI", "EventService");
  dep("WorkspaceUI", "WorkspaceService");
  dep("TeamService", "DataStore");
  dep("ScheduleService", "DataStore");
  dep("TaskService", "DataStore");
  dep("EventService", "DataStore");
  dep("WorkspaceService", "DataStore");
  dep("TaskService", "FileStorage");
  dep("TeamService", "NotificationService");
  dep("EventService", "NotificationService");
  dep("WorkspaceService", "NotificationService");
  comp("Team", "TeamMember", "1..*");
  assoc("TeamMember", "Member", "*");
  comp("Team", "ScheduleBlock", "*");
  comp("Team", "Task", "*");
  comp("Task", "Submission", "*");
  comp("Event", "Vote", "*");
  comp("Event", "TeamWorkspace", "0..1");
  assoc("TeamWorkspace", "Member", "*");
  assoc("TeamService", "Team");
  assoc("ScheduleService", "ScheduleBlock");
  assoc("TaskService", "Task");
  assoc("TaskService", "Submission");
  assoc("EventService", "Event");
  assoc("EventService", "Vote");
  assoc("WorkspaceService", "TeamWorkspace");
  return `${svg}${boxLayer}</svg>`;
}

const sequences = {
  "03_14_manage_team_workspace_sequence.svg": {
    title: "3.14 Manage Team Workspace",
    participants: [
      ["actor", "sender:Member"],
      ["participant", "WorkspaceUI"],
      ["participant", "WorkspaceService"],
      ["participant", "DataStore"],
      ["participant", "NotificationService"],
      ["actor", "recipient:Member"],
    ],
    events: [
      ["sender:Member", "WorkspaceUI", "메시지 입력 후 전송"],
      ["WorkspaceUI", "WorkspaceUI", "submitMessage(message)"],
      ["WorkspaceUI", "WorkspaceService", "sendMessage(workspaceId, memberId, message)"],
      ["WorkspaceService", "DataStore", "save(message)"],
      ["DataStore", "WorkspaceService", "save success", true],
      ["WorkspaceService", "NotificationService", "sendWorkspaceNotice(workspaceId)"],
      ["NotificationService", "recipient:Member", "새 메시지 알림", true],
      ["WorkspaceService", "WorkspaceUI", "message sent", true],
      ["WorkspaceUI", "sender:Member", "updateMessageList(message)", true],
    ],
  },
};

function renderSequence({ title, participants, events }) {
  const laneW = 205;
  const marginX = 96;
  const headY = 62;
  const stepY = 48;
  const headH = 44;
  const width = marginX * 2 + (participants.length - 1) * laneW + 150;
  const height = headY + headH + events.length * stepY + 100;
  const xOf = new Map(participants.map(([, name], i) => [name, marginX + i * laneW]));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#111827"/></marker></defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="36" y="32" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#111827">${esc(title)}</text>`;
  for (const [kind, name] of participants) {
    const x = xOf.get(name);
    if (kind === "actor") {
      svg += `<circle cx="${x}" cy="${headY + 10}" r="10" fill="#fff" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${headY + 20}" x2="${x}" y2="${headY + 42}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x - 16}" y1="${headY + 28}" x2="${x + 16}" y2="${headY + 28}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${headY + 42}" x2="${x - 16}" y2="${headY + 58}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${headY + 42}" x2="${x + 16}" y2="${headY + 58}" stroke="#111827" stroke-width="1.3"/>
<text x="${x}" y="${headY + 78}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#111827">${esc(name)}</text>`;
    } else {
      svg += `<rect x="${x - 76}" y="${headY}" width="152" height="${headH}" fill="#fff" stroke="#111827" stroke-width="1.2"/>
<text x="${x}" y="${headY + 27}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#111827">${esc(name)}</text>`;
    }
    svg += `<line x1="${x}" y1="${headY + headH}" x2="${x}" y2="${height - 44}" stroke="#111827" stroke-width="1" stroke-dasharray="6 6"/>`;
  }
  let y = headY + headH + 42;
  for (const [from, to, label, dashed = false] of events) {
    const x1 = xOf.get(from);
    const x2 = xOf.get(to);
    if (x1 === x2) {
      svg += `<path d="M${x1} ${y} h36 q18 0 18 18 q0 18 -18 18 h-36" fill="none" stroke="#111827" stroke-width="1.1" marker-end="url(#arrow)"${dashed ? ' stroke-dasharray="4 4"' : ""}/>`;
      svg += `<text x="${x1 + 46}" y="${y - 5}" font-family="Arial, sans-serif" font-size="12" fill="#111827">${esc(label)}</text>`;
    } else {
      svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#111827" stroke-width="1.1" marker-end="url(#arrow)"${dashed ? ' stroke-dasharray="4 4"' : ""}/>`;
      lines(label, Math.max(18, Math.floor(Math.abs(x2 - x1) / 8))).forEach((line, i) => {
        svg += `<text x="${(x1 + x2) / 2}" y="${y - 7 + i * 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#111827">${esc(line)}</text>`;
      });
    }
    y += stepY;
  }
  return `${svg}</svg>`;
}

function renderStateMachine() {
  const width = 1420;
  const height = 980;
  const states = [
    ["LaunchSystem", 700, 80], ["WaitLoginInput", 700, 185], ["WaitLoginValidation", 700, 290], ["Home", 700, 405],
    ["RegisterMember", 360, 185], ["WaitRegisterValidation", 360, 290], ["RegisterInformation", 360, 405],
    ["TeamList", 180, 555], ["TeamCreating", 80, 675], ["MemberInviting", 280, 675],
    ["ScheduleEditing", 500, 555], ["ScheduleRecommending", 500, 675], ["ScheduleConfirmed", 500, 795],
    ["TaskViewing", 780, 555], ["TaskUploading", 780, 675], ["TaskSubmitted", 780, 795],
    ["TaskApproved", 660, 905], ["TaskRejected", 900, 905],
    ["EventVoting", 1110, 555], ["VoteReminderWaiting", 1000, 675], ["VoteSubmitted", 1220, 675],
    ["EventDeciding", 1220, 795], ["EventCanceled", 1080, 905], ["WorkspaceCreated", 1340, 905],
  ];
  const pos = new Map(states.map(([name, x, y]) => [name, { x, y }]));
  const edges = [
    ["LaunchSystem", "WaitLoginInput", "로그인 화면"], ["LaunchSystem", "RegisterMember", "회원가입 선택"],
    ["RegisterMember", "WaitRegisterValidation", "입력 완료"], ["WaitRegisterValidation", "RegisterMember", "입력 오류"],
    ["WaitRegisterValidation", "RegisterInformation", "Supabase 인증 성공"], ["RegisterInformation", "Home", "세션 생성"],
    ["WaitLoginInput", "WaitLoginValidation", "학번/비밀번호 입력"], ["WaitLoginValidation", "WaitLoginInput", "로그인 실패"],
    ["WaitLoginValidation", "Home", "로그인 성공"], ["Home", "TeamList", "팀"], ["TeamList", "TeamCreating", "생성"],
    ["TeamCreating", "TeamList", "완료"], ["TeamList", "MemberInviting", "초대"], ["MemberInviting", "TeamList", "완료"],
    ["Home", "ScheduleEditing", "일정"], ["ScheduleEditing", "ScheduleRecommending", "추천"], ["ScheduleRecommending", "ScheduleConfirmed", "확정"],
    ["ScheduleConfirmed", "Home", "복귀"], ["Home", "TaskViewing", "과제"], ["TaskViewing", "TaskUploading", "업로드"],
    ["TaskUploading", "TaskSubmitted", "제출"], ["TaskSubmitted", "TaskApproved", "승인"], ["TaskSubmitted", "TaskRejected", "반려"],
    ["TaskRejected", "TaskUploading", "재제출"], ["TaskApproved", "TaskViewing", "갱신"], ["Home", "EventVoting", "이벤트"],
    ["EventVoting", "VoteReminderWaiting", "미투표"], ["VoteReminderWaiting", "EventVoting", "리마인드"],
    ["EventVoting", "VoteSubmitted", "투표"], ["VoteSubmitted", "EventDeciding", "마감"],
    ["EventDeciding", "EventCanceled", "참여자 없음"], ["EventDeciding", "WorkspaceCreated", "참여자 있음"],
  ];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#111827"/></marker></defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="36" y="34" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#111827">Jo:YUl State Machine Diagram</text>
<circle cx="700" cy="45" r="10" fill="#111827"/>
<line x1="700" y1="55" x2="700" y2="56" stroke="#111827" stroke-width="1.2" marker-end="url(#arrow)"/>`;
  function state(name, x, y) {
    svg += `<rect x="${x - 82}" y="${y - 24}" width="164" height="48" rx="18" fill="#fff" stroke="#111827" stroke-width="1.2"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">${esc(name)}</text>`;
  }
  function edge(a, b, label) {
    const from = pos.get(a), to = pos.get(b);
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const x1 = from.x + (dx / len) * 82;
    const y1 = from.y + (dy / len) * 24;
    const x2 = to.x - (dx / len) * 82;
    const y2 = to.y - (dy / len) * 24;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"/>`;
    svg += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#111827">${esc(label)}</text>`;
  }
  edges.forEach(([a, b, label]) => edge(a, b, label));
  states.forEach(([name, x, y]) => state(name, x, y));
  svg += `<circle cx="1340" cy="960" r="13" fill="#fff" stroke="#111827" stroke-width="1.5"/><circle cx="1340" cy="960" r="8" fill="#111827"/>`;
  return `${svg}</svg>`;
}

writeSvg("02_class_diagram.svg", renderClassDiagram());
writeSvg("03_14_manage_team_workspace_sequence.svg", renderSequence(sequences["03_14_manage_team_workspace_sequence.svg"]));
writeSvg("04_state_machine_diagram.svg", renderStateMachine());
console.log("Regenerated class diagram, 3.14 sequence diagram, and state machine diagram.");
