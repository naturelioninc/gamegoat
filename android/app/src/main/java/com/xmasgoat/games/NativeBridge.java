package com.xmasgoat.games;

import android.content.Intent;
import android.webkit.WebView;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import java.util.Collections;
import java.util.Set;
import org.json.JSONObject;

/**
 * The one door between the website and the phone.
 *
 * The app shows app.xmasgoat.com itself rather than files bundled inside the
 * app, which means Capacitor's own bridge is never injected and no plugin can
 * run. Android's web message listener works regardless, and unlike the old
 * JavaScript interface it is locked to an origin by the platform: the object
 * exists only for pages from app.xmasgoat.com, and every message arrives with
 * its origin already verified.
 *
 * The web side posts small JSON commands. Today there is one, "share", which
 * opens the Android Sharesheet: the panel from the bottom of the screen with
 * the row of people. Anything else is ignored.
 */
final class NativeBridge {
    private static final String OBJECT_NAME = "xgNative";
    private static final Set<String> ALLOWED_ORIGINS =
        Collections.singleton("https://app.xmasgoat.com");

    private NativeBridge() {}

    static void install(MainActivity activity, WebView webView) {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return;
        WebViewCompat.addWebMessageListener(
            webView,
            OBJECT_NAME,
            ALLOWED_ORIGINS,
            (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                if (!isMainFrame) return;
                String data = message.getData();
                if (data == null) return;
                String id = "";
                try {
                    JSONObject command = new JSONObject(data);
                    id = command.optString("id", "");
                    if (!"share".equals(command.optString("cmd"))) {
                        replyProxy.postMessage(reply(id, false, "unknown"));
                        return;
                    }
                    activity.runOnUiThread(() -> share(activity, command));
                    replyProxy.postMessage(reply(id, true, null));
                } catch (Exception e) {
                    replyProxy.postMessage(reply(id, false, "failed"));
                }
            }
        );
    }

    private static void share(MainActivity activity, JSONObject command) {
        String title = command.optString("title", "");
        String text = command.optString("text", "");
        String url = command.optString("url", "");
        String body = url.isEmpty() ? text : (text.contains(url) ? text : text + " " + url);

        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_TEXT, body);
        if (!title.isEmpty()) {
            send.putExtra(Intent.EXTRA_SUBJECT, title);
            send.putExtra(Intent.EXTRA_TITLE, title);
        }
        // createChooser is what produces the system sheet, with the people row.
        Intent chooser = Intent.createChooser(send, null);
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(chooser);
    }

    private static String reply(String id, boolean ok, String error) {
        try {
            JSONObject response = new JSONObject();
            response.put("id", id);
            response.put("ok", ok);
            if (error != null) response.put("error", error);
            return response.toString();
        } catch (Exception e) {
            return "{\"ok\":false}";
        }
    }
}
