#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
: "${XMASGOAT_SIGNING_DIR:=/home/claude/.config/gamegoat-signing}"
: "${JAVA_HOME:=/usr/lib/jvm/java-21-openjdk-amd64}"
export JAVA_HOME
for file in upload-keystore.jks keystore.pass; do
  test -r "$XMASGOAT_SIGNING_DIR/$file" || { echo "Missing signing file: $file" >&2; exit 1; }
done
npx cap copy android
(cd android && nice -n 19 ./gradlew --no-daemon --max-workers=1 :app:testDebugUnitTest :app:lintRelease :app:bundleRelease)
release_version=$(sed -n 's/.*versionName "\([^"]*\)".*/\1/p' android/app/build.gradle)
unsigned_bundle=android/app/build/outputs/bundle/release/app-release.aab
signed_bundle="android/app/build/outputs/bundle/release/xmasgoat-${release_version}-release.aab"
nice -n 19 "$JAVA_HOME/bin/jarsigner" \
  -keystore "$XMASGOAT_SIGNING_DIR/upload-keystore.jks" \
  -storepass:file "$XMASGOAT_SIGNING_DIR/keystore.pass" \
  -keypass:file "$XMASGOAT_SIGNING_DIR/keystore.pass" \
  -signedjar "$signed_bundle" "$unsigned_bundle" gamegoat-upload
"$JAVA_HOME/bin/jarsigner" -verify "$signed_bundle"
sha256sum "$signed_bundle"
echo "Signed bundle ready: $signed_bundle"
