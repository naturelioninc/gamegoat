package com.xmasgoat.games;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

final class InvitationReferrer {
    static String path(String referrer) {
        if (referrer == null || referrer.length() > 2048) return null;
        try {
            for (String pair : referrer.split("&")) {
                String[] parts = pair.split("=", 2);
                if (parts.length != 2) continue;
                String key = URLDecoder.decode(parts[0], StandardCharsets.UTF_8.name());
                String value = URLDecoder.decode(parts[1], StandardCharsets.UTF_8.name());
                if (key.equals("invite") && value.matches("[A-Za-z0-9_-]{16,64}")) return "/join/" + value;
                if (key.equals("code") && value.matches("[A-Za-z0-9]{6}")) return "/join?code=" + value.toUpperCase(Locale.ROOT);
            }
        } catch (Exception ignored) { return null; }
        return null;
    }
}
