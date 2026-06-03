package com.joyul.app;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

class SupabaseAuthClient {
    interface AuthCallback {
        void onSuccess(AuthSession session);
        void onError(String message);
    }

    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    void signIn(String email, String password, AuthCallback callback) {
        postAuth("/auth/v1/token?grant_type=password", email, password, callback);
    }

    void signUp(String email, String password, AuthCallback callback) {
        postAuth("/auth/v1/signup", email, password, callback);
    }

    private void postAuth(String path, String email, String password, AuthCallback callback) {
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
                    postSuccess(callback, new AuthSession(accessToken, userId, userEmail));
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
            if (!message.isEmpty()) return message;
        } catch (Exception ignored) {
        }
        return "Supabase 요청 실패 (" + code + ")";
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

        AuthSession(String accessToken, String userId, String email) {
            this.accessToken = accessToken;
            this.userId = userId;
            this.email = email;
        }
    }
}
