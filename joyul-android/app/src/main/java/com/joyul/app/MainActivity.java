package com.joyul.app;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.provider.OpenableColumns;
import android.database.Cursor;
import android.util.Patterns;
import android.view.Gravity;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.content.Intent;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.NumberPicker;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends Activity {
    private static final int PICK_FILE_REQUEST = 42;

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
    private final List<EventItem> events = new ArrayList<>();
    private final Map<String, List<MessageItem>> workspaceMessagesByEvent = new HashMap<>();
    private final List<MessageItem> workspaceMessages = new ArrayList<>();
    private final Map<String, Map<String, Set<String>>> teamScheduleCells = new HashMap<>();
    private final List<MeetingItem> confirmedMeetings = new ArrayList<>();

    private String currentTab = "home";
    private boolean recommended = false;
    private String currentScheduleTeamId = "";
    private String currentScheduleTeamName = "";
    private SupabaseAuthClient authClient;
    private String currentUserName = "";
    private String currentUserRole = "member";
    private String currentAccessToken = "";
    private TaskItem pendingUploadTask = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(bg);
        getWindow().setNavigationBarColor(Color.WHITE);
        authClient = new SupabaseAuthClient();
        showLogin();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    private void showLogin() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(28), dp(32), dp(28), dp(32));
        root.setBackgroundColor(bg);

        TextView title = textView("Jo:YUl", 36, text, true);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, dp(4));
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
        EditText email = input("이메일");
        email.setInputType(0x00000021);
        EditText password = input("비밀번호");
        password.setInputType(0x00000081);
        form.addView(email, marginTop(14));
        form.addView(password, marginTop(10));

        Button start = primaryButton("시작하기");
        form.addView(start, marginTop(18));
        start.setOnClickListener(v -> {
            requestSupabaseAuth(email, password, start, false);
        });

        TextView register = textView("계정이 없으신가요? 회원가입", 14, blue, true);
        register.setGravity(Gravity.CENTER);
        register.setPadding(0, dp(18), 0, 0);
        form.addView(register, matchWrap());
        register.setOnClickListener(v -> showRegister());

        setContentView(root);
    }

    private void showRegister() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(28), dp(32), dp(28), dp(32));
        root.setBackgroundColor(bg);

        TextView title = textView("회원가입", 32, text, true);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0, 0, 0, dp(4));
        root.addView(title, matchWrap());

        TextView subtitle = textView("닉네임, 이메일, 비밀번호를 등록해 주세요.", 15, muted, false);
        subtitle.setGravity(Gravity.CENTER);
        root.addView(subtitle, matchWrap());

        LinearLayout form = cardLayout();
        form.setPadding(dp(20), dp(22), dp(20), dp(22));
        LinearLayout.LayoutParams formLp = new LinearLayout.LayoutParams(-1, -2);
        formLp.setMargins(0, dp(34), 0, 0);
        root.addView(form, formLp);

        form.addView(sectionTitle("회원 등록"));
        EditText name = input("앱에서 사용할 닉네임");
        EditText email = input("이메일");
        email.setInputType(0x00000021);
        EditText password = input("비밀번호");
        EditText passwordConfirm = input("비밀번호 확인");
        password.setInputType(0x00000081);
        passwordConfirm.setInputType(0x00000081);
        form.addView(name, marginTop(14));
        form.addView(email, marginTop(10));
        form.addView(password, marginTop(10));
        form.addView(passwordConfirm, marginTop(10));

        RadioGroup roleGroup = new RadioGroup(this);
        roleGroup.setOrientation(RadioGroup.HORIZONTAL);
        RadioButton memberRole = roleButton("회원", "member");
        RadioButton adminRole = roleButton("관리자", "admin");
        memberRole.setChecked(true);
        roleGroup.addView(memberRole, new RadioGroup.LayoutParams(0, -2, 1));
        roleGroup.addView(adminRole, new RadioGroup.LayoutParams(0, -2, 1));
        form.addView(label("앱 권한", 13, muted, true), marginTop(14));
        form.addView(roleGroup, marginTop(6));

        Button submit = primaryButton("회원가입 완료");
        form.addView(submit, marginTop(18));
        submit.setOnClickListener(v -> {
            String pw = password.getText().toString().trim();
            String confirm = passwordConfirm.getText().toString().trim();
            if (!pw.equals(confirm)) {
                Toast.makeText(this, "비밀번호가 서로 다릅니다.", Toast.LENGTH_SHORT).show();
                return;
            }
            RadioButton selectedRole = findViewById(roleGroup.getCheckedRadioButtonId());
            String role = selectedRole != null ? String.valueOf(selectedRole.getTag()) : "member";
            requestSupabaseAuth(email, password, name, role, submit, true);
        });

        TextView back = textView("이미 계정이 있으신가요? 로그인", 14, blue, true);
        back.setGravity(Gravity.CENTER);
        back.setPadding(0, dp(18), 0, 0);
        form.addView(back, matchWrap());
        back.setOnClickListener(v -> showLogin());

        setContentView(root);
    }

    private RadioButton roleButton(String label, String role) {
        RadioButton button = new RadioButton(this);
        button.setId(View.generateViewId());
        button.setText(label);
        button.setTag(role);
        button.setTextSize(15);
        button.setTextColor(text);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        return button;
    }

    private void requestSupabaseAuth(EditText emailInput, EditText password, Button button, boolean signUp) {
        requestSupabaseAuth(emailInput, password, null, "member", button, signUp);
    }

    private void requestSupabaseAuth(EditText emailInput, EditText password, EditText nameInput, String role, Button button, boolean signUp) {
        String email = emailInput.getText().toString().trim();
        String pw = password.getText().toString().trim();
        String nickname = nameInput != null ? nameInput.getText().toString().trim() : "";
        if (signUp && nickname.isEmpty()) {
            Toast.makeText(this, "닉네임을 입력해 주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (signUp && nickname.length() < 2) {
            Toast.makeText(this, "닉네임은 2글자 이상 입력해 주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (email.isEmpty() || pw.isEmpty()) {
            Toast.makeText(this, "이메일과 비밀번호를 입력해 주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            Toast.makeText(this, "올바른 이메일 형식으로 입력해 주세요.", Toast.LENGTH_SHORT).show();
            return;
        }
        if (pw.length() < 6) {
            Toast.makeText(this, "비밀번호는 6글자 이상이 필요합니다.", Toast.LENGTH_SHORT).show();
            return;
        }

        hideKeyboard(emailInput);
        String original = button.getText().toString();
        button.setEnabled(false);
        button.setText(signUp ? "회원가입 확인 중.." : "로그인 확인 중..");

        SupabaseAuthClient.AuthCallback callback = new SupabaseAuthClient.AuthCallback() {
            @Override
            public void onSuccess(SupabaseAuthClient.AuthSession session) {
                button.setEnabled(true);
                button.setText(original);
                currentUserName = session.displayName.isEmpty() ? email : session.displayName;
                currentUserRole = "admin".equals(session.role) ? "admin" : "member";
                currentAccessToken = session.accessToken;
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

        if (signUp) authClient.signUp(email, pw, nickname, role, callback);
        else authClient.signIn(email, pw, callback);
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
        content.addView(pill(isAdmin() ? "관리자" : "회원"), marginTop(6));
        for (MeetingItem meeting : visibleMeetings()) {
            content.addView(meetingCard(meeting.teamName + " : " + meeting.text + "에 만나요 !"), marginTop(12));
        }
        Button logout = outlineButton("로그아웃");
        content.addView(logout, marginTop(12));
        logout.setOnClickListener(v -> logout());
        Button deleteAccount = outlineButton("회원탈퇴");
        content.addView(deleteAccount, marginTop(8));
        deleteAccount.setOnClickListener(v -> deleteAccount(deleteAccount));

        LinearLayout notice = cardLayout();
        List<EventItem> visibleEvents = visibleEvents();
        if (visibleEvents.isEmpty()) {
            notice.addView(label("진행 중인 이벤트가 없습니다.", 18, text, true));
            notice.addView(label(isAdmin() ? "이벤트 탭에서 새 투표를 만들 수 있습니다." : "관리자가 이벤트를 만들면 투표가 표시됩니다.", 14, muted, false), marginTop(6));
        } else {
            notice.addView(label("새로운 이벤트 투표", 18, text, true));
            EventItem firstEvent = visibleEvents.get(0);
            notice.addView(label(firstEvent.teamName + " : " + firstEvent.title + " 참여 여부를 확인해 주세요.", 14, muted, false), marginTop(6));
            Button goVote = primaryButton("투표하러 가기");
            notice.addView(goVote, marginTop(14));
            goVote.setOnClickListener(v -> {
                currentTab = "event";
                showMain();
            });
        }
        content.addView(notice, marginTop(22));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        Button schedule = actionButton("일정 추천", "schedule");
        Button task = actionButton("과제 관리", "task");
        actions.addView(schedule, new LinearLayout.LayoutParams(0, dp(56), 1));
        LinearLayout.LayoutParams taskLp = new LinearLayout.LayoutParams(0, dp(56), 1);
        taskLp.setMargins(dp(10), 0, 0, 0);
        actions.addView(task, taskLp);
        content.addView(actions, marginTop(14));

        content.addView(sectionTitle("내 팀 목록"), marginTop(24));
        List<Team> visibleTeams = visibleTeams();
        if (visibleTeams.isEmpty()) {
            content.addView(infoCard(isAdmin() ? "아직 생성된 팀이 없습니다. 아래 버튼으로 팀을 만들어 주세요." : "아직 참여 중인 팀이 없습니다."), marginTop(12));
        }
        for (Team team : visibleTeams) content.addView(teamCard(team), marginTop(12));

        if (isAdmin()) {
            Button addTeam = outlineButton("+ 팀 생성");
            content.addView(addTeam, marginTop(14));
            addTeam.setOnClickListener(v -> showTeamForm());
        }
    }

    private boolean isAdmin() {
        return "admin".equals(currentUserRole);
    }

    private List<Team> visibleTeams() {
        List<Team> result = new ArrayList<>();
        for (Team team : teams) {
            if (team.isVisibleTo(currentUserName)) result.add(team);
        }
        return result;
    }

    private Team firstVisibleTeam() {
        List<Team> visible = visibleTeams();
        return visible.isEmpty() ? null : visible.get(0);
    }

    private Team teamById(String teamId) {
        for (Team team : teams) {
            if (team.id.equals(teamId) && team.isVisibleTo(currentUserName)) return team;
        }
        return null;
    }

    private void setCurrentScheduleTeam(Team team) {
        currentScheduleTeamId = team == null ? "" : team.id;
        currentScheduleTeamName = team == null ? "" : team.name;
    }

    private void ensureCurrentScheduleTeam() {
        if (teamById(currentScheduleTeamId) != null) return;
        setCurrentScheduleTeam(firstVisibleTeam());
    }

    private List<MeetingItem> visibleMeetings() {
        List<MeetingItem> result = new ArrayList<>();
        for (MeetingItem meeting : confirmedMeetings) {
            if (teamById(meeting.teamId) != null) result.add(meeting);
        }
        return result;
    }

    private void upsertMeeting(String teamId, String teamName, String text) {
        for (MeetingItem meeting : confirmedMeetings) {
            if (meeting.teamId.equals(teamId)) {
                meeting.teamName = teamName;
                meeting.text = text;
                return;
            }
        }
        confirmedMeetings.add(0, new MeetingItem(teamId, teamName, text));
    }

    private List<TaskItem> tasksForTeam(String teamId) {
        List<TaskItem> result = new ArrayList<>();
        for (TaskItem task : tasks) {
            if (task.teamId.equals(teamId)) result.add(task);
        }
        return result;
    }

    private List<EventItem> eventsForTeam(String teamId) {
        List<EventItem> result = new ArrayList<>();
        for (EventItem event : events) {
            if (event.teamId.equals(teamId)) result.add(event);
        }
        return result;
    }

    private List<EventItem> visibleEvents() {
        List<EventItem> result = new ArrayList<>();
        for (Team team : visibleTeams()) {
            result.addAll(eventsForTeam(team.id));
        }
        return result;
    }

    private void logout() {
        currentUserName = "";
        currentUserRole = "member";
        currentAccessToken = "";
        currentTab = "home";
        recommended = false;
        currentScheduleTeamId = "";
        currentScheduleTeamName = "";
        Toast.makeText(this, "로그아웃되었습니다.", Toast.LENGTH_SHORT).show();
        showLogin();
    }

    private void deleteAccount(Button button) {
        String original = button.getText().toString();
        button.setEnabled(false);
        button.setText("탈퇴 처리 중..");
        authClient.deleteAccount(currentAccessToken, new SupabaseAuthClient.AuthCallback() {
            @Override
            public void onSuccess(SupabaseAuthClient.AuthSession session) {
                button.setEnabled(true);
                button.setText(original);
                Toast.makeText(MainActivity.this, "회원탈퇴가 완료되었습니다.", Toast.LENGTH_SHORT).show();
                logout();
            }

            @Override
            public void onError(String message) {
                button.setEnabled(true);
                button.setText(original);
                Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showTeamForm() {
        LinearLayout content = formScreen("팀 생성", "새 팀 정보를 입력해 주세요.");
        EditText name = input("팀 이름");
        EditText description = input("팀 설명");
        content.addView(name, marginTop(14));
        content.addView(description, marginTop(10));

        Button save = primaryButton("팀 저장");
        content.addView(save, marginTop(18));
        save.setOnClickListener(v -> {
            String teamName = name.getText().toString().trim();
            String detail = description.getText().toString().trim();
            if (teamName.isEmpty() || detail.isEmpty()) {
                Toast.makeText(this, "팀 이름과 설명을 입력해 주세요.", Toast.LENGTH_SHORT).show();
                return;
            }
            teams.add(0, new Team(teamName, detail, currentUserName, "", 0, true));
            Toast.makeText(this, "팀이 생성되었습니다.", Toast.LENGTH_SHORT).show();
            currentTab = "home";
            showMain();
        });

        Button cancel = outlineButton("취소");
        content.addView(cancel, marginTop(10));
        cancel.setOnClickListener(v -> showMain());
    }

    private Button actionButton(String title, String tab) {
        Button button = outlineButton(title);
        button.setOnClickListener(v -> {
            if ("schedule".equals(tab) && currentScheduleTeamName.isEmpty()) {
                Team team = firstVisibleTeam();
                setCurrentScheduleTeam(team);
            }
            currentTab = tab;
            showMain();
        });
        return button;
    }

    private View teamCard(Team team) {
        LinearLayout box = cardLayout();
        box.addView(row(label(team.name, 18, text, true), pill(team.memberCount() + "명")));
        box.addView(label(team.description, 14, muted, false), marginTop(6));
        box.addView(label("진척도 " + team.progress + "%", 14, blue, true), marginTop(12));
        box.addView(progress(team.progress), marginTop(8));
        if (team.needsSchedule) {
            Button schedule = outlineButton("정기 모임 시간 조율하기");
            box.addView(schedule, marginTop(12));
            schedule.setOnClickListener(v -> {
                setCurrentScheduleTeam(team);
                currentTab = "schedule";
                showMain();
            });
        }
        if (team.isOwner(currentUserName)) {
            Button invite = outlineButton("닉네임으로 초대");
            box.addView(invite, marginTop(10));
            invite.setOnClickListener(v -> showInviteForm(team));
        }
        return box;
    }

    private void showInviteForm(Team team) {
        LinearLayout content = formScreen("팀원 초대", "가입된 회원의 닉네임을 입력해 팀에 초대합니다.");
        EditText nickname = input("초대할 닉네임");
        content.addView(nickname, marginTop(14));

        Button invite = primaryButton("초대하기");
        content.addView(invite, marginTop(18));
        invite.setOnClickListener(v -> {
            String target = nickname.getText().toString().trim();
            if (target.isEmpty()) {
                Toast.makeText(this, "초대할 닉네임을 입력해 주세요.", Toast.LENGTH_SHORT).show();
                return;
            }
            if (target.equals(currentUserName)) {
                Toast.makeText(this, "본인은 이미 팀에 포함되어 있습니다.", Toast.LENGTH_SHORT).show();
                return;
            }
            invite.setEnabled(false);
            invite.setText("닉네임 확인 중..");
            authClient.findMemberByNickname(target, new SupabaseAuthClient.MemberLookupCallback() {
                @Override
                public void onFound(String nickname) {
                    invite.setEnabled(true);
                    invite.setText("초대하기");
                    if (team.invite(nickname)) {
                        Toast.makeText(MainActivity.this, nickname + " 님을 초대했습니다.", Toast.LENGTH_SHORT).show();
                    } else {
                        Toast.makeText(MainActivity.this, "이미 초대된 회원입니다.", Toast.LENGTH_SHORT).show();
                    }
                    currentTab = "home";
                    showMain();
                }

                @Override
                public void onNotFound() {
                    invite.setEnabled(true);
                    invite.setText("초대하기");
                    Toast.makeText(MainActivity.this, "해당 닉네임의 회원이 없습니다.", Toast.LENGTH_LONG).show();
                }

                @Override
                public void onError(String message) {
                    invite.setEnabled(true);
                    invite.setText("초대하기");
                    Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        });

        Button cancel = outlineButton("취소");
        content.addView(cancel, marginTop(10));
        cancel.setOnClickListener(v -> showMain());
    }

    private void renderSchedule(LinearLayout content) {
        ensureCurrentScheduleTeam();
        content.addView(pageTitle("일정 조율"));
        Team scheduleTeam = teamById(currentScheduleTeamId);
        if (scheduleTeam == null) {
            content.addView(infoCard(isAdmin() ? "먼저 팀을 생성해 주세요." : "가입된 팀이 없어 일정을 볼 수 없습니다."), marginTop(14));
            return;
        }
        content.addView(pill(scheduleTeam.name), marginTop(8));
        content.addView(infoCard(isAdmin()
                ? "팀원이 입력한 불가능 시간을 제외하고 가능한 전체 시간을 추천합니다."
                : "본인이 참석 불가능한 시간을 선택해 주세요."), marginTop(14));

        content.addView(sectionTitle("입력 현황"), marginTop(18));
        LinearLayout members = new LinearLayout(this);
        members.setOrientation(LinearLayout.HORIZONTAL);
        members.addView(miniMember(currentUserName, currentScheduleCells().size()), new LinearLayout.LayoutParams(0, -2, 1));
        content.addView(members, marginTop(10));

        content.addView(scheduleGrid(), marginTop(16));

        if (!isAdmin()) return;

        if (!recommended) {
            Button recommend = primaryButton("최적 시간 추천받기");
            content.addView(recommend, marginTop(18));
            recommend.setOnClickListener(v -> {
                recommended = true;
                showMain();
            });
            return;
        }

        content.addView(sectionTitle("확정 일정 입력"), marginTop(18));
        LinearLayout pickerRow = meetingPickerRow();
        content.addView(pickerRow, marginTop(10));

        Button confirm = primaryButton("일정 확정");
        content.addView(confirm, marginTop(18));
        confirm.setOnClickListener(v -> {
            DateTimeSelection selection = (DateTimeSelection) pickerRow.getTag();
            upsertMeeting(currentScheduleTeamId, currentScheduleTeamName.isEmpty() ? "팀" : currentScheduleTeamName, selection.text);
            recommended = false;
            currentTab = "home";
            Toast.makeText(this, "일정이 확정되었습니다.", Toast.LENGTH_SHORT).show();
            showMain();
        });

        Button reset = outlineButton("다시 입력");
        content.addView(reset, marginTop(10));
        reset.setOnClickListener(v -> {
            recommended = false;
            showMain();
        });
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
        String[] times = {"09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"};
        Set<String> recommendedKeys = new HashSet<>();
        if (recommended) {
            for (Slot slot : availableSlots()) recommendedKeys.add(slot.key);
        }
        Set<String> selectedCells = currentScheduleCells();

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
                int color = selected ? red : Color.rgb(241, 244, 248);
                if (recommendedKeys.contains(key)) {
                    color = green;
                    cell.setText("가능");
                }
                cell.setBackground(round(color, dp(8)));
                final int dayIndex = d, timeIndex = t;
                cell.setOnClickListener(v -> {
                    if (recommended) return;
                    String k = dayIndex + "-" + timeIndex;
                    if (selectedCells.contains(k)) {
                        selectedCells.remove(k);
                        cell.setText("");
                        cell.setBackground(round(Color.rgb(241, 244, 248), dp(8)));
                    } else {
                        selectedCells.add(k);
                        cell.setText("");
                        cell.setBackground(round(red, dp(8)));
                    }
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
        return slotCard(slot);
    }

    private View slotCard(Slot slot) {
        LinearLayout box = cardLayout();
        box.setPadding(dp(14), dp(14), dp(14), dp(14));
        box.addView(row(label(slot.day + " " + slot.time, 16, text, true), pill("전원 가능")));
        return box;
    }

    private List<Slot> rankedSlots() {
        return availableSlots();
    }

    private List<Slot> availableSlots() {
        String[] days = {"월", "화", "수", "목", "금"};
        String[] times = {"09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"};
        Map<String, Set<String>> all = new HashMap<>(scheduleCellsForCurrentTeam());
        all.put(currentUserName, new HashSet<>(currentScheduleCells()));
        if (all.isEmpty()) all.put(currentUserName, new HashSet<>());
        List<Slot> slots = new ArrayList<>();
        for (int d = 0; d < days.length; d++) {
            for (int t = 0; t < times.length; t++) {
                String key = d + "-" + t;
                int unavailable = 0;
                for (Set<String> cells : all.values()) if (cells.contains(key)) unavailable++;
                if (unavailable == 0) {
                    slots.add(new Slot(key, days[d], times[t], all.size(), 0));
                }
            }
        }
        return slots;
    }

    private Set<String> currentScheduleCells() {
        Map<String, Set<String>> schedules = scheduleCellsForCurrentTeam();
        Set<String> cells = schedules.get(currentUserName);
        if (cells == null) {
            cells = new HashSet<>();
            schedules.put(currentUserName, cells);
        }
        return cells;
    }

    private Map<String, Set<String>> scheduleCellsForCurrentTeam() {
        String teamId = currentScheduleTeamId.isEmpty() ? "default" : currentScheduleTeamId;
        Map<String, Set<String>> schedules = teamScheduleCells.get(teamId);
        if (schedules == null) {
            schedules = new HashMap<>();
            teamScheduleCells.put(teamId, schedules);
        }
        return schedules;
    }

    private LinearLayout meetingPickerRow() {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);

        Calendar now = Calendar.getInstance();
        NumberPicker year = picker(now.get(Calendar.YEAR), now.get(Calendar.YEAR), now.get(Calendar.YEAR) + 2);
        NumberPicker month = picker(now.get(Calendar.MONTH) + 1, 1, 12);
        NumberPicker day = picker(now.get(Calendar.DAY_OF_MONTH), 1, 31);
        NumberPicker hour = picker(18, 0, 23);
        NumberPicker minute = picker(0, 0, 59);

        NumberPicker.OnValueChangeListener update = (picker, oldVal, newVal) -> {
            updateDayPicker(year, month, day);
            row.setTag(dateTimeSelection(year, month, day, hour, minute));
        };
        year.setOnValueChangedListener(update);
        month.setOnValueChangedListener(update);
        day.setOnValueChangedListener(update);
        hour.setOnValueChangedListener(update);
        minute.setOnValueChangedListener(update);
        updateDayPicker(year, month, day);
        row.setTag(dateTimeSelection(year, month, day, hour, minute));

        row.addView(pickerBox("년", year), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(pickerBox("월", month), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(pickerBox("일", day), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(pickerBox("시", hour), new LinearLayout.LayoutParams(0, -2, 1));
        row.addView(pickerBox("분", minute), new LinearLayout.LayoutParams(0, -2, 1));
        return row;
    }

    private NumberPicker picker(int value, int min, int max) {
        NumberPicker picker = new NumberPicker(this);
        picker.setMinValue(min);
        picker.setMaxValue(max);
        picker.setValue(Math.max(min, Math.min(max, value)));
        picker.setWrapSelectorWheel(true);
        return picker;
    }

    private LinearLayout pickerBox(String suffix, NumberPicker picker) {
        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setGravity(Gravity.CENTER);
        box.addView(picker, new LinearLayout.LayoutParams(-1, dp(120)));
        TextView label = label(suffix, 12, muted, true);
        label.setGravity(Gravity.CENTER);
        box.addView(label, matchWrap());
        return box;
    }

    private void updateDayPicker(NumberPicker year, NumberPicker month, NumberPicker day) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.YEAR, year.getValue());
        calendar.set(Calendar.MONTH, month.getValue() - 1);
        int maxDay = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        if (day.getValue() > maxDay) day.setValue(maxDay);
        day.setMaxValue(maxDay);
    }

    private DateTimeSelection dateTimeSelection(NumberPicker year, NumberPicker month, NumberPicker day, NumberPicker hour, NumberPicker minute) {
        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        calendar.set(year.getValue(), month.getValue() - 1, day.getValue(), hour.getValue(), minute.getValue());
        String[] weekdays = {"일", "월", "화", "수", "목", "금", "토"};
        String weekday = weekdays[calendar.get(Calendar.DAY_OF_WEEK) - 1];
        String text = year.getValue() + "년 " + month.getValue() + "월 " + day.getValue() + "일 " + weekday + "요일 "
                + String.format("%02d:%02d", hour.getValue(), minute.getValue());
        return new DateTimeSelection(text, calendar.getTimeInMillis());
    }

    private void renderTasks(LinearLayout content) {
        content.addView(pageTitle("과제 관리"));
        List<Team> visibleTeams = visibleTeams();
        if (visibleTeams.isEmpty()) {
            content.addView(infoCard(isAdmin() ? "먼저 팀을 생성해 주세요." : "가입된 팀이 없어 과제를 볼 수 없습니다."), marginTop(14));
            return;
        }

        for (Team team : visibleTeams) {
            List<TaskItem> teamTasks = tasksForTeam(team.id);
            int completed = 0;
            for (TaskItem task : teamTasks) if (task.approved) completed++;
            int progressValue = teamTasks.isEmpty() ? 0 : Math.round(completed * 100f / teamTasks.size());

            LinearLayout teamBox = cardLayout();
            teamBox.addView(row(label(team.name, 19, text, true), label(progressValue + "%", 16, blue, true)));
            teamBox.addView(progress(progressValue), marginTop(10));

            if (teamTasks.isEmpty()) {
                teamBox.addView(infoCard(isAdmin() ? "아직 생성된 과제가 없습니다." : "이 팀에 등록된 과제가 없습니다."), marginTop(12));
            }
            for (TaskItem task : teamTasks) teamBox.addView(taskCard(task), marginTop(12));

            if (isAdmin() && team.isOwner(currentUserName)) {
                Button addTask = outlineButton("+ 과제 생성");
                teamBox.addView(addTask, marginTop(12));
                addTask.setOnClickListener(v -> showTaskForm(team));
            }
            content.addView(teamBox, marginTop(14));
        }
    }

    private View taskCard(TaskItem task) {
        LinearLayout box = cardLayout();
        box.addView(row(label(task.title, 17, text, true), pill(task.status)));
        box.addView(label("담당자: " + task.assignee, 13, muted, false), marginTop(6));
        if (!task.file.isEmpty()) {
            if (isAdmin() || task.isSubmittedBy(currentUserName)) {
                String fileInfo = "제출 파일: " + task.file + "\n파일 형식: " + task.mimeType + "\n제출자: " + task.submittedBy;
                if (!task.fileUri.isEmpty()) fileInfo += "\n저장 경로: " + task.fileUri;
                box.addView(infoCard(fileInfo), marginTop(10));
                if (!task.localUri.isEmpty()) {
                    Button openFile = outlineButton("제출 파일 열기");
                    box.addView(openFile, marginTop(8));
                    openFile.setOnClickListener(v -> openSubmittedFile(task));
                }
            } else {
                box.addView(infoCard(task.submittedBy + " 님이 제출한 산출물이 있습니다."), marginTop(10));
            }
        }
        if (!task.approved) {
            boolean canUpload = !isAdmin() && (task.file.isEmpty() || task.isSubmittedBy(currentUserName));
            if (canUpload) {
                Button upload = outlineButton(task.file.isEmpty() ? "산출물 업로드" : "산출물 다시 업로드");
                box.addView(upload, marginTop(10));
                upload.setOnClickListener(v -> showUploadForm(task));
            } else if (!isAdmin() && !task.file.isEmpty()) {
                box.addView(label("다른 계정이 업로드한 산출물은 다시 업로드할 수 없습니다.", 13, muted, false), marginTop(10));
            }

            if (isAdmin()) {
                Button approve = primaryButton("관리자 승인");
                box.addView(approve, marginTop(8));
                approve.setOnClickListener(v -> {
                    if (task.file.isEmpty()) {
                        Toast.makeText(this, "제출 파일이 있어야 승인할 수 있습니다.", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    task.approved = true;
                    task.status = "승인 완료";
                    Toast.makeText(this, "제출물을 승인했습니다.", Toast.LENGTH_SHORT).show();
                    showMain();
                });
            }
        }
        return box;
    }

    private void showTaskForm(Team team) {
        LinearLayout content = formScreen("과제 생성", "팀원이 수행할 과제 정보를 입력해 주세요.");
        EditText title = input("과제 제목");
        EditText assignee = input("담당자 이름 또는 이메일");
        content.addView(title, marginTop(14));
        content.addView(assignee, marginTop(10));

        Button save = primaryButton("과제 저장");
        content.addView(save, marginTop(18));
        save.setOnClickListener(v -> {
            String taskTitle = title.getText().toString().trim();
            String owner = assignee.getText().toString().trim();
            if (taskTitle.isEmpty() || owner.isEmpty()) {
                Toast.makeText(this, "과제 제목과 담당자를 입력해 주세요.", Toast.LENGTH_SHORT).show();
                return;
            }
            tasks.add(0, new TaskItem(team.id, team.name, taskTitle, owner, "대기중", "", false));
            Toast.makeText(this, "과제가 생성되었습니다.", Toast.LENGTH_SHORT).show();
            currentTab = "task";
            showMain();
        });

        Button cancel = outlineButton("취소");
        content.addView(cancel, marginTop(10));
        cancel.setOnClickListener(v -> showMain());
    }

    private void showUploadForm(TaskItem task) {
        pendingUploadTask = task;
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        intent.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"image/*", "application/pdf", "text/*", "application/zip"});
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(intent, PICK_FILE_REQUEST);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PICK_FILE_REQUEST || resultCode != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri = data.getData();
        try {
            getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
        } catch (Exception ignored) {
        }
        if (pendingUploadTask != null) {
            String displayName = getDisplayName(uri);
            String mimeType = getContentResolver().getType(uri);
            byte[] bytes = readBytes(uri);
            Toast.makeText(this, "파일 업로드 중입니다.", Toast.LENGTH_SHORT).show();
            authClient.uploadSubmission(currentAccessToken, displayName, mimeType, bytes, new SupabaseAuthClient.UploadCallback() {
                @Override
                public void onSuccess(String storagePath) {
                    pendingUploadTask.file = displayName;
                    pendingUploadTask.fileUri = storagePath;
                    pendingUploadTask.localUri = uri.toString();
                    pendingUploadTask.mimeType = mimeType == null || mimeType.isEmpty() ? "*/*" : mimeType;
                    pendingUploadTask.submittedBy = currentUserName;
                    pendingUploadTask.status = "검토 대기";
                    pendingUploadTask = null;
                    Toast.makeText(MainActivity.this, "파일이 제출되었습니다.", Toast.LENGTH_SHORT).show();
                    currentTab = "task";
                    showMain();
                }

                @Override
                public void onError(String message) {
                    pendingUploadTask = null;
                    Toast.makeText(MainActivity.this, message, Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    private void openSubmittedFile(TaskItem task) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(Uri.parse(task.localUri), task.mimeType == null || task.mimeType.isEmpty() ? "*/*" : task.mimeType);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(Intent.createChooser(intent, "제출 파일 열기"));
        } catch (Exception e) {
            Toast.makeText(this, "이 파일을 열 수 있는 앱이 없거나 접근 권한이 없습니다.", Toast.LENGTH_LONG).show();
        }
    }

    private byte[] readBytes(Uri uri) {
        try (InputStream input = getContentResolver().openInputStream(uri);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            if (input == null) return new byte[0];
            byte[] buffer = new byte[8192];
            int read;
            while ((read = input.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            return output.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }

    private String getDisplayName(Uri uri) {
        String name = null;
        try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (index >= 0) name = cursor.getString(index);
            }
        } catch (Exception ignored) {
        }
        if (name == null || name.isEmpty()) name = uri.getLastPathSegment();
        return name == null || name.isEmpty() ? "선택한 파일" : name;
    }

    private void renderEvent(LinearLayout content) {
        content.addView(pageTitle("이벤트 및 소통"));

        List<Team> visibleTeams = visibleTeams();
        if (visibleTeams.isEmpty()) {
            content.addView(infoCard(isAdmin() ? "먼저 팀을 생성해 주세요." : "가입된 팀이 없어 이벤트를 볼 수 없습니다."), marginTop(14));
            return;
        }

        for (Team team : visibleTeams) {
            List<EventItem> teamEvents = eventsForTeam(team.id);
            LinearLayout teamBox = cardLayout();
            teamBox.addView(label(team.name, 19, text, true));
            if (teamEvents.isEmpty()) {
                teamBox.addView(infoCard(isAdmin() ? "아직 생성된 이벤트가 없습니다." : "이 팀에 투표할 이벤트가 없습니다."), marginTop(12));
            }
            for (EventItem item : teamEvents) {
                teamBox.addView(eventCard(item), marginTop(12));
            }
            if (isAdmin() && team.isOwner(currentUserName)) {
                Button addEvent = outlineButton("+ 이벤트 생성");
                teamBox.addView(addEvent, marginTop(12));
                addEvent.setOnClickListener(v -> showEventForm(team));
            }
            content.addView(teamBox, marginTop(14));
        }

        for (EventItem item : visibleEvents()) {
            if ("참여".equals(item.voteFor(currentUserName))) {
                content.addView(workspaceCard(item), marginTop(14));
            }
        }

        if (false && hasParticipatingVote()) {
            LinearLayout workspace = cardLayout();
            workspace.addView(row(label("참여자 워크스페이스", 20, text, true), pill("참여자")));
            workspace.addView(infoCard("참여자로 확정된 멤버만 사용하는 공지 공간입니다."), marginTop(14));
            if (workspaceMessages.isEmpty()) {
                workspace.addView(infoCard("아직 작성된 메시지가 없습니다."), marginTop(10));
            }
            for (MessageItem message : workspaceMessages) {
                workspace.addView(message(message.sender, message.body), marginTop(10));
            }

            EditText input = input("메시지 입력");
            workspace.addView(input, marginTop(14));
            Button send = primaryButton("전송");
            workspace.addView(send, marginTop(10));
            send.setOnClickListener(v -> {
                String msg = input.getText().toString().trim();
                if (msg.isEmpty()) return;
                workspaceMessages.add(new MessageItem(currentUserName, msg));
                showMain();
            });
            content.addView(workspace, marginTop(14));
        }
    }

    private View eventCard(EventItem item) {
        LinearLayout event = cardLayout();
        boolean closed = item.isClosed();
        event.addView(label("투표 마감: " + item.deadlineText, 13, closed ? red : blue, true));
        event.addView(label(closed ? "투표가 마감되었습니다." : "남은 시간: " + item.remainingText(), 13, muted, false), marginTop(4));
        event.addView(label(item.title, 22, text, true), marginTop(6));
        event.addView(label(item.description, 14, muted, false), marginTop(10));
        String myVote = item.voteFor(currentUserName);
        if (!myVote.isEmpty()) {
            event.addView(infoCard("내 투표 결과: " + myVote), marginTop(12));
            return event;
        }
        if (closed) {
            event.addView(infoCard("마감 시간이 지나 투표할 수 없습니다."), marginTop(12));
            return event;
        }

        LinearLayout buttons = new LinearLayout(this);
        buttons.setOrientation(LinearLayout.HORIZONTAL);
        Button yes = primaryButton("참여할게요");
        Button no = outlineButton("어려워요");
        buttons.addView(yes, new LinearLayout.LayoutParams(0, dp(52), 1));
        LinearLayout.LayoutParams noLp = new LinearLayout.LayoutParams(0, dp(52), 1);
        noLp.setMargins(dp(8), 0, 0, 0);
        buttons.addView(no, noLp);
        event.addView(buttons, marginTop(18));

        yes.setOnClickListener(v -> {
            item.vote(currentUserName, "참여");
            Toast.makeText(this, "참여자로 확정되어 워크스페이스가 생성되었습니다.", Toast.LENGTH_SHORT).show();
            showMain();
        });
        no.setOnClickListener(v -> {
            item.vote(currentUserName, "불참");
            Toast.makeText(this, "불참 투표가 저장되었습니다.", Toast.LENGTH_SHORT).show();
            showMain();
        });
        return event;
    }

    private View workspaceCard(EventItem item) {
        LinearLayout workspace = cardLayout();
        workspace.addView(row(label(item.teamName + " : " + item.title, 20, text, true), pill("참여중")));
        workspace.addView(infoCard("이 이벤트 참여자만 사용하는 공지 공간입니다."), marginTop(14));
        List<MessageItem> messages = workspaceMessagesFor(item.id);
        if (messages.isEmpty()) {
            workspace.addView(infoCard("아직 작성된 메시지가 없습니다."), marginTop(10));
        }
        for (MessageItem message : messages) {
            workspace.addView(message(message.sender, message.body), marginTop(10));
        }

        EditText input = input("메시지 입력");
        workspace.addView(input, marginTop(14));
        Button send = primaryButton("전송");
        workspace.addView(send, marginTop(10));
        send.setOnClickListener(v -> {
            String msg = input.getText().toString().trim();
            if (msg.isEmpty()) return;
            workspaceMessagesFor(item.id).add(new MessageItem(currentUserName, msg));
            showMain();
        });
        return workspace;
    }

    private List<MessageItem> workspaceMessagesFor(String eventId) {
        List<MessageItem> messages = workspaceMessagesByEvent.get(eventId);
        if (messages == null) {
            messages = new ArrayList<>();
            workspaceMessagesByEvent.put(eventId, messages);
        }
        return messages;
    }

    private boolean hasParticipatingVote() {
        for (EventItem item : visibleEvents()) {
            if ("참여".equals(item.voteFor(currentUserName))) return true;
        }
        return false;
    }

    private void showEventForm(Team team) {
        LinearLayout content = formScreen("이벤트 생성", "투표할 이벤트 정보를 입력해 주세요.");
        EditText title = input("이벤트 제목");
        EditText description = input("이벤트 설명");
        content.addView(title, marginTop(14));
        content.addView(description, marginTop(10));
        content.addView(sectionTitle("투표 마감 시간"), marginTop(18));
        LinearLayout deadlinePicker = meetingPickerRow();
        content.addView(deadlinePicker, marginTop(10));

        Button save = primaryButton("이벤트 저장");
        content.addView(save, marginTop(18));
        save.setOnClickListener(v -> {
            String eventTitle = title.getText().toString().trim();
            String detail = description.getText().toString().trim();
            DateTimeSelection due = (DateTimeSelection) deadlinePicker.getTag();
            if (eventTitle.isEmpty() || detail.isEmpty()) {
                Toast.makeText(this, "이벤트 제목과 설명을 입력해 주세요.", Toast.LENGTH_SHORT).show();
                return;
            }
            if (due.millis <= System.currentTimeMillis()) {
                Toast.makeText(this, "투표 마감 시간은 현재 이후로 선택해 주세요.", Toast.LENGTH_SHORT).show();
                return;
            }
            events.add(0, new EventItem(team.id, team.name, eventTitle, detail, due.text, due.millis));
            Toast.makeText(this, "이벤트가 생성되었습니다.", Toast.LENGTH_SHORT).show();
            currentTab = "event";
            showMain();
        });

        Button cancel = outlineButton("취소");
        content.addView(cancel, marginTop(10));
        cancel.setOnClickListener(v -> showMain());
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

    private LinearLayout formScreen(String title, String subtitle) {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);

        ScrollView scroll = new ScrollView(this);
        LinearLayout content = new LinearLayout(this);
        content.setOrientation(LinearLayout.VERTICAL);
        content.setPadding(dp(22), dp(28), dp(22), dp(28));
        scroll.addView(content);
        root.addView(scroll, new LinearLayout.LayoutParams(-1, -1));
        setContentView(root);

        content.addView(pageTitle(title));
        content.addView(label(subtitle, 14, muted, false), marginTop(6));
        return content;
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

    private View meetingCard(String value) {
        TextView tv = label(value, 19, green, true);
        tv.setPadding(dp(16), dp(16), dp(16), dp(16));
        tv.setBackground(round(Color.rgb(230, 247, 240), dp(14)));
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
        String id;
        String name;
        String description;
        String ownerNickname;
        Set<String> invitedNicknames = new HashSet<>();
        String nextMeeting;
        int progress;
        boolean needsSchedule;

        Team(String name, String description, String ownerNickname, String nextMeeting, int progress, boolean needsSchedule) {
            this(UUID.randomUUID().toString(), name, description, ownerNickname, nextMeeting, progress, needsSchedule);
        }

        Team(String id, String name, String description, String ownerNickname, String nextMeeting, int progress, boolean needsSchedule) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.ownerNickname = ownerNickname;
            this.nextMeeting = nextMeeting;
            this.progress = progress;
            this.needsSchedule = needsSchedule;
        }

        boolean isOwner(String nickname) {
            return ownerNickname != null && ownerNickname.equals(nickname);
        }

        boolean isVisibleTo(String nickname) {
            return isOwner(nickname) || invitedNicknames.contains(nickname);
        }

        boolean invite(String nickname) {
            if (isOwner(nickname) || invitedNicknames.contains(nickname)) return false;
            invitedNicknames.add(nickname);
            return true;
        }

        int memberCount() {
            return 1 + invitedNicknames.size();
        }
    }

    static class MeetingItem {
        String teamId;
        String teamName;
        String text;

        MeetingItem(String teamId, String teamName, String text) {
            this.teamId = teamId;
            this.teamName = teamName;
            this.text = text;
        }
    }

    static class TaskItem {
        String teamId;
        String teamName;
        String title;
        String assignee;
        String status;
        String file;
        String fileUri = "";
        String localUri = "";
        String mimeType = "알 수 없음";
        String submittedBy = "";
        boolean approved;

        TaskItem(String teamId, String teamName, String title, String assignee, String status, String file, boolean approved) {
            this.teamId = teamId;
            this.teamName = teamName;
            this.title = title;
            this.assignee = assignee;
            this.status = status;
            this.file = file;
            this.approved = approved;
        }

        boolean isSubmittedBy(String nickname) {
            return submittedBy != null && submittedBy.equals(nickname);
        }
    }

    static class EventItem {
        String id;
        String teamId;
        String teamName;
        String title;
        String description;
        String deadlineText;
        long deadlineMillis;
        Map<String, String> votesByNickname = new HashMap<>();

        EventItem(String teamId, String teamName, String title, String description, String deadlineText, long deadlineMillis) {
            this.id = UUID.randomUUID().toString();
            this.teamId = teamId;
            this.teamName = teamName;
            this.title = title;
            this.description = description;
            this.deadlineText = deadlineText;
            this.deadlineMillis = deadlineMillis;
        }

        void vote(String nickname, String value) {
            votesByNickname.put(nickname, value);
        }

        String voteFor(String nickname) {
            String value = votesByNickname.get(nickname);
            return value == null ? "" : value;
        }

        boolean isClosed() {
            return System.currentTimeMillis() >= deadlineMillis;
        }

        String remainingText() {
            long diff = Math.max(0, deadlineMillis - System.currentTimeMillis());
            long minutes = diff / 60000;
            long days = minutes / (60 * 24);
            long hours = (minutes % (60 * 24)) / 60;
            long mins = minutes % 60;
            if (days > 0) return days + "일 " + hours + "시간 " + mins + "분";
            if (hours > 0) return hours + "시간 " + mins + "분";
            return mins + "분";
        }
    }

    static class DateTimeSelection {
        String text;
        long millis;

        DateTimeSelection(String text, long millis) {
            this.text = text;
            this.millis = millis;
        }
    }

    static class MessageItem {
        String sender;
        String body;

        MessageItem(String sender, String body) {
            this.sender = sender;
            this.body = body;
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
