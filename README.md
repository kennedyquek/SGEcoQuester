# SGEcoQuester
This repo is the repository for SGEcoQuester, an AR app for eco-conscious urban exploration.

## Requirements

- A Mac with Xcode, its iOS platform tools and CocoaPods installed.
- Node.js 24 LTS (24.3 or later in the 24.x series), including npm.
- A physical ARKit-compatible iPhone, connected to the Mac. Enable Developer Mode and trust the computer when prompted.
- An Apple account configured in Xcode for development signing.
- Internet access to install dependencies and download the recognition model when it loads.

  ## First setup on the Mac

1. Clone or download this repository. Open Terminal in its root folder, where `package.json` is located.
2. Install the locked dependencies and generate the iOS project:

   ```bash
   npm ci
   npx expo prebuild --platform ios
   open ios/*.xcworkspace
   ```

3. In Xcode, select the **SGEcoQuester application target**, open **Signing & Capabilities**, enable **Automatically manage signing**, and choose your development team. If the bundle identifier is unavailable, set a unique `expo.ios.bundleIdentifier` in `app.json`, then rerun prebuild.
4. Connect and unlock the iPhone, then build and install the app:

   ```bash
   npx expo run:ios --device
   ```

   Select the connected iPhone. Keep the terminal running while using this development build.

   ## Trying the app

Take or choose a photograph, confirm or change the suggested topic, read its fact and complete the quiz. Manual topic selection is also available. From the fact screen, choose **View fact in AR**, slowly scan a well-lit floor or table and tap a detected surface. Stay in a safe position while using AR.

Progress is stored locally. Recognition can be slow or produce no useful suggestion; selecting another topic allows the learning activity to continue.

## Automated tests

```bash
npm test
```

These tests check application rules and simulated download handling, not physical camera or AR behaviour.
