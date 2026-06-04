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
  const boxW = 270;
  const classes = [
    { n: "LoginUI", s: "boundary", x: 60, y: 95, a: [], o: ["+requestLogin()", "+openRegisterUI()", "+showError()"] },
    { n: "RegisterUI", s: "boundary", x: 60, y: 250, a: [], o: ["+submitRegister()", "+showSuccess()", "+showError()"] },
    { n: "HomeUI", s: "boundary", x: 60, y: 405, a: [], o: ["+showHome()", "+updateTeamList()"] },
    { n: "TeamUI", s: "boundary", x: 60, y: 550, a: [], o: ["+submitTeamData()", "+selectInviteMember()", "+showInviteResult()"] },
    { n: "ScheduleUI", s: "boundary", x: 60, y: 715, a: [], o: ["+selectUnavailableTime()", "+requestRecommendation()", "+confirmSchedule()"] },
    { n: "TaskBoardUI", s: "boundary", x: 60, y: 880, a: [], o: ["+requestUpload()", "+showSubmissionDetail()", "+requestApproval()"] },
    { n: "EventUI", s: "boundary", x: 60, y: 1045, a: [], o: ["+submitEventData()", "+submitVote()", "+requestDecision()"] },
    { n: "WorkspaceUI", s: "boundary", x: 60, y: 1210, a: [], o: ["+submitMessage()", "+updateMessageList()"] },

    { n: "AuthService", s: "control", x: 430, y: 115, a: [], o: ["+registerMember()", "+login()", "+validateInput()", "+createMemberProfile()"] },
    { n: "TeamService", s: "control", x: 430, y: 340, a: [], o: ["+createTeam()", "+inviteMember()"] },
    { n: "ScheduleService", s: "control", x: 430, y: 555, a: [], o: ["+saveUnavailableTime()", "+recommendTime()", "+confirmSchedule()"] },
    { n: "TaskService", s: "control", x: 430, y: 770, a: [], o: ["+uploadSubmission()", "+approveSubmission()", "+rejectSubmission()", "+calculateProgress()"] },
    { n: "EventService", s: "control", x: 430, y: 1005, a: [], o: ["+createEvent()", "+vote()", "+decideEvent()"] },
    { n: "WorkspaceService", s: "control", x: 430, y: 1215, a: [], o: ["+createWorkspace()", "+sendMessage()"] },

    { n: "SupabaseAuthClient", s: "control", x: 805, y: 115, a: ["-supabaseUrl", "-anonKey"], o: ["+signUp()", "+signIn()", "+handleAuthResponse()"] },
    { n: "SupabaseAuthAPI", s: "external", x: 805, y: 315, a: [], o: ["+signUpEndpoint()", "+passwordLoginEndpoint()", "+returnSession()"] },
    { n: "NotificationService", s: "control", x: 805, y: 515, a: [], o: ["+sendInvite()", "+sendVoteRequest()", "+sendVoteReminder()", "+sendWorkspaceNotice()"] },
    { n: "DataStore", s: "storage", x: 805, y: 765, a: [], o: ["+save()", "+findById()", "+findAll()", "+update()"] },
    { n: "FileStorage", s: "storage", x: 805, y: 1010, a: [], o: ["+upload()"] },

    { n: "Member", s: "entity", x: 1205, y: 95, a: ["+memberId", "+supabaseUserId", "+studentNo", "+name", "+email", "+role"], o: ["+joinTeam()", "+voteEvent()"] },
    { n: "Team", s: "entity", x: 1205, y: 335, a: ["+teamId", "+teamName", "+description", "+adminId", "+createdAt"], o: ["+addMember()", "+createTask()", "+createEvent()"] },
    { n: "ScheduleBlock", s: "entity", x: 1205, y: 585, a: ["+scheduleId", "+teamId", "+memberId", "+day", "+startTime", "+endTime"], o: ["+overlaps()"] },
    { n: "Task", s: "entity", x: 1205, y: 815, a: ["+taskId", "+teamId", "+title", "+assigneeId", "+dueDate", "+status"], o: ["+submit()", "+approve()", "+reject()"] },
    { n: "Event", s: "entity", x: 1205, y: 1060, a: ["+eventId", "+teamId", "+title", "+voteDeadline", "+status"], o: ["+closeVote()", "+cancel()"] },
    { n: "TeamWorkspace", s: "entity", x: 1205, y: 1275, a: ["+workspaceId", "+eventId", "+workspaceName", "+createdAt"], o: ["+addParticipant()", "+postMessage()"] },

    { n: "TeamMember", s: "entity", x: 1585, y: 335, a: ["+teamMemberId", "+teamId", "+memberId", "+joinedAt"], o: ["+assignRole()"] },
    { n: "Submission", s: "entity", x: 1585, y: 815, a: ["+submissionId", "+taskId", "+memberId", "+fileUrl", "+status", "+submittedAt"], o: ["+markApproved()", "+markRejected()"] },
    { n: "Vote", s: "entity", x: 1585, y: 1060, a: ["+voteId", "+eventId", "+memberId", "+status", "+votedAt"], o: ["+submit()"] },
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
    boxes += `<rect x="${c.x}" y="${c.y}" width="${boxW}" height="${h}" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
    boxes += `<line x1="${c.x}" y1="${c.y + headerH}" x2="${c.x + boxW}" y2="${c.y + headerH}" stroke="#111827"/>`;
    boxes += `<line x1="${c.x}" y1="${c.y + headerH + attrH}" x2="${c.x + boxW}" y2="${c.y + headerH + attrH}" stroke="#111827"/>`;
    boxes += `<text x="${c.x + boxW / 2}" y="${c.y + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#475569">&lt;&lt;${c.s}&gt;&gt;</text>`;
    boxes += `<text x="${c.x + boxW / 2}" y="${c.y + 32}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#111827">${c.n}</text>`;
    c.a.forEach((a, i) => boxes += `<text x="${c.x + 10}" y="${c.y + headerH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11">${esc(a)}</text>`);
    c.o.forEach((o, i) => boxes += `<text x="${c.x + 10}" y="${c.y + headerH + attrH + 17 + i * lineH}" font-family="Consolas, monospace" font-size="11">${esc(o)}</text>`);
  }
  const width = 1925;
  const height = 1495;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="#111827" stroke-width="1"/>
<path d="M18 18 H190 L214 42 V58 H18 Z" fill="#fffef9" stroke="#111827" stroke-width="1"/>
<text x="36" y="39" font-family="Arial, sans-serif" font-size="13">class</text>
<text x="78" y="39" font-family="Arial, sans-serif" font-size="13" font-weight="700">Jo:YUl Design</text>`;
  let relations = "";

  function p(name, side = "right") {
    const n = nodes.get(name);
    if (side === "left") return { x: n.x, y: n.y + n.h / 2 };
    if (side === "top") return { x: n.x + n.w / 2, y: n.y };
    if (side === "bottom") return { x: n.x + n.w / 2, y: n.y + n.h };
    return { x: n.x + n.w, y: n.y + n.h / 2 };
  }
  function route(a, b, type = "dep", label = "", opts = {}) {
    const from = p(a, opts.from || "right");
    const to = p(b, opts.to || "left");
    const midX = opts.midX ?? (from.x + to.x) / 2;
    const midY = opts.midY ?? (from.y + to.y) / 2;
    const dashed = type === "dep" ? ' stroke-dasharray="5 4"' : "";
    const markerStart = type === "comp" ? ' marker-start="url(#diamond)"' : "";
    const markerEnd = type === "dep" || type === "gen" ? ' marker-end="url(#hollowArrow)"' : "";
    const d = opts.d || (opts.vertical
      ? `M${from.x} ${from.y} V${midY} H${to.x} V${to.y}`
      : `M${from.x} ${from.y} H${midX} V${to.y} H${to.x}`);
    relations += `<path d="${d}" fill="none" stroke="#111827" stroke-width="1.05"${dashed}${markerStart}${markerEnd}/>`;
    if (label) relations += labelText(opts.labelX ?? midX, opts.labelY ?? midY, label, { size: 11, max: 8 });
  }

  [
    ["LoginUI", "AuthService"], ["RegisterUI", "AuthService"],
    ["HomeUI", "TeamService"], ["TeamUI", "TeamService"],
    ["ScheduleUI", "ScheduleService"], ["TaskBoardUI", "TaskService"],
    ["EventUI", "EventService"], ["WorkspaceUI", "WorkspaceService"],
    ["AuthService", "SupabaseAuthClient"],
    ["TaskService", "FileStorage"],
  ].forEach(([a, b]) => route(a, b, "dep"));
  route("SupabaseAuthClient", "SupabaseAuthAPI", "dep", "", { from: "bottom", to: "top", vertical: true, midY: 292 });

  route("Team", "TeamMember", "comp", "", { d: "M1475 410 H1530 V410.5 H1585" });
  route("Team", "ScheduleBlock", "comp", "", { from: "bottom", to: "top", vertical: true, midY: 558 });
  route("Team", "Task", "comp", "", { d: "M1475 470 H1510 V815 H1340" });
  route("Team", "Event", "comp", "", { d: "M1475 505 H1525 V1060 H1340" });
  route("Task", "Submission", "comp");
  route("Event", "Vote", "comp");
  route("Event", "TeamWorkspace", "comp", "", { from: "bottom", to: "top", vertical: true, midY: 1262 });

  function multiplicity(x, y, text, anchor = "middle") {
    relations += `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="11" fill="#111827">${text}</text>`;
  }
  multiplicity(1494, 400, "1");
  multiplicity(1568, 400, "1..*");
  multiplicity(1362, 578, "*");
  multiplicity(1362, 808, "*");
  multiplicity(1362, 1053, "*");
  multiplicity(1494, 913, "1");
  multiplicity(1569, 910, "*");
  multiplicity(1494, 1144, "1");
  multiplicity(1569, 1138, "*");
  multiplicity(1322, 1258, "1");
  multiplicity(1378, 1269, "0..1");
  return `${svg}${boxes}${relations}</svg>`;
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
  const externalLifelines = new Set([
    "member:Member",
    "admin:Administrator",
    "invitee:Member",
    "sender:Member",
    "recipient:Member",
  ]);
  participants = participants
    .filter(([, name]) => !externalLifelines.has(name))
    .map(([, name]) => ["participant", name]);
  events = events.filter((event) => {
    if (event[0] === "fragment") return true;
    return !externalLifelines.has(event[0]) && !externalLifelines.has(event[1]);
  });
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
  const width = 2100;
  const height = 1620;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="#111827" stroke-width="1"/>
<path d="M18 18 H220 L244 42 V58 H18 Z" fill="#fffef9" stroke="#111827" stroke-width="1"/>
<text x="36" y="39" font-family="Arial, sans-serif" font-size="13">stm</text>
<text x="78" y="39" font-family="Arial, sans-serif" font-size="13" font-weight="700">Jo:YUl Application</text>`;
  const regions = [
    ["Authentication", 60, 88, 890, 420],
    ["Team Management", 60, 595, 420, 345],
    ["Schedule Management", 540, 595, 420, 345],
    ["Task Management", 1020, 595, 540, 435],
    ["Event / Workspace", 60, 1080, 1540, 430],
  ];
  for (const [title, x, y, w, h] of regions) {
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#fffef9" stroke="#111827" stroke-width="1.1"/>`;
    svg += `<line x1="${x}" y1="${y + 32}" x2="${x + w}" y2="${y + 32}" stroke="#111827" stroke-width="1"/>`;
    svg += `<text x="${x + 12}" y="${y + 22}" font-family="Arial, sans-serif" font-size="14" font-weight="700">${esc(title)}</text>`;
  }
  const pos = new Map();
  let stateLayer = "";
  function addState(name, x, y, w = 170, h = 52) {
    pos.set(name, { x, y, w, h });
    stateLayer += `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="16" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
    stateLayer += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700">${esc(name)}</text>`;
  }
  [
    ["LaunchSystem", 210, 160],
    ["WaitLoginInput", 210, 300],
    ["WaitLoginValidation", 465, 300],
    ["RegisterMember", 210, 435],
    ["WaitRegisterValidation", 465, 435],
    ["RegisterInformation", 725, 300],
    ["Home", 1080, 180],
    ["TeamList", 260, 670],
    ["TeamCreating", 170, 845],
    ["MemberInviting", 355, 845],
    ["ScheduleEditing", 750, 670],
    ["ScheduleRecommending", 750, 785],
    ["ScheduleConfirmed", 750, 900],
    ["TaskViewing", 1280, 670],
    ["TaskUploading", 1160, 810],
    ["TaskSubmitted", 1390, 810],
    ["TaskApproved", 1160, 970],
    ["TaskRejected", 1440, 970],
    ["EventVoting", 210, 1230],
    ["VoteReminderWaiting", 210, 1410],
    ["VoteSubmitted", 520, 1230],
    ["EventDeciding", 800, 1230],
    ["EventCanceled", 1030, 1410],
    ["WorkspaceCreated", 1295, 1230],
    ["WorkspaceManaging", 1295, 1410],
  ].forEach(([name, x, y]) => addState(name, x, y));
  pos.set("Initial", { x: 105, y: 160, w: 20, h: 20 });
  pos.set("TaskDecision", { x: 1280, y: 900, w: 34, h: 34 });
  pos.set("EventDecision", { x: 1030, y: 1230, w: 34, h: 34 });
  pos.set("Final", { x: 1920, y: 180, w: 26, h: 26 });
  function port(node, side) {
    if (side === "left") return { x: node.x - node.w / 2, y: node.y };
    if (side === "right") return { x: node.x + node.w / 2, y: node.y };
    if (side === "top") return { x: node.x, y: node.y - node.h / 2 };
    return { x: node.x, y: node.y + node.h / 2 };
  }
  function edge(a, b, label = "", opts = {}) {
    const from = typeof a === "string" ? pos.get(a) : a;
    const to = typeof b === "string" ? pos.get(b) : b;
    if (!from || !to) return;
    const start = port(from, opts.from || "right");
    const end = port(to, opts.to || "left");
    const midX = opts.midX ?? (start.x + end.x) / 2;
    const midY = opts.midY ?? (start.y + end.y) / 2;
    const d = opts.d || (opts.vertical
      ? `M${start.x} ${start.y} V${midY} H${end.x} V${end.y}`
      : `M${start.x} ${start.y} H${midX} V${end.y} H${end.x}`);
    svg += `<path d="${d}" fill="none" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"/>`;
    if (label) {
      svg += labelText(opts.labelX ?? midX, opts.labelY ?? (midY - 18), label, {
        anchor: opts.anchor || "middle",
        size: 11,
        max: opts.max || 22,
      });
    }
  }

  svg += `<circle cx="105" cy="160" r="10" fill="#111827"/>`;
  svg += `<path d="M1280 883 L1297 900 L1280 917 L1263 900 Z" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
  svg += `<path d="M1030 1213 L1047 1230 L1030 1247 L1013 1230 Z" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
  svg += `<circle cx="1920" cy="180" r="14" fill="#fffef9" stroke="#111827" stroke-width="1.4"/><circle cx="1920" cy="180" r="8" fill="#111827"/>`;

  edge("Initial", "LaunchSystem", "", { from: "right", to: "left" });
  edge("LaunchSystem", "WaitLoginInput", "show login", { from: "bottom", to: "top", vertical: true, midY: 230, labelX: 270, labelY: 232 });
  edge("LaunchSystem", "RegisterMember", "select sign up", { from: "left", to: "left", d: "M125 160 H112 V435 H125", labelX: 166, labelY: 348 });
  edge("WaitLoginInput", "WaitLoginValidation", "submit login", { from: "right", to: "left", labelY: 275 });
  edge("WaitLoginValidation", "WaitLoginInput", "[failure]", { from: "bottom", to: "bottom", d: "M465 326 V365 H210 V326", labelX: 355, labelY: 382 });
  edge("WaitLoginValidation", "Home", "[success]", { from: "right", to: "left", d: "M550 300 H620 V250 H995", labelX: 780, labelY: 238 });
  edge("RegisterMember", "WaitRegisterValidation", "submit data", { from: "right", to: "left", labelY: 410 });
  edge("WaitRegisterValidation", "RegisterMember", "[invalid]", { from: "top", to: "right", d: "M465 409 V380 H300 V435 H295", labelX: 390, labelY: 372 });
  edge("WaitRegisterValidation", "RegisterInformation", "[valid]", { from: "top", to: "bottom", d: "M465 409 V372 H725 V326", labelX: 595, labelY: 362 });
  edge("RegisterInformation", "Home", "session created", { from: "right", to: "left", d: "M810 300 H925 V180 H995", labelX: 900, labelY: 160 });
  edge("Home", "Final", "logout / exit", { from: "right", to: "left", labelX: 1610, labelY: 160 });

  edge("Home", "TeamList", "team tab", { from: "bottom", to: "top", d: "M1080 206 V545 H260 V644", labelX: 640, labelY: 528 });
  edge("Home", "ScheduleEditing", "schedule tab", { from: "bottom", to: "top", d: "M1080 206 V525 H750 V644", labelX: 860, labelY: 510 });
  edge("Home", "TaskViewing", "task tab", { from: "bottom", to: "top", d: "M1080 206 V505 H1280 V644", labelX: 1220, labelY: 488 });
  edge("Home", "EventVoting", "event tab", { from: "left", to: "top", d: "M995 180 H40 V1230 H125", labelX: 86, labelY: 1025 });

  edge("TeamList", "TeamCreating", "create", { from: "bottom", to: "top", d: "M235 696 V760 H170 V819", labelX: 138, labelY: 754 });
  edge("TeamCreating", "TeamList", "done", { from: "top", to: "bottom", d: "M145 819 V735 H235 V696", labelX: 115, labelY: 728 });
  edge("TeamList", "MemberInviting", "invite", { from: "bottom", to: "top", d: "M285 696 V760 H355 V819", labelX: 378, labelY: 754 });
  edge("MemberInviting", "TeamList", "done", { from: "top", to: "bottom", d: "M380 819 V735 H285 V696", labelX: 405, labelY: 728 });

  edge("ScheduleEditing", "ScheduleRecommending", "recommend", { from: "bottom", to: "top", vertical: true, midY: 730, labelX: 650, labelY: 730 });
  edge("ScheduleRecommending", "ScheduleConfirmed", "confirm", { from: "bottom", to: "top", vertical: true, midY: 845, labelX: 650, labelY: 845 });
  edge("ScheduleConfirmed", "Home", "return", { from: "right", to: "bottom", d: "M835 900 H970 V206 H1080", labelX: 988, labelY: 610 });

  edge("TaskViewing", "TaskUploading", "upload", { from: "bottom", to: "top", d: "M1280 696 V745 H1160 V784", labelX: 1200, labelY: 738 });
  edge("TaskUploading", "TaskSubmitted", "submitted", { from: "right", to: "left", labelY: 780 });
  edge("TaskSubmitted", "TaskDecision", "review", { from: "bottom", to: "top", d: "M1390 836 V865 H1280 V883", labelX: 1405, labelY: 864 });
  edge("TaskDecision", "TaskApproved", "[approved]", { from: "left", to: "top", d: "M1263 900 H1160 V944", labelX: 1198, labelY: 890 });
  edge("TaskDecision", "TaskRejected", "[rejected]", { from: "right", to: "top", d: "M1297 900 H1440 V944", labelX: 1390, labelY: 890 });
  edge("TaskRejected", "TaskUploading", "resubmit", { from: "bottom", to: "left", d: "M1440 996 V1010 H1045 V810 H1075", labelX: 1240, labelY: 1025 });
  edge("TaskApproved", "TaskViewing", "progress updated", { from: "left", to: "top", d: "M1075 970 H1045 V620 H1280 V644", labelX: 1120, labelY: 620 });

  edge("EventVoting", "VoteSubmitted", "attend / absent", { from: "right", to: "left", labelY: 1202 });
  edge("EventVoting", "VoteReminderWaiting", "not responded", { from: "bottom", to: "top", vertical: true, midY: 1320, labelX: 112, labelY: 1320 });
  edge("VoteReminderWaiting", "EventVoting", "reminder", { from: "right", to: "right", d: "M295 1410 H360 V1230 H295", labelX: 385, labelY: 1325 });
  edge("VoteSubmitted", "EventDeciding", "deadline", { from: "right", to: "left", labelY: 1202 });
  edge("EventDeciding", "EventDecision", "count votes", { from: "right", to: "left", labelY: 1202 });
  edge("EventDecision", "EventCanceled", "[no attendee]", { from: "bottom", to: "top", vertical: true, midY: 1320, labelX: 930, labelY: 1320 });
  edge("EventDecision", "WorkspaceCreated", "[attendee exists]", { from: "right", to: "left", labelY: 1202 });
  edge("WorkspaceCreated", "WorkspaceManaging", "enter", { from: "bottom", to: "top", vertical: true, midY: 1320, labelX: 1225, labelY: 1320 });
  edge("WorkspaceManaging", "Home", "work finished", { from: "right", to: "right", d: "M1380 1410 H1660 V180 H1165", labelX: 1725, labelY: 835 });
  edge("EventCanceled", "Final", "cancel", { from: "bottom", to: "bottom", d: "M1030 1436 V1530 H1920 V194", labelX: 1730, labelY: 1545 });
  return `${svg}${stateLayer}</svg>`;
}

