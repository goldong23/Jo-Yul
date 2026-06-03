import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mdPath = path.join(root, "Design_22411923_홍주은.md");
const outDir = path.join(root, "design_diagrams");

fs.mkdirSync(outDir, { recursive: true });

const md = fs.readFileSync(mdPath, "utf8");
const mermaidBlocks = [...md.matchAll(/```mermaid\r?\n([\s\S]*?)\r?\n```/g)].map((m) => m[1]);
if (mermaidBlocks.length < 16) {
  throw new Error(`Expected at least 16 Mermaid blocks, found ${mermaidBlocks.length}`);
}

const sequenceNames = [
  "03_01_register_member_sequence",
  "03_02_login_sequence",
  "03_03_create_team_sequence",
  "03_04_invite_member_sequence",
  "03_05_input_schedule_sequence",
  "03_06_decide_schedule_sequence",
  "03_07_upload_task_sequence",
  "03_08_approve_task_sequence",
  "03_09_manage_event_notification_sequence",
  "03_10_vote_event_sequence",
  "03_11_alert_vote_sequence",
  "03_12_decide_event_sequence",
  "03_13_create_team_workspace_sequence",
  "03_14_manage_team_workspace_sequence",
];

const imageMap = [
  ["02_class_diagram.svg", "Class Diagram"],
  ...sequenceNames.map((name, index) => [`${name}.svg`, `Sequence Diagram ${index + 1}`]),
  ["04_state_machine_diagram.svg", "State Machine Diagram"],
];

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textLines(value, max = 24) {
  const result = [];
  let current = "";
  for (const part of String(value).split(/(\s+)/)) {
    const next = `${current}${part}`;
    if (next.length > max && current.trim()) {
      result.push(current.trim());
      current = part.trimStart();
    } else {
      current = next;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result.length ? result : [""];
}

function writeSvg(name, svg) {
  fs.writeFileSync(path.join(outDir, name), svg, "utf8");
}

function parseClasses(block) {
  const classes = [];
  const classMap = new Map();
  let current = null;
  for (const raw of block.split(/\r?\n/)) {
    const line = raw.trim();
    const classMatch = line.match(/^class\s+([A-Za-z0-9_]+)\s*\{/);
    if (classMatch) {
      current = { name: classMatch[1], members: [] };
      classes.push(current);
      classMap.set(current.name, current);
      continue;
    }
    if (current && line === "}") {
      current = null;
      continue;
    }
    if (current && line) {
      current.members.push(line.replace(/^\+/, "+ "));
    }
  }
  return classes;
}

function renderClassDiagram(block) {
  const classes = parseClasses(block);
  const groups = [
    ["UI Layer", ["LoginUI", "RegisterUI", "HomeUI", "TeamUI", "ScheduleUI", "TaskBoardUI", "EventUI", "WorkspaceUI"]],
    ["Service Layer", ["AuthService", "SupabaseAuthClient", "TeamService", "ScheduleService", "TaskService", "EventService", "WorkspaceService", "NotificationService"]],
    ["Domain / External / Storage", ["Member", "Team", "TeamMember", "ScheduleBlock", "Task", "Submission", "Event", "Vote", "TeamWorkspace", "DataStore", "FileStorage", "SupabaseAuthAPI"]],
  ];
  const byName = new Map(classes.map((c) => [c.name, c]));
  const boxW = 250;
  const gapX = 32;
  const gapY = 34;
  const headerH = 28;
  const lineH = 17;
  let y = 36;
  const nodes = [];

  for (const [group, names] of groups) {
    const available = names.filter((name) => byName.has(name));
    const cols = group.startsWith("Domain") ? 4 : 4;
    nodes.push({ kind: "group", title: group, x: 30, y, w: cols * boxW + (cols - 1) * gapX, h: 28 });
    y += 44;
    let rowMax = 0;
    available.forEach((name, index) => {
      const c = byName.get(name);
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = 30 + col * (boxW + gapX);
      const boxY = y + row * (rowMax + gapY);
      const h = headerH + Math.max(1, c.members.length) * lineH + 18;
      nodes.push({ kind: "class", ...c, x, y: boxY, w: boxW, h });
      rowMax = Math.max(rowMax, h);
    });
    const rows = Math.ceil(available.length / cols);
    y += rows * (rowMax + gapY) + 18;
  }

  const height = y + 40;
  const width = 30 + 4 * boxW + 3 * gapX + 30;
  const pos = new Map(nodes.filter((n) => n.kind === "class").map((n) => [n.name, n]));
  const relations = [
    ["LoginUI", "AuthService"], ["RegisterUI", "AuthService"], ["AuthService", "SupabaseAuthClient"],
    ["SupabaseAuthClient", "SupabaseAuthAPI"], ["AuthService", "Member"], ["AuthService", "DataStore"],
    ["HomeUI", "TeamUI"], ["TeamUI", "TeamService"], ["TeamService", "Team"], ["TeamService", "TeamMember"],
    ["ScheduleUI", "ScheduleService"], ["ScheduleService", "ScheduleBlock"], ["TaskBoardUI", "TaskService"],
    ["TaskService", "Task"], ["TaskService", "Submission"], ["TaskService", "FileStorage"],
    ["EventUI", "EventService"], ["EventService", "Event"], ["EventService", "Vote"],
    ["WorkspaceUI", "WorkspaceService"], ["WorkspaceService", "TeamWorkspace"],
    ["NotificationService", "Member"], ["NotificationService", "Team"], ["NotificationService", "Event"],
  ].filter(([a, b]) => pos.has(a) && pos.has(b));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#555"/>
  </marker>
</defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="30" y="28" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1f2937">Jo:YUl Class Diagram</text>`;

  for (const [a, b] of relations) {
    const from = pos.get(a);
    const to = pos.get(b);
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    svg += `<path d="M${x1} ${y1} C${x1} ${y1 + 28}, ${x2} ${y2 - 28}, ${x2} ${y2}" fill="none" stroke="#8b8b8b" stroke-width="1.2" marker-end="url(#arrow)" opacity="0.65"/>`;
  }

  for (const node of nodes) {
    if (node.kind === "group") {
      svg += `<text x="${node.x}" y="${node.y}" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#2563eb">${esc(node.title)}</text>`;
      continue;
    }
    svg += `<rect x="${node.x}" y="${node.y}" width="${node.w}" height="${node.h}" rx="6" fill="#f8fafc" stroke="#64748b" stroke-width="1.2"/>`;
    svg += `<rect x="${node.x}" y="${node.y}" width="${node.w}" height="${headerH}" rx="6" fill="#e0f2fe" stroke="#64748b" stroke-width="1.2"/>`;
    svg += `<text x="${node.x + node.w / 2}" y="${node.y + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#111827">${esc(node.name)}</text>`;
    svg += `<line x1="${node.x}" y1="${node.y + headerH}" x2="${node.x + node.w}" y2="${node.y + headerH}" stroke="#64748b" stroke-width="1"/>`;
    node.members.forEach((member, i) => {
      svg += `<text x="${node.x + 10}" y="${node.y + headerH + 18 + i * lineH}" font-family="Consolas, monospace" font-size="11.5" fill="#334155">${esc(member)}</text>`;
    });
  }
  return `${svg}</svg>`;
}

function parseSequence(block) {
  const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const participants = [];
  const seen = new Set();
  const events = [];
  for (const line of lines) {
    let m = line.match(/^(actor|participant)\s+([A-Za-z0-9_]+)/);
    if (m) {
      if (!seen.has(m[2])) {
        seen.add(m[2]);
        participants.push({ kind: m[1], name: m[2] });
      }
      continue;
    }
    m = line.match(/^([A-Za-z0-9_]+)\s*(-{1,2}>>|->>|-->>)\s*([A-Za-z0-9_]+)\s*:\s*(.+)$/);
    if (m) {
      events.push({ type: "message", from: m[1], arrow: m[2], to: m[3], label: m[4] });
      continue;
    }
    m = line.match(/^alt\s+(.+)$/);
    if (m) events.push({ type: "fragmentStart", label: `alt ${m[1]}` });
    m = line.match(/^else\s+(.+)$/);
    if (m) events.push({ type: "fragmentElse", label: `else ${m[1]}` });
    if (line === "end") events.push({ type: "fragmentEnd" });
  }
  return { participants, events };
}

function renderSequenceDiagram(block, title) {
  const { participants, events } = parseSequence(block);
  const laneW = 185;
  const marginX = 48;
  const top = 52;
  const headY = 60;
  const headH = 42;
  const stepY = 46;
  const width = marginX * 2 + Math.max(1, participants.length - 1) * laneW + 120;
  const height = top + headH + events.length * stepY + 110;
  const xOf = new Map(participants.map((p, i) => [p.name, marginX + i * laneW]));
  const lifelineTop = headY + headH;
  const lifelineBottom = height - 48;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#1f2937"/>
  </marker>
</defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="28" y="28" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#1f2937">${esc(title)}</text>`;

  for (const p of participants) {
    const x = xOf.get(p.name);
    if (p.kind === "actor") {
      svg += `<circle cx="${x}" cy="${headY + 10}" r="10" fill="#fff" stroke="#6d5dfc" stroke-width="1.5"/>
<line x1="${x}" y1="${headY + 20}" x2="${x}" y2="${headY + 42}" stroke="#6d5dfc" stroke-width="1.5"/>
<line x1="${x - 16}" y1="${headY + 28}" x2="${x + 16}" y2="${headY + 28}" stroke="#6d5dfc" stroke-width="1.5"/>
<line x1="${x}" y1="${headY + 42}" x2="${x - 16}" y2="${headY + 58}" stroke="#6d5dfc" stroke-width="1.5"/>
<line x1="${x}" y1="${headY + 42}" x2="${x + 16}" y2="${headY + 58}" stroke="#6d5dfc" stroke-width="1.5"/>
<text x="${x}" y="${headY + 78}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#111827">${esc(p.name)}</text>`;
    } else {
      svg += `<rect x="${x - 68}" y="${headY}" width="136" height="${headH}" rx="4" fill="#eef2ff" stroke="#7c3aed" stroke-width="1"/>
<text x="${x}" y="${headY + 26}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" fill="#111827">${esc(p.name)}</text>`;
    }
    svg += `<line x1="${x}" y1="${lifelineTop}" x2="${x}" y2="${lifelineBottom}" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="6 6"/>`;
  }

  const fragments = [];
  let y = lifelineTop + 34;
  for (const event of events) {
    if (event.type === "fragmentStart") {
      fragments.push({ y, label: event.label });
      svg += `<rect x="${marginX - 18}" y="${y - 24}" width="${width - marginX - 38}" height="${stepY * 3}" fill="none" stroke="#7c3aed" stroke-width="1.1" stroke-dasharray="3 3"/>
<path d="M${marginX - 18} ${y - 24} h54 l-10 18 h-44 z" fill="#faf5ff" stroke="#7c3aed" stroke-width="1"/>
<text x="${marginX - 8}" y="${y - 11}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">${esc(event.label)}</text>`;
      y += stepY * 0.6;
      continue;
    }
    if (event.type === "fragmentElse") {
      svg += `<line x1="${marginX - 18}" y1="${y - 12}" x2="${width - 56}" y2="${y - 12}" stroke="#7c3aed" stroke-width="1" stroke-dasharray="3 3"/>
<text x="${marginX + 8}" y="${y - 18}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">${esc(event.label)}</text>`;
      y += stepY * 0.6;
      continue;
    }
    if (event.type === "fragmentEnd") {
      y += stepY * 0.35;
      continue;
    }
    const x1 = xOf.get(event.from);
    const x2 = xOf.get(event.to);
    if (x1 == null || x2 == null) continue;
    const dashed = event.arrow.startsWith("--");
    if (x1 === x2) {
      svg += `<path d="M${x1} ${y} h34 q18 0 18 18 q0 18 -18 18 h-34" fill="none" stroke="#1f2937" stroke-width="1.2" marker-end="url(#arrow)"${dashed ? ' stroke-dasharray="4 4"' : ""}/>`;
      textLines(event.label, 24).forEach((line, i) => {
        svg += `<text x="${x1 + 48}" y="${y - 5 + i * 14}" font-family="Arial, sans-serif" font-size="12" fill="#111827">${esc(line)}</text>`;
      });
      y += stepY;
      continue;
    }
    svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#1f2937" stroke-width="1.2" marker-end="url(#arrow)"${dashed ? ' stroke-dasharray="4 4"' : ""}/>`;
    const labelX = (x1 + x2) / 2;
    textLines(event.label, Math.max(16, Math.floor(Math.abs(x2 - x1) / 8))).forEach((line, i) => {
      svg += `<text x="${labelX}" y="${y - 7 + i * 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#111827">${esc(line)}</text>`;
    });
    y += stepY;
  }
  return `${svg}</svg>`;
}

function renderStateDiagram() {
  const nodes = [
    ["LaunchSystem", 540, 60], ["RegisterMember", 260, 160], ["WaitRegisterValidation", 260, 250],
    ["RegisterInformation", 260, 340], ["WaitLoginInput", 540, 220], ["WaitLoginValidation", 540, 320],
    ["Home", 540, 430], ["TeamList", 190, 540], ["TeamCreating", 70, 650], ["MemberInviting", 300, 650],
    ["ScheduleEditing", 500, 540], ["ScheduleRecommending", 500, 650], ["ScheduleConfirmed", 500, 760],
    ["TaskViewing", 790, 540], ["TaskUploading", 790, 650], ["TaskSubmitted", 790, 760],
    ["TaskApproved", 680, 870], ["TaskRejected", 900, 870], ["EventVoting", 1120, 540],
    ["VoteReminderWaiting", 1030, 650], ["VoteSubmitted", 1220, 650], ["EventDeciding", 1220, 760],
    ["EventCanceled", 1090, 870], ["WorkspaceCreated", 1340, 870], ["WorkspaceManaging", 1340, 980],
  ];
  const pos = new Map(nodes.map(([n, x, y]) => [n, { x, y }]));
  const edges = [
    ["LaunchSystem", "RegisterMember", "회원가입 선택"], ["RegisterMember", "WaitRegisterValidation", "입력 완료"],
    ["WaitRegisterValidation", "RegisterMember", "입력 오류"], ["WaitRegisterValidation", "RegisterInformation", "Supabase 인증 성공"],
    ["RegisterInformation", "Home", "세션 생성"], ["LaunchSystem", "WaitLoginInput", "로그인 화면"],
    ["WaitLoginInput", "WaitLoginValidation", "로그인 입력"], ["WaitLoginValidation", "WaitLoginInput", "실패"],
    ["WaitLoginValidation", "Home", "성공"], ["Home", "TeamList", "홈 진입"], ["TeamList", "TeamCreating", "팀 생성"],
    ["TeamList", "MemberInviting", "멤버 초대"], ["TeamCreating", "TeamList", "완료"], ["MemberInviting", "TeamList", "완료"],
    ["Home", "ScheduleEditing", "일정 탭"], ["ScheduleEditing", "ScheduleRecommending", "추천"], ["ScheduleRecommending", "ScheduleConfirmed", "확정"],
    ["ScheduleConfirmed", "Home", "복귀"], ["Home", "TaskViewing", "과제 탭"], ["TaskViewing", "TaskUploading", "업로드"],
    ["TaskUploading", "TaskSubmitted", "제출"], ["TaskSubmitted", "TaskApproved", "승인"], ["TaskSubmitted", "TaskRejected", "반려"],
    ["TaskRejected", "TaskUploading", "재제출"], ["TaskApproved", "TaskViewing", "갱신"], ["Home", "EventVoting", "이벤트 탭"],
    ["EventVoting", "VoteReminderWaiting", "미투표"], ["VoteReminderWaiting", "EventVoting", "리마인드"], ["EventVoting", "VoteSubmitted", "투표"],
    ["VoteSubmitted", "EventDeciding", "마감"], ["EventDeciding", "EventCanceled", "참여자 없음"], ["EventDeciding", "WorkspaceCreated", "참여자 있음"],
    ["WorkspaceCreated", "WorkspaceManaging", "입장"], ["WorkspaceManaging", "Home", "종료"], ["EventCanceled", "Home", "취소"],
  ];
  const width = 1530;
  const height = 1060;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#334155"/></marker></defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<text x="28" y="30" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#1f2937">Jo:YUl State Machine Diagram</text>
<circle cx="540" cy="38" r="10" fill="#111827"/>`;
  for (const [a, b, label] of edges) {
    const from = pos.get(a), to = pos.get(b);
    if (!from || !to) continue;
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const x1 = from.x + (dx / len) * 68;
    const y1 = from.y + (dy / len) * 25;
    const x2 = to.x - (dx / len) * 68;
    const y2 = to.y - (dy / len) * 25;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrow)"/>`;
    svg += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#334155">${esc(label)}</text>`;
  }
  for (const [name, x, y] of nodes) {
    svg += `<rect x="${x - 82}" y="${y - 24}" width="164" height="48" rx="18" fill="#f8fafc" stroke="#2563eb" stroke-width="1.2"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#111827">${esc(name)}</text>`;
  }
  return `${svg}</svg>`;
}

writeSvg("02_class_diagram.svg", renderClassDiagram(mermaidBlocks[0]));
for (let i = 0; i < 14; i++) {
  const displayNo = `3.${i + 1}`;
  writeSvg(`${sequenceNames[i]}.svg`, renderSequenceDiagram(mermaidBlocks[i + 1], `${displayNo} ${sequenceNames[i].replace(/^03_\d+_/, "").replace(/_/g, " ")}`));
}
writeSvg("04_state_machine_diagram.svg", renderStateDiagram());

let updated = md;
let blockIndex = 0;
updated = updated.replace(/```mermaid\r?\n[\s\S]*?\r?\n```/g, () => {
  const [file, alt] = imageMap[blockIndex++];
  return `![${alt}](design_diagrams/${file})`;
});
fs.writeFileSync(mdPath, updated, "utf8");

console.log(`Generated ${imageMap.length} SVG diagrams in ${path.relative(root, outDir)}`);
