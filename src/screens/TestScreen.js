import React from 'react';
import { Button, ScrollView, StyleSheet, Text, Image, View, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import { randomBytes } from 'crypto';
import crc from 'crc';

var CryptoJS = require("../utils/Cmac");
var AES = require("crypto-js/aes");

function hexToBytes(hex) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
        let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

function leftRotate(bytesArr, rotatebit = 1) {
    let first = bytesArr.shift();
    bytesArr.push(first);
    return bytesArr;
}

//Encrypted IV
function ivEncryption(ti, cmdCtr, sesAuthEncKey) {
  const ivData = AES.encrypt(
    CryptoJS.enc.Hex.parse("A55A"+ti+cmdCtr+"0000000000000000"), 
    CryptoJS.enc.Hex.parse(sesAuthEncKey), 
    {
      mode: CryptoJS.mode.ECB, 
      // iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"), 
      keySize: 128 / 8, 
      padding: CryptoJS.pad.NoPadding
    }
  );
  return ivData.ciphertext.toString(CryptoJS.enc.Hex);
}

function padForEnc(data, byteLen) {
  console.log('padforenc',data, data.length, byteLen)
  var paddedData = data;
  if(data.length < (byteLen * 2)) {
    console.log('padforEnc22', (byteLen * 2))
    paddedData += "80";
    paddedData = paddedData.padEnd((byteLen * 2), "00");
  }
  return paddedData;
}

export default function TestScreen({ navigation }) {
    async function readNdef() {
        try {
            // register for the NFC tag with NDEF in it
            await NfcManager.requestTechnology(NfcTech.IsoDep);
            // the resolved tag object will contain `ndefMessage` property

            const {sesAuthMacKey, ti} = await AuthEv2First('00', '00000000000000000000000000000000');
            const commandMac = CryptoJS.CMAC(CryptoJS.enc.Hex.parse(sesAuthMacKey), CryptoJS.enc.Hex.parse("F50000"+ti+'02'));
            const commandMacHex = commandMac.toString();
            console.log('commandMacHex', commandMacHex, hexToBytes(commandMacHex));
            //truncate to 8 bytes (only get even numbered bytes)
            const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
              return ((index + 1) % 2 === 0);
            });
            console.log('truncatedMac', truncatedMacBytes, bytesToHex(truncatedMacBytes));

            const getFileSettingsHex = "90F500000902" + bytesToHex(truncatedMacBytes) + '00';
            const getFileSettingsRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(getFileSettingsHex)) : await NfcManager.transceive(hexToBytes(getFileSettingsHex));
            console.warn('getFileSettingsRes Result: ', Platform.OS == 'ios' ? bytesToHex([getFileSettingsRes.sw1, getFileSettingsRes.sw2]) : bytesToHex(getFileSettingsRes));

          } catch (ex) {
          console.warn('Oops!', ex);
        } finally {
          // stop the nfc scanning
          NfcManager.cancelTechnologyRequest();
        }
      }

    /*
    * keyNo String (00, 01, 02)
    * key String (hex value)
    */
    const AuthEv2First = async (keyNo, pKey) => {
      //iso select file before auth
      const isoSelectFileBytes = hexToBytes("00A4040007D276000085010100");
      const isoSelectRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(isoSelectFileBytes) : await NfcManager.transceive(isoSelectFileBytes);
      console.warn('isoSelectRes: ', Platform.OS == 'ios' ? bytesToHex([isoSelectRes.sw1, isoSelectRes.sw2]) : bytesToHex(isoSelectRes));

      const bytes = hexToBytes('9071000005'+keyNo+'0300000000');
      console.log('bytes', bytes)
      const Result = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(bytes) : await NfcManager.transceive(bytes);
      console.warn('Result: ', Platform.OS == 'ios' ? bytesToHex([Result.sw1, Result.sw2]) : bytesToHex(Result));
      const resultData = bytesToHex(Result.response);
      console.log('resultData', resultData);
      console.log('resultData', hexToBytes(resultData));
      //91AF is the successful code
      //@TODO: it might be different for android to get the result code
      const resultCode = bytesToHex([Result.sw1, Result.sw2]);
      if(resultCode == '91af') {
        const key = CryptoJS.enc.Hex.parse(pKey);
        const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
        const aesEncryptOption = {padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CBC, iv: iv, keySize: 128 / 8};
        const RndBDec = AES.decrypt({ciphertext: CryptoJS.enc.Hex.parse(resultData)}, key, aesEncryptOption);
        const RndB = CryptoJS.enc.Hex.stringify(RndBDec);
        console.log('key',key, 'iv', iv);
        console.log('rndb',RndB);
        const RndABytes = randomBytes(16);
        const RndA = bytesToHex(RndABytes);
        console.log('rnda', bytesToHex(RndABytes));
        const RndBRotlBytes = leftRotate(hexToBytes(RndB));
        const RndBRotl = bytesToHex(RndBRotlBytes);
        console.log('RndBRotl', RndBRotlBytes, RndBRotl);

        const RndARndBRotl = RndA + RndBRotl;
        console.log('RndARndBRotl', RndARndBRotl);
        const RndARndBEncData = AES.encrypt(CryptoJS.enc.Hex.parse(RndARndBRotl), key, aesEncryptOption);
        const RndARndBEnc = RndARndBEncData.ciphertext.toString(CryptoJS.enc.Hex);
        console.log('RndARndBEnc',RndARndBEnc);
        console.log('RndARndBEnc',hexToBytes(RndARndBEnc));
    
        const secondAuthBytes = hexToBytes('90AF000020'+RndARndBEnc+'00');
        console.log('90AF000020'+RndARndBEnc+'00');
        console.log('secondAuthBytes', secondAuthBytes);
        const secondAuthRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(secondAuthBytes) : await NfcManager.transceive(secondAuthBytes);
        console.warn('Result: ', Platform.OS == 'ios' ? bytesToHex([secondAuthRes.sw1, secondAuthRes.sw2]) : bytesToHex(secondAuthRes));
        //9100 is the successful code
        //@TODO: it might be different for android to get the result code
        const secondAuthResultCode = bytesToHex([secondAuthRes.sw1, secondAuthRes.sw2]);
        if(secondAuthResultCode == '9100') {
          //auth successful
          const secondAuthResultData = bytesToHex(secondAuthRes.response);
          const secondAuthResultDataDec = AES.decrypt({ciphertext: CryptoJS.enc.Hex.parse(secondAuthResultData)}, key, aesEncryptOption);
          const secondAuthResultDataDecStr = CryptoJS.enc.Hex.stringify(secondAuthResultDataDec);
          console.log('secondAuthResultDataDec', secondAuthResultDataDecStr);

          const tiBytes = hexToBytes(secondAuthResultDataDecStr).slice(0,4);
          const ti = bytesToHex(tiBytes);
          console.log('ti', ti);
          
          var WordArray = CryptoJS.lib.WordArray;
          const xor =  CryptoJS.ext.xor(new WordArray.init(hexToBytes(RndA.slice(4, 16))), new WordArray.init(hexToBytes(RndB.slice(0, 12))));
          let svPost = RndA.slice(0,4);
          svPost +=  bytesToHex(xor.words);
          svPost += RndB.slice(12, 32) + RndA.slice(16, 32);
          //SV1 = A5h||5Ah||00h||01h||00h||80h||RndA[15..14]|| ( RndA[13..8] # RndB[15..10])||RndB[9..0]||RndA[7..0]
          let sv1 = "A55A00010080";
          sv1 += svPost;
          const sesAuthEnc = CryptoJS.CMAC(key, CryptoJS.enc.Hex.parse(sv1));
          const sesAuthEncKey = sesAuthEnc.toString();

          //SV2 = 5Ah||A5h||00h||01h||00h||80h||RndA[15..14]|| ( RndA[13..8] # RndB[15..10])||RndB[9..0]||RndA[7..0]
            //# == XOR-operator

          console.log(RndA.slice(0,4), RndA.slice(4,16));
          let sv2 = "5AA500010080";
          sv2 += svPost;
          console.log('sv2', sv2);
          const sesAuthMac = CryptoJS.CMAC(key, CryptoJS.enc.Hex.parse(sv2));
          const sesAuthMacKey = sesAuthMac.toString();
          console.log('sesAuthMacKey', sesAuthMacKey);

          return Promise.resolve({sesAuthEncKey, sesAuthMacKey, ti});

        } else {
          //auth failed
          return Promise.reject("Auth Failed: "+secondAuthResultCode)
        }
      } else {
        //auth failed
        return Promise.reject("Auth Failed: "+resultCode)
      }
    }

    const setFileSettings = async (masterKey, piccOffset, macOffset) => {
      try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(NfcTech.IsoDep);
          // the resolved tag object will contain `ndefMessage` property

          const {sesAuthEncKey, sesAuthMacKey, ti} = await AuthEv2First('00', masterKey);
          const cmdCtr = "0000";
          //File Option SDM and mirroring enabled, CommMode: plain
          var cmdData = "40";
          //Access rights (FileAR.ReadWrite: 0x0, FileAR.Change: 0x0, FileAR.Read: 0xE, FileAR.Write; 0x0)
          cmdData += "00E0";
          //UID mirror: 1
          // SDMReadCtr: 1
          // SDMReadCtrLimit: 0
          // SDMENCFileData: 0
          // ASCII Encoding mode: 1
          cmdData += "C1"
          //sdm access rights
          //RFU: 0F
          //CtrRet: 0F
          //MetaRead: 01
          //FileRead: 02
          cmdData += "FF12";
          //ENCPICCDataOffset
          cmdData += (piccOffset.toString(16)).padEnd(6, "0");
          //SDMMACOffset
          cmdData += (macOffset.toString(16)).padEnd(6, "0");
          //SDMMACInputOffset
          cmdData += (macOffset.toString(16)).padEnd(6, "0");
          
          const cmdDataPadd = padForEnc(cmdData, 16);

          console.log('cmdDataPadd', cmdDataPadd);

          const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
          const aesEncryptOption = {
            mode: CryptoJS.mode.CBC,
            iv: CryptoJS.enc.Hex.parse(iv), 
            keySize: 128 / 8, 
            padding: CryptoJS.pad.NoPadding
          };

          const encKeyData = (
            AES.encrypt(
              CryptoJS.enc.Hex.parse(cmdDataPadd), 
              CryptoJS.enc.Hex.parse(sesAuthEncKey), 
              aesEncryptOption
            )
          ).ciphertext.toString(CryptoJS.enc.Hex);

          const fileNo = "02";
          const commandMac = CryptoJS.CMAC(
            CryptoJS.enc.Hex.parse(sesAuthMacKey), 
            CryptoJS.enc.Hex.parse("5F"+cmdCtr+ti+fileNo+encKeyData)
          );
          const commandMacHex = commandMac.toString();
          console.log('changeFileSettings encKeyData', encKeyData, hexToBytes(encKeyData));
          console.log('changeFileSettings commandmac', commandMacHex);
          
          const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
            return ((index + 1) % 2 === 0);
          });
          const truncatedMac = bytesToHex(truncatedMacBytes);
          console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
          const data = encKeyData + truncatedMac;
          console.log('data', data, data.length);
          const lc = ((data.length / 2) + 1).toString(16);
          const changeFileSettingsHex = "905F0000"+lc+fileNo+encKeyData+truncatedMac+"00";
          console.log('changeFileSettingsHex', changeFileSettingsHex); 

          const changeFileSettingsRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(changeFileSettingsHex)) : await NfcManager.transceive(hexToBytes(changeFileSettingsHex));
          console.warn('changeFileSettingsRes Result: ', Platform.OS == 'ios' ? bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]) : bytesToHex(changeFileSettingsRes));
          const resCode = bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]);
          if(resCode == '9100') {
            return Promise.resolve("Successful");
          } else {
            return Promise.reject(resCode);
          }

        } catch (ex) {
        console.warn('Oops!', ex);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }

    const wipeNdefResetFileSettings = async (masterKey) => {
      //RESET FILE SETTINGS
      try {
        // register for the NFC tag with NDEF in it
        await NfcManager.requestTechnology(NfcTech.IsoDep);
        // the resolved tag object will contain `ndefMessage` property

        const {sesAuthEncKey, sesAuthMacKey, ti} = await AuthEv2First('00', masterKey);
        const cmdCtr = "0000";
        //File Option SDM and mirroring enabled, CommMode: plain
        var cmdData = "40";
        //Access rights (FileAR.ReadWrite: 0xE, FileAR.Change: 0x0, FileAR.Read: 0xE, FileAR.Write; 0xE)
        cmdData += "E0EE";

        //UID mirror: 0
        // SDMReadCtr: 0
        // SDMReadCtrLimit: 0
        // SDMENCFileData: 0
        // ASCII Encoding mode: 1
        cmdData += "01"
        //sdm access rights
        //RFU: 0F
        //CtrRet: 0F
        //MetaRead: 0F
        //FileRead: 0F
        cmdData += "FFFF";
        //no picc offset and mac offset
        
        const cmdDataPadd = padForEnc(cmdData, 16);

        console.log('cmdDataPadd', cmdDataPadd);

        const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
        const aesEncryptOption = {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse(iv), 
          keySize: 128 / 8, 
          padding: CryptoJS.pad.NoPadding
        };

        const encKeyData = (
          AES.encrypt(
            CryptoJS.enc.Hex.parse(cmdDataPadd), 
            CryptoJS.enc.Hex.parse(sesAuthEncKey), 
            aesEncryptOption
          )
        ).ciphertext.toString(CryptoJS.enc.Hex);

        const fileNo = "02";
        const commandMac = CryptoJS.CMAC(
          CryptoJS.enc.Hex.parse(sesAuthMacKey), 
          CryptoJS.enc.Hex.parse("5F"+cmdCtr+ti+fileNo+encKeyData)
        );
        const commandMacHex = commandMac.toString();
        console.log('changeFileSettings encKeyData', encKeyData, hexToBytes(encKeyData));
        console.log('changeFileSettings commandmac', commandMacHex);
        
        const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
          return ((index + 1) % 2 === 0);
        });
        const truncatedMac = bytesToHex(truncatedMacBytes);
        console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
        const data = encKeyData + truncatedMac;
        console.log('data', data, data.length);
        const lc = ((data.length / 2) + 1).toString(16);
        const changeFileSettingsHex = "905F0000"+lc+fileNo+encKeyData+truncatedMac+"00";
        console.log('changeFileSettingsHex', changeFileSettingsHex); 

        const changeFileSettingsRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(changeFileSettingsHex)) : await NfcManager.transceive(hexToBytes(changeFileSettingsHex));
        console.warn('changeFileSettingsRes Result: ', Platform.OS == 'ios' ? bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]) : bytesToHex(changeFileSettingsRes));
        const resCode = bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]);
        if(resCode == '9100') {
          const message = [
            Ndef.uriRecord(""),
          ];
          const bytes = Ndef.encodeMessage(message);
          console.log('ndef bytes', bytes)
          await NfcManager.ndefHandler.writeNdefMessage(bytes);

          return Promise.resolve("Successful");
        } else {
          return Promise.reject(resCode);
        }

      } catch (ex) {
        console.warn('Oops!', ex);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }

    const changeKey = async(keyNo, masterKey, key, newKey, keyVersion) => {
      try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(NfcTech.IsoDep);
          // the resolved tag object will contain `ndefMessage` property

          //have to auth with key 0
          const {sesAuthEncKey, sesAuthMacKey, ti} = await AuthEv2First('00', masterKey);
          const cmdCtr = "0000";

          const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
          console.log('iv', iv);
          const aesEncryptOption = {mode: CryptoJS.mode.CBC, iv: CryptoJS.enc.Hex.parse(iv), keySize: 128 / 8, padding: CryptoJS.pad.NoPadding};

          var keyData = '';
          if(keyNo == '00') {
            //if key 0 is to be changed
            //keyData = NewKey || KeyVer 17 byte
            // 0000000000000000000000000000
            // 0000000000000000000000000000
            keyData = padForEnc((newKey + keyVersion), 32); //32 byte

          } else {
            //if key 1 to 4 are to be changed
            //keyData = (NewKey XOR OldKey) || KeyVer || CRC32NK
            // crc32
            var WordArray = CryptoJS.lib.WordArray;

            const oldNewXorBytes = (CryptoJS.ext.xor(
              new WordArray.init(hexToBytes(key)),
              new WordArray.init(newKeyBytes)
            )).words;
            const oldNewXor = bytesToHex(oldNewXorBytes);
            const crc32Reversed = crc.crcjam(newKeyBytes).toString(16);
            const crc32 = bytesToHex(hexToBytes(crc32Reversed).reverse());
            keyData = padForEnc((oldNewXor + keyVersion + crc32), 32); //32 bytes

          }
          console.log('changeKey keyData', keyData, hexToBytes(keyData));

          const encKeyData = (
            AES.encrypt(
              CryptoJS.enc.Hex.parse(keyData), 
              CryptoJS.enc.Hex.parse(sesAuthEncKey), 
              aesEncryptOption
            )
          ).ciphertext.toString(CryptoJS.enc.Hex);

          const commandMac = CryptoJS.CMAC(
            CryptoJS.enc.Hex.parse(sesAuthMacKey), 
            CryptoJS.enc.Hex.parse("C4"+cmdCtr+ti+keyNo+encKeyData)
          );
          const commandMacHex = commandMac.toString();
          console.log('changeKey encKeyData', encKeyData, hexToBytes(encKeyData));
          console.log('changeKey commandmac', commandMacHex);
          
          const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
            return ((index + 1) % 2 === 0);
          });
          const truncatedMac = bytesToHex(truncatedMacBytes);
          console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
          const data = encKeyData + truncatedMac;
          console.log('data', data, data.length);
          const lc = ((data.length / 2) + 1).toString(16);
          const changeKeyHex = "90C40000"+lc+keyNo+encKeyData+truncatedMac+"00";
          console.log('changeKeyHex', changeKeyHex);

          const changeKeyRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(changeKeyHex)) : await NfcManager.transceive(hexToBytes(changeKeyHex));
          console.warn('changeKeyRes Result: ', Platform.OS == 'ios' ? bytesToHex([changeKeyRes.sw1, changeKeyRes.sw2]) : bytesToHex(changeKeyRes));
          
          const resCode = bytesToHex([changeKeyRes.sw1, changeKeyRes.sw2]);
          if(resCode == '9100') {
            return Promise.resolve("Successful");
          } else {
            return Promise.reject(resCode);
          }

      } catch (ex) {
        console.warn('Oops!', ex);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }

    const writeNdefSetFileSettings = async (masterKey, ndefMessage) => {
      if(!ndefMessage.includes("p=")) {
        return Promise.reject("No p value set");
      }
      if(!ndefMessage.includes("c=")) {
        return Promise.reject("No c value set");
      }
      try {
        // register for the NFC tag with NDEF in it
        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const url = ndefMessage;

        const message = [
          Ndef.uriRecord(url),
        ];
        const bytes = Ndef.encodeMessage(message);
        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        const ndef = await NfcManager.ndefHandler.getNdefMessage();
        console.log(Ndef.uri.decodePayload(ndef.ndefMessage[0].payload));

        const piccOffset = ndefMessage.indexOf("p=") + 9;
        const macOffset = ndefMessage.indexOf("c=") + 9;
        //set file settings
        const {sesAuthEncKey, sesAuthMacKey, ti} = await AuthEv2First('00', masterKey);
        const cmdCtr = "0000";
        //File Option SDM and mirroring enabled, CommMode: plain
        var cmdData = "40";
        //Access rights (FileAR.ReadWrite: 0x0, FileAR.Change: 0x0, FileAR.Read: 0xE, FileAR.Write; 0x0)
        cmdData += "00E0";
        //UID mirror: 1
        // SDMReadCtr: 1
        // SDMReadCtrLimit: 0
        // SDMENCFileData: 0
        // ASCII Encoding mode: 1
        cmdData += "C1"
        //sdm access rights
        //RFU: 0F
        //CtrRet: 0F
        //MetaRead: 01
        //FileRead: 02
        cmdData += "FF12";
        //ENCPICCDataOffset
        cmdData += (piccOffset.toString(16)).padEnd(6, "0");
        //SDMMACOffset
        cmdData += (macOffset.toString(16)).padEnd(6, "0");
        //SDMMACInputOffset
        cmdData += (macOffset.toString(16)).padEnd(6, "0");
        
        const cmdDataPadd = padForEnc(cmdData, 16);

        console.log('cmdDataPadd', cmdDataPadd);

        const iv = ivEncryption(ti, cmdCtr, sesAuthEncKey);
        const aesEncryptOption = {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse(iv), 
          keySize: 128 / 8, 
          padding: CryptoJS.pad.NoPadding
        };

        const encKeyData = (
          AES.encrypt(
            CryptoJS.enc.Hex.parse(cmdDataPadd), 
            CryptoJS.enc.Hex.parse(sesAuthEncKey), 
            aesEncryptOption
          )
        ).ciphertext.toString(CryptoJS.enc.Hex);

        const fileNo = "02";
        const commandMac = CryptoJS.CMAC(
          CryptoJS.enc.Hex.parse(sesAuthMacKey), 
          CryptoJS.enc.Hex.parse("5F"+cmdCtr+ti+fileNo+encKeyData)
        );
        const commandMacHex = commandMac.toString();
        console.log('changeFileSettings encKeyData', encKeyData, hexToBytes(encKeyData));
        console.log('changeFileSettings commandmac', commandMacHex);
        
        const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
          return ((index + 1) % 2 === 0);
        });
        const truncatedMac = bytesToHex(truncatedMacBytes);
        console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
        const data = encKeyData + truncatedMac;
        console.log('data', data, data.length);
        const lc = ((data.length / 2) + 1).toString(16);
        const changeFileSettingsHex = "905F0000"+lc+fileNo+encKeyData+truncatedMac+"00";
        console.log('changeFileSettingsHex', changeFileSettingsHex); 

        const changeFileSettingsRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(changeFileSettingsHex)) : await NfcManager.transceive(hexToBytes(changeFileSettingsHex));
        console.warn('changeFileSettingsRes Result: ', Platform.OS == 'ios' ? bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]) : bytesToHex(changeFileSettingsRes));
        const resCode = bytesToHex([changeFileSettingsRes.sw1, changeFileSettingsRes.sw2]);
        if(resCode == '9100') {
          return Promise.resolve("Successful");
        } else {
          return Promise.reject(resCode);
        }

      } catch (ex) {
        console.warn('Oops!', ex, ex.message);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }

    const writeNdef = async () => {
      try {
        // register for the NFC tag with NDEF in it
        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const url = "lnurlw://your.domain.com/ln?p=00000000000000000000000000000000&c=0000000000000000";

        const message = [
          Ndef.uriRecord(url),
        ];
        const bytes = Ndef.encodeMessage(message);
        await NfcManager.ndefHandler.writeNdefMessage(bytes);

        const ndef = await NfcManager.ndefHandler.getNdefMessage();
        console.log(ndef, Ndef.uri.decodePayload(ndef.ndefMessage[0].payload));
      } catch (ex) {
        console.warn('Oops!', ex);
      } finally {
        // stop the nfc scanning
        NfcManager.cancelTechnologyRequest();
      }
    }

    return (
        <ScrollView>
        <Card style={{ marginBottom: 20, marginHorizontal: 10 }}>
          <Card.Content>
            <Title selectable={true}>Testing </Title>
          </Card.Content>
        </Card>
        <Card style={{ marginBottom: 20, marginHorizontal: 10 }}>
          <Card.Content>
            <Title>Test Buttons</Title>
            <View style={{flexDirection: 'column', justifyContent: 'space-evenly'}}>
            <Button title="Authenticate EV2 First And Get File Settings" onPress={readNdef}>
            </Button>
            <Button title="Write NDEF & Set File Settings" onPress={() => {
              // setFileSettings("00000000000000000000000000000000", 32, 67);
              writeNdefSetFileSettings("00000000000000000000000000000000", "lnurlw://your.domain.com/ln?p=00000000000000000000000000000000&c=0000000000000000");
            }}></Button>
            <Button title="Reset File Settings" onPress={() => {
              wipeNdefResetFileSettings("00000000000000000000000000000000");
            }}></Button>
            <Button title="WRITE NDEF" onPress={writeNdef}></Button>
            <Button title="Change key" onPress={() => {
              // changeKey("00", "00000000000000000000000000000000", "00000000000000000000000000000000", "11111111111111111111111111111111", "01")
              // changeKey("00", "11111111111111111111111111111111", "11111111111111111111111111111111", "00000000000000000000000000000000", "00")
              // changeKey("01", "00000000000000000000000000000000", "00000000000000000000000000000000", "11111111111111111111111111111111", "01")
              // changeKey("01", "00000000000000000000000000000000", "11111111111111111111111111111111", "00000000000000000000000000000000", "00")
            }}></Button>
            </View>
          </Card.Content>
        </Card>
        </ScrollView>
    )
}