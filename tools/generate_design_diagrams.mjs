import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "design_diagrams");
fs.mkdirSync(outDir, { recursive: true });
const diagramBg = "#ffffff";
const nodeBg = "#fbfbfb";

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

function wrap(value, max = 18) {
  const text = String(value);
  if (text.length <= max) return [text];
  const out = [];
  let current = "";
  for (const token of text.split(/(\s+)/)) {
    const next = current + token;
    if (next.length > max && current.trim()) {
      out.push(current.trim());
      current = token.trimStart();
    } else {
      current = next;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

function markerDefs() {
  return `<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#111827"/></marker>
  <marker id="hollowArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${nodeBg}" stroke="#111827"/></marker>
  <marker id="diamond" viewBox="0 0 16 10" refX="1" refY="5" markerWidth="11" markerHeight="9" orient="auto"><path d="M1 5 L8 1 L15 5 L8 9 z" fill="#111827" stroke="#111827"/></marker>
</defs>`;
}

function labelText(x, y, text, opts = {}) {
  const { anchor = "middle", size = 12, weight = "400", max = 22 } = opts;
  const lines = wrap(text, max);
  let svg = "";
  lines.forEach((line, i) => {
    svg += `<text x="${x}" y="${y + i * (size + 3)}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="#111827">${esc(line)}</text>`;
  });
  return svg;
}

function renderClassDiagram() {
  const boxW = 236;
  const classes = [
    { n: "LoginUI", s: "boundary", x: 50, y: 70, a: [], o: ["+requestLogin()", "+showError()"] },
    { n: "RegisterUI", s: "boundary", x: 50, y: 214, a: [], o: ["+submitRegister()", "+showSuccess()", "+showError()"] },
    { n: "HomeUI", s: "boundary", x: 50, y: 378, a: [], o: ["+showHome()", "+updateTeamList()"] },
    { n: "ScheduleUI", s: "boundary", x: 50, y: 522, a: [], o: ["+selectUnavailableTime()", "+requestRecommendation()", "+confirmSchedule()"] },
    { n: "TaskBoardUI", s: "boundary", x: 50, y: 704, a: [], o: ["+requestUpload()", "+requestApproval()", "+requestRejection()"] },
    { n: "EventUI", s: "boundary", x: 50, y: 886, a: [], o: ["+submitVote()", "+requestDecision()"] },
    { n: "WorkspaceUI", s: "boundary", x: 50, y: 1044, a: [], o: ["+submitMessage()", "+updateMessageList()"] },

    { n: "AuthService", s: "control", x: 375, y: 90, a: [], o: ["+registerMember()", "+login()", "+validateInput()", "+createMemberProfile()"] },
    { n: "TeamService", s: "control", x: 375, y: 286, a: [], o: ["+createTeam()", "+inviteMember()"] },
    { n: "ScheduleService", s: "control", x: 375, y: 462, a: [], o: ["+saveUnavailableTime()", "+recommendTime()", "+confirmSchedule()"] },
    { n: "TaskService", s: "control", x: 375, y: 654, a: [], o: ["+uploadSubmission()", "+approveSubmission()", "+rejectSubmission()", "+calculateProgress()"] },
    { n: "EventService", s: "control", x: 375, y: 860, a: [], o: ["+createEvent()", "+vote()", "+decideEvent()"] },
    { n: "WorkspaceService", s: "control", x: 375, y: 1036, a: [], o: ["+createWorkspace()", "+sendMessage()"] },

    { n: "SupabaseAuthClient", s: "control", x: 700, y: 70, a: ["-supabaseUrl", "-anonKey"], o: ["+signUp()", "+signIn()", "+handleAuthResponse()"] },
    { n: "NotificationService", s: "control", x: 700, y: 286, a: [], o: ["+sendInvite()", "+sendVoteRequest()", "+sendVoteReminder()", "+sendWorkspaceNotice()"] },
    { n: "DataStore", s: "storage", x: 700, y: 522, a: [], o: ["+save()", "+findById()", "+findAll()", "+update()"] },
    { n: "FileStorage", s: "storage", x: 700, y: 704, a: [], o: ["+upload()"] },
    { n: "SupabaseAuthAPI", s: "external", x: 700, y: 886, a: [], o: ["+signUpEndpoint()", "+passwordLoginEndpoint()", "+returnSession()"] },

    { n: "Member", s: "entity", x: 1050, y: 70, a: ["+memberId", "+supabaseUserId", "+studentNo", "+name", "+email", "+role"], o: [] },
    { n: "Team", s: "entity", x: 1050, y: 286, a: ["+teamId", "+teamName", "+description", "+adminId", "+createdAt"], o: [] },
    { n: "TeamMember", s: "entity", x: 1330, y: 286, a: ["+teamMemberId", "+teamId", "+memberId", "+joinedAt"], o: [] },
    { n: "ScheduleBlock", s: "entity", x: 1050, y: 522, a: ["+scheduleId", "+teamId", "+memberId", "+day", "+startTime", "+endTime"], o: [] },
    { n: "Task", s: "entity", x: 1050, y: 704, a: ["+taskId", "+teamId", "+title", "+assigneeId", "+dueDate", "+status"], o: [] },
    { n: "Submission", s: "entity", x: 1330, y: 704, a: ["+submissionId", "+taskId", "+memberId", "+fileUrl", "+status", "+submittedAt"], o: [] },
    { n: "Event", s: "entity", x: 1050, y: 886, a: ["+eventId", "+teamId", "+title", "+voteDeadline", "+status"], o: [] },
    { n: "Vote", s: "entity", x: 1330, y: 886, a: ["+voteId", "+eventId", "+memberId", "+status", "+votedAt"], o: [] },
    { n: "TeamWorkspace", s: "entity", x: 1050, y: 1062, a: ["+workspaceId", "+eventId", "+workspaceName", "+participants", "+createdAt"], o: [] },
  ];
  const nodes = new Map();
  let boxes = "";
  for (const c of classes) {
    const headerH = 42;
    const lineH = 17;
    const attrH = Math.max(24, c.a.length * lineH + 12);
    const opH = Math.max(24, c.o.length * lineH + 12);
    const h = headerH + attrH + opH;
    nodes.set(c.n, { x: c.x, y: c.y, w: boxW, h });
    boxes += `<rect x="${c.x}" y="${c.y}" width="${boxW}" height="${h}" fill="${nodeBg}" stroke="#111827" stroke-width="1.2"/>`;
    boxes += `<line x1="${c.x}" y1="${c.y + headerH}" x2="${c.x + boxW}" y2="${c.y + headerH}" stroke="#111827"/>`;
    boxes += `<line x1="${c.x}" y1="${c.y + headerH + attrH}" x2="${c.x + boxW}" y2="${c.y + headerH + attrH}" stroke="#111827"/>`;
    boxes += `<text x="${c.x + boxW / 2}" y="${c.y + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#475569">&lt;&lt;${c.s}&gt;&gt;</text>`;
    boxes += `<text x="${c.x + boxW / 2}" y="${c.y + 32}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#111827">${c.n}</text>`;
    c.a.forEach((a, i) => boxes += `<text x="${c.x + 10}" y="${c.y + headerH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11">${esc(a)}</text>`);
    c.o.forEach((o, i) => boxes += `<text x="${c.x + 10}" y="${c.y + headerH + attrH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11">${esc(o)}</text>`);
  }
  const width = 1620;
  const height = 1240;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<text x="50" y="34" font-family="Arial, sans-serif" font-size="22" font-weight="700">Jo:YUl Class Diagram</text>`;

  function p(name, side = "right") {
    const n = nodes.get(name);
    if (side === "left") return { x: n.x, y: n.y + n.h / 2 };
    if (side === "top") return { x: n.x + n.w / 2, y: n.y };
    if (side === "bottom") return { x: n.x + n.w / 2, y: n.y + n.h };
    return { x: n.x + n.w, y: n.y + n.h / 2 };
  }
  function line(a, b, type = "dep", label = "") {
    const from = p(a, "right");
    const to = p(b, "left");
    const dashed = type === "dep" ? ' stroke-dasharray="5 4"' : "";
    const markerStart = type === "comp" ? ' marker-start="url(#diamond)"' : "";
    const markerEnd = type === "gen" ? ' marker-end="url(#hollowArrow)"' : ' marker-end="url(#arrow)"';
    svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#111827" stroke-width="1.05"${dashed}${markerStart}${markerEnd}/>`;
    if (label) svg += labelText((from.x + to.x) / 2, (from.y + to.y) / 2 - 3, label, { size: 11, max: 8 });
  }
  [
    ["LoginUI", "AuthService"], ["RegisterUI", "AuthService"], ["AuthService", "SupabaseAuthClient"],
    ["SupabaseAuthClient", "SupabaseAuthAPI"], ["AuthService", "Member", "assoc"], ["AuthService", "DataStore"],
    ["HomeUI", "TeamService"], ["ScheduleUI", "ScheduleService"], ["TaskBoardUI", "TaskService"],
    ["EventUI", "EventService"], ["WorkspaceUI", "WorkspaceService"], ["TeamService", "DataStore"],
    ["ScheduleService", "DataStore"], ["TaskService", "DataStore"], ["EventService", "DataStore"],
    ["WorkspaceService", "DataStore"], ["TaskService", "FileStorage"], ["TeamService", "NotificationService"],
    ["EventService", "NotificationService"], ["WorkspaceService", "NotificationService"],
    ["TeamService", "Team", "assoc"], ["ScheduleService", "ScheduleBlock", "assoc"], ["TaskService", "Task", "assoc"],
    ["TaskService", "Submission", "assoc"], ["EventService", "Event", "assoc"], ["EventService", "Vote", "assoc"],
    ["WorkspaceService", "TeamWorkspace", "assoc"],
  ].forEach(([a, b, t]) => line(a, b, t || "dep"));
  [
    ["Team", "TeamMember", "comp", "1..*"], ["TeamMember", "Member", "assoc", "*"],
    ["Team", "ScheduleBlock", "comp", "*"], ["Team", "Task", "comp", "*"],
    ["Task", "Submission", "comp", "*"], ["Event", "Vote", "comp", "*"],
    ["Event", "TeamWorkspace", "comp", "0..1"], ["TeamWorkspace", "Member", "assoc", "*"],
  ].forEach(([a, b, t, l]) => line(a, b, t, l));
  return `${svg}${boxes}</svg>`;
}

const sequenceFiles = [
  ["03_01_register_member_sequence.svg", "3.1 Register Member", [["actor", "member:Member"], ["participant", "LoginUI"], ["participant", "RegisterUI"], ["participant", "AuthService"], ["participant", "SupabaseAuthClient"], ["participant", "SupabaseAuthAPI"], ["participant", "DataStore"]], [
    ["member:Member", "LoginUI", "회원가입 선택"], ["LoginUI", "LoginUI", "openRegisterUI()"], ["LoginUI", "RegisterUI", "display()"],
    ["member:Member", "RegisterUI", "학번 또는 이메일, 비밀번호 입력"], ["RegisterUI", "RegisterUI", "submitRegister(data)"],
    ["RegisterUI", "AuthService", "registerMember(data)"], ["AuthService", "AuthService", "validateInput(data)"],
    ["AuthService", "SupabaseAuthClient", "signUp(email, password)"], ["SupabaseAuthClient", "SupabaseAuthAPI", "POST /auth/v1/signup"],
    ["SupabaseAuthAPI", "SupabaseAuthClient", "user and session response", true], ["fragment", "alt 회원가입 성공"],
    ["SupabaseAuthClient", "AuthService", "auth session", true], ["AuthService", "DataStore", "save(Member profile)"], ["DataStore", "AuthService", "profile save success", true],
    ["AuthService", "RegisterUI", "registration success", true], ["RegisterUI", "member:Member", "showSuccess()", true],
    ["fragment", "else 입력 오류 또는 이미 가입된 계정"], ["SupabaseAuthAPI", "SupabaseAuthClient", "auth error", true],
    ["SupabaseAuthClient", "AuthService", "error message", true], ["AuthService", "RegisterUI", "registration error", true],
    ["RegisterUI", "member:Member", "showError(message)", true], ["fragment", "end"],
  ]],
  ["03_02_login_sequence.svg", "3.2 Login", [["actor", "member:Member"], ["participant", "LoginUI"], ["participant", "AuthService"], ["participant", "SupabaseAuthClient"], ["participant", "SupabaseAuthAPI"], ["participant", "HomeUI"]], [
    ["member:Member", "LoginUI", "학번과 비밀번호 입력"], ["LoginUI", "LoginUI", "requestLogin(studentNo, password)"],
    ["LoginUI", "AuthService", "login(studentNo, password)"], ["AuthService", "AuthService", "convertStudentNoToEmail(studentNo)"],
    ["AuthService", "SupabaseAuthClient", "signIn(email, password)"], ["SupabaseAuthClient", "SupabaseAuthAPI", "POST /auth/v1/token"],
    ["SupabaseAuthAPI", "SupabaseAuthClient", "auth response", true], ["fragment", "alt 로그인 성공"],
    ["SupabaseAuthClient", "AuthService", "auth session", true], ["AuthService", "LoginUI", "auth success", true],
    ["LoginUI", "LoginUI", "navigateHome()"], ["LoginUI", "HomeUI", "showHome()"], ["HomeUI", "member:Member", "홈 화면 표시", true],
    ["fragment", "else 로그인 실패"], ["SupabaseAuthClient", "AuthService", "error message", true], ["AuthService", "LoginUI", "auth failure", true],
    ["LoginUI", "member:Member", "showError(message)", true], ["fragment", "end"],
  ]],
  ["03_03_create_team_sequence.svg", "3.3 Create Team", [["actor", "admin:Administrator"], ["participant", "HomeUI"], ["participant", "TeamUI"], ["participant", "TeamService"], ["participant", "DataStore"]], [
    ["admin:Administrator", "HomeUI", "+ 팀 생성 선택"], ["HomeUI", "HomeUI", "openTeamUI()"], ["HomeUI", "TeamUI", "displayTeamForm()"],
    ["admin:Administrator", "TeamUI", "팀명, 설명 입력"], ["TeamUI", "TeamUI", "submitTeamData(teamData)"],
    ["TeamUI", "TeamService", "createTeam(adminId, teamData)"], ["TeamService", "DataStore", "save(Team)"],
    ["DataStore", "TeamService", "created Team", true], ["TeamService", "TeamUI", "create success", true],
    ["TeamUI", "HomeUI", "updateTeamList(team)", true], ["HomeUI", "admin:Administrator", "새 팀 카드 표시", true],
  ]],
  ["03_04_invite_member_sequence.svg", "3.4 Invite Member", [["actor", "admin:Administrator"], ["participant", "TeamUI"], ["participant", "TeamService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "invitee:Member"]], [
    ["admin:Administrator", "TeamUI", "초대할 멤버 선택"], ["TeamUI", "TeamUI", "selectInviteMember(memberId)"],
    ["TeamUI", "TeamService", "inviteMember(teamId, memberId)"], ["TeamService", "DataStore", "findById(memberId)"],
    ["DataStore", "TeamService", "Member data", true], ["TeamService", "DataStore", "save(TeamMember)"],
    ["DataStore", "TeamService", "invite saved", true], ["TeamService", "NotificationService", "sendInvite(memberId, teamId)"],
    ["NotificationService", "invitee:Member", "팀 초대 알림", true], ["TeamService", "TeamUI", "invitation success", true],
    ["TeamUI", "TeamUI", "showInviteResult()"],
  ]],
  ["03_05_input_schedule_sequence.svg", "3.5 Input Schedule", [["actor", "member:Member"], ["participant", "ScheduleUI"], ["participant", "ScheduleService"], ["participant", "DataStore"]], [
    ["member:Member", "ScheduleUI", "불가능 시간 cell 터치"], ["ScheduleUI", "ScheduleUI", "selectUnavailableTime(block)"],
    ["ScheduleUI", "ScheduleService", "saveUnavailableTime(block)"], ["ScheduleService", "DataStore", "save(ScheduleBlock)"],
    ["DataStore", "ScheduleService", "save success", true], ["ScheduleService", "ScheduleUI", "update result", true],
    ["ScheduleUI", "member:Member", "선택한 불가능 시간 표시", true],
  ]],
  ["03_06_decide_schedule_sequence.svg", "3.6 Decide Schedule", [["actor", "admin:Administrator"], ["participant", "ScheduleUI"], ["participant", "ScheduleService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "member:Member"]], [
    ["admin:Administrator", "ScheduleUI", "최적 시간 추천받기 선택"], ["ScheduleUI", "ScheduleUI", "requestRecommendation(teamId)"],
    ["ScheduleUI", "ScheduleService", "recommendTime(teamId)"], ["ScheduleService", "DataStore", "findAll(teamId)"],
    ["DataStore", "ScheduleService", "all unavailable blocks", true], ["ScheduleService", "ScheduleService", "calculate available slots"],
    ["ScheduleService", "ScheduleUI", "recommended slots", true], ["ScheduleUI", "admin:Administrator", "highlightRecommendedSlot(slot)", true],
    ["admin:Administrator", "ScheduleUI", "추천 시간 확정"], ["ScheduleUI", "ScheduleService", "confirmSchedule(teamId, slot)"],
    ["ScheduleService", "NotificationService", "sendScheduleNotice(teamId, slot)"], ["NotificationService", "member:Member", "일정 확정 알림", true],
  ]],
  ["03_07_upload_task_sequence.svg", "3.7 Upload Task", [["actor", "member:Member"], ["participant", "TaskBoardUI"], ["participant", "TaskService"], ["participant", "FileStorage"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "admin:Administrator"]], [
    ["member:Member", "TaskBoardUI", "제출물 업로드 선택"], ["TaskBoardUI", "TaskBoardUI", "requestUpload(taskId, file)"],
    ["TaskBoardUI", "TaskService", "uploadSubmission(taskId, memberId, file)"], ["TaskService", "FileStorage", "upload(file)"],
    ["FileStorage", "TaskService", "fileUrl", true], ["TaskService", "DataStore", "save(Submission)"],
    ["DataStore", "TaskService", "save success", true], ["TaskService", "NotificationService", "sendSubmissionNotice(taskId)"],
    ["NotificationService", "admin:Administrator", "제출 알림", true], ["TaskService", "TaskBoardUI", "upload success", true],
    ["TaskBoardUI", "member:Member", "제출 상태 표시", true],
  ]],
  ["03_08_approve_task_sequence.svg", "3.8 Approve Task", [["actor", "admin:Administrator"], ["participant", "TaskBoardUI"], ["participant", "TaskService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "member:Member"]], [
    ["admin:Administrator", "TaskBoardUI", "제출물 확인"], ["TaskBoardUI", "TaskService", "getSubmission(submissionId)"],
    ["TaskService", "DataStore", "findById(submissionId)"], ["DataStore", "TaskService", "submission data", true],
    ["TaskService", "TaskBoardUI", "submission detail", true], ["TaskBoardUI", "TaskBoardUI", "showSubmissionDetail(submission)"],
    ["fragment", "alt 승인 선택"], ["admin:Administrator", "TaskBoardUI", "승인 선택"], ["TaskBoardUI", "TaskService", "approveSubmission(submissionId)"],
    ["TaskService", "DataStore", "update(Submission APPROVED)"], ["TaskService", "TaskService", "calculateProgress(teamId)"],
    ["TaskService", "NotificationService", "sendApprovalNotice(submissionId)"], ["NotificationService", "member:Member", "승인 알림", true],
    ["TaskBoardUI", "admin:Administrator", "updateProgress(progress)", true], ["fragment", "else 반려 선택"],
    ["admin:Administrator", "TaskBoardUI", "반려 선택"], ["TaskBoardUI", "TaskService", "rejectSubmission(submissionId)"],
    ["TaskService", "DataStore", "update(Submission REJECTED)"], ["TaskService", "NotificationService", "sendRejectionNotice(submissionId)"],
    ["NotificationService", "member:Member", "재제출 요청 알림", true], ["fragment", "end"],
  ]],
  ["03_09_manage_event_notification_sequence.svg", "3.9 Manage Event & Notification", [["actor", "admin:Administrator"], ["participant", "EventUI"], ["participant", "EventService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "member:Member"]], [
    ["admin:Administrator", "EventUI", "이벤트 생성 정보 입력"], ["EventUI", "EventUI", "submitEventData(eventData)"],
    ["EventUI", "EventService", "createEvent(teamId, eventData)"], ["EventService", "DataStore", "save(Event)"],
    ["DataStore", "EventService", "event saved", true], ["EventService", "NotificationService", "sendVoteRequest(eventId)"],
    ["NotificationService", "member:Member", "이벤트 투표 요청 알림", true], ["EventService", "EventUI", "event open", true],
    ["EventUI", "admin:Administrator", "이벤트 카드 표시", true],
  ]],
  ["03_10_vote_event_sequence.svg", "3.10 Vote Event", [["actor", "member:Member"], ["participant", "EventUI"], ["participant", "EventService"], ["participant", "DataStore"]], [
    ["member:Member", "EventUI", "참여/불참 선택"], ["EventUI", "EventUI", "submitVote(voteStatus)"],
    ["EventUI", "EventService", "vote(eventId, memberId, voteStatus)"], ["EventService", "DataStore", "save(Vote)"],
    ["DataStore", "EventService", "vote saved", true], ["EventService", "EventUI", "vote success", true],
    ["EventUI", "member:Member", "투표 완료 상태 표시", true],
  ]],
  ["03_11_alert_vote_sequence.svg", "3.11 Alert Vote", [["participant", "EventService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "member:Member"]], [
    ["EventService", "DataStore", "findAll(eventId)"], ["DataStore", "EventService", "vote list", true],
    ["EventService", "EventService", "filter NOT_RESPONDED members"], ["fragment", "alt 미투표자 존재"],
    ["EventService", "NotificationService", "sendVoteReminder(eventId)"], ["NotificationService", "member:Member", "투표 리마인드 알림", true],
    ["fragment", "else 모든 멤버 투표 완료"], ["EventService", "EventService", "skip reminder"], ["fragment", "end"],
  ]],
  ["03_12_decide_event_sequence.svg", "3.12 Decide Event", [["actor", "admin:Administrator"], ["participant", "EventUI"], ["participant", "EventService"], ["participant", "DataStore"]], [
    ["admin:Administrator", "EventUI", "투표 마감 또는 결과 확인"], ["EventUI", "EventUI", "requestDecision(eventId)"],
    ["EventUI", "EventService", "decideEvent(eventId)"], ["EventService", "DataStore", "findAll(eventId)"],
    ["DataStore", "EventService", "vote result", true], ["EventService", "EventService", "count attend and absent"],
    ["fragment", "alt 참여자 1명 이상"], ["EventService", "DataStore", "update(Event CLOSED)"],
    ["EventService", "EventUI", "showEventResult(CLOSED)", true], ["fragment", "else 참여자 없음"],
    ["EventService", "DataStore", "update(Event CANCELED)"], ["EventService", "EventUI", "showEventResult(CANCELED)", true], ["fragment", "end"],
  ]],
  ["03_13_create_team_workspace_sequence.svg", "3.13 Create Team Workspace", [["participant", "EventService"], ["participant", "WorkspaceService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "member:Member"]], [
    ["EventService", "DataStore", "findAll(ATTEND votes)"], ["DataStore", "EventService", "attendee list", true],
    ["EventService", "WorkspaceService", "createWorkspace(eventId, attendees)"], ["WorkspaceService", "DataStore", "save(TeamWorkspace)"],
    ["DataStore", "WorkspaceService", "workspace saved", true], ["WorkspaceService", "NotificationService", "sendWorkspaceNotice(workspaceId)"],
    ["NotificationService", "member:Member", "참여자 전용 워크스페이스 알림", true],
  ]],
  ["03_14_manage_team_workspace_sequence.svg", "3.14 Manage Team Workspace", [["actor", "sender:Member"], ["participant", "WorkspaceUI"], ["participant", "WorkspaceService"], ["participant", "DataStore"], ["participant", "NotificationService"], ["actor", "recipient:Member"]], [
    ["sender:Member", "WorkspaceUI", "메시지 입력 후 전송"], ["WorkspaceUI", "WorkspaceUI", "submitMessage(message)"],
    ["WorkspaceUI", "WorkspaceService", "sendMessage(workspaceId, memberId, message)"], ["WorkspaceService", "DataStore", "save(message)"],
    ["DataStore", "WorkspaceService", "save success", true], ["WorkspaceService", "NotificationService", "sendWorkspaceNotice(workspaceId)"],
    ["NotificationService", "recipient:Member", "새 메시지 알림", true], ["WorkspaceService", "WorkspaceUI", "message sent", true],
    ["WorkspaceUI", "sender:Member", "updateMessageList(message)", true],
  ]],
];

function renderSequence(title, participants, events) {
  participants = participants.map(([, name]) => ["participant", name]);
  const laneW = 230;
  const marginX = 110;
  const top = 62;
  const headH = 44;
  const xOf = new Map(participants.map(([, name], i) => [name, marginX + i * laneW]));
  const heights = events.map((e) => e[0] === "fragment" ? 42 : 72 + Math.max(0, wrap(e[2] || "", 24).length - 1) * 14);
  const height = top + headH + 95 + heights.reduce((a, b) => a + b, 0);
  const width = marginX * 2 + (participants.length - 1) * laneW + 150;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<text x="36" y="32" font-family="Arial, sans-serif" font-size="20" font-weight="700">${esc(title)}</text>`;
  const lifeTop = top + headH;
  const lifeBottom = height - 40;
  for (const [kind, name] of participants) {
    const x = xOf.get(name);
    if (kind === "actor") {
      svg += `<circle cx="${x}" cy="${top + 10}" r="10" fill="${nodeBg}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${top + 20}" x2="${x}" y2="${top + 42}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x - 16}" y1="${top + 28}" x2="${x + 16}" y2="${top + 28}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${top + 42}" x2="${x - 16}" y2="${top + 58}" stroke="#111827" stroke-width="1.3"/>
<line x1="${x}" y1="${top + 42}" x2="${x + 16}" y2="${top + 58}" stroke="#111827" stroke-width="1.3"/>
<text x="${x}" y="${top + 78}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13">${esc(name)}</text>`;
    } else {
      svg += `<rect x="${x - 84}" y="${top}" width="168" height="${headH}" fill="${nodeBg}" stroke="#111827" stroke-width="1.2"/>
<text x="${x}" y="${top + 27}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700">${esc(name)}</text>`;
    }
    svg += `<line x1="${x}" y1="${lifeTop}" x2="${x}" y2="${lifeBottom}" stroke="#111827" stroke-width="1" stroke-dasharray="6 6"/>`;
  }
  let y = lifeTop + 56;
  let fragmentLayer = "";
  let messageLayer = "";
  const fragStack = [];
  for (const e of events) {
    if (e[0] === "fragment") {
      const label = e[1];
      if (label.startsWith("alt")) {
        fragStack.push({ y, label, elseYs: [] });
      } else if (label.startsWith("else")) {
        const current = fragStack[fragStack.length - 1];
        if (current) current.elseYs.push({ y, label });
      } else if (label === "end" && fragStack.length) {
        const current = fragStack.pop();
        const topY = current.y - 25;
        const boxH = Math.max(70, y - topY + 8);
        fragmentLayer += `<rect x="${marginX - 36}" y="${topY}" width="${width - marginX - 52}" height="${boxH}" fill="none" stroke="#111827" stroke-dasharray="4 4"/>`;
        fragmentLayer += `<path d="M${marginX - 36} ${topY} h72 l-12 22 h-60 z" fill="${nodeBg}" stroke="#111827"/>`;
        fragmentLayer += labelText(marginX - 2, current.y - 10, current.label, { size: 12, max: 18, weight: "700" });
        for (const elseInfo of current.elseYs) {
          fragmentLayer += `<line x1="${marginX - 36}" y1="${elseInfo.y - 17}" x2="${width - 88}" y2="${elseInfo.y - 17}" stroke="#111827" stroke-dasharray="4 4"/>`;
          fragmentLayer += labelText(marginX + 16, elseInfo.y - 26, elseInfo.label, { size: 12, max: 20, weight: "700", anchor: "start" });
        }
      }
      y += 42;
      continue;
    }
    const [from, to, text, dashed = false] = e;
    const x1 = xOf.get(from);
    const x2 = xOf.get(to);
    const dash = dashed ? ' stroke-dasharray="5 4"' : "";
    if (x1 === x2) {
      messageLayer += `<path d="M${x1} ${y} h42 q18 0 18 18 q0 18 -18 18 h-42" fill="none" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"${dash}/>`;
      messageLayer += labelText(x1 + 54, y - 18, text, { anchor: "start", size: 12, max: 30 });
    } else {
      messageLayer += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"${dash}/>`;
      messageLayer += labelText((x1 + x2) / 2, y - 18, text, { size: 12, max: Math.max(16, Math.floor(Math.abs(x2 - x1) / 8)) });
    }
    y += 72 + Math.max(0, wrap(text, 24).length - 1) * 14;
  }
  return `${svg}${fragmentLayer}${messageLayer}</svg>`;
}

function renderStateMachine() {
  const width = 1540;
  const height = 1080;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<text x="40" y="34" font-family="Arial, sans-serif" font-size="22" font-weight="700">Jo:YUl State Machine Diagram</text>`;
  const regions = [
    ["Authentication", 40, 70, 430, 360],
    ["Team Management", 40, 470, 430, 270],
    ["Schedule Management", 520, 70, 430, 360],
    ["Task Management", 520, 470, 430, 360],
    ["Event / Workspace", 1000, 70, 480, 830],
  ];
  for (const [title, x, y, w, h] of regions) {
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${nodeBg}" stroke="#111827" stroke-width="1.1"/>`;
    svg += `<text x="${x + 12}" y="${y + 22}" font-family="Arial, sans-serif" font-size="14" font-weight="700">${esc(title)}</text>`;
  }
  const states = [
    ["LaunchSystem", 255, 130], ["WaitLoginInput", 255, 215], ["WaitLoginValidation", 255, 300], ["RegisterMember", 105, 215], ["WaitRegisterValidation", 105, 300], ["RegisterInformation", 105, 380], ["Home", 760, 130],
    ["TeamList", 255, 525], ["TeamCreating", 120, 650], ["MemberInviting", 330, 650],
    ["ScheduleEditing", 760, 215], ["ScheduleRecommending", 760, 300], ["ScheduleConfirmed", 760, 380],
    ["TaskViewing", 760, 525], ["TaskUploading", 650, 650], ["TaskSubmitted", 760, 735], ["TaskApproved", 640, 800], ["TaskRejected", 875, 800],
    ["EventVoting", 1240, 130], ["VoteReminderWaiting", 1115, 245], ["VoteSubmitted", 1360, 245], ["EventDeciding", 1360, 360], ["EventCanceled", 1120, 475], ["WorkspaceCreated", 1360, 475], ["WorkspaceManaging", 1360, 620],
  ];
  const pos = new Map(states.map(([n, x, y]) => [n, { x, y }]));
  function state(name, x, y) {
    svg += `<rect x="${x - 84}" y="${y - 24}" width="168" height="48" rx="18" fill="${nodeBg}" stroke="#111827" stroke-width="1.2"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700">${esc(name)}</text>`;
  }
  function edge(a, b, label, bend = 0) {
    const from = typeof a === "string" ? pos.get(a) : a;
    const to = typeof b === "string" ? pos.get(b) : b;
    if (!from || !to) return;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const x1 = from.x + (dx / len) * 84;
    const y1 = from.y + (dy / len) * 24;
    const x2 = to.x - (dx / len) * 84;
    const y2 = to.y - (dy / len) * 24;
    if (bend) {
      const mx = (x1 + x2) / 2 + bend;
      const my = (y1 + y2) / 2 - Math.abs(bend) * 0.2;
      svg += `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"/>`;
      svg += labelText(mx, my - 18, label, { size: 11, max: 14 });
    } else {
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"/>`;
      svg += labelText((x1 + x2) / 2, (y1 + y2) / 2 - 18, label, { size: 11, max: 14 });
    }
  }
  svg += `<circle cx="255" cy="95" r="10" fill="#111827"/>`;
  edge({ x: 255, y: 95 }, "LaunchSystem", "");
  edge("LaunchSystem", "WaitLoginInput", "로그인 화면");
  edge("LaunchSystem", "RegisterMember", "회원가입 선택");
  edge("RegisterMember", "WaitRegisterValidation", "입력 완료");
  edge("WaitRegisterValidation", "RegisterMember", "입력 오류", -45);
  edge("WaitRegisterValidation", "RegisterInformation", "Supabase 인증 성공");
  edge("RegisterInformation", "Home", "세션 생성", 40);
  edge("WaitLoginInput", "WaitLoginValidation", "로그인 입력");
  edge("WaitLoginValidation", "WaitLoginInput", "실패", 50);
  edge("WaitLoginValidation", "Home", "성공");
  edge("Home", "TeamList", "팀 목록");
  edge("TeamList", "TeamCreating", "팀 생성");
  edge("TeamCreating", "TeamList", "완료", -55);
  edge("TeamList", "MemberInviting", "멤버 초대");
  edge("MemberInviting", "TeamList", "완료", 55);
  edge("Home", "ScheduleEditing", "일정 탭");
  edge("ScheduleEditing", "ScheduleRecommending", "추천 요청");
  edge("ScheduleRecommending", "ScheduleConfirmed", "관리자 확정");
  edge("ScheduleConfirmed", "Home", "알림 후 복귀", 60);
  edge("Home", "TaskViewing", "과제 탭");
  edge("TaskViewing", "TaskUploading", "업로드");
  edge("TaskUploading", "TaskSubmitted", "제출 완료");
  edge("TaskSubmitted", "TaskApproved", "승인");
  edge("TaskSubmitted", "TaskRejected", "반려");
  edge("TaskRejected", "TaskUploading", "재제출", 50);
  edge("TaskApproved", "TaskViewing", "진행률 갱신", -40);
  edge("Home", "EventVoting", "이벤트 탭");
  edge("EventVoting", "VoteReminderWaiting", "미투표");
  edge("VoteReminderWaiting", "EventVoting", "리마인드", -50);
  edge("EventVoting", "VoteSubmitted", "참여/불참");
  edge("VoteSubmitted", "EventDeciding", "투표 마감");
  edge("EventDeciding", "EventCanceled", "[참여자 없음]");
  edge("EventDeciding", "WorkspaceCreated", "[참여자 있음]");
  edge("WorkspaceCreated", "WorkspaceManaging", "입장");
  edge("WorkspaceManaging", "Home", "작업 종료", 110);
  svg += `<circle cx="1240" cy="840" r="13" fill="${nodeBg}" stroke="#111827" stroke-width="1.4"/><circle cx="1240" cy="840" r="8" fill="#111827"/>`;
  edge("EventCanceled", { x: 1240, y: 840 }, "이벤트 취소");
  edge("Home", { x: 1240, y: 840 }, "로그아웃/종료", 70);
  states.forEach(([n, x, y]) => state(n, x, y));
  return `${svg}</svg>`;
}

writeSvg("02_class_diagram.svg", renderClassDiagram());
for (const [file, title, participants, events] of sequenceFiles) {
  writeSvg(file, renderSequence(title, participants, events));
}
writeSvg("04_state_machine_diagram.svg", renderStateMachine());
console.log("Regenerated UML class, sequence, and state machine diagrams.");
