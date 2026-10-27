# Lantern (Expo)

Lantern is a customizable mobile browser built with Expo and React Native.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install --legacy-peer-deps`.
3. Run `npx expo install --fix`.
4. Run `npx expo start` and scan the QR code with Expo Go.

## Build

Use Expo Application Services (EAS) for signed iOS and Android builds. Configure your own app identifiers in `app.json` before publishing.

The GitHub Actions workflows in `.github/workflows/` provide build automation. The unsigned iOS IPA workflow is for producing an artifact only; an unsigned IPA generally cannot be installed on a device without appropriate signing and provisioning.
