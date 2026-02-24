#!/usr/bin/env bash
set -e

# Notarize the built macOS app. Run after: npm run tauri:build:release
# (tauri:build:release re-signs with timestamp + hardened runtime and removes the DMG)
# Requires env: APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD
# Optional: APPLE_TEAM_ID (defaults to DP9DFGMC65)

APPLE_TEAM_ID="${APPLE_TEAM_ID:-DP9DFGMC65}"
BUNDLE="src-tauri/target/release/bundle"
APP="$BUNDLE/macos/neopixel-blocks.app"
DMG=$(echo $BUNDLE/dmg/*.dmg 2>/dev/null || true)

if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ]; then
  echo "Set APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD (app-specific password from appleid.apple.com)"
  exit 1
fi

if [ ! -d "$BUNDLE" ]; then
  echo "Bundle not found at $BUNDLE. Run: npm run tauri:build:release"
  exit 1
fi

# Only notarize the .app after tauri:build:release (re-signed; DMG is removed then).
# If DMG still exists, the .app was not re-signed — Apple will reject it.
if [ -f "$DMG" ]; then
  echo "DMG still present. Run: npm run tauri:build:release"
  echo "That re-signs the app with timestamp + hardened runtime and removes the DMG. Then run npm run notarize again."
  exit 1
fi

if [ -d "$APP" ]; then
  ZIP="$BUNDLE/macos/neopixel-blocks.zip"
  echo "Submitting .app for notarization (zipping)..."
  ditto -c -k --keepParent "$APP" "$ZIP"
  SUBMIT_OUTPUT=$(xcrun notarytool submit "$ZIP" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_APP_SPECIFIC_PASSWORD" \
    --team-id "$APPLE_TEAM_ID" \
    --wait 2>&1) || true
  rm -f "$ZIP"
  echo "$SUBMIT_OUTPUT"
  if echo "$SUBMIT_OUTPUT" | grep -q "status: Invalid"; then
    SUBMISSION_ID=$(echo "$SUBMIT_OUTPUT" | grep "id:" | head -1 | sed 's/.*id: *//' | tr -d ' ')
    echo "Notarization failed. Fetching Apple's rejection reason..."
    if [ -n "$SUBMISSION_ID" ]; then
      xcrun notarytool log "$SUBMISSION_ID" \
        --apple-id "$APPLE_ID" \
        --password "$APPLE_APP_SPECIFIC_PASSWORD" \
        --team-id "$APPLE_TEAM_ID" 2>&1 || true
    fi
    exit 1
  fi
  if ! echo "$SUBMIT_OUTPUT" | grep -q "status: Accepted"; then
    echo "Unexpected notarization status. Aborting."
    exit 1
  fi
  echo "Stapling notarization ticket to app..."
  xcrun stapler staple "$APP"
  echo "Done. Notarized: $APP"
else
  echo "No .app found under $BUNDLE. Run: npm run tauri:build:release"
  exit 1
fi
