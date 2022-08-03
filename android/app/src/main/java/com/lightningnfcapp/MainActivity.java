package com.lightningnfcapp;


import static com.lightningnfcapp.Constants.ALIAS_DEFAULT_FF;
import static com.lightningnfcapp.Constants.ALIAS_KEY_2KTDES;
import static com.lightningnfcapp.Constants.ALIAS_KEY_2KTDES_ULC;
import static com.lightningnfcapp.Constants.ALIAS_KEY_AES128;
import static com.lightningnfcapp.Constants.ALIAS_KEY_AES128_ZEROES;
import static com.lightningnfcapp.Constants.EMPTY_SPACE;
import static com.lightningnfcapp.Constants.EXTRA_KEYS_STORED_FLAG;
import static com.lightningnfcapp.Constants.KEY_AES128_DEFAULT;
import static com.lightningnfcapp.Constants.KEY_APP_MASTER;
import static com.lightningnfcapp.Constants.PRINT;
import static com.lightningnfcapp.Constants.STORAGE_PERMISSION_WRITE;
import static com.lightningnfcapp.Constants.TAG;
import static com.lightningnfcapp.Constants.TOAST;
import static com.lightningnfcapp.Constants.TOAST_PRINT;
import static com.lightningnfcapp.Constants.bytesKey;
import static com.lightningnfcapp.Constants.cipher;
import static com.lightningnfcapp.Constants.default_ff_key;
import static com.lightningnfcapp.Constants.default_zeroes_key;
import static com.lightningnfcapp.Constants.iv;
import static com.lightningnfcapp.Constants.objKEY_2KTDES;
import static com.lightningnfcapp.Constants.objKEY_2KTDES_ULC;
import static com.lightningnfcapp.Constants.objKEY_AES128;
import static com.lightningnfcapp.Constants.packageKey;


import com.lightningnfcapp.R;
import com.nxp.nfclib.CardType;
import com.nxp.nfclib.NxpNfcLib;
import com.nxp.nfclib.classic.ClassicFactory;
import com.nxp.nfclib.defaultimpl.KeyData;
import com.nxp.nfclib.desfire.DESFireFactory;
import com.nxp.nfclib.desfire.IDESFireEV2;
import com.nxp.nfclib.desfire.IDESFireEV3;
import com.nxp.nfclib.desfire.IDESFireEV3C;
import com.nxp.nfclib.desfire.IDESFireLight;
import com.nxp.nfclib.desfire.IMIFAREIdentity;
import com.nxp.nfclib.desfire.INTAG424DNA;
import com.nxp.nfclib.desfire.NTAG424DNAFileSettings;
import com.nxp.nfclib.exceptions.NxpNfcLibException;
import com.nxp.nfclib.icode.ICodeFactory;
import com.nxp.nfclib.ntag.NTagFactory;
import com.nxp.nfclib.plus.IPlus;
import com.nxp.nfclib.plus.IPlusEV1SL0;
import com.nxp.nfclib.plus.IPlusEV1SL1;
import com.nxp.nfclib.plus.IPlusEV1SL3;
import com.nxp.nfclib.plus.IPlusSL0;
import com.nxp.nfclib.plus.IPlusSL1;
import com.nxp.nfclib.plus.IPlusSL3;
import com.nxp.nfclib.plus.PlusFactory;
import com.nxp.nfclib.plus.PlusSL1Factory;
import com.nxp.nfclib.ultralight.UltralightFactory;
import com.nxp.nfclib.utils.NxpLogUtils;
import com.nxp.nfclib.utils.Utilities;
import com.nxp.nfclib.desfire.MFPCard;
import com.nxp.nfclib.ndef.INdefMessage;
import com.nxp.nfclib.ndef.NdefMessageWrapper;
import com.nxp.nfclib.ndef.NdefRecordWrapper;
import com.nxp.nfclib.exceptions.UsageException;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.List;
import java.util.ArrayList;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.Charset;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.codec.binary.Hex;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Point;
import android.graphics.Typeface;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.MifareClassic;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.preference.PreferenceManager;
import android.text.Html;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AnimationUtils;
import android.view.KeyEvent;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.PackageList;
import com.facebook.react.ReactPackage;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContext;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import expo.modules.ReactActivityDelegateWrapper;


public class MainActivity extends ReactActivity {

