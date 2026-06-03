package com.joyul.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class MainActivity extends Activity {
    private final int bg = Color.rgb(247, 248, 250);
    private final int card = Color.WHITE;
    private final int text = Color.rgb(25, 31, 40);
    private final int muted = Color.rgb(110, 118, 132);
    private final int border = Color.rgb(229, 233, 240);
    private final int blue = Color.rgb(49, 130, 246);
    private final int red = Color.rgb(244, 67, 54);
    private final int green = Color.rgb(0, 180, 118);
    private final int amber = Color.rgb(245, 158, 11);

    private final List<Team> teams = new ArrayList<>();
    private final List<TaskItem> tasks = new ArrayList<>();
    private final Set<String> selectedCells = new HashSet<>();
    private final Map<String, List<String>> memberSchedules = new HashMap<>();

    private String currentTab = "home";
    private boolean recommended = false;
    private Slot confirmedSlot = null;
    private boolean voted = false;
    private boolean workspaceCreated = false;
    private String voteResult = "";
    private SupabaseAuthClient authClient;
    private String currentUserName = "홍주은";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(Color.WHITE);
        authClient = new SupabaseAuthClient();
        seedData();
        showLogin();
    }

    private void seedData() {
        if (!teams.isEmpty()) return;

        teams.add(new Team("캡스톤 디자인 3조", "요구사항 분석 및 UI 설계", 4, "오늘 19:00", 75, false));
        teams.add(new Team("알고리즘 스터디", "주차별 문제 풀이와 인증", 6, "금요일 20:00", 40, false));
        teams.add(new Team("모바일 프로그래밍", "기말 팀 프로젝트", 3, "일정 조율 필요", 10, true));

        tasks.add(new TaskItem("DB 스키마 설계서 작성", "홍주은", "승인 완료", "schema_v1.pdf", true));
        tasks.add(new TaskItem("로그인/회원가입 API 구현", "김철수", "진행중", "", false));
        tasks.add(new TaskItem("UI 프로토타입 시연 영상", "이영희", "대기중", "", false));

        selectedCells.add("0-2");
        selectedCells.add("2-4");
        selectedCells.add("4-7");
        memberSchedules.put("김철수", Arrays.asList("0-0", "0-1", "1-5", "2-6", "4-8"));
        memberSchedules.put("이영희", Arrays.asList("0-3", "1-4", "2-6", "3-7", "4-8"));
        memberSchedules.put("박민수", Arrays.asList("0-7", "1-2", "2-3", "3-4", "4-5"));
    }

    private void showLogin() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(28), dp(32), dp(28), dp(32));
        root.setBackgroundColor(bg);

        TextView logo = textView("J", 34, Color.WHITE, true);
        logo.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams logoLp = new LinearLayout.LayoutParams(dp(76), dp(76));
        logo.setBackground(round(blue, dp(22)));
        root.addView(logo, logoLp);

        TextView title = textView("Jo:YUl", 36, text, true);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, dp(22), 0, dp(4));
        root.addView(title, matchWrap());

        TextView subtitle = textView("스마트한 종합 모임 관리 시스템", 15, muted, false);
        subtitle.setGravity(Gravity.CENTER);
        root.addView(subtitle, matchWrap());

        LinearLayout form = cardLayout();
        form.setPadding(dp(20), dp(22), dp(20), dp(22));
        LinearLayout.LayoutParams formLp = new LinearLayout.LayoutParams(-1, -2);
        formLp.setMargins(0, dp(34), 0, 0);
        root.addView(form, formLp);

        form.addView(sectionTitle("로그인"));
        EditText studentId = input("학번 (ID)");
        EditText password = input("비밀번호");
        password.setInputType(0x00000081);
        form.addView(studentId, marginTop(14));
        form.addView(password, marginTop(10));

        Button start = primaryButton("시작하기");
        form.addView(start, marginTop(18));
        start.setOnClickListener(v -> {
            requestSupabaseAuth(studentId, password, start, false);
        });

        TextView register = textView("계정이 없으신가요? 회원가입", 14, blue, true);
        register.setGravity(Gravity.CENTER);
        register.setPadding(0, dp(18), 0, 0);
        form.addView(register, matchWrap());
        register.setOnClickListener(v -> requestSupabaseAuth(studentId, password, start, true));

        setContentView(root);
    }

    private void requestSupabaseAuth(EditText studentId, EditText password, Button button, boolean signUp) {
        String id = studentId.getText().toString().trim();
        String pw = password.getText().toString().trim();
        if (id.isEmpty() || pw.isEmpty()) {
            Toast.makeText(this, "학번과 비밀번호를 입력해 주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (pw.length() < 6) {
            Toast.makeText(this, "비밀번호는 6글자 이상이 필요합니다.", Toast.LENGTH_SHORT).show();
            return;
        }

        hideKeyboard(studentId);
        String original = button.getText().toString();
        button.setEnabled(false);
        button.setText(signUp ? "회원가입 확인 중.." : "로그인 확인 중..");

        SupabaseAuthClient.AuthCallback callback = new SupabaseAuthClient.AuthCallback() {
            @Override
            public void onSuccess(SupabaseAuthClient.AuthSession session) {
                button.setEnabled(true);
                button.setText(original);
                currentUserName = id;
                currentTab = "home";
                Toast.makeText(MainActivity.this, signUp ? "회원가입이 완료되었습니다." : "로그인에 성공했습니다.", Toast.LENGTH_SHORT).show();
                showMain();
            }

            @Override
            public void onError(String message) {
                button.setEnabled(true);
                button.setText(original);
                Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
            }
        };

        String email = toSupabaseEmail(id);
        if (signUp) authClient.signUp(email, pw, callback);
        else authClient.signIn(email, pw, callback);
    }

    private String toSupabaseEmail(String id) {
        if (id.contains("@")) return id;
        return id + "@joyul.local";
    }

    private void showMain() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);

        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(false);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(22), dp(22), dp(22), dp(28));
        scroll.addView(content);

        root.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(bottomNav());
        setContentView(root);

        if ("home".equals(currentTab)) renderHome(content);
        if ("schedule".equals(currentTab)) renderSchedule(content);
        if ("task".equals(currentTab)) renderTasks(content);
        if ("event".equals(currentTab)) renderEvent(content);
    }

    private void renderHome(LinearLayout content) {
        content.addView(label("환영합니다.", 14, muted, false));
        content.addView(label(currentUserName + " 님", 28, text, true), marginTop(2));

        LinearLayout notice = cardLayout();
        notice.addView(label("새로운 이벤트 투표", 18, text, true));
        notice.addView(label("종강 기념 친목 도모 회식 참여 여부를 확인해 주세요.", 14, muted, false), marginTop(6));
        Button goVote = primaryButton("투표하러 가기");
        notice.addView(goVote, marginTop(14));
        goVote.setOnClickListener(v -> {
            currentTab = "event";
            showMain();
        });
        content.addView(notice, marginTop(22));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.addView(actionCard("일정 추천", "가능한 회의 시간을 계산합니다.", "schedule"), new LinearLayout.LayoutParams(0, -2, 1));
        actions.addView(actionCard("과제 관리", "제출과 승인을 확인합니다.", "task"), new LinearLayout.LayoutParams(0, -2, 1));
        content.addView(actions, marginTop(14));

        content.addView(sectionTitle("내 팀 목록"), marginTop(24));
        for (Team team : teams) content.addView(teamCard(team), marginTop(12));

        Button addTeam = outlineButton("+ 팀 생성");
        content.addView(addTeam, marginTop(14));
        addTeam.setOnClickListener(v -> {
            teams.add(0, new Team("새 프로젝트 팀", "Android 앱 구현을 위한 신규 팀", 4, "일정 조율 필요", 0, true));
            Toast.makeText(this, "새 팀이 생성되고 초대 알림이 전송되었습니다.", Toast.LENGTH_SHORT).show();
            showMain();
        });
    }

    private View actionCard(String title, String detail, String tab) {
        LinearLayout box = cardLayout();
        box.setPadding(dp(16), dp(16), dp(16), dp(16));
        box.addView(label(title, 17, text, true));
        box.addView(label(detail, 13, muted, false), marginTop(6));
        box.setOnClickListener(v -> {
            currentTab = tab;
            showMain();
        });
        return box;
    }

    private View teamCard(Team team) {
        LinearLayout box = cardLayout();
        box.addView(row(label(team.name, 18, text, true), pill(team.members + "명")));
        box.addView(label(team.description, 14, muted, false), marginTop(6));
        box.addView(row(label(team.nextMeeting, 14, team.needsSchedule ? red : blue, true), label("진척도 " + team.progress + "%", 14, blue, true)), marginTop(12));
        box.addView(progress(team.progress), marginTop(8));
        if (team.needsSchedule) {
            Button schedule = outlineButton("정기 모임 시간 조율하기");
            box.addView(schedule, marginTop(12));
            schedule.setOnClickListener(v -> {
                currentTab = "schedule";
                showMain();
            });
        }
        return box;
    }

    private void renderSchedule(LinearLayout content) {
        content.addView(pageTitle("일정 조율"));
        content.addView(infoCard(recommended
                ? "팀원들의 불가능 시간을 분석했습니다. 가장 많은 인원이 참석 가능한 시간을 추천합니다."
                : "본인이 참석 불가능한 시간을 선택해 주세요. 추천 버튼을 누르면 후보 시간이 계산됩니다."), marginTop(14));

        content.addView(sectionTitle("입력 현황"), marginTop(18));
        LinearLayout members = new LinearLayout(this);
        members.setOrientation(LinearLayout.HORIZONTAL);
        members.addView(miniMember("홍주은", selectedCells.size()), new LinearLayout.LayoutParams(0, -2, 1));
        members.addView(miniMember("김철수", 5), new LinearLayout.LayoutParams(0, -2, 1));
        members.addView(miniMember("이영희", 5), new LinearLayout.LayoutParams(0, -2, 1));
        content.addView(members, marginTop(10));

        content.addView(scheduleGrid(), marginTop(16));

        if (recommended) {
            List<Slot> slots = rankedSlots();
            content.addView(sectionTitle("추천 시간"), marginTop(18));
            for (int i = 0; i < Math.min(3, slots.size()); i++) content.addView(slotCard(slots.get(i), i == 0), marginTop(8));
        }

        if (confirmedSlot != null) {
            content.addView(successCard("최종 회의 시간이 " + confirmedSlot.day + " " + confirmedSlot.time + "로 확정되었습니다."), marginTop(14));
        }

        Button main = primaryButton(recommended ? "관리자 일정 확정" : "최적 시간 추천받기");
        content.addView(main, marginTop(18));
        main.setOnClickListener(v -> {
            if (!recommended) {
                recommended = true;
            } else {
                confirmedSlot = rankedSlots().get(0);
                Toast.makeText(this, "일정 확정 알림을 전송했습니다.", Toast.LENGTH_SHORT).show();
            }
            showMain();
        });

        if (recommended) {
            Button reset = outlineButton("다시 입력");
            content.addView(reset, marginTop(10));
            reset.setOnClickListener(v -> {
                recommended = false;
                confirmedSlot = null;
                showMain();
            });
        }
    }

    private View miniMember(String name, int count) {
        LinearLayout box = cardLayout();
        box.setPadding(dp(12), dp(12), dp(12), dp(12));
        box.addView(label(name, 14, text, true));
        box.addView(label(count + "개 블록", 12, muted, false), marginTop(4));
        return box;
    }

    private View scheduleGrid() {
        LinearLayout gridCard = cardLayout();
        gridCard.setPadding(dp(12), dp(12), dp(12), dp(12));
        String[] days = {"월", "화", "수", "목", "금"};
        String[] times = {"09", "10", "11", "12", "13", "14", "15", "16", "17"};
        List<Slot> best = rankedSlots().subList(0, 3);

        LinearLayout header = new LinearLayout(this);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.addView(label("", 12, muted, false), new LinearLayout.LayoutParams(dp(38), dp(28)));
        for (String day : days) {
            TextView tv = label(day, 12, muted, true);
            tv.setGravity(Gravity.CENTER);
            header.addView(tv, new LinearLayout.LayoutParams(0, dp(28), 1));
        }
        gridCard.addView(header);

        for (int t = 0; t < times.length; t++) {
            LinearLayout row = new LinearLayout(this);
            row.setOrientation(LinearLayout.HORIZONTAL);
            TextView time = label(times[t], 11, muted, false);
            time.setGravity(Gravity.CENTER);
            row.addView(time, new LinearLayout.LayoutParams(dp(38), dp(38)));
            for (int d = 0; d < days.length; d++) {
                String key = d + "-" + t;
                TextView cell = label("", 11, Color.WHITE, true);
                cell.setGravity(Gravity.CENTER);
                boolean selected = selectedCells.contains(key);
                Slot matching = null;
                if (recommended) for (Slot slot : best) if (slot.key.equals(key)) matching = slot;
                int color = selected ? red : Color.rgb(241, 244, 248);
                if (matching != null) {
                    color = matching.unavailable == 0 ? green : amber;
                    cell.setText(matching.available + "명");
                }
                cell.setBackground(round(color, dp(8)));
                final int dayIndex = d, timeIndex = t;
                cell.setOnClickListener(v -> {
                    if (recommended) return;
                    String k = dayIndex + "-" + timeIndex;
                    if (selectedCells.contains(k)) selectedCells.remove(k); else selectedCells.add(k);
                    showMain();
                });
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(38), 1);
                lp.setMargins(dp(2), dp(2), dp(2), dp(2));
                row.addView(cell, lp);
            }
            gridCard.addView(row);
        }
        return gridCard;
    }

    private View slotCard(Slot slot, boolean top) {
        LinearLayout box = cardLayout();
        box.setPadding(dp(14), dp(14), dp(14), dp(14));
        box.addView(row(label(slot.day + " " + slot.time, 16, text, true), pill(slot.available + "명 가능")));
        box.addView(label(slot.unavailable == 0 ? "불가능 인원 없음" : "일부 인원이 참석 불가능합니다.", 13, muted, false), marginTop(6));
        if (top) box.setBackground(round(Color.rgb(232, 243, 255), dp(18)));
        return box;
    }

    private List<Slot> rankedSlots() {
        String[] days = {"월", "화", "수", "목", "금"};
        String[] times = {"09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"};
        Map<String, List<String>> all = new HashMap<>(memberSchedules);
        all.put("홍주은", new ArrayList<>(selectedCells));
        List<Slot> slots = new ArrayList<>();
        for (int d = 0; d < days.length; d++) {
            for (int t = 0; t < times.length; t++) {
                String key = d + "-" + t;
                int unavailable = 0;
                for (List<String> cells : all.values()) if (cells.contains(key)) unavailable++;
                slots.add(new Slot(key, days[d], times[t], all.size() - unavailable, unavailable));
            }
        }
        slots.sort((a, b) -> b.available != a.available ? b.available - a.available : a.key.compareTo(b.key));
        return slots;
    }

    private void renderTasks(LinearLayout content) {
        content.addView(pageTitle("과제 관리"));
        int completed = 0;
        for (TaskItem task : tasks) if (task.approved) completed++;
        int progressValue = Math.round(completed * 100f / tasks.size());
        LinearLayout progressCard = cardLayout();
        progressCard.addView(row(label("캡스톤 디자인 3조 진행 상황", 18, text, true), label(progressValue + "%", 16, blue, true)));
        progressCard.addView(progress(progressValue), marginTop(12));
        content.addView(progressCard, marginTop(14));

        for (TaskItem task : tasks) content.addView(taskCard(task), marginTop(12));
    }

    private View taskCard(TaskItem task) {
        LinearLayout box = cardLayout();
        box.addView(row(label(task.title, 17, text, true), pill(task.status)));
        box.addView(label("담당자: " + task.assignee, 13, muted, false), marginTop(6));
        if (!task.file.isEmpty()) {
            box.addView(infoCard("제출 파일: " + task.file), marginTop(10));
        }
        if (!task.approved) {
            Button upload = outlineButton("산출물 업로드");
            box.addView(upload, marginTop(10));
            upload.setOnClickListener(v -> {
                task.file = "uploaded_file.pdf";
                task.status = "검토 대기";
                Toast.makeText(this, "산출물이 업로드되었습니다.", Toast.LENGTH_SHORT).show();
                showMain();
            });

            Button approve = primaryButton("관리자 승인");
            box.addView(approve, marginTop(8));
            approve.setOnClickListener(v -> {
                task.approved = true;
                task.status = "승인 완료";
                if (task.file.isEmpty()) task.file = "approved_result.pdf";
                Toast.makeText(this, "제출물을 승인했습니다.", Toast.LENGTH_SHORT).show();
                showMain();
            });
        }
        return box;
    }

    private void renderEvent(LinearLayout content) {
        content.addView(pageTitle("이벤트 및 소통"));
        if (!workspaceCreated) {
            LinearLayout event = cardLayout();
            event.addView(label("D-3 투표 마감", 13, red, true));
            event.addView(label("종강 기념 친목 도모 회식", 22, text, true), marginTop(6));
            event.addView(label("한 학기 동안 고생한 팀원들과 저녁 식사를 하며 회고하는 자리입니다. 참석 여부를 선택해 주세요.", 14, muted, false), marginTop(10));

            LinearLayout buttons = new LinearLayout(this);
            buttons.setOrientation(LinearLayout.HORIZONTAL);
            Button yes = primaryButton("참여할게요");
            Button no = outlineButton("어려워요");
            buttons.addView(yes, new LinearLayout.LayoutParams(0, dp(52), 1));
            LinearLayout.LayoutParams noLp = new LinearLayout.LayoutParams(0, dp(52), 1);
            noLp.setMargins(dp(8), 0, 0, 0);
            buttons.addView(no, noLp);
            event.addView(buttons, marginTop(18));
            content.addView(event, marginTop(14));

            yes.setOnClickListener(v -> {
                voted = true;
                voteResult = "참여";
                workspaceCreated = true;
                Toast.makeText(this, "참여자로 확정되어 워크스페이스가 생성되었습니다.", Toast.LENGTH_SHORT).show();
                showMain();
            });
            no.setOnClickListener(v -> {
                voted = true;
                voteResult = "불참";
                Toast.makeText(this, "불참 투표가 저장되었습니다.", Toast.LENGTH_SHORT).show();
                showMain();
            });
            if (voted) content.addView(infoCard("내 투표 결과: " + voteResult), marginTop(12));
        } else {
            LinearLayout workspace = cardLayout();
            workspace.addView(row(label("회식 참여자 워크스페이스", 20, text, true), pill("12명")));
            workspace.addView(infoCard("시스템: 참여자로 확정된 멤버만 포함된 공지 공간입니다."), marginTop(14));
            workspace.addView(message("관리자", "장소는 학교 앞 식당으로 예약했습니다. 금요일 18:00까지 모여 주세요."), marginTop(10));

            EditText input = input("메시지 입력");
            workspace.addView(input, marginTop(14));
            Button send = primaryButton("전송");
            workspace.addView(send, marginTop(10));
            send.setOnClickListener(v -> {
                String msg = input.getText().toString().trim();
                if (msg.isEmpty()) return;
                workspace.addView(message("나", msg), marginTop(10));
                input.setText("");
            });
            content.addView(workspace, marginTop(14));
        }
    }

    private View message(String sender, String body) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(14), dp(12), dp(14), dp(12));
        box.setBackground(round(Color.rgb(241, 244, 248), dp(14)));
        box.addView(label(sender, 12, blue, true));
        box.addView(label(body, 14, text, false), marginTop(4));
        return box;
    }

    private LinearLayout bottomNav() {
        LinearLayout nav = new LinearLayout(this);
        nav.setOrientation(LinearLayout.HORIZONTAL);
        nav.setGravity(Gravity.CENTER);
        nav.setPadding(dp(10), dp(8), dp(10), dp(8));
        nav.setBackgroundColor(Color.WHITE);
        nav.addView(navButton("홈", "home"), new LinearLayout.LayoutParams(0, dp(58), 1));
        nav.addView(navButton("일정", "schedule"), new LinearLayout.LayoutParams(0, dp(58), 1));
        nav.addView(navButton("과제", "task"), new LinearLayout.LayoutParams(0, dp(58), 1));
        nav.addView(navButton("이벤트", "event"), new LinearLayout.LayoutParams(0, dp(58), 1));
        return nav;
    }

    private Button navButton(String label, String tab) {
        Button button = new Button(this);
        button.setText(label);
        button.setTextSize(13);
        button.setTextColor(tab.equals(currentTab) ? blue : muted);
        button.setAllCaps(false);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setBackground(round(Color.TRANSPARENT, dp(12)));
        button.setOnClickListener(v -> {
            currentTab = tab;
            showMain();
        });
        return button;
    }

    private TextView pageTitle(String value) {
        return label(value, 28, text, true);
    }

    private TextView sectionTitle(String value) {
        return label(value, 20, text, true);
    }

    private TextView textView(String value, int sp, int color, boolean bold) {
        TextView tv = new TextView(this);
        tv.setText(value);
        tv.setTextSize(sp);
        tv.setTextColor(color);
        if (bold) tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setIncludeFontPadding(true);
        return tv;
    }

    private TextView label(String value, int sp, int color, boolean bold) {
        TextView tv = textView(value, sp, color, bold);
        tv.setLineSpacing(dp(2), 1.0f);
        return tv;
    }

    private EditText input(String hint) {
        EditText input = new EditText(this);
        input.setHint(hint);
        input.setTextSize(15);
        input.setSingleLine(true);
        input.setPadding(dp(16), 0, dp(16), 0);
        input.setMinHeight(dp(54));
        input.setBackground(round(Color.rgb(241, 244, 248), dp(14)));
        return input;
    }

    private LinearLayout cardLayout() {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(dp(18), dp(18), dp(18), dp(18));
        box.setBackground(round(card, dp(18)));
        box.setElevation(dp(1));
        return box;
    }

    private View infoCard(String value) {
        TextView tv = label(value, 14, muted, false);
        tv.setPadding(dp(14), dp(12), dp(14), dp(12));
        tv.setBackground(round(Color.rgb(241, 244, 248), dp(12)));
        return tv;
    }

    private View successCard(String value) {
        TextView tv = label(value, 14, green, true);
        tv.setPadding(dp(14), dp(12), dp(14), dp(12));
        tv.setBackground(round(Color.rgb(230, 247, 240), dp(12)));
        return tv;
    }

    private Button primaryButton(String value) {
        Button button = new Button(this);
        button.setText(value);
        button.setTextColor(Color.WHITE);
        button.setTextSize(15);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setAllCaps(false);
        button.setMinHeight(dp(52));
        button.setBackground(round(blue, dp(14)));
        return button;
    }

    private Button outlineButton(String value) {
        Button button = new Button(this);
        button.setText(value);
        button.setTextColor(blue);
        button.setTextSize(15);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setAllCaps(false);
        button.setMinHeight(dp(52));
        button.setBackground(stroke(Color.WHITE, border, dp(14)));
        return button;
    }

    private TextView pill(String value) {
        TextView tv = label(value, 12, blue, true);
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(dp(10), dp(5), dp(10), dp(5));
        tv.setBackground(round(Color.rgb(232, 243, 255), dp(999)));
        return tv;
    }

    private View progress(int value) {
        FrameLayout track = new FrameLayout(this);
        track.setBackground(round(Color.rgb(229, 233, 240), dp(999)));
        TextView fill = new TextView(this);
        fill.setBackground(round(blue, dp(999)));
        track.addView(fill, new FrameLayout.LayoutParams(0, dp(8)));
        track.post(() -> {
            int width = track.getWidth() * value / 100;
            FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(width, dp(8));
            fill.setLayoutParams(lp);
        });
        track.setMinimumHeight(dp(8));
        return track;
    }

    private LinearLayout row(View left, View right) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        row.addView(left, new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(right);
        return row;
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(-1, -2);
    }

    private LinearLayout.LayoutParams marginTop(int top) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(-1, -2);
        lp.setMargins(0, dp(top), 0, 0);
        return lp;
    }

    private GradientDrawable round(int color, int radius) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(color);
        drawable.setCornerRadius(radius);
        return drawable;
    }

    private GradientDrawable stroke(int color, int strokeColor, int radius) {
        GradientDrawable drawable = round(color, radius);
        drawable.setStroke(dp(1), strokeColor);
        return drawable;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void hideKeyboard(View view) {
        InputMethodManager manager = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        if (manager != null) manager.hideSoftInputFromWindow(view.getWindowToken(), 0);
    }

    static class Team {
        String name;
        String description;
        int members;
        String nextMeeting;
        int progress;
        boolean needsSchedule;

        Team(String name, String description, int members, String nextMeeting, int progress, boolean needsSchedule) {
            this.name = name;
            this.description = description;
            this.members = members;
            this.nextMeeting = nextMeeting;
            this.progress = progress;
            this.needsSchedule = needsSchedule;
        }
    }

    static class TaskItem {
        String title;
        String assignee;
        String status;
        String file;
        boolean approved;

        TaskItem(String title, String assignee, String status, String file, boolean approved) {
            this.title = title;
            this.assignee = assignee;
            this.status = status;
            this.file = file;
            this.approved = approved;
        }
    }

    static class Slot {
        String key;
        String day;
        String time;
        int available;
        int unavailable;

        Slot(String key, String day, String time, int available, int unavailable) {
            this.key = key;
            this.day = day;
            this.time = time;
            this.available = available;
            this.unavailable = unavailable;
        }
    }
}
