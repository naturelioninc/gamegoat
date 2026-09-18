package com.xmasgoat.games;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.FileProvider;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebChromeClient;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * One door to a picture.
 *
 * A web page that asks for a photo gets, on a phone's browser, a single
 * sheet offering the camera, the gallery and the files. Inside a web view
 * it does not: the page is handed a plain content picker, and the camera is
 * only reachable from an input that asks for the camera and nothing else.
 * That is why the app used to need two buttons.
 *
 * So the sheet is built here instead. A chooser over the ordinary picker,
 * with the camera pushed in front of it as an initial intent, is the way
 * Android has always meant this to be done. The page keeps one plain file
 * input; the phone offers everything.
 *
 * Anything that is not a plain request for one image - a request for the
 * camera itself, several files, or something that is not a picture - is
 * left to Capacitor's own handling underneath.
 */
public class PhotoChooser extends BridgeWebChromeClient {

    private final Bridge bridge;
    private final ActivityResultLauncher<Intent> launcher;
    private ValueCallback<Uri[]> waiting;
    private Uri cameraFile;

    public PhotoChooser(Bridge bridge) {
        super(bridge);
        this.bridge = bridge;
        this.launcher = bridge.registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::finish);
    }

    /** Hand the client to the web view. Safe to call once the bridge exists. */
    public static void install(Bridge bridge) {
        if (bridge == null || bridge.getWebView() == null) return;
        bridge.getWebView().setWebChromeClient(new PhotoChooser(bridge));
    }

    @Override
    public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (!wantsOnePicture(params)) return super.onShowFileChooser(view, callback, params);

        // A previous request that never came back must not strand the page.
        if (waiting != null) waiting.onReceiveValue(null);
        waiting = callback;
        cameraFile = null;

        Intent chooser = Intent.createChooser(params.createIntent(), "Add a photo");
        Intent camera = cameraIntent();
        if (camera != null) chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, new Intent[] { camera });

        try {
            launcher.launch(chooser);
        } catch (Exception e) {
            finish(null);
        }
        return true;
    }

    private boolean wantsOnePicture(FileChooserParams params) {
        if (params.isCaptureEnabled()) return false;
        if (params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) return false;
        String[] accept = params.getAcceptTypes();
        if (accept == null || accept.length == 0) return false;
        for (String type : accept) {
            if (type == null || !type.trim().toLowerCase(Locale.US).startsWith("image/")) return false;
        }
        return true;
    }

    /** The camera, pointed at a file of ours, or null when the phone has none. */
    private Intent cameraIntent() {
        Activity activity = bridge.getActivity();
        if (activity == null) return null;
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (intent.resolveActivity(activity.getPackageManager()) == null) return null;
        try {
            String stamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(new Date());
            File folder = activity.getExternalFilesDir(Environment.DIRECTORY_PICTURES);
            File file = File.createTempFile("wish_" + stamp + "_", ".jpg", folder);
            cameraFile = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", file);
        } catch (Exception e) {
            return null;
        }
        intent.putExtra(MediaStore.EXTRA_OUTPUT, cameraFile);
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return intent;
    }

    /**
     * Hand the page what it asked for. A picked file arrives in the result; a
     * photo just taken arrives in the file the camera was pointed at, and the
     * result carries nothing. The page is always answered, even with nothing,
     * or its input would never work again.
     */
    private void finish(ActivityResult result) {
        Uri[] answer = null;
        if (result != null && result.getResultCode() == Activity.RESULT_OK) {
            Intent data = result.getData();
            boolean fromCamera = data == null || (data.getData() == null && data.getClipData() == null);
            if (fromCamera) {
                if (cameraFile != null) answer = new Uri[] { cameraFile };
            } else {
                answer = WebChromeClient.FileChooserParams.parseResult(result.getResultCode(), data);
            }
        }
        if (waiting != null) waiting.onReceiveValue(answer);
        waiting = null;
        cameraFile = null;
    }
}
