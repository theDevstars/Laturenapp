# Saturn — Expo Go preview

Saturn is a simple mobile browser built with Expo and React Native. The current app uses React Native WebView, which is available in Expo Go.

## Open Saturn in Expo Go

**Expo Go needs a running development server. GitHub by itself cannot provide the live QR code.**

1. Install **Expo Go** on your iPhone from the App Store: https://expo.dev/go
2. On a computer, install Node.js 20 or newer.
3. Clone this repository:
   ```bash
   git clone https://github.com/theDevstars/Laturenapp.git
   cd Laturenapp
   npm install --legacy-peer-deps
   npx expo install --fix
   npx expo start --tunnel
   ```
4. Keep the terminal running. It will show a QR code.
5. Open the iPhone Camera app and scan the QR code, then tap the prompt to open Saturn in Expo Go. If prompted, open the project directly in Expo Go.

If you only have your iPhone and no computer, tell me and I can guide you through an Expo Snack preview instead.

## Notes

- This is a development preview, not an App Store release.
- The unsigned IPA workflow creates a build artifact, but an unsigned IPA generally cannot be installed on an iPhone without appropriate signing and provisioning.
- Before distribution, replace the placeholder iOS bundle identifier `com.yourname.lantern` in `app.json` with an identifier you control.