  /**
   * NxpNfclib instance.
   */
  private NxpNfcLib libInstance = null;
  /**
   * text view instance.
   */
  private TextView information_textView = null;
  /**
   * Image view instance.
   */
  private ImageView logoAndCardImageView = null;

  private ImageView tapTagImageView;

  private final StringBuilder stringBuilder = new StringBuilder();

  static Object mString;

  CardLogic mCardLogic;

  private ReactRootView mReactRootView; //change
  private ReactInstanceManager mReactInstanceManager;

  private boolean readmode = true;
  private String nodeURL = "";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support 
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    super.onCreate(savedInstanceState);

    mReactRootView = new ReactRootView(this);
    List<ReactPackage> packages = new PackageList(getApplication()).getPackages();
    mReactInstanceManager = ReactInstanceManager.builder()
                .setApplication(getApplication())
                .setCurrentActivity(this)
                .setBundleAssetName("index.android.bundle")
                .setJSMainModulePath("index")
                .addPackages(packages)
                .setUseDeveloperSupport(BuildConfig.DEBUG)
                .setInitialLifecycleState(LifecycleState.RESUMED)
                .build();
    // The string here (e.g. "MyReactNativeApp") has to match
    // the string in AppRegistry.registerComponent() in index.js
    Bundle initialProperties = new Bundle();
    mReactRootView.startReactApplication(mReactInstanceManager, "main", initialProperties);

    tapTagImageView = findViewById(R.id.tap_tag_image);

    boolean readPermission = (ContextCompat.checkSelfPermission(MainActivity.this,
            Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED);

    if (!readPermission) {
        ActivityCompat.requestPermissions(MainActivity.this,
                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                STORAGE_PERMISSION_WRITE
        );
    }

    mCardLogic = CardLogic.getInstance();

    /* Initialize the library and register to this activity */
    initializeLibrary();

    initializeKeys();

    /* Initialize the Cipher and init vector of 16 bytes with 0xCD */
    initializeCipherinitVector();

    /* Get text view handle to be used further */
    // initializeView();

    Log.d(TAG, "onCreate");

  }

  /**
   * Initialize the library and register to this activity.
   */
  private void initializeLibrary() {
      libInstance = NxpNfcLib.getInstance();
      try {
          libInstance.registerActivity(this, packageKey);
      } catch (NxpNfcLibException ex) {
          showMessage(ex.getMessage(), TOAST);
      } catch (Exception e) {
          // do nothing added to handle the crash if any
          showMessage(e.getMessage(), TOAST);
      }
  }

  private void initializeKeys() {
    KeyInfoProvider infoProvider = KeyInfoProvider.getInstance(getApplicationContext());

    SharedPreferences sharedPrefs = getPreferences(Context.MODE_PRIVATE);
    boolean keysStoredFlag = sharedPrefs.getBoolean(EXTRA_KEYS_STORED_FLAG, false);
    if (!keysStoredFlag) {
        //Set Key stores the key in persistent storage, this method can be called only once
        // if key for a given alias does not change.
        byte[] ulc24Keys = new byte[24];
        System.arraycopy(SampleAppKeys.KEY_2KTDES_ULC, 0, ulc24Keys, 0, SampleAppKeys.KEY_2KTDES_ULC.length);
        System.arraycopy(SampleAppKeys.KEY_2KTDES_ULC, 0, ulc24Keys, SampleAppKeys.KEY_2KTDES_ULC.length, 8);
        infoProvider.setKey(ALIAS_KEY_2KTDES_ULC, SampleAppKeys.EnumKeyType.EnumDESKey, ulc24Keys);

        infoProvider.setKey(ALIAS_KEY_2KTDES, SampleAppKeys.EnumKeyType.EnumDESKey, SampleAppKeys.KEY_2KTDES);
        infoProvider.setKey(ALIAS_KEY_AES128, SampleAppKeys.EnumKeyType.EnumAESKey, SampleAppKeys.KEY_AES128);
        infoProvider.setKey(ALIAS_KEY_AES128_ZEROES, SampleAppKeys.EnumKeyType.EnumAESKey, SampleAppKeys.KEY_AES128_ZEROS);
        infoProvider.setKey(ALIAS_DEFAULT_FF, SampleAppKeys.EnumKeyType.EnumMifareKey, SampleAppKeys.KEY_DEFAULT_FF);

        sharedPrefs.edit().putBoolean(EXTRA_KEYS_STORED_FLAG, true).apply();
        //If you want to store a new key after key initialization above, kindly reset the
        // flag EXTRA_KEYS_STORED_FLAG to false in shared preferences.
    }
    try {

        objKEY_2KTDES_ULC = infoProvider.getKey(ALIAS_KEY_2KTDES_ULC, SampleAppKeys.EnumKeyType.EnumDESKey);
        objKEY_2KTDES = infoProvider.getKey(ALIAS_KEY_2KTDES, SampleAppKeys.EnumKeyType.EnumDESKey);
        objKEY_AES128 = infoProvider.getKey(ALIAS_KEY_AES128, SampleAppKeys.EnumKeyType.EnumAESKey);
        default_zeroes_key = infoProvider.getKey(ALIAS_KEY_AES128_ZEROES, SampleAppKeys.EnumKeyType.EnumAESKey);
        default_ff_key = infoProvider.getMifareKey(ALIAS_DEFAULT_FF);
    } catch (Exception e) {
        ((ActivityManager) Objects.requireNonNull(MainActivity.this.getSystemService(ACTIVITY_SERVICE))).clearApplicationUserData();
    }
  }

  
  /**
   * Initialize the Cipher and init vector of 16 bytes with 0xCD.
   */
  private void initializeCipherinitVector() {
    /* Initialize the Cipher */
    try {
        cipher = Cipher.getInstance("AES/CBC/NoPadding");
    } catch (NoSuchAlgorithmException | NoSuchPaddingException e) {
        e.printStackTrace();
    }
    /* set Application Master Key */
    bytesKey = KEY_APP_MASTER.getBytes();

    /* Initialize init vector of 16 bytes with 0xCD. It could be anything */
    byte[] ivSpec = new byte[16];
    Arrays.fill(ivSpec, (byte) 0xCD);
    iv = new IvParameterSpec(ivSpec);
  }

