import React from 'react';
import { Button, ScrollView, StyleSheet, Text, Image, View, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
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

    const changeFileSettings = async () => {
      try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(NfcTech.IsoDep);
          // the resolved tag object will contain `ndefMessage` property

          const {sesAuthMacKey, ti} = await AuthEv2First('00', '00000000000000000000000000000000');

          // const commandMac = CryptoJS.CMAC(CryptoJS.enc.Hex.parse(sesAuthMacKey), CryptoJS.enc.Hex.parse("F50000"+ti+'02'));
          // const commandMacHex = commandMac.toString();
          // console.log('commandMacHex', commandMacHex, hexToBytes(commandMacHex));
          // //truncate to 8 bytes (only get even numbered bytes)
          // const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
          //   return ((index + 1) % 2 === 0);
          // });
          // console.log('truncatedMac', truncatedMacBytes, bytesToHex(truncatedMacBytes));

          // const getFileSettingsHex = "90F500000902" + bytesToHex(truncatedMacBytes) + '00';
          // const getFileSettingsRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(getFileSettingsHex)) : await NfcManager.transceive(hexToBytes(getFileSettingsHex));
          // console.warn('getFileSettingsRes Result: ', Platform.OS == 'ios' ? bytesToHex([getFileSettingsRes.sw1, getFileSettingsRes.sw2]) : bytesToHex(getFileSettingsRes));

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

          // IV for CmdData = E(SesAuthENCKey; A5h || 5Ah || TI || CmdCtr || 0000000000000000h)
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
          const iv = ivData.ciphertext.toString(CryptoJS.enc.Hex);
          console.log('iv', iv);
          const aesEncryptOption = {mode: CryptoJS.mode.CBC, iv: CryptoJS.enc.Hex.parse(iv), keySize: 128 / 8, padding: CryptoJS.pad.NoPadding};

          var keyData = '';
          if(keyNo == '00') {
            //if key 0 is to be changed
            //keyData = NewKey || KeyVer 17 byte
            // 0000000000000000000000000000
            // 0000000000000000000000000000
            keyData = (newKey + keyVersion + "80").padEnd(64, "0"); //32 byte
          } else {
            //if key 1 to 4 are to be changed
            //keyData = (NewKey XOR OldKey) || KeyVer || CRC32NK
            const newKeyBytes = hexToBytes(newKey);
            const crc32ReversedTest = crc.crcjam(hexToBytes("F3847D627727ED3BC9C4CC050489B966")).toString(16);
            const crc32Test = bytesToHex(hexToBytes(crc32ReversedTest).reverse());
            console.log("CRC32 TEST", crc32ReversedTest, crc32Test);
            // crc32
            var WordArray = CryptoJS.lib.WordArray;

            const oldNewXorBytes = (CryptoJS.ext.xor(
              new WordArray.init(hexToBytes(key)),
              new WordArray.init(newKeyBytes)
            )).words;
            const oldNewXor = bytesToHex(oldNewXorBytes);
            const crc32Reversed = crc.crcjam(newKeyBytes).toString(16);
            const crc32 = bytesToHex(hexToBytes(crc32Reversed).reverse());
            keyData = (oldNewXor + keyVersion + crc32 + "80").padEnd(64, "0"); //32 bytes
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
            <Button title="Change key" onPress={() => {
              // changeKey("00", "00000000000000000000000000000000", "00000000000000000000000000000000", "11111111111111111111111111111111", "01")
              // changeKey("01", "00000000000000000000000000000000", "00000000000000000000000000000000", "11111111111111111111111111111111", "01")
              // changeKey("00", "11111111111111111111111111111111", "11111111111111111111111111111111", "00000000000000000000000000000000", "00")
              // changeKey("01", "00000000000000000000000000000000", "11111111111111111111111111111111", "00000000000000000000000000000000", "00")
            }}></Button>
            </View>
          </Card.Content>
        </Card>
        </ScrollView>
    )
}