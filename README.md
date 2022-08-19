# Boltcard NFC Programming App

Quickly program a blank NFC card (NTAG424DNA) to act as your own personal Boltcard. A contactless / paywave like experience for the Lightning network. Before programming your NFC card you must set up your own [boltcard server](https://github.com/boltcard/boltcard).

The boltcard can be used with Lightning PoS terminals that have NFC support, or Breez wallet PoS App.

## Current Version
v0.0.7

## Setup & Run instructions for Linux with Android

### Quick

Download the compiled APK from the [latest release](https://github.com/boltcard/bolt-nfc-android-app/releases) and install on your android phone.

### Build instructions
1. Install android studio https://developer.android.com/studio
2. Install Android 12 SDK version 31 reference: https://reactnative.dev/docs/environment-setup
“Android Studio installs the latest Android SDK by default. Building a React Native app with native code, however, requires the Android 12 (S) SDK in particular. Additional Android SDKs can be installed through the SDK Manager in Android Studio.“
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
14. Rename .env-example to .env and set the Mifare package key in this file
15. open another terminal in same dir and type $npx react-native run-android

## Usage

1. Install [boltcard server](https://github.com/boltcard/boltcard) and aquire some blank NTAG424DNA tags. 
2. When app has loaded go to the write screen and put your lnurlw domain and path in to the text box.
3. When finished tap a card on the NFC scanner to write the card.
4. Go to the read screen and check that your URL looks correct. Should also be outputting the PICC and CMAC as URL paramters
5. To change your keys (to prevent malicious re-writing of your card) Go to the boltcard server terminal and run the command to show the card key change URL in QR code form and then scan this with the phone camera to load the server keys.
6. When the keys are loaded, Hold the NFC card to the phone to run the key change on the card. Do not move the card until the key change has completed. 
Warning! If you lose the new keys then you will be unable to reprogram the card again

## Useful commands

* adb logcat -s "lightningnfcapp"
* java --module-path ~/Android/javafx-sdk-18.0.2/lib --add-modules javafx.controls,javafx.fxml -jar TagXplorer-v1.2.jar
* ./gradlew assembleRelease