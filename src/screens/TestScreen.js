import React from 'react';
import { TouchableOpacity, Button, Linking, ScrollView, StyleSheet, Text, Image, View, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import gitinfo from '../../gitinfo.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { randomBytes } from 'crypto';

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
            const bytes = hexToBytes('9071000005000300000000');
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
              const key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
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
                console.log('ti', ti, tiBytes);

                //SV2 = 5Ah||A5h||00h||01h||00h||80h||RndA[15..14]|| ( RndA[13..8] # RndB[15..10])||RndB[9..0]||RndA[7..0]
                  //# == XOR-operator

                console.log(RndA.slice(0,4), RndA.slice(4,16));
                let sv2 = "5AA500010080";
                sv2 = sv2 + RndA.slice(0,4);
                
                var WordArray = CryptoJS.lib.WordArray;

                const xor =  CryptoJS.ext.xor(new WordArray.init(hexToBytes(RndA.slice(4, 16))), new WordArray.init(hexToBytes(RndB.slice(0, 12))));
                sv2 = sv2 + bytesToHex(xor.words);
                sv2 = sv2 + RndB.slice(12, 32) + RndA.slice(16, 32);
                console.log('sv2', sv2);
                const sesAuthMac = CryptoJS.CMAC(key, CryptoJS.enc.Hex.parse(sv2));
                const sesAuthMacKey = sesAuthMac.toString();
                console.log('sesAuthMacKey', sesAuthMacKey);

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
              } else {
                //auth failed
              }
            } else {
              //auth failed
            }

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
            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Button title="Authenticate EV2 First And Get File Settings" onPress={readNdef}>
            </Button>
            </View>
          </Card.Content>
        </Card>
        </ScrollView>
    )
}