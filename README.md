# Boltcard NFC Programming App

Quickly program a blank NFC card (NTAG424DNA) to act as your own personal Boltcard. A contactless / paywave like experience for the Lightning network. Before programming your NFC card you must set up your own [boltcard server](https://github.com/boltcard/boltcard).

The boltcard can be used with Lightning PoS terminals that have NFC support, or Breez wallet PoS App.

The app is currently Android only.

Since December 2022 it may be possible to add iOS support using the new [NXP Mifare TapLinx iOS SDK library](https://www.mifare.net/en/products/tools/taplinx/) as this application is written in React Native.

Find out more at [boltcard.org](https://boltcard.org)

# [Card programming errors](card-programming-errors.md)

## Current Version
v0.3.2

## NFC Card Support
 * NXP NTAG424 DNA
 * NXP NTAG424 DNA TT (Tag Tamper) Thanks to [Bassim](https://github.com/bassim)

## Quick Install

Download the compiled APK from the [latest release](https://github.com/boltcard/bolt-nfc-android-app/releases) and install on your android phone.

Download from the [Google Play store](https://play.google.com/store/apps/details?id=com.lightningnfcapp&hl=en&gl=US)

## Setup & Run instructions for Linux with Android

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

## Wiping cards

To wipe a card get the keys into a json in the following format:
```
{
	"version": 1,
	"action": "wipe",
	"k0": "11111111111111111111111111111111",
	"k1": "22222222222222222222222222222222",
	"k2": "33333333333333333333333333333333",
	"k3": "44444444444444444444444444444444",
	"k4": "55555555555555555555555555555555"
}
```
Go to the advanced > key reset screen and either paste this json from the clipboard or scan a QR code with this JSON encoded in it.
Then press "reset card now" and tap and hold your card against the NFC reader. 

## UID Privacy

As of 0.1.4 the app now supports card UID Randomisation (irreversable). If you add the "uid_privacy" field and set its value to "Y" the card will be programmed to have a random UID. Any other value or ommission of this field will leave the card UID as-is. Please note this action is irreversable.

```
{
    "protocol_name": "new_bolt_card_response",
    "protocol_version":1,
    "card_name": "Spending_Card",
    "lnurlw_base": "lnurlw://your.domain.com/ln", 
    "uid_privacy": "Y",
    "k0":"11111111111111111111111111111111",
    "k1":"22222222222222222222222222222222",
    "k2":"33333333333333333333333333333333",
    "k3":"44444444444444444444444444444444",
    "k4":"55555555555555555555555555555555"
}
```

# Dependencies / Security considerations

We rely on the Taplinx 2.0 Android library supplied by NXP. 

React native libraries are also used to make building the UI easier.

Keep all your keys secret, and be careful when creating your cards that there are no other potential listening devices in range.

# Version info

## 0.2.0
Support for iOS devices. Rebuilt the card communication. Uses raw ADPU commands from react native.

## 0.1.9
Various fixes to attempt to prevent card programming errors

## 0.1.6
Remove key check code to prevent card programming errors

## 0.1.4
Added support for random UID to increase privacy. https://github.com/boltcard/bolt-nfc-android-app/issues/25

# [Testing](testing.md)

## Useful debug commands

* npm run run-android
* adb logcat -s "lightningnfcapp"
* java --module-path ~/Android/javafx-sdk-18.0.2/lib --add-modules javafx.controls,javafx.fxml -jar TagXplorer-v1.2.jar
* ./gradlew assembleRelease
* \copy (select * from cards order by card_id) to export.csv CSV HEADER;
* echo \"{\\\"commit\\\":\\\"`git rev-parse --short HEAD`\\\"}\" > gitinfo.json
