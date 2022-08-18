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

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.GCMParameterSpec;

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
import org.bouncycastle.crypto.engines.AESEngine;
import org.bouncycastle.crypto.macs.CMac;
import org.bouncycastle.crypto.BlockCipher;
import org.bouncycastle.crypto.CipherParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.crypto.engines.AESFastEngine;
import org.bouncycastle.crypto.Mac;

import expo.modules.ReactActivityDelegateWrapper;

public class MainActivity extends ReactActivity {

  /**
   * NxpNfclib instance.
   */
  private NxpNfcLib libInstance = null;

  private final StringBuilder stringBuilder = new StringBuilder();

  static Object mString;

  CardLogic mCardLogic;

  private ReactRootView mReactRootView; //change
  private ReactInstanceManager mReactInstanceManager;

  private final String CARD_MODE_READ = "read";
  private final String CARD_MODE_WRITE = "write";
  private final String CARD_MODE_WRITEKEYS = "writekeys";
  private final String CARD_MODE_DEBUGRESETKEYS = "resetkeys";
  
  private String cardmode = CARD_MODE_READ;
  private String nodeURL = "";
  private String packageKey = BuildConfig.MIFARE_KEY;

  private byte[] key0;
  private byte[] key1;
  private byte[] key2;
  
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
   * // @see android.app.Activity#onNewIntent(android.content.Intent)
   */
  @Override
  public void onNewIntent(final Intent intent) {
      final Bundle extras = intent.getExtras();
      mString = Objects.requireNonNull(extras).get("android.nfc.extra.TAG");
      try {
          if(this.cardmode.equals(CARD_MODE_WRITE)) {
            writeCard(intent);
          }
          else if(this.cardmode.equals(CARD_MODE_WRITEKEYS)) {
            writeKeys(intent);
          }
          else if(this.cardmode.equals(CARD_MODE_DEBUGRESETKEYS)) {
            debugResetKeys(intent);
          }
          else { //this.cardmode == CARD_MODE_READ, or if in doubt, just read the card
            readCard(intent);
          }
          super.onNewIntent(intent);
      } catch (Exception e) {
          Log.e(TAG, "Some exception occurred", e);
          if(e instanceof UsageException && e.getMessage() == "BytesToRead should be greater than 0") {
            WritableMap params = Arguments.createMap();
            params.putString("ndef", "This NFC card has not been formatted.");
            sendEvent("CardHasBeenRead", params);
            WritableMap params = Arguments.createMap();
            params.putString("message", "This NFC card has not been formatted.");
            sendEvent("NFCError", params);
          }
          else {
            WritableMap params = Arguments.createMap();
            params.putString("ndef", "Error: "+e.getMessage());
            sendEvent("CardHasBeenRead", params);
            WritableMap params = Arguments.createMap();
            params.putString("message", "Error: "+e.getMessage());
            sendEvent("NFCError", params);
          }
          
      }
  }

