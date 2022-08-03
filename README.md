# Setup & Run instructions for Linux with Android

1. Install android studio https://developer.android.com/studio
2. Install Android 12 SDK version 31 reference: https://reactnative.dev/docs/environment-setup
“Android Studio installs the latest Android SDK by default. Building a React Native app with native
code, however, requires the Android 12 (S) SDK in particular. Additional Android SDKs can be installed
through the SDK Manager in Android Studio.“
3. Install Google APIs Intel x86 Atom_64 System Image
4. Install node v14.X or v16.X (v14.20.0 & v16.14.2 are working)
5. Install NPX https://www.npmjs.com/package/npx
6. Install Yarn https://yarnpkg.com/
7. Might also be needed: $ sudo corepack enable
8. Install JDK $sudo apt install default-jdk
9. clone repo to dir
10. cd to dir and run yarn (might be some warnings)
11. connect android phone to USB and enable USB debugging on phone.
12. in the terminal type $npx react-native start
13. Register an app key for the Taplinx SDK library on https://inspire.nxp.com/mifare/
14. Add app key to ./android/app/src/main/java/com/lightningnfcapp/Constants.java
15. open another terminal in same dir and type $npx react-native run-android


## Useful commands

* adb logcat -s "lightningnfcapp"
* java --module-path ~/Android/javafx-sdk-18.0.2/lib --add-modules javafx.controls,javafx.fxml -jar TagXplorer-v1.2.jar

## Libraries Used

### Node packages

"@react-navigation/bottom-tabs": "^6.3.2",
"@react-navigation/native": "^6.0.11",
"expo": "~45.0.0",
"expo-splash-screen": "~0.15.1",
"expo-status-bar": "~1.3.0",
"react": "17.0.2",
"react-dom": "17.0.2",
"react-native": "0.68.2",
"react-native-safe-area-context": "^4.3.1",
"react-native-screens": "^3.15.0",
"react-native-web": "0.17.7"

### Java packages

NXP Taplinx Android Library version 1.9.1

All react native java packages plus

implementation "com.facebook.react:react-native:+"  // From node_modules
implementation "com.google.firebase:firebase-core:17.2.2"
implementation 'org.apache.commons:commons-lang3:3.6'
implementation 'commons-codec:commons-codec:1.13'
implementation group: 'com.madgag.spongycastle', name: 'pkix', version: '1.54.0.0'
implementation group: 'com.madgag.spongycastle', name: 'prov', version: '1.54.0.0'
implementation group: 'com.madgag.spongycastle', name: 'core', version: '1.54.0.0'
