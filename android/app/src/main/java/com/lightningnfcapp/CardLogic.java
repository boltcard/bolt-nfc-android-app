/*
 * *****************************************************************************************************************************
 * Copyright 2013-2021 NXP.
 * NXP Confidential. This software is owned or controlled by NXP and may only be used strictly in
 *  accordance with the applicable license terms.
 * By expressly accepting such terms or by downloading, installing, activating and/or otherwise
 * using the software, you are agreeing that you have read, and that you agree to comply with and
 *  are bound by, such license terms.
 * If you do not agree to be bound by the applicable license terms, then you may not retain,
 * install, activate or otherwise use the software.
 * ********************************************************************************************************************************
 *
 */


package com.lightningnfcapp;

import static com.lightningnfcapp.Constants.DEFAULT_ICode_PAGE;
import static com.lightningnfcapp.Constants.DEFAULT_SECTOR_CLASSIC;
import static com.lightningnfcapp.Constants.KEY_AES128_DEFAULT;
import static com.lightningnfcapp.Constants.TAG;
import static com.lightningnfcapp.Constants.UNABLE_TO_READ;
import static com.lightningnfcapp.Constants.default_ff_key;
import static com.lightningnfcapp.Constants.default_zeroes_key;
import static com.lightningnfcapp.Constants.objKEY_2KTDES;
import static com.lightningnfcapp.Constants.objKEY_2KTDES_ULC;
import static com.lightningnfcapp.Constants.objKEY_AES128;
import static com.lightningnfcapp.MainActivity.mString;

import android.util.Log;

import com.lightningnfcapp.R;
import com.nxp.nfclib.CardType;
import com.nxp.nfclib.CustomModules;
import com.nxp.nfclib.KeyType;
import com.nxp.nfclib.classic.IMFClassic;
import com.nxp.nfclib.classic.IMFClassicEV1;
import com.nxp.nfclib.defaultimpl.KeyData;
import com.nxp.nfclib.desfire.IDESFireEV1;
import com.nxp.nfclib.desfire.IDESFireEV2;
import com.nxp.nfclib.desfire.IDESFireLight;
import com.nxp.nfclib.desfire.INTAG424DNA;
import com.nxp.nfclib.desfire.INTAG424DNATT;
import com.nxp.nfclib.desfire.INTag413DNA;
import com.nxp.nfclib.desfire.TagTamper;
import com.nxp.nfclib.exceptions.NxpNfcLibException;
import com.nxp.nfclib.icode.ICode;
import com.nxp.nfclib.icode.IICodeDNA;
import com.nxp.nfclib.icode.IICodeSLI;
import com.nxp.nfclib.icode.IICodeSLIL;
import com.nxp.nfclib.icode.IICodeSLIS;
import com.nxp.nfclib.icode.IICodeSLIX;
import com.nxp.nfclib.icode.IICodeSLIX2;
import com.nxp.nfclib.icode.IICodeSLIXL;
import com.nxp.nfclib.icode.IICodeSLIXS;
import com.nxp.nfclib.ndef.INdefMessage;
import com.nxp.nfclib.ndef.NdefMessageWrapper;
import com.nxp.nfclib.ndef.NdefRecordWrapper;
import com.nxp.nfclib.ntag.INTAGI2Cplus;
import com.nxp.nfclib.ntag.INTag;
import com.nxp.nfclib.ntag.INTag213TagTamper;
import com.nxp.nfclib.ntag.INTagI2C;
import com.nxp.nfclib.plus.IPlusEV1SL1;
import com.nxp.nfclib.plus.IPlusEV1SL3;
import com.nxp.nfclib.plus.IPlusSL1;
import com.nxp.nfclib.plus.IPlusSL3;
import com.nxp.nfclib.ultralight.IUltralight;
import com.nxp.nfclib.ultralight.IUltralightAES;
import com.nxp.nfclib.ultralight.IUltralightC;
import com.nxp.nfclib.ultralight.IUltralightEV1;
import com.nxp.nfclib.ultralight.UltralightNano;
import com.nxp.nfclib.utils.Utilities;

import java.nio.charset.Charset;
import java.security.Key;

import javax.crypto.spec.SecretKeySpec;


/**
 * This class does the card related operations
 */
class CardLogic {
    private static CardLogic instance = null;
    private final StringBuilder stringBuilder = new StringBuilder();

