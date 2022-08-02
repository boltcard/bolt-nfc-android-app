Setup & Run instructions for Linux with Android

1. Install android studio https://developer.android.com/studio
2. Install Android 12 SDK version 31
3. Install NPX https://www.npmjs.com/package/npx
4. Install Yarn https://yarnpkg.com/
5. clone repo to dir
6. cd to dir and run yarn
7. connect android phone to USB and enable USB debugging on phone.
8. in the terminal type $npx react-native start
9. Register an app key for the Taplinx SDK library on https://inspire.nxp.com/mifare/
10. Add app key to Constants.java
11. open another terminal in same dir and type $npx react-native run-android


Useful commands
adb logcat -s "lightningnfcapp"
java --module-path ~/Android/javafx-sdk-18.0.2/lib --add-modules javafx.controls,javafx.fxml -jar TagXplorer-v1.2.jar