  /**
   * (non-Javadoc).
   *
   * @param intent NFC intent from the android framework.
   *               // @see android.app.Activity#onNewIntent(android.content.Intent)
   */
  @Override
  public void onNewIntent(final Intent intent) {
      Log.d(TAG, "onNewIntent");
      // stringBuilder.delete(0, stringBuilder.length());
      final Bundle extras = intent.getExtras();
      mString = Objects.requireNonNull(extras).get("android.nfc.extra.TAG");
      // logoAndCardImageView.setVisibility(View.VISIBLE);
      try {
          if(this.readmode) {
            readCard(intent);
          }
          else {
            writeCard(intent);
          }
          // cardLogic(intent);
          super.onNewIntent(intent);
          // tapTagImageView.setVisibility(View.GONE);
      } catch (Exception e) {
          Log.e(TAG, "Some exception occurred", e);
          if(e instanceof UsageException && e.getMessage() == "BytesToRead should be greater than 0") {
            WritableMap params = Arguments.createMap();
            params.putString("ndef", "This NFC card has not been formatted.");
            sendEvent("CardHasBeenRead", params);
          }
          //showMessage("Some exception occurred: "+ e.getMessage(), TOAST_PRINT);
      }
  }

  // public void onNewIntent(Intent intent) {
  //   Tag tagFromIntent = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
  //   //do something with tagFromIntent
  // }

