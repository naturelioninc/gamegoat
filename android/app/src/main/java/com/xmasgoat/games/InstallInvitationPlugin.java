package com.xmasgoat.games;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import com.android.installreferrer.api.InstallReferrerClient;
import com.android.installreferrer.api.InstallReferrerStateListener;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.atomic.AtomicBoolean;

/** Retain an invitation until the web app has opened it. No contact or analytics data. */
@CapacitorPlugin(name = "InstallInvitation")
public class InstallInvitationPlugin extends Plugin {
    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("install_invitation", Context.MODE_PRIVATE);
    }

    private void resolve(PluginCall call) {
        JSObject result = new JSObject();
        String path = preferences().getString("path", null);
        if (path != null) result.put("path", path);
        call.resolve(result);
    }

    @PluginMethod
    public void get(PluginCall call) {
        if (preferences().getBoolean("read", false)) { resolve(call); return; }
        InstallReferrerClient client = InstallReferrerClient.newBuilder(getContext()).build();
        AtomicBoolean finished = new AtomicBoolean(false);
        Handler handler = new Handler(Looper.getMainLooper());
        Runnable timeout = () -> {
            if (finished.compareAndSet(false, true)) { client.endConnection(); resolve(call); }
        };
        handler.postDelayed(timeout, 5000);
        try {
            client.startConnection(new InstallReferrerStateListener() {
                @Override public void onInstallReferrerSetupFinished(int responseCode) {
                    if (!finished.compareAndSet(false, true)) return;
                    handler.removeCallbacks(timeout);
                    try {
                        if (responseCode == InstallReferrerClient.InstallReferrerResponse.OK) {
                            String path = InvitationReferrer.path(client.getInstallReferrer().getInstallReferrer());
                            preferences().edit().putBoolean("read", true).putString("path", path).apply();
                        }
                    } catch (Exception ignored) { /* Retry on a later launch. */ }
                    finally { client.endConnection(); resolve(call); }
                }
                @Override public void onInstallReferrerServiceDisconnected() { /* Timeout permits a later retry. */ }
            });
        } catch (Exception ignored) { timeout.run(); }
    }

    @PluginMethod
    public void consume(PluginCall call) {
        preferences().edit().remove("path").putBoolean("read", true).apply();
        call.resolve();
    }
}
