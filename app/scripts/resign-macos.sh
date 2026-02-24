#!/usr/bin/env bash
# Re-sign the macOS app binary with secure timestamp and hardened runtime
# so it passes Apple notarization. Run after: npm run tauri:build
# Set SIGNING_IDENTITY to your keychain identity, e.g.:
#   security find-identity -v -p codesigning
#   export SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"

set -e
if [ -z "$SIGNING_IDENTITY" ]; then
  echo "SIGNING_IDENTITY not set. Find your identity with: security find-identity -v -p codesigning"
  echo "Then run: export SIGNING_IDENTITY=\"Developer ID Application: Your Name (TEAM_ID)\""
  exit 1
fi
BUNDLE="src-tauri/target/release/bundle"
APP="$BUNDLE/macos/neopixel-blocks.app"
BINARY="$APP/Contents/MacOS/app"
ENTITLEMENTS="src-tauri/Entitlements.plist"

if [ ! -f "$BINARY" ]; then
  echo "Binary not found at $BINARY. Run: npm run tauri:build"
  exit 1
fi

if ! security find-identity -v -p codesigning | grep -Fq "$SIGNING_IDENTITY"; then
  echo "Signing identity not found in keychain: $SIGNING_IDENTITY"
  echo ""
  echo "List available identities:"
  security find-identity -v -p codesigning
  echo ""
  echo "Use the exact string in quotes (e.g. \"Developer ID Application: ...\") and run:"
  echo "  export SIGNING_IDENTITY=\"<your exact identity>\""
  echo "  npm run tauri:build:release"
  exit 1
fi

echo "Re-signing main binary with timestamp and hardened runtime..."
if ! codesign --force --timestamp --options runtime \
  -s "$SIGNING_IDENTITY" \
  --entitlements "$ENTITLEMENTS" \
  "$BINARY"; then
  echo ""
  echo "Resign failed. DMG was not removed. Fix SIGNING_IDENTITY/keychain and run: npm run tauri:build:release"
  exit 1
fi

echo "Re-signing app bundle..."
if ! codesign --force --timestamp --options runtime \
  -s "$SIGNING_IDENTITY" \
  "$APP"; then
  echo ""
  echo "Resign failed. DMG was not removed. Fix SIGNING_IDENTITY/keychain and run: npm run tauri:build:release"
  exit 1
fi

# Remove DMG so notarize uses the re-signed .app (DMG would still contain old copy)
rm -f "$BUNDLE/dmg/"*.dmg 2>/dev/null || true

echo "Done. Run npm run notarize to submit the re-signed .app."
