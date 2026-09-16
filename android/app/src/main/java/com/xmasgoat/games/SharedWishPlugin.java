package com.xmasgoat.games;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageDecoder;
import android.net.Uri;
import android.os.Build;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.util.UUID;

/** A bounded private draft, acknowledged only after the web form preserves it. */
@CapacitorPlugin(name = "SharedWish")
public class SharedWishPlugin extends Plugin {
    private SharedPreferences preferences() {
        return getContext().getSharedPreferences("shared_wish", Context.MODE_PRIVATE);
    }
    @Override public void load() { capture(getActivity().getIntent()); }
    @Override protected void handleOnNewIntent(Intent intent) { capture(intent); }
    private File photoFile(String id) { return new File(getContext().getFilesDir(), "wish-" + id + ".jpg"); }
    private byte[] boundedBytes(InputStream input, int max) throws Exception {
        if (input == null) throw new Exception("No image");
        try (InputStream stream = input; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192]; int count;
            while ((count = stream.read(buffer)) != -1) {
                if (output.size() + count > max) throw new Exception("Image too large");
                output.write(buffer, 0, count);
            }
            return output.toByteArray();
        }
    }
    private byte[] normalizedPhoto(Uri uri) throws Exception {
        if (uri == null || !"content".equals(uri.getScheme())) throw new Exception("Unsupported image URI");
        byte[] bytes = boundedBytes(getContext().getContentResolver().openInputStream(uri), 20 * 1024 * 1024);
        BitmapFactory.Options bounds = new BitmapFactory.Options(); bounds.inJustDecodeBounds = true;
        BitmapFactory.decodeByteArray(bytes, 0, bytes.length, bounds);
        if (bounds.outWidth < 1 || bounds.outHeight < 1 || (long) bounds.outWidth * bounds.outHeight > 40000000) throw new Exception("Unsupported image");
        Bitmap bitmap;
        if (Build.VERSION.SDK_INT >= 28) {
            bitmap = ImageDecoder.decodeBitmap(ImageDecoder.createSource(ByteBuffer.wrap(bytes)), (decoder, info, source) -> {
                double ratio = Math.min(1d, 1400d / Math.max(info.getSize().getWidth(), info.getSize().getHeight()));
                decoder.setTargetSize(Math.max(1,(int)(info.getSize().getWidth()*ratio)), Math.max(1,(int)(info.getSize().getHeight()*ratio)));
                decoder.setAllocator(ImageDecoder.ALLOCATOR_SOFTWARE);
            });
        } else {
            BitmapFactory.Options options = new BitmapFactory.Options(); options.inSampleSize = 1;
            while (Math.max(bounds.outWidth,bounds.outHeight)/options.inSampleSize > 1400) options.inSampleSize *= 2;
            bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
            if (bitmap != null) {
                Bitmap original = bitmap;
                bitmap = com.capacitorjs.plugins.camera.ImageUtils.correctOrientation(
                    getContext(), bitmap, uri,
                    com.capacitorjs.plugins.camera.ImageUtils.getExifData(getContext(), bitmap, uri));
                if (original != bitmap) original.recycle();
            }
        }
        if (bitmap == null) throw new Exception("Cannot decode image");
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 88, out)) throw new Exception("Cannot encode image");
            return out.toByteArray();
        } finally { bitmap.recycle(); }
    }
    private void capture(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        String type = intent.getType();
        if (type == null || !("text/plain".equals(type) || type.startsWith("image/"))) return;
        final Intent incoming = new Intent(intent);
        intent.setAction(Intent.ACTION_MAIN);
        intent.removeExtra(Intent.EXTRA_STREAM); intent.removeExtra(Intent.EXTRA_TEXT); intent.removeExtra(Intent.EXTRA_SUBJECT);
        // Decode off the activity/UI thread and serialize with get/consume calls.
        execute(() -> {
            String id = UUID.randomUUID().toString();
            SharedPreferences prefs = preferences();
            String previous = prefs.getString("id", "");
            SharedPreferences.Editor draft = prefs.edit().clear().putString("id", id);
            try {
                CharSequence text = incoming.getCharSequenceExtra(Intent.EXTRA_TEXT);
                String title = incoming.getStringExtra(Intent.EXTRA_SUBJECT);
                draft.putString("text", text == null ? "" : text.toString().substring(0,Math.min(4096,text.length())));
                draft.putString("title", title == null ? "" : title.substring(0,Math.min(240,title.length())));
                if (type.startsWith("image/")) {
                    Uri uri = incoming.getParcelableExtra(Intent.EXTRA_STREAM);
                    if (uri == null && incoming.getClipData() != null && incoming.getClipData().getItemCount() > 0) uri = incoming.getClipData().getItemAt(0).getUri();
                    byte[] bytes = normalizedPhoto(uri);
                    try (FileOutputStream output = new FileOutputStream(photoFile(id))) { output.write(bytes); }
                    draft.putBoolean("photo", true);
                }
            } catch (Exception error) {
                photoFile(id).delete();
                draft.putString("error", "This photo could not be opened. Try sharing a screenshot or choose a photo in the app.");
            }
            draft.apply();
            if (!previous.isEmpty()) photoFile(previous).delete();
            notifyListeners("received", new JSObject());
        });
    }
    @PluginMethod public void get(PluginCall call) {
        JSObject result = new JSObject(); SharedPreferences prefs = preferences();
        if (prefs.contains("id")) {
            String id = prefs.getString("id", "");
            result.put("id", id); result.put("text", prefs.getString("text", "")); result.put("title", prefs.getString("title", ""));
            result.put("error", prefs.getString("error", ""));
            if (prefs.getBoolean("photo", false)) {
                try { result.put("image", Base64.encodeToString(boundedBytes(new FileInputStream(photoFile(id)), 2 * 1024 * 1024), Base64.NO_WRAP)); }
                catch (Exception error) { result.put("error", "Please share this photo again."); }
            }
        }
        call.resolve(result);
    }
    @PluginMethod public void consume(PluginCall call) {
        String id = preferences().getString("id", "");
        if (id.equals(call.getString("id"))) { photoFile(id).delete(); preferences().edit().clear().apply(); }
        call.resolve();
    }
}
