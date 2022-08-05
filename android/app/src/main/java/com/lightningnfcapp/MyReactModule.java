package com.lightningnfcapp;

import static com.lightningnfcapp.Constants.TAG;


import com.facebook.react.*;
import com.facebook.react.bridge.*;
import java.util.*;
import android.app.*;
import android.util.Log;
import com.facebook.react.bridge.Callback;

/**
 * This class is just to pass function calls through from React Native
 * to the main activity. There might be a cleaner way of doing this. Not sure.
 */
public class MyReactModule extends ReactContextBaseJavaModule {

    public MyReactModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Log.d(TAG, "reactContext");
    }

    @Override
    public String getName() {
        return getClass().getSimpleName();
    }

    @ReactMethod
    public void setCardMode(String cardmode) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        activity.setCardMode(cardmode);
    }

    @ReactMethod
    public void setNodeURL(String url) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        activity.setNodeURL(url);
    }

    @ReactMethod
    public void changeKeys(String key0, String key1, String key2, Callback callBack) {
        MainActivity activity = (MainActivity) getCurrentActivity();
        activity.changeKeys(key0, key1, key2, callBack);
    }

}