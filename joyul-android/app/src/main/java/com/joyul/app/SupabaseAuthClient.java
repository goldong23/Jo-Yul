package com.joyul.app;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;
import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

class SupabaseAuthClient {
    interface AuthCallback {
        void onSuccess(AuthSession session);
        void onError(String message);
    }

    interface UploadCallback {
        void onSuccess(String storagePath);
        void onError(String message);
    }

    interface MemberLookupCallback {
        void onFound(String nickname);
        void onNotFound();
        void onError(String message);
    }

    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    void signIn(String email, String password, AuthCallback callback) {
        postAuth("/auth/v1/token?grant_type=password", email, password, callback);
    }

    void signUp(String email, String password, String name, String role, AuthCallback callback) {
        new Thread(() -> {
            try {
                if (isNicknameTaken(name)) {
                    postError(callback, "이미 사용 중인 닉네임입니다.");
                    return;
                }
                postAuth("/auth/v1/signup", email, password, name, role, callback, true);
            } catch (Exception e) {
                postError(callback, "닉네임 중복 확인 실패: " + e.getMessage());
            }
        }).start();
    }

    void deleteAccount(String accessToken, AuthCallback callback) {
        if (BuildConfig.DELETE_ACCOUNT_FUNCTION_URL == null || BuildConfig.DELETE_ACCOUNT_FUNCTION_URL.trim().isEmpty()) {
            callback.onError("회원탈퇴 서버 함수 URL이 설정되어 있지 않습니다.");
            return;
        }
        if (accessToken == null || accessToken.trim().isEmpty()) {
            callback.onError("로그인 세션이 없습니다. 다시 로그인해 주세요.");
            return;
        }

        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(BuildConfig.DELETE_ACCOUNT_FUNCTION_URL);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(12000);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
                connection.setRequestProperty("Authorization", "Bearer " + accessToken);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write("{}".getBytes(StandardCharsets.UTF_8));
                }