    /**
     * Protected constructor to avoid external object creation.
     */
    private CardLogic() {

    }

    static CardLogic getInstance() {
        if (instance == null) {
            instance = new CardLogic();
        }
        return instance;
    }

    /* *
     * MIFARE DESFire Light CardLogic.
     */
    String desfireLightCardLogic(MainActivity activity, IDESFireLight idesFireLight) {
        byte[] appDFName =
                {(byte) 0xA0, 0x00, 0x00, 0x03, (byte) 0x96, 0x56, 0x43, 0x41, 0x03, (byte) 0xF0,
                        0x15, 0x40, 0x00, 0x00, 0x00, 0x0B}; //Application DF Name
        int timeOut = 2000;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                idesFireLight.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));
        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(idesFireLight.getUID())).append(
                activity.getString(R.string.LINE_BREAK));
        try {
            idesFireLight.getReader().setTimeout(timeOut);
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    idesFireLight.getTotalMemory()).append(
                    activity.getString(R.string.LINE_BREAK));
            byte[] getVersion = idesFireLight.getVersion();
            if (getVersion[0] == (byte) 0x04) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            if (getVersion[6] == (byte) 0x05) {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(
                                R.string.PROTOCOL_VALUE_DefireLight)).append(
                        activity.getString(R.string.LINE_BREAK));
            } else {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(R.string.PROTOCOL_UNKNOWN)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));
            idesFireLight.isoSelectApplicationByDFName(appDFName);
            byte[] getFileIDResponse = idesFireLight.getFileIDs();
            String str = CustomModules.getUtility().dumpBytes(getFileIDResponse);
            stringBuilder.append(activity.getString(R.string.File_IDs)).append(str).append(
                    activity.getString(R.string.LINE_BREAK));
            Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
            KeyData aesKeyData = new KeyData();
            aesKeyData.setKey(keyDefault);
            idesFireLight.authenticateEV2First(0, aesKeyData, null);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(
                    activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /* *
     * MIFARE Plus Pre-condition.
     * <p/>
     * - PICC should be SL3. AuthenticateSL3 API requires block number to be
     * authenticated with AES128 key. Default key -
     * 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF, KeyNo - specify(0-9) during
     * set/getkey, KeyVersion - specify(0-2) Diversification input is null,
     * pcdCap2Out/pdCap2/pcdCap2In is a byte array.
     * <p/>
     * <p/>
     * ReadValue API require parameters(byte encrypted, byte readMACed, byte
     * macOnCmd, int blockNo, byte dstBlock).Result will print read data from
     * corresponding block(4 bytes).
     */
    String plusSL3CardLogic(MainActivity activity, IPlusSL3 plusSL3) {
        byte[] pcdCap2In = new byte[0];
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                plusSL3.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));
        stringBuilder.append(activity.getString(R.string.Sub_Type)).append(
                plusSL3.getPlusType()).append(
                activity.getString(R.string.LINE_BREAK));
        if (plusSL3.getCardDetails().securityLevel.equals(activity.getString(R.string.SL3))) {
            try {
                stringBuilder.append(mString.toString()).append(
                        activity.getString(R.string.LINE_BREAK));


//                 ALL WORK RELATED TO MIFARE PLUS SL3 card.
                plusSL3.authenticateFirst(0x4004, objKEY_AES128, pcdCap2In);
                stringBuilder.append(activity.getString(R.string.UID)).append(
                        Utilities.dumpBytes(plusSL3.getUID())).append(
                        activity.getString(R.string.LINE_BREAK));
                stringBuilder.append(activity.getString(R.string.SIZE)).append(
                        plusSL3.getTotalMemory()).append(
                        activity.getString(R.string.LINE_BREAK));
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(R.string.PROTOCOL_VALUE_PLUSSL3)).append(
                        activity.getString(R.string.LINE_BREAK));
                stringBuilder.append(
                        activity.getString(R.string.Authentication_status_true)).append(
                        activity.getString(R.string.LINE_BREAK));
            } catch (Exception e) {
                stringBuilder.append(UNABLE_TO_READ).append(
                        activity.getString(R.string.LINE_BREAK));
            }
        } else {
            stringBuilder.append(activity.getString(R.string.No_operation_done_since_card_in_SL0));

        }
        return stringBuilder.toString();
    }

    String plusEV1SL3CardLogic(MainActivity activity, IPlusEV1SL3 plusEV1SL3) {
        //pcdCap2In ensures the usage of PlusEV1 Secure messaging
        byte[] pcdCap2In = new byte[]{0x01};
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                plusEV1SL3.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));
        try {
            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));
            if (plusEV1SL3.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }

