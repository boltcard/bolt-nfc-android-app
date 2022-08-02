package com.lightningnfcapp;

import static com.lightningnfcapp.Constants.TAG;


import com.facebook.react.*;
import com.facebook.react.bridge.*;
import java.util.*;
import android.app.*;
import android.util.Log;


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
    public void finish() {
        Log.d(TAG, "finish");

        MainActivity activity = (MainActivity) getCurrentActivity();
        activity.getSomething(null);
        
    }

}