                int code = connection.getResponseCode();
                String response = readAll(code >= 200 && code < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream());
                if (code >= 200 && code < 300) {
                    postSuccess(callback, new AuthSession("", "", "", "", "member"));
                } else {
                    postError(callback, parseError(response, code));
                }
            } catch (Exception e) {
                postError(callback, "회원탈퇴 요청 실패: " + e.getMessage());
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    void findMemberByNickname(String nickname, MemberLookupCallback callback) {
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(BuildConfig.SUPABASE_URL + "/rest/v1/members?select=nickname&nickname=eq." + encode(nickname) + "&limit=1");
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(12000);
                connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
                connection.setRequestProperty("Authorization", "Bearer " + BuildConfig.SUPABASE_ANON_KEY);
                int code = connection.getResponseCode();
                String response = readAll(code >= 200 && code < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream());
                if (code >= 200 && code < 300) {
                    JSONArray rows = new JSONArray(response);
                    if (rows.length() == 0) {
                        mainHandler.post(callback::onNotFound);
                    } else {
                        mainHandler.post(() -> callback.onFound(nickname));
                    }
                } else {
                    mainHandler.post(() -> callback.onError(parseError(response, code)));
                }
            } catch (Exception e) {
                mainHandler.post(() -> callback.onError("닉네임 조회 실패: " + e.getMessage()));
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    void uploadSubmission(String accessToken, String fileName, String mimeType, byte[] bytes, UploadCallback callback) {
        if (bytes == null || bytes.length == 0) {
            mainHandler.post(() -> callback.onError("업로드할 파일이 비어 있습니다."));
            return;
        }
        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                String safeName = fileName == null || fileName.isEmpty() ? "submission" : fileName.replaceAll("[^A-Za-z0-9._-]", "_");
                String objectPath = "submissions/" + UUID.randomUUID() + "-" + safeName;
                String encodedPath = URLEncoder.encode(objectPath, StandardCharsets.UTF_8.name()).replace("+", "%20").replace("%2F", "/");
                URL url = new URL(BuildConfig.SUPABASE_URL + "/storage/v1/object/" + encodedPath);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(20000);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", mimeType == null || mimeType.isEmpty() ? "application/octet-stream" : mimeType);
                connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
                connection.setRequestProperty("Authorization", "Bearer " + (accessToken == null || accessToken.isEmpty() ? BuildConfig.SUPABASE_ANON_KEY : accessToken));
                connection.setRequestProperty("x-upsert", "false");
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(bytes);
                }

                int code = connection.getResponseCode();
                String response = readAll(code >= 200 && code < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream());
                if (code >= 200 && code < 300) {
                    mainHandler.post(() -> callback.onSuccess(objectPath));
                } else {
                    mainHandler.post(() -> callback.onError(parseError(response, code)));
                }
            } catch (Exception e) {
                mainHandler.post(() -> callback.onError("파일 업로드 실패: " + e.getMessage()));
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    private void postAuth(String path, String email, String password, AuthCallback callback) {
        postAuth(path, email, password, "", "", callback, false);
    }

    private void postAuth(String path, String email, String password, String name, String role, AuthCallback callback) {
        postAuth(path, email, password, name, role, callback, false);
    }

    private void postAuth(String path, String email, String password, String name, String role, AuthCallback callback, boolean insertProfile) {
        if (BuildConfig.SUPABASE_ANON_KEY == null || BuildConfig.SUPABASE_ANON_KEY.trim().isEmpty()) {
            callback.onError("Supabase anon key가 비어 있습니다. joyul-android/local.properties에 SUPABASE_ANON_KEY를 넣어주세요.");
            return;
        }

        new Thread(() -> {
            HttpURLConnection connection = null;
            try {
                URL url = new URL(BuildConfig.SUPABASE_URL + path);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(12000);
                connection.setReadTimeout(12000);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");
                connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
                connection.setRequestProperty("Authorization", "Bearer " + BuildConfig.SUPABASE_ANON_KEY);

                JSONObject body = new JSONObject();
                body.put("email", email);
                body.put("password", password);
                if (!name.isEmpty() || !role.isEmpty()) {
                    JSONObject metadata = new JSONObject();
                    metadata.put("name", name);
                    metadata.put("nickname", name);
                    metadata.put("role", role);
                    body.put("data", metadata);
                }
                byte[] payload = body.toString().getBytes(StandardCharsets.UTF_8);
                try (OutputStream out = connection.getOutputStream()) {
                    out.write(payload);
                }

                int code = connection.getResponseCode();
                String response = readAll(code >= 200 && code < 300
                        ? connection.getInputStream()
                        : connection.getErrorStream());

                if (code >= 200 && code < 300) {
                    JSONObject json = new JSONObject(response);
                    JSONObject user = json.optJSONObject("user");
                    String accessToken = json.optString("access_token", "");
                    String userId = user != null ? user.optString("id", "") : "";
                    String userEmail = user != null ? user.optString("email", email) : email;
                    JSONObject metadata = user != null ? user.optJSONObject("user_metadata") : null;
                    String displayName = metadata != null ? metadata.optString("nickname", metadata.optString("name", "")) : "";
                    String userRole = metadata != null ? metadata.optString("role", "member") : "member";
                    AuthSession session = new AuthSession(accessToken, userId, userEmail, displayName, userRole);
                    if (insertProfile && !accessToken.isEmpty()) {
                        insertMemberProfile(session);
                    }
                    postSuccess(callback, session);
                } else {
                    postError(callback, parseError(response, code));
                }
            } catch (Exception e) {
                postError(callback, "Supabase 연결 실패: " + e.getMessage());
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    private boolean isNicknameTaken(String nickname) throws Exception {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(BuildConfig.SUPABASE_URL + "/rest/v1/members?select=nickname&nickname=eq." + encode(nickname) + "&limit=1");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(12000);
            connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
            connection.setRequestProperty("Authorization", "Bearer " + BuildConfig.SUPABASE_ANON_KEY);
            int code = connection.getResponseCode();
            String response = readAll(code >= 200 && code < 300
                    ? connection.getInputStream()
                    : connection.getErrorStream());
            if (code >= 200 && code < 300) {
                return new JSONArray(response).length() > 0;
            }
            throw new IllegalStateException(parseError(response, code));
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private void insertMemberProfile(AuthSession session) throws Exception {
        HttpURLConnection connection = null;
        try {
            URL url = new URL(BuildConfig.SUPABASE_URL + "/rest/v1/members");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(12000);
            connection.setReadTimeout(12000);
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("apikey", BuildConfig.SUPABASE_ANON_KEY);
            connection.setRequestProperty("Authorization", "Bearer " + session.accessToken);
            connection.setRequestProperty("Prefer", "return=minimal");

            JSONObject body = new JSONObject();
            body.put("supabase_user_id", session.userId);
            body.put("email", session.email);
            body.put("nickname", session.displayName);
            body.put("role", session.role);
            try (OutputStream out = connection.getOutputStream()) {
                out.write(body.toString().getBytes(StandardCharsets.UTF_8));
            }

            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) {
                String response = readAll(connection.getErrorStream());
                throw new IllegalStateException(parseError(response, code));
            }
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private String encode(String value) throws Exception {
        return URLEncoder.encode(value, StandardCharsets.UTF_8.name()).replace("+", "%20");
    }

    private String readAll(InputStream stream) throws Exception {
        if (stream == null) return "";
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) builder.append(line);
        }
        return builder.toString();
    }

    private String parseError(String response, int code) {
        try {
            JSONObject json = new JSONObject(response);
            String message = json.optString("msg",
                    json.optString("message",
                            json.optString("error_description", "")));
            if (!message.isEmpty()) return toUserMessage(message);
        } catch (Exception ignored) {
        }
        return "Supabase 요청 실패 (" + code + ")";
    }

    private String toUserMessage(String message) {
        String lower = message.toLowerCase(Locale.US);
        if (lower.contains("invalid login credentials")) {
            return "회원이 아닙니다. 회원가입을 진행해주세요.";
        }
        if (lower.contains("invalid user token") || lower.contains("invalid jwt")) {
            return "로그인 세션이 만료되었습니다. 다시 로그인한 뒤 회원탈퇴를 진행해주세요.";
        }
        if (lower.contains("user already registered") || lower.contains("already registered")) {
            return "이미 가입된 회원입니다. 로그인해주세요.";
        }
        if (lower.contains("email rate limit")) {
            return "이메일 인증 요청 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.";
        }
        if (lower.contains("duplicate") || lower.contains("unique")) {
            return "이미 사용 중인 닉네임입니다.";
        }
        if (lower.contains("row-level security") || lower.contains("rowlevel security")) {
            return "Supabase Storage 정책이 설정되지 않았습니다. joyul_setup.sql의 Storage 정책을 실행해 주세요.";
        }
        return message;
    }

    private void postSuccess(AuthCallback callback, AuthSession session) {
        mainHandler.post(() -> callback.onSuccess(session));
    }

    private void postError(AuthCallback callback, String message) {
        mainHandler.post(() -> callback.onError(message));
    }

    static class AuthSession {
        final String accessToken;
        final String userId;
        final String email;
        final String displayName;
        final String role;

        AuthSession(String accessToken, String userId, String email, String displayName, String role) {
            this.accessToken = accessToken;
            this.userId = userId;
            this.email = email;
            this.displayName = displayName;
            this.role = role == null || role.isEmpty() ? "member" : role;
        }
    }
}