//             ALL WORK RELATED TO MIFARE PLUS EV1 SL3 card. using EV1 secure messaging
            plusEV1SL3.authenticateFirst(0x4006, objKEY_AES128, pcdCap2In);

            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(plusEV1SL3.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    plusEV1SL3.getTotalMemory()).append(
                    activity.getString(R.string.LINE_BREAK));
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                    activity.getString(R.string.PROTOCOL_VALUE_PLUSSL3)).append(
                    activity.getString(R.string.LINE_BREAK));
            stringBuilder.append(activity.getString(R.string.Authentication_status_true)).append(
                    activity.getString(R.string.LINE_BREAK));
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * MIFARE Ultralight EV1 CardLogic.
     */
    String ultralightEV1CardLogic(MainActivity activity, IUltralightEV1 ultralightEV1) {
        ultralightEV1.getReader().connect();
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                ultralightEV1.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        try {
//             connect to card, authenticate and read data
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(ultralightEV1.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ultralightEV1.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.User_Memory)).append(
                    ultralightEV1.getUserMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (ultralightEV1.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }

        return stringBuilder.toString();
    }

    /**
     * MIFARE Ultralight-C Card Logic.
     */
    String ultralightcCardLogic(MainActivity activity, IUltralightC ultralightC) {
        ultralightC.getReader().connect();
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                ultralightC.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.Auth_with_default_key)).append(
                    activity.getString(R.string.LINE_BREAK));

            ultralightC.authenticate(objKEY_2KTDES_ULC);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (NxpNfcLibException e) {
            stringBuilder.append(activity.getString(R.string.Unable_to_authenticate)).append(
                    activity.getString(R.string.LINE_BREAK));

        }
        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(ultralightC.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ultralightC.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.User_Memory)).append(
                    ultralightC.getUserMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (ultralightC.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * Ultralight Card Logic.
     */
    String ultralightCardLogic(MainActivity activity, IUltralight ultralightObj) {
        ultralightObj.getReader().connect();
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                ultralightObj.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(ultralightObj.getUID())).append(
                activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ultralightObj.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.User_Memory)).append(
                    ultralightObj.getUserMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (ultralightObj.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * Ultralight AES Card Logic.
     */
    String ultralightAESCardLogic(MainActivity activity, IUltralightAES ultralightAES) {
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                ultralightAES.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(ultralightAES.getUID())).append(
                activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ultralightAES.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.User_Memory)).append(
                    ultralightAES.getUserMemory()).append(activity.getString(R.string.LINE_BREAK));

            //Setting the comm mode as isNxp internally invokes read command
            ultralightAES.setCommunicationMode(IUltralightAES.CommunicationMode.PLAIN);
            if (ultralightAES.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    String ultralightNanoCardLogic(MainActivity activity, UltralightNano ultralightNano) {
        if (!ultralightNano.getReader().isConnected()) {
            ultralightNano.getReader().connect();
        }
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                ultralightNano.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(ultralightNano.getUID())).append(
                activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ultralightNano.getTotalMemory()).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.User_Memory)).append(
                    ultralightNano.getUserMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (ultralightNano.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }

            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * MIFARE Plus SL1 Card Logic.
     */
    String plusSL1CardLogic(MainActivity activity, IPlusSL1 plusSL1) {
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                plusSL1.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        // ******* Note that all the classic APIs work well with Plus Security Level 1 *******//
        int blockTorw = DEFAULT_SECTOR_CLASSIC;
        int sectorOfBlock;
        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(plusSL1.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    plusSL1.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (plusSL1.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_ULTRALIGHT)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            if (!plusSL1.getReader().isConnected()) {
                plusSL1.getReader().connect();
            }
            sectorOfBlock = plusSL1.blockToSector(blockTorw);
            plusSL1.authenticateSectorWithKeyA(sectorOfBlock, default_ff_key);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(activity.getString(R.string.Unable_to_read_from_block)).append(
                    blockTorw).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    String plusEV1SL1CardLogic(MainActivity activity, IPlusEV1SL1 plusEV1SL1) {
        stringBuilder.delete(0, stringBuilder.length());
        int sectorOfBlock;
        try {
            stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                    plusEV1SL1.getType().getTagName()).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(plusEV1SL1.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            if (!plusEV1SL1.getReader().isConnected()) {
                plusEV1SL1.getReader().connect();
            }
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    plusEV1SL1.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (plusEV1SL1.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_PLUSEV1SL1)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            sectorOfBlock = plusEV1SL1.blockToSector(DEFAULT_SECTOR_CLASSIC);
            plusEV1SL1.authenticateSectorWithKeyA(sectorOfBlock, default_ff_key);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));


            plusEV1SL1.getReader().close();
        } catch (Exception e) {
            Log.w(TAG, activity.getString(R.string.Exception_performing_operation_on_plusEV1SL1)
                    + e.getMessage());
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * MIFARE classic Card Logic.
     */
    String classicCardLogic(MainActivity activity, IMFClassic mifareClassic) {
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                mifareClassic.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(mifareClassic.getUID())).append(
                activity.getString(R.string.LINE_BREAK));


        int sectorOfBlock;
        try {
            //Call connect first if the Reader is not connected
            if (!mifareClassic.getReader().isConnected()) {
                mifareClassic.getReader().connect();
            }
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    mifareClassic.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));


            if (mifareClassic.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(
                                R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_MIFARECLASSIC)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(
                            R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            sectorOfBlock = mifareClassic.blockToSector(DEFAULT_SECTOR_CLASSIC);
            mifareClassic.authenticateSectorWithKeyA(sectorOfBlock,
                    default_ff_key);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * MIFARE classic EV1 Card Logic.
     */
    String classicCardEV1Logic(MainActivity activity, IMFClassicEV1 mifareClassicEv1) {
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                mifareClassicEv1.getType().getTagName()).append(
                activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(mifareClassicEv1.getUID())).append(
                activity.getString(R.string.LINE_BREAK));


        int sectorOfBlock;
        try {
            //Call connect first is the Reader is not connected
            if (!mifareClassicEv1.getReader().isConnected()) {
                mifareClassicEv1.getReader().connect();
            }
            if (mifareClassicEv1.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_VALUE_MIFARECLASSIC)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(
                    activity.getString(R.string.Default_Max_Transceive_TimeOut)).append(
                    activity.getString(R.string.Default_Max_Trans_Timeout_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            sectorOfBlock = mifareClassicEv1.blockToSector(DEFAULT_SECTOR_CLASSIC);
            mifareClassicEv1.authenticateSectorWithKeyA(sectorOfBlock,
                    default_ff_key);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(
                    activity.getString(
                            R.string.Unable_to_authenticate_sector_with_default_key)).append(
                    activity.getString(R.string.LINE_BREAK));

        }
        try {
            if (mifareClassicEv1.getCardDetails().totalMemory == 1024) {
                //Originality Check
                boolean isSuccess = mifareClassicEv1.doOriginalityCheck();
                stringBuilder.append(
                        activity.getString(R.string.doOriginality_check_API_status)).append(
                        isSuccess).append(activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(
                    activity.getString(R.string.Unable_to_do_originality_check)).append(
                    activity.getString(R.string.LINE_BREAK));

        } finally {
            //Closing the reader. This is Mandatory...
            mifareClassicEv1.getReader().close();
        }
        return stringBuilder.toString();
    }

    /*  *
      DESFire Pre Conditions .
      PICC Master key should be factory default settings,(i.e . 16 byte All zero Key ).
  */
    String desfireEV1CardLogic(MainActivity activity, IDESFireEV1 desFireEV1) {
        desFireEV1.getReader().connect();
        desFireEV1.getReader().setTimeout(2000);
        int timeOut = 2000;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                desFireEV1.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(desFireEV1.getUID())).append(
                activity.getString(R.string.LINE_BREAK));

        try {
            desFireEV1.getReader().setTimeout(timeOut);
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    desFireEV1.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Availabe_Size)).append(
                    desFireEV1.getFreeMemory()).append(activity.getString(R.string.LINE_BREAK));


            byte[] getVersion = desFireEV1.getVersion();
            if (getVersion[0] == (byte) 0x04) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            if (getVersion[6] == (byte) 0x05) {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(
                                R.string.PROTOCOL_VALUE_DefireEV2));


            } else {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(R.string.PROTOCOL_UNKNOWN));

            }
            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            desFireEV1.selectApplication(0);

            try {
                stringBuilder.append(activity.getString(R.string.Auth_with_default_key));

                desFireEV1.authenticate(0, IDESFireEV1.AuthType.Native, KeyType.THREEDES,
                        objKEY_2KTDES);
                stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                        activity.getString(R.string.LINE_BREAK));

            } catch (NxpNfcLibException e) {
                stringBuilder.append(activity.getString(R.string.Unable_to_authenticate));

            }

            int[] app_Ids = desFireEV1.getApplicationIDs();
            for (int app_id : app_Ids) {
                byte[] ids = Utilities.intToBytes(app_id, 3);
                String str = Utilities.byteToHexString(ids);
                stringBuilder.append(activity.getString(R.string.Application_IDs)).append(str);

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    String desfireEV2CardLogic(MainActivity activity, IDESFireEV2 desFireEV2) {
        int timeOut = 2000;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                desFireEV2.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(desFireEV2.getUID())).append(
                activity.getString(R.string.LINE_BREAK));

        try {
            desFireEV2.getReader().setTimeout(timeOut);
            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    desFireEV2.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Availabe_Size)).append(
                    desFireEV2.getFreeMemory());


            byte[] getVersion = desFireEV2.getVersion();
            if (getVersion[0] == (byte) 0x04) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            if (getVersion[6] == (byte) 0x05) {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(
                                R.string.PROTOCOL_VALUE_DefireEV2));

            } else {
                stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(
                        activity.getString(R.string.PROTOCOL_UNKNOWN));

            }
            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            desFireEV2.selectApplication(0);

            int[] app_Ids = desFireEV2.getApplicationIDs();
            for (int app_id : app_Ids) {
                byte[] ids = Utilities.intToBytes(app_id, 3);
                String str = Utilities.byteToHexString(ids);
                stringBuilder.append(activity.getString(R.string.Application_IDs)).append(
                        str).append(activity.getString(R.string.LINE_BREAK));

            }
            desFireEV2.authenticate(0, IDESFireEV1.AuthType.Native, KeyType.THREEDES,
                    objKEY_2KTDES);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * NTAG424DNA CardLogic.
     */

    String tag424DNACardLogic(MainActivity activity, INTAG424DNA ntag424DNA) {
        byte[] NTAG424DNA_APP_NAME =
                {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
        try {
            stringBuilder.delete(0, stringBuilder.length());
            stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                    ntag424DNA.getType().getTagName()).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(ntag424DNA.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ntag424DNA.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            byte[] getVersion = ntag424DNA.getVersion();
            if (getVersion[0] == (byte) 0x04) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }

            try {
                stringBuilder.append(activity.getString(R.string.Auth_with_default_key));

                ntag424DNA.isoSelectApplicationByDFName(NTAG424DNA_APP_NAME);
                KeyData aesKeyData = new KeyData();
                Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
                aesKeyData.setKey(keyDefault);
                ntag424DNA.authenticateEV2First(0, aesKeyData, null);
                stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                        activity.getString(R.string.LINE_BREAK));

            } catch (NxpNfcLibException e) {
                stringBuilder.append(activity.getString(R.string.Unable_to_authenticate)).append(
                        activity.getString(R.string.LINE_BREAK));

            }

            try {
                //Creating URI NDEF message
                NdefMessageWrapper msg = new NdefMessageWrapper(
                        new NdefRecordWrapper(NdefRecordWrapper.TNF_ABSOLUTE_URI,
                                "https://www.nxp.com/".getBytes(
                                        Charset.forName("US-ASCII")), new byte[0], new byte[0]));
                stringBuilder.append(activity.getString(R.string.writing_ndef)).append(
                        CustomModules.getUtility().dumpBytes(msg.toByteArray())).append(
                        activity.getString(R.string.LINE_BREAK));

                ntag424DNA.writeNDEF(msg);
                stringBuilder.append(activity.getString(R.string.ndef_write_success)).append(
                        activity.getString(R.string.LINE_BREAK));
            } catch (Exception e) {
                e.printStackTrace();
                stringBuilder.append(activity.getString(R.string.ndeg_write_failed)).append(
                        e.getMessage()).append(activity.getString(R.string.LINE_BREAK));
            }

            try {
                stringBuilder.append(activity.getString(R.string.reading_ndef)).append(
                        activity.getString(R.string.LINE_BREAK));

                INdefMessage ndefRead = ntag424DNA.readNDEF();
                stringBuilder.append(activity.getString(R.string.ndef_msg_read)).append(
                        CustomModules.getUtility().dumpBytes(ndefRead.toByteArray())).append(
                        activity.getString(R.string.LINE_BREAK));

            } catch (Exception e) {
                e.printStackTrace();
                stringBuilder.append(activity.getString(R.string.ndef_read_failed)).append(
                        e.getMessage()).append(activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_NTAG)).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    /**
     * NTAG424DNA Tag
     * Tamper CardLogic.
     */

    String tag424DNATTCardLogic(MainActivity activity, INTAG424DNATT ntag424DNATT) {
        byte[] NTAG424DNATT_APP_NAME =
                {(byte) 0xD2, (byte) 0x76, 0x00, 0x00, (byte) 0x85, 0x01, 0x01};
        try {
            stringBuilder.delete(0, stringBuilder.length());
            stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                    ntag424DNATT.getType().getTagName()).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(ntag424DNATT.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    ntag424DNATT.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            byte[] getVersion = ntag424DNATT.getVersion();
            if (getVersion[0] == (byte) 0x04) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            ntag424DNATT.isoSelectApplicationByDFName(NTAG424DNATT_APP_NAME);
            KeyData aesKeyData = new KeyData();
            Key keyDefault = new SecretKeySpec(KEY_AES128_DEFAULT, "AES");
            aesKeyData.setKey(keyDefault);
            ntag424DNATT.authenticateEV2First(0, aesKeyData, null);
            TagTamper tagTamper = ntag424DNATT.getTTStatus();
            stringBuilder.append(activity.getString(R.string.Permanent_Status)).append(
                    tagTamper.getPermanentStatus()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.CURRENT_Status)).append(
                    tagTamper.getCurrentStatus()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_NTAG)).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));

            ntag424DNATT.isoSelectApplicationByDFName(NTAG424DNATT_APP_NAME);
            aesKeyData.setKey(keyDefault);
            ntag424DNATT.authenticateEV2First(0, aesKeyData, null);
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    String ntag413CardLogic(MainActivity activity, final INTag413DNA tag) {
        byte[] DF =
                new byte[]{(byte) 0xD2, (byte) 0x76, (byte) 0x00, (byte) 0x00, (byte) 0x85,
                        (byte) 0x01, (byte) 0x01};
        byte[] fileNDEFId = new byte[]{(byte) 0xE1, (byte) 0x04};
        try {
            tag.select((byte) 0x04, false, DF);
            tag.select((byte) 0x00, false, CustomModules.getUtility().reverseBytes(fileNDEFId));
            stringBuilder.delete(0, stringBuilder.length());
            stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                    tag.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(tag.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    tag.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            boolean isNXP = tag.isNXP();
            if (isNXP) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_NTAG)).append(activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));

            tag.authenticateFirst(0, default_zeroes_key, new byte[]{});
            stringBuilder.append(activity.getString(R.string.Auth_success)).append(
                    activity.getString(R.string.LINE_BREAK));

        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));

        }
        return stringBuilder.toString();
    }

    String ntag213TTCardLogic(MainActivity activity, final INTag213TagTamper tag) {
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                tag.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(tag.getUID())).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.SIZE)).append(tag.getTotalMemory()).append(
                activity.getString(R.string.LINE_BREAK));

        boolean isNXP = tag.isNXP();
        if (isNXP) {
            stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(activity.getString(
                    R.string.NXP)).append(activity.getString(R.string.LINE_BREAK));

        } else {
            stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(activity.getString(
                    R.string.NON_NXP)).append(activity.getString(R.string.LINE_BREAK));

        }
        stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                R.string.PROTOCOL_NTAG213TT)).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(mString.toString()).append(activity.getString(R.string.LINE_BREAK));

        try {
            byte[] readTTStatus = tag.readTTStatus();
            stringBuilder.append(activity.getString(R.string.Tamper_MSG)).append(
                    Utilities.dumpBytes(readTTStatus, 0,
                            4).trim()).append(activity.getString(R.string.LINE_BREAK));

            if (readTTStatus == null || readTTStatus.length > 4) {
                String readTT = Utilities.dumpBytes(readTTStatus, 4, 5).trim();
                switch (readTT) {
                    case "0x49":
                        stringBuilder.append(activity.getString(R.string.Status_of_TT)).append(
                                readTT).append(activity.getString(R.string.LINE_BREAK));

                        stringBuilder.append(activity.getString(R.string.TT_Incorrect)).append(
                                activity.getString(R.string.LINE_BREAK));

                        break;
                    case "0x43":
                        stringBuilder.append(activity.getString(R.string.Status_of_TT)).append(
                                readTT).append(activity.getString(R.string.LINE_BREAK));

                        stringBuilder.append(activity.getString(R.string.TT_Closed)).append(
                                activity.getString(R.string.LINE_BREAK));

                        break;
                    case "0x4F":
                        stringBuilder.append(activity.getString(R.string.Status_of_TT)).append(
                                readTT).append(activity.getString(R.string.LINE_BREAK));

                        stringBuilder.append(activity.getString(R.string.TT_Open)).append(
                                activity.getString(R.string.LINE_BREAK));

                        break;
                    default:
                        break;
                }
            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * Ntag IO
     * Operations .
     *
     * @param tag object
     */

    String ntagCardLogic(MainActivity activity, final INTag tag) {
        tag.getReader().connect();
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                tag.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.UID)).append(
                Utilities.dumpBytes(tag.getUID())).append(activity.getString(R.string.LINE_BREAK));

        stringBuilder.append(activity.getString(R.string.SIZE)).append(tag.getTotalMemory()).append(
                activity.getString(R.string.LINE_BREAK));

        if (tag.isNXP()) {
            stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                    activity.getString(R.string.NXP)).append(
                    activity.getString(R.string.LINE_BREAK));

        } else {
            stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                    activity.getString(R.string.NON_NXP)).append(
                    activity.getString(R.string.LINE_BREAK));

        }
        stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                R.string.PROTOCOL_NTAG213TT)).append(activity.getString(R.string.LINE_BREAK));


        stringBuilder.append(mString.toString()).append(activity.getString(R.string.LINE_BREAK));

        try {
            // NTag I2C 1K and 2K Operation
            if (tag.getType() == (CardType.NTagI2C2K)
                    || tag.getType() == (CardType.NTagI2C1K)) {
                stringBuilder.append(activity.getString(R.string.Read_session_bytes)).append(
                        Utilities.dumpBytes(((INTagI2C) tag).getSessionBytes())).append(
                        activity.getString(R.string.LINE_BREAK));

                stringBuilder.append(activity.getString(R.string.Read_config_bytes)).append(
                        Utilities.dumpBytes(((INTagI2C) tag)
                                .getConfigBytes())).append(activity.getString(R.string.LINE_BREAK));

            }
            // NTag I2C and NTag I2C Plus Variant 1K and 2K Operation
            if (tag.getType() == (CardType.NTagI2CPlus2K)
                    || tag.getType() == (CardType.NTagI2CPlus1K)) {

                stringBuilder.append(activity.getString(R.string.Get_version_bytes)).append(
                        Utilities.dumpBytes(
                                ((INTAGI2Cplus) tag)
                                        .getVersion())).append(
                        activity.getString(R.string.LINE_BREAK));

                stringBuilder.append(activity.getString(R.string.Read_session_bytes)).append(
                        Utilities.dumpBytes(
                                ((INTAGI2Cplus) tag)
                                        .getSessionBytes())).append(
                        activity.getString(R.string.LINE_BREAK));

                stringBuilder.append(activity.getString(R.string.Read_config_bytes)).append(
                        Utilities.dumpBytes(
                                ((INTAGI2Cplus) tag)
                                        .getConfigBytes())).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        } finally {
            tag.getReader().close();
        }
        if (tag.getType() == (CardType.NTagI2CPlus2K)
                || tag.getType() == (CardType.NTagI2CPlus1K)
                || tag.getType() == (CardType.NTagI2C2K)
                || tag.getType() == (CardType.NTagI2C1K)) {
            ((INTagI2C) tag).sectorSelect((byte) 0);
        }
        return stringBuilder.toString();
    }

    /* *
     ICode SLI
     card logic.
 */

    /**
     * ICode SLIS
     * card logic.
     */

    String iCodeSLISCardLogic(MainActivity activity, IICodeSLIS icodeSLIS) {
        if (!icodeSLIS.getReader().isConnected()) {
            icodeSLIS.getReader().connect();
        }
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIS.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIS.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIS.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIS.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));


            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));

            out = icodeSLIS.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    String iCodeSLICardLogic(MainActivity activity, IICodeSLI icodeSLI) {
        icodeSLI.getReader().connect();
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLI.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLI.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLI.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLI.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));


            out = icodeSLI.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * ICode SLIL
     * card logic.
     */
    String iCodeSLILCardLogic(MainActivity activity, IICodeSLIL icodeSLIL) {
        icodeSLIL.getReader().connect();
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIL.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIL.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIL.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIL.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));


            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));

            out = icodeSLIL.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * ICode SLIX
     * card logic.
     */
    String iCodeSLIXCardLogic(MainActivity activity, IICodeSLIX icodeSLIX) {
        icodeSLIX.getReader().connect();
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIX.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIX.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIX.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIX.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value));

            out = icodeSLIX.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * ICode SLIXS
     * card logic.
     */
    String iCodeSLIXSCardLogic(MainActivity activity, IICodeSLIXS icodeSLIXS) {
        icodeSLIXS.getReader().connect();
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIXS.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIXS.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIXS.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIXS.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));


            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));

            out = icodeSLIXS.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * ICode SLIXL
     * card logic.
     */

    String iCodeSLIXLCardLogic(MainActivity activity, IICodeSLIXL icodeSLIXL) {
        icodeSLIXL.getReader().connect();
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIXL.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIXL.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIXL.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIXL.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value));

            out = icodeSLIXL.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    /**
     * ICode SLIX2
     * card logic.
     */
    String iCodeSLIX2CardLogic(MainActivity activity, IICodeSLIX2 icodeSLIX2) {
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeSLIX2.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeSLIX2.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeSLIX2.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeSLIX2.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));

            out = icodeSLIX2.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));

            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }

    String iCodeDNACardLogic(MainActivity activity, IICodeDNA icodeDNA) {
        byte[] out;
        stringBuilder.delete(0, stringBuilder.length());
        stringBuilder.append(activity.getString(R.string.Card_Detected)).append(
                icodeDNA.getType().getTagName()).append(activity.getString(R.string.LINE_BREAK));

        try {
            stringBuilder.append(activity.getString(R.string.UID)).append(
                    Utilities.dumpBytes(icodeDNA.getUID())).append(
                    activity.getString(R.string.LINE_BREAK));

            stringBuilder.append(activity.getString(R.string.SIZE)).append(
                    icodeDNA.getTotalMemory()).append(activity.getString(R.string.LINE_BREAK));

            if (icodeDNA.isNXP()) {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NXP)).append(
                        activity.getString(R.string.LINE_BREAK));

            } else {
                stringBuilder.append(activity.getString(R.string.Vendor_ID)).append(
                        activity.getString(R.string.NON_NXP)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
            stringBuilder.append(activity.getString(R.string.PROTOCOL)).append(activity.getString(
                    R.string.PROTOCOL_ICODESLI)).append(activity.getString(R.string.LINE_BREAK));


            stringBuilder.append(mString.toString()).append(
                    activity.getString(R.string.LINE_BREAK));
            stringBuilder.append(activity.getString(R.string.Max_Transceive_length)).append(
                    activity.getString(
                            R.string.Max_Trans_length_value)).append(
                    activity.getString(R.string.LINE_BREAK));

            out = icodeDNA.readSingleBlock(ICode.NFCV_FLAG_ADDRESS, DEFAULT_ICode_PAGE);
            if (out != null) {
                stringBuilder.append(activity.getString(R.string.Data_read_from_block)).append(
                        " ").append(
                        DEFAULT_ICode_PAGE).append(": ").append(
                        CustomModules.getUtility().dumpBytes(out)).append(
                        activity.getString(R.string.LINE_BREAK));
            }
        } catch (Exception e) {
            stringBuilder.append(UNABLE_TO_READ).append(activity.getString(R.string.LINE_BREAK));
        }
        return stringBuilder.toString();
    }
}
