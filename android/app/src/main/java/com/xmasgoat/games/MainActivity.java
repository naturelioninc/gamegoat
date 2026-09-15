package com.xmasgoat.games;

import android.os.Bundle;
import android.view.View;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import com.getcapacitor.BridgeActivity;
import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

public class MainActivity extends BridgeActivity {
    private AppUpdateManager appUpdateManager;
    private ActivityResultLauncher<IntentSenderRequest> updateLauncher;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(InstallInvitationPlugin.class);
        super.onCreate(savedInstanceState);
        getBridge().getWebView().setOverScrollMode(View.OVER_SCROLL_NEVER);

        appUpdateManager = AppUpdateManagerFactory.create(this);
        updateLauncher = registerForActivityResult(
            new ActivityResultContracts.StartIntentSenderForResult(),
            result -> {
                // A declined update remains optional; Google Play can offer it again
                // the next time the application starts.
            }
        );
        checkForUpdate();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (appUpdateManager == null) return;

        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(info -> {
            if (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                startImmediateUpdate(info);
            }
        });
    }

    private void checkForUpdate() {
        appUpdateManager.getAppUpdateInfo().addOnSuccessListener(info -> {
            if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                && info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                startImmediateUpdate(info);
            }
        });
    }

    private void startImmediateUpdate(AppUpdateInfo info) {
        appUpdateManager.startUpdateFlowForResult(
            info,
            updateLauncher,
            AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
        );
    }
}
