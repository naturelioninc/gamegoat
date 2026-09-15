package com.xmasgoat.games;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.UUID;

/** A private, acknowledged draft. Sharing never saves an item without confirmation. */
@CapacitorPlugin(name = "SharedWish")
public class SharedWishPlugin extends Plugin {
    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("shared_wish", Context.MODE_PRIVATE);
    }
    @Override public void load() { capture(getActivity().getIntent()); }
    @Override protected void handleOnNewIntent(Intent intent) { capture(intent); }
    private void capture(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())
            || !"text/plain".equals(intent.getType())) return;
        try {
            CharSequence text = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
            if (text == null || text.length() == 0 || text.length() > 4096) return;
            String title = intent.getStringExtra(Intent.EXTRA_SUBJECT);
            preferences().edit().putString("id", UUID.randomUUID().toString())
                .putString("text", text.toString())
                .putString("title", title == null ? "" : title.substring(0, Math.min(240, title.length())))
                .apply();
            intent.setAction(Intent.ACTION_MAIN);
            intent.removeExtra(Intent.EXTRA_TEXT);
            intent.removeExtra(Intent.EXTRA_SUBJECT);
            notifyListeners("received", new JSObject());
        } catch (RuntimeException ignored) { /* Malformed extras from another app are not trusted. */ }
    }
    @PluginMethod public void get(PluginCall call) {
        JSObject result = new JSObject();
        SharedPreferences prefs = preferences();
        if (prefs.contains("id")) {
            result.put("id", prefs.getString("id", ""));
            result.put("text", prefs.getString("text", ""));
            result.put("title", prefs.getString("title", ""));
        }
        call.resolve(result);
    }
    @PluginMethod public void consume(PluginCall call) {
        if (preferences().getString("id", "").equals(call.getString("id")))
            preferences().edit().clear().apply();
        call.resolve();
    }
}