  /**
   * Authenticates with the change key (key 0) and checks the card is the correct type and format.
   * @param intent
   * @return
   */
  public INTAG424DNA authenticateChangeKey(final Intent intent) throws Exception {

    CardType type = libInstance.getCardType(intent); //Get the type of the card
    if (type == CardType.UnknownCard) {
      showMessage(getString(R.string.UNKNOWN_TAG), PRINT);
      throw new Exception("Unknown Tag. Maybe try again?");
    }
    else if (type != CardType.NTAG424DNA) {
      showMessage("NFC Card must be of type NTAG424DNA", PRINT);
      throw new Exception("NFC Card must be of type NTAG424DNA");
    }
    INTAG424DNA ntag424DNA = DESFireFactory.getInstance().getNTAG424DNA(libInstance.getCustomModules());
    byte[] NTAG424DNA_APP_NAME = {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
    
    ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
    KeyData aesKeyData = new KeyData();
    Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
    aesKeyData.setKey(keyDefault);
    ntag424DNA.authenticateEV2First(0, aesKeyData, null);
    return ntag424DNA;
  }

  /**
   * Reads the NFC card unauthenticated and dumps the first NDEF message along with other
   * interesting info.
   * 
   * @param intent
   * @throws Exception
   */
  private void readCard(final Intent intent) throws Exception{

    CardType type = libInstance.getCardType(intent); //Get the type of the card
    if (type == CardType.UnknownCard) {
      showMessage(getString(R.string.UNKNOWN_TAG), PRINT);
    }
    else if (type == CardType.NTAG424DNA) {
      INTAG424DNA ntag424DNA = DESFireFactory.getInstance().getNTAG424DNA(libInstance.getCustomModules());
      byte[] NTAG424DNA_APP_NAME = {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
      
      String tagname = ntag424DNA.getType().getTagName() + ntag424DNA.getType().getDescription();
      String UID = Utilities.dumpBytes(ntag424DNA.getUID());
      int totalMem = ntag424DNA.getTotalMemory();
      byte[] getVersion = ntag424DNA.getVersion();
      String vendor = (getVersion[0] == (byte) 0x04) ? "NXP" : "Non NXP"; 

      String cardDataBuilder = "Tagname: "+tagname+"\r\n"+
        "UID: "+UID+"\r\n"+
        "TotalMem: "+totalMem+"\r\n"+
        "Vendor: "+vendor+"\r\n";

      INdefMessage ndefRead = ntag424DNA.readNDEF();

      //Check if auth works to see if key0 is zero.
      String key0Changed = null;
      try {
        key0Changed="no";
        ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
        KeyData aesKeyData = new KeyData();
        Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
        aesKeyData.setKey(keyDefault);
        ntag424DNA.authenticateEV2First(0, aesKeyData, null);
      }
      catch(Exception e) {
        key0Changed="yes";
      }

      //check PICC encryption to see if key1 is zero
      String bolturl = this.decodeHex(ndefRead.toByteArray()).substring(5);
      String pParam = bolturl.split("p=")[1].substring(0, 32);
      String cParam = bolturl.split("c=")[1].substring(0, 16);
      String pDecrypt = this.decrypt(this.hexStringToByteArray(pParam));
      String key1Changed = "yes";
      if(pDecrypt.startsWith("0xC7"+UID.substring(2))) {
        key1Changed = "no";
      }
      
      String sv2string = "3CC300010080"+pDecrypt.substring(4,24);
      byte[] sv2 = this.hexStringToByteArray(sv2string);

      int cmacPos = bolturl.indexOf("c=")+7;
      byte[] msg = sv2; //Arrays.copyOfRange(ndefRead.toByteArray(), 0, cmacPos-1);
      
      //Check CMAC to see if key2 is zero.
      String key2Changed = null;
      try {
        int cmacSize = 16;
        BlockCipher cipher = new AESFastEngine();
        Mac cmac = new CMac(cipher, cmacSize * 8);
        KeyParameter keyParameter = new KeyParameter(KEY_AES128_DEFAULT);
        cmac.init(keyParameter);
        cmac.update(msg, 0, msg.length);
        byte[] CMAC = new byte[cmacSize];
        cmac.doFinal(CMAC, 0);

        int cmacSize1 = 16;
        BlockCipher cipher1 = new AESFastEngine();
        Mac cmac1 = new CMac(cipher1, cmacSize1 * 8);
        KeyParameter keyParameter1 = new KeyParameter(CMAC);
        cmac.init(keyParameter1);
        cmac.update(new byte[0], 0, 0);
        byte[] CMAC1 = new byte[cmacSize1];
        cmac.doFinal(CMAC1, 0);

        byte[] MFCMAC = new byte[cmacSize / 2];

        int j = 0;
        for (int i = 0; i < CMAC1.length; i++) {
          if (i % 2 != 0) {
            MFCMAC[j] = CMAC1[i];
            j += 1;
          }
        }

        if(!Utilities.dumpBytes(MFCMAC).equals("0x"+cParam)) {
          key2Changed = "yes";
        }
        else {
          key2Changed = "no";
        }

      } catch (Exception ex) {
        key2Changed = "yes";
      }

      
      WritableMap params = Arguments.createMap();
      params.putString("cardReadInfo", cardDataBuilder);
      params.putString("ndef", bolturl);
      params.putString("key0Changed", key0Changed);
      params.putString("key1Changed", key1Changed);
      params.putString("key2Changed", key2Changed);
      params.putString("cardUID", UID.substring(2));
      sendEvent("CardHasBeenRead", params);
    }
  }


  public String decrypt(byte[] encryptedData) throws Exception {
    Cipher decryptionCipher = Cipher.getInstance("AES/CBC/NoPadding");    
    byte[] ivSpec = new byte[16];
    Arrays.fill(ivSpec, (byte) 0x00);
    IvParameterSpec spec = new IvParameterSpec(ivSpec);
    Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
    decryptionCipher.init(Cipher.DECRYPT_MODE, keyDefault, spec);
    byte[] decryptedBytes = decryptionCipher.doFinal(encryptedData);
    return Utilities.dumpBytes(decryptedBytes);
  }

  /**
   * Writes the NFC card with the lnurlw:// and domain and path specified, 
   * sets up PICC and MAC mirroring and sets correct PICC and MAC mirror offsets
   * 
   * @param intent
   * @throws Exception
   */
  private void writeCard(final Intent intent) throws Exception{
    String result = "success";
    try{

      INTAG424DNA ntag424DNA = this.authenticateChangeKey(intent);
    
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
        NdefRecordWrapper.createUri(
          nodeURL.indexOf("?") == -1 ? 
            "lnurlw://"+nodeURL+"?p=00000000000000000000000000000000&c=0000000000000000"
          :
            "lnurlw://"+nodeURL+"&p=00000000000000000000000000000000&c=0000000000000000"
        )
      );

      ntag424DNA.writeNDEF(msg);

      INdefMessage ndefAfterRead = ntag424DNA.readNDEF();
    }
    catch(Exception e) {
      result = "Error writing card: "+e.getMessage();
      Log.d(TAG, e.getMessage());
    }

    WritableMap params = Arguments.createMap();
    params.putString("output", result);
    sendEvent("WriteResult", params);

  }

  /**
   * Write the keys stored in memory to the NFC card (assmumes default zero byte keys)
   * 
   * @param intent
   * @throws Exception
   */
  private void writeKeys(final Intent intent) throws Exception{
    String result = "success";
    try{
      INTAG424DNA ntag424DNA = this.authenticateChangeKey(intent);

      //changeKey(int keyNumber, byte[] currentKeyData, byte[] newKeyData, byte newKeyVersion)
      int key0newVersion = ntag424DNA.getKeyVersion(0)+1;
      int key1newVersion = ntag424DNA.getKeyVersion(1)+1;
      int key2newVersion = ntag424DNA.getKeyVersion(2)+1;

      //set up the default key
      KeyData aesKeyData = new KeyData();
      Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
      aesKeyData.setKey(keyDefault);

      // change key 0 last as this is the change key
      ntag424DNA.changeKey(1, KEY_AES128_DEFAULT, this.key1, (byte) key1newVersion);
      
      ntag424DNA.authenticateEV2First(0, aesKeyData, null);
      ntag424DNA.changeKey(2, KEY_AES128_DEFAULT, this.key2, (byte) key2newVersion);

      ntag424DNA.authenticateEV2First(0, aesKeyData, null);
      ntag424DNA.changeKey(0, KEY_AES128_DEFAULT, this.key0, (byte) key0newVersion);
    }
    catch(Exception e) {
      result = "Error changing keys: "+e.getMessage();
      Log.d(TAG, "Error changing keys: "+e);
    }
    WritableMap params = Arguments.createMap();
    params.putString("output", result);
    sendEvent("WriteKeysResult", params);
  }

  /**
   * Debug Reset all keys back to zero bytes from 111, 222, 333
   * @param intent
   * @throws Exception
   */
  private void debugResetKeys(final Intent intent) throws Exception{
    String result = "success";
    try{
      CardType type = libInstance.getCardType(intent); //Get the type of the card
      if (type == CardType.UnknownCard) {
        showMessage(getString(R.string.UNKNOWN_TAG), PRINT);
        throw new Exception("Unknown Tag. Maybe try again?");
      }
      else if (type != CardType.NTAG424DNA) {
        showMessage("NFC Card must be of type NTAG424DNA", PRINT);
        throw new Exception("NFC Card must be of type NTAG424DNA");
      }
      INTAG424DNA ntag424DNA = DESFireFactory.getInstance().getNTAG424DNA(libInstance.getCustomModules());
      byte[] NTAG424DNA_APP_NAME = {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
      
      ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
      KeyData aesKeyData = new KeyData();
      Key keyDefault = new SecretKeySpec(this.hexStringToByteArray("11111111111111111111111111111111"), "AES");
      aesKeyData.setKey(keyDefault);
      ntag424DNA.authenticateEV2First(0, aesKeyData, null);

      //changeKey(int keyNumber, byte[] currentKeyData, byte[] newKeyData, byte newKeyVersion)
      int keynewVersion = 0;

      // change key 0 last as this is the change key
      ntag424DNA.changeKey(1, this.hexStringToByteArray("22222222222222222222222222222222"), KEY_AES128_DEFAULT, (byte) keynewVersion);
      
      ntag424DNA.authenticateEV2First(0, aesKeyData, null);
      ntag424DNA.changeKey(2, this.hexStringToByteArray("33333333333333333333333333333333"), KEY_AES128_DEFAULT, (byte) keynewVersion);

      ntag424DNA.authenticateEV2First(0, aesKeyData, null);
      ntag424DNA.changeKey(0, this.hexStringToByteArray("11111111111111111111111111111111"), KEY_AES128_DEFAULT, (byte) keynewVersion);
    }
    catch(Exception e) {
      result = "Error resetting keys: "+e.getMessage();
    }
    WritableMap params = Arguments.createMap();
    params.putString("output", result);
    sendEvent("ChangeKeysResult", params);
  }

  /**
   * Called by react native to set new keys in memory for prepare for writing to the NFC card
   * @param key0
   * @param key1
   * @param key2
   * @param callBack
   */
  public void changeKeys(String key0, String key1, String key2, Callback callBack) {
    this.cardmode = CARD_MODE_WRITEKEYS;
    String result = "Success";
    if(key0 == null && key1 == null && key2 == null) {
      this.key0 = null;
      this.key1 = null;
      this.key2 = null;
    }
    try {
      this.key0 = this.hexStringToByteArray(key0);
      this.key1 = this.hexStringToByteArray(key1);
      this.key2 = this.hexStringToByteArray(key2);    
    }
    catch(Exception e) {
      Log.d(TAG, "Error one or more keys are invalid: "+e.getMessage());
      result = "Error one or more keys are invalid";
    }
    callBack.invoke(result);
  }

  private void sendEvent(String eventName, WritableMap params) {
    ReactContext reactContext = getReactNativeHost().getReactInstanceManager().getCurrentReactContext();
    
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(eventName, params);
  }

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

  public byte[] hexStringToByteArray(String s) {
    final int len = s.length();
    // "111" is not a valid hex encoding.
    if( len%2 != 0 )
        throw new IllegalArgumentException("hexBinary needs to be even-length: "+s);

    byte[] out = new byte[len/2];

    for( int i=0; i<len; i+=2 ) {
        int h = hexToBin(s.charAt(i  ));
        int l = hexToBin(s.charAt(i+1));
        if( h==-1 || l==-1 )
            throw new IllegalArgumentException("contains illegal character for hexBinary: "+s);

        out[i/2] = (byte)(h*16+l);
    }

    return out;
  }

  private static int hexToBin( char ch ) {
    if( '0'<=ch && ch<='9' )    return ch-'0';
    if( 'A'<=ch && ch<='F' )    return ch-'A'+10;
    if( 'a'<=ch && ch<='f' )    return ch-'a'+10;
    return -1;
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

      libInstance.stopForeGroundDispatch();
      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostPause(this);
      }
  }

  @Override
  protected void onResume() {
      super.onResume();

      libInstance.startForeGroundDispatch();
      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostResume(this, this);
      }
  }

  @Override
  protected void onDestroy() {
      super.onDestroy();

      if (mReactInstanceManager != null) {
          mReactInstanceManager.onHostDestroy(this);
      }
      if (mReactRootView != null) {
          mReactRootView.unmountReactApplication();
      }
  }

  @Override
  public void onBackPressed() {

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
    this.nodeURL = url;
  }

  public void setCardMode(String cardmode) {
    this.cardmode = cardmode;
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