function renderStateMachineNoOverlap() {
  const width = 1700;
  const height = 1500;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${markerDefs()}
<rect width="100%" height="100%" fill="${diagramBg}"/>
<rect x="18" y="18" width="${width - 36}" height="${height - 36}" fill="none" stroke="#111827" stroke-width="1"/>
<path d="M18 18 H220 L244 42 V58 H18 Z" fill="#fffef9" stroke="#111827" stroke-width="1"/>
<text x="36" y="39" font-family="Arial, sans-serif" font-size="13">stm</text>
<text x="78" y="39" font-family="Arial, sans-serif" font-size="13" font-weight="700">Jo:YUl Application</text>`;
  const regions = [
    ["Authentication", 60, 88, 1500, 360],
    ["Team Management", 60, 515, 430, 330],
    ["Schedule Management", 535, 515, 430, 330],
    ["Task Management", 1010, 515, 550, 430],
    ["Event / Workspace", 60, 970, 1500, 400],
  ];
  for (const [title, x, y, w, h] of regions) {
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#fffef9" stroke="#111827" stroke-width="1.1"/>`;
    svg += `<line x1="${x}" y1="${y + 32}" x2="${x + w}" y2="${y + 32}" stroke="#111827" stroke-width="1"/>`;
    svg += `<text x="${x + 12}" y="${y + 22}" font-family="Arial, sans-serif" font-size="14" font-weight="700">${esc(title)}</text>`;
  }
  const pos = new Map();
  let stateLayer = "";
  function addState(name, x, y, w = 170, h = 52) {
    pos.set(name, { x, y, w, h });
    stateLayer += `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="16" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
    stateLayer += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700">${esc(name)}</text>`;
  }
  function addInitial(name, x, y) {
    pos.set(name, { x, y, w: 20, h: 20 });
    stateLayer += `<circle cx="${x}" cy="${y}" r="10" fill="#111827"/>`;
  }
  function addFinal(name, x, y) {
    pos.set(name, { x, y, w: 28, h: 28 });
    stateLayer += `<circle cx="${x}" cy="${y}" r="14" fill="#fffef9" stroke="#111827" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="8" fill="#111827"/>`;
  }
  function addDecision(name, x, y) {
    pos.set(name, { x, y, w: 34, h: 34 });
    stateLayer += `<path d="M${x} ${y - 17} L${x + 17} ${y} L${x} ${y + 17} L${x - 17} ${y} Z" fill="#fffef9" stroke="#111827" stroke-width="1.2"/>`;
  }
  [
    ["LaunchSystem", 210, 160],
    ["WaitLoginInput", 210, 300],
    ["WaitLoginValidation", 465, 300],
    ["RegisterMember", 210, 435],
    ["WaitRegisterValidation", 465, 435],
    ["RegisterInformation", 735, 300],
    ["Home", 1215, 190],
    ["TeamList", 250, 650],
    ["TeamCreating", 165, 790],
    ["MemberInviting", 365, 790],
    ["ScheduleEditing", 750, 625],
    ["ScheduleRecommending", 750, 725],
    ["ScheduleConfirmed", 750, 815],
    ["TaskViewing", 1265, 625],
    ["TaskUploading", 1135, 765],
    ["TaskSubmitted", 1400, 765],
    ["TaskApproved", 1135, 885],
    ["TaskRejected", 1435, 885],
    ["EventVoting", 210, 1100],
    ["VoteReminderWaiting", 210, 1255],
    ["VoteSubmitted", 500, 1100],
    ["EventDeciding", 765, 1100],
    ["EventCanceled", 1010, 1255],
    ["WorkspaceCreated", 1250, 1100],
    ["WorkspaceManaging", 1250, 1255],
  ].forEach(([name, x, y]) => addState(name, x, y));
  addInitial("Initial", 105, 160);
  addFinal("Final", 1465, 190);
  addInitial("TeamStart", 105, 650);
  addInitial("ScheduleStart", 585, 625);
  addInitial("TaskStart", 1055, 625);
  addInitial("EventStart", 105, 1100);
  addFinal("ScheduleEnd", 900, 815);
  addDecision("TaskDecision", 1265, 835);
  addFinal("TaskEnd", 1515, 625);
  addDecision("EventDecision", 1000, 1100);
  addFinal("EventEnd", 1450, 1255);
  function port(node, side) {
    if (side === "left") return { x: node.x - node.w / 2, y: node.y };
    if (side === "right") return { x: node.x + node.w / 2, y: node.y };
    if (side === "top") return { x: node.x, y: node.y - node.h / 2 };
    return { x: node.x, y: node.y + node.h / 2 };
  }
  function edge(a, b, label = "", opts = {}) {
    const from = typeof a === "string" ? pos.get(a) : a;
    const to = typeof b === "string" ? pos.get(b) : b;
    if (!from || !to) return;
    const start = port(from, opts.from || "right");
    const end = port(to, opts.to || "left");
    const midX = opts.midX ?? (start.x + end.x) / 2;
    const midY = opts.midY ?? (start.y + end.y) / 2;
    const d = opts.d || (opts.vertical
      ? `M${start.x} ${start.y} V${midY} H${end.x} V${end.y}`
      : `M${start.x} ${start.y} H${midX} V${end.y} H${end.x}`);
    svg += `<path d="${d}" fill="none" stroke="#111827" stroke-width="1.05" marker-end="url(#arrow)"/>`;
    if (label) {
      svg += labelText(opts.labelX ?? midX, opts.labelY ?? (midY - 18), label, {
        anchor: opts.anchor || "middle",
        size: 11,
        max: opts.max || 22,
      });
    }
  }

  edge("Initial", "LaunchSystem", "", { from: "right", to: "left" });
  edge("LaunchSystem", "WaitLoginInput", "show login", { from: "bottom", to: "top", vertical: true, midY: 230, labelX: 270, labelY: 232 });
  edge("LaunchSystem", "RegisterMember", "select sign up", { from: "left", to: "left", d: "M125 160 H112 V435 H125", labelX: 166, labelY: 348 });
  edge("WaitLoginInput", "WaitLoginValidation", "submit login", { from: "right", to: "left", labelY: 275 });
  edge("WaitLoginValidation", "WaitLoginInput", "[failure]", { from: "bottom", to: "bottom", d: "M465 326 V365 H210 V326", labelX: 355, labelY: 392 });
  edge("WaitLoginValidation", "Home", "[success]", { from: "right", to: "left", d: "M550 300 H610 V250 H1130", labelX: 815, labelY: 238 });
  edge("RegisterMember", "WaitRegisterValidation", "submit data", { from: "right", to: "left", labelY: 410 });
  edge("WaitRegisterValidation", "RegisterMember", "[invalid]", { from: "top", to: "right", d: "M465 409 V380 H300 V435 H295", labelX: 430, labelY: 360 });
  edge("WaitRegisterValidation", "RegisterInformation", "[valid]", { from: "top", to: "bottom", d: "M465 409 V372 H735 V326", labelX: 605, labelY: 362 });
  edge("RegisterInformation", "Home", "session created", { from: "right", to: "left", d: "M820 300 H1035 V190 H1130", labelX: 1000, labelY: 175 });
  edge("Home", "Final", "logout / exit", { from: "right", to: "left", labelX: 1340, labelY: 170 });

  edge("TeamStart", "TeamList", "team tab", { from: "right", to: "left", labelY: 626 });
  edge("TeamList", "TeamCreating", "create", { from: "bottom", to: "top", d: "M220 676 V730 H165 V764", labelX: 140, labelY: 720 });
  edge("TeamCreating", "TeamList", "done", { from: "top", to: "bottom", d: "M145 764 V710 H220 V676", labelX: 115, labelY: 700 });
  edge("TeamList", "MemberInviting", "invite", { from: "bottom", to: "top", d: "M280 676 V730 H365 V764", labelX: 392, labelY: 720 });
  edge("MemberInviting", "TeamList", "done", { from: "top", to: "bottom", d: "M390 764 V710 H280 V676", labelX: 418, labelY: 700 });

  edge("ScheduleStart", "ScheduleEditing", "schedule tab", { from: "right", to: "left", labelY: 602 });
  edge("ScheduleEditing", "ScheduleRecommending", "recommend", { from: "bottom", to: "top", vertical: true, midY: 675, labelX: 650, labelY: 682 });
  edge("ScheduleRecommending", "ScheduleConfirmed", "confirm", { from: "bottom", to: "top", vertical: true, midY: 770, labelX: 650, labelY: 775 });
  edge("ScheduleConfirmed", "ScheduleEnd", "return home", { from: "right", to: "left", labelY: 790 });

  edge("TaskStart", "TaskViewing", "task tab", { from: "right", to: "left", labelY: 602 });
  edge("TaskViewing", "TaskUploading", "upload", { from: "bottom", to: "top", d: "M1265 651 V700 H1135 V739", labelX: 1180, labelY: 695 });
  edge("TaskUploading", "TaskSubmitted", "submitted", { from: "right", to: "left", labelY: 740 });
  edge("TaskSubmitted", "TaskDecision", "review", { from: "bottom", to: "right", d: "M1400 791 V805 H1282 V835", labelX: 1325, labelY: 800 });
  edge("TaskDecision", "TaskApproved", "[approved]", { from: "left", to: "top", d: "M1248 835 H1135 V859", labelX: 1195, labelY: 820 });
  edge("TaskDecision", "TaskRejected", "[rejected]", { from: "right", to: "top", d: "M1282 835 H1435 V859", labelX: 1468, labelY: 815, anchor: "start" });
  edge("TaskRejected", "TaskUploading", "resubmit", { from: "bottom", to: "left", d: "M1435 911 V925 H1080 V765 H1050", labelX: 1230, labelY: 940 });
  edge("TaskApproved", "TaskViewing", "progress updated", { from: "left", to: "top", d: "M1050 885 H1035 V585 H1265 V599", labelX: 1125, labelY: 580 });
  edge("TaskViewing", "TaskEnd", "back", { from: "right", to: "left", labelY: 602 });

  edge("EventStart", "EventVoting", "event tab", { from: "right", to: "left", labelY: 1076 });
  edge("EventVoting", "VoteSubmitted", "attend / absent", { from: "right", to: "left", labelY: 1076 });
  edge("EventVoting", "VoteReminderWaiting", "not responded", { from: "bottom", to: "top", vertical: true, midY: 1180, labelX: 112, labelY: 1185 });
  edge("VoteReminderWaiting", "EventVoting", "reminder", { from: "right", to: "right", d: "M295 1255 H355 V1100 H295", labelX: 382, labelY: 1188 });
  edge("VoteSubmitted", "EventDeciding", "deadline", { from: "right", to: "left", labelY: 1076 });
  edge("EventDeciding", "EventDecision", "count votes", { from: "right", to: "left", labelY: 1076 });
  edge("EventDecision", "EventCanceled", "[no attendee]", { from: "bottom", to: "top", vertical: true, midY: 1180, labelX: 900, labelY: 1185 });
  edge("EventDecision", "WorkspaceCreated", "[attendee exists]", { from: "right", to: "left", labelY: 1076 });
  edge("WorkspaceCreated", "WorkspaceManaging", "enter", { from: "bottom", to: "top", vertical: true, midY: 1180, labelX: 1170, labelY: 1185 });
  edge("WorkspaceManaging", "EventEnd", "work finished", { from: "right", to: "left", labelY: 1230 });
  edge("EventCanceled", "EventEnd", "cancel", { from: "bottom", to: "bottom", d: "M1010 1281 V1325 H1450 V1269", labelX: 1230, labelY: 1340 });
  return `${svg}${stateLayer}</svg>`;
}

writeSvg("02_class_diagram.svg", renderClassDiagram());
for (const [file, title, participants, events] of sequenceFiles) {
  writeSvg(file, renderSequence(title, participants, events));
}
writeSvg("04_state_machine_diagram.svg", renderStateMachineNoOverlap());
console.log("Regenerated UML class, sequence, and state machine diagrams.");