  private void readCard(final Intent intent) throws Exception{
    Log.e(TAG, "readCard");

    CardType type = libInstance.getCardType(intent); //Get the type of the card
    if (type == CardType.UnknownCard) {
      showMessage(getString(R.string.UNKNOWN_TAG), PRINT);
    }
    else if (type == CardType.NTAG424DNA) {
      INTAG424DNA ntag424DNA = DESFireFactory.getInstance().getNTAG424DNA(libInstance.getCustomModules());
      byte[] NTAG424DNA_APP_NAME = {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
      String tagname = ntag424DNA.getType().getTagName() + ntag424DNA.getType().getDescription();
      String UID = Utilities.dumpBytes(ntag424DNA.getUID());
      // String FileCounter = Utilities.dumpBytes(ntag424DNA.getFileCounters(0));
      int totalMem = ntag424DNA.getTotalMemory();
      byte[] getVersion = ntag424DNA.getVersion();
      String vendor = "Non NXP";
      if (getVersion[0] == (byte) 0x04) {
        vendor = "NXP";
      }         

      String cardDataBuilder = "Tagname: "+tagname+"\r\n"+
        "UID: "+UID+"\r\n"+
        "totalMem: "+totalMem+"\r\n"+
        // "getVersion: "+Utilities.dumpBytes(getVersion)+"\r\n"+
        "vendor: "+vendor+"\r\n";

      ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
      KeyData aesKeyData = new KeyData();
      Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
      aesKeyData.setKey(keyDefault);
      ntag424DNA.authenticateEV2First(0, aesKeyData, null);

      NTAG424DNAFileSettings readSettings2 = ntag424DNA.getFileSettings(2);

      INdefMessage ndefRead = ntag424DNA.readNDEF();
      Log.d(TAG, "***NDEF READ : "+this.decodeHex(ndefRead.toByteArray()));

      WritableMap params = Arguments.createMap();
      params.putString("cardReadInfo", cardDataBuilder);
      params.putString("ndef", this.decodeHex(ndefRead.toByteArray()).substring(5));
      params.putString("cardFileSettings", readSettings2.toString().replace(",", ",\r\n"));
      sendEvent("CardHasBeenRead", params);


    }
  }

  private void writeCard(final Intent intent) throws Exception{
    Log.e(TAG, "writeCard");

    if (this.nodeURL == null || this.nodeURL.equals("")) {
      throw new Exception("Lightning node URL must not be empty");
    }

    CardType type = libInstance.getCardType(intent); //Get the type of the card
    if (type == CardType.UnknownCard) {
      showMessage(getString(R.string.UNKNOWN_TAG), PRINT);
    }
    else if (type == CardType.NTAG424DNA) {
      INTAG424DNA ntag424DNA = DESFireFactory.getInstance().getNTAG424DNA(libInstance.getCustomModules());
      byte[] NTAG424DNA_APP_NAME = {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
      
      ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
      KeyData aesKeyData = new KeyData();
      Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
      aesKeyData.setKey(keyDefault);
      ntag424DNA.authenticateEV2First(0, aesKeyData, null);

      NTAG424DNAFileSettings fileSettings = new NTAG424DNAFileSettings(
        MFPCard.CommunicationMode.Plain,
        (byte) 0xE,
        (byte) 0xE,
        (byte) 0xE,
        (byte) 0x0
      );

      //picc offset = 9 + nodeURL length + 3 +7(junk at start?)
      //mac offset = 9 + nodeURL length + 38 +7(junk at start?)
      int piccOffset = 9 + nodeURL.length() + 3 + 7;
      int macOffset = 9 + nodeURL.length() + 38 + 7;
      fileSettings.setSdmAccessRights(new byte[] {(byte) 0xFF, (byte) 0x12});
      fileSettings.setSDMEnabled(true);
      fileSettings.setUIDMirroringEnabled(true);
      fileSettings.setSDMReadCounterEnabled(true);
      fileSettings.setSDMReadCounterLimitEnabled(false);
      fileSettings.setSDMEncryptFileDataEnabled(false);
      fileSettings.setUidOffset(null);
      fileSettings.setSdmReadCounterOffset(null);
      fileSettings.setPiccDataOffset(new byte[] {(byte) piccOffset, (byte) 0, (byte) 0});
      fileSettings.setSdmMacInputOffset(new byte[] {(byte) macOffset, (byte) 0, (byte) 0});
      fileSettings.setSdmEncryptionOffset(null);
      fileSettings.setSdmEncryptionLength(null);
      fileSettings.setSdmMacOffset(new byte[] {(byte) macOffset, (byte) 0, (byte) 0});
      fileSettings.setSdmReadCounterLimit(null);

      ntag424DNA.changeFileSettings(2, fileSettings);

      NdefMessageWrapper msg = new NdefMessageWrapper(
        NdefRecordWrapper.createUri("lnurlw://"+nodeURL+"?p=00000000000000000000000000000000&c=0000000000000000")
      );

      // ntag424DNA.writeData(2, 0, ArrayUtils.addAll(initialBytes, urlbytes));
      ntag424DNA.writeNDEF(msg);


      INdefMessage ndefAfterRead = ntag424DNA.readNDEF();
      Log.d(TAG, "***NDEF AFTER READ : "+this.decodeHex(ndefAfterRead.toByteArray()));



      WritableMap params = Arguments.createMap();
      params.putString("output", "Success");
      sendEvent("WriteResult", params);

    }
  }
  
  
  protected String decodeHex(byte[] input) throws Exception {
    return this.decodeHex(new BigInteger(1, input).toString(16));
  }

  protected String decodeHex(String input) throws Exception {
    byte[] bytes = Hex.decodeHex(input.toCharArray());
    return new String(bytes, "UTF-8");
  }

  @Override
  protected void onPause() {
      super.onPause();
      Log.d(TAG, "onPause");

      libInstance.stopForeGroundDispatch();
      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostPause(this);
      }
  }

  @Override
  protected void onResume() {
      super.onResume();
      Log.d(TAG, "onResume");

      libInstance.startForeGroundDispatch();
      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostResume(this, this);
      }
  }

  @Override
  protected void onDestroy() {
      super.onDestroy();
      Log.d(TAG, "onDestroy");

      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostDestroy(this);
      }
      if (mReactRootView != null) {
          mReactRootView.unmountReactApplication();
      }
  }

  @Override
  public void onBackPressed() {
    Log.d(TAG, "onBackPressed");

    if (mReactInstanceManager != null) {
        mReactInstanceManager.onBackPressed();
    } else {
        super.onBackPressed();
    }
  }

  @Override
  public boolean onKeyUp(int keyCode, KeyEvent event) {
      if (keyCode == KeyEvent.KEYCODE_MENU && mReactInstanceManager != null) {
          mReactInstanceManager.showDevOptionsDialog();
          return true;
      }
      return super.onKeyUp(keyCode, event);
  }

  public void setNodeURL(String url) {
    Log.d(TAG, "MainActivity.setNodeURL: "+url);
    this.nodeURL = url;
    // callback.invoke(null, "Hello");
  }

  public void setReadMode(boolean readmode) {
    Log.d(TAG, "MainActivity.setReadMode: "+readmode);
    this.readmode = readmode;
    // callback.invoke(null, "Hello");
  }

  private void sendEvent(String eventName, WritableMap params) {
    ReactContext reactContext = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

  // @ReactMethod
  // public void requestTechnology(ReadableArray techs, Callback callback) {
  //     synchronized(this) {
  //         if (!isForegroundEnabled) {
  //             callback.invoke(ERR_NOT_REGISTERED);
  //             return;
  //         }

  //         if (hasPendingRequest()) {
  //             callback.invoke(ERR_MULTI_REQ);
  //         } else {
  //             techRequest = new TagTechnologyRequest(techs.toArrayList(), callback);
  //         }
  //     }
  // }

  // @ReactMethod
  // public void getTag(Callback callback) {
  //     synchronized (this) {
  //         if (techRequest != null) {
  //             Tag tag = techRequest.getTagHandle();
  //             if (tag != null) {
  //                 WritableMap parsed = tag2React(tag);
  //                 if (Arrays.asList(tag.getTechList()).contains(Ndef.class.getName())) {
  //                     try {
  //                         Ndef ndef = Ndef.get(tag);
  //                         parsed = ndef2React(ndef, new NdefMessage[]{ndef.getCachedNdefMessage()});
  //                     } catch (Exception ex) {
  //                     }
  //                 }
  //                 callback.invoke(null, parsed);
  //             } else {
  //                 callback.invoke(ERR_NO_REFERENCE);
  //             }
  //         } else {
  //             callback.invoke(ERR_NO_TECH_REQ);
  //         }
  //     }
  // }


  // @ReactMethod
  // public void cancelTechnologyRequest(Callback callback) {
  //     synchronized(this) {
  //         if (techRequest != null) {
  //             techRequest.close();
  //             try {
  //                 techRequest.getPendingCallback().invoke(ERR_CANCEL);
  //             } catch (RuntimeException ex) {
  //                 // the pending callback might already been invoked when there is an ongoing
  //                 // connected tag, bypass this case explicitly
  //             }
  //             techRequest = null;
  //             callback.invoke();
  //         } else {
  //             // explicitly allow this
  //             callback.invoke();
  //         }
  //     }
  // }

  /**
   * This will display message in toast or logcat or on screen or all three.
   *
   * @param str           String to be logged or displayed
   * @param operationType 't' for Toast; 'n' for Logcat and Display in UI; 'd' for Toast, Logcat
   *                      and
   *                      Display in UI.
   */
  private void showMessage(final String str, final char operationType) {
    Toast.makeText(MainActivity.this, str, Toast.LENGTH_SHORT).show();
    NxpLogUtils.i(TAG, getString(R.string.Dump_data) + str);
    
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected Bundle getLaunchOptions() {
        Bundle initialProperties = new Bundle();
        initialProperties.putCharSequence("carddata", new String("Please scan NFC Card"));
        return initialProperties;
      }
    };
  }


  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }
}
