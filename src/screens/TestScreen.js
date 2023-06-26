import React from 'react';
import { TouchableOpacity, Button, Linking, ScrollView, StyleSheet, Text, Image, View, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import gitinfo from '../../gitinfo.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { randomBytes } from 'crypto';

var CryptoJS = require("../utils/Cmac");
var AES = require("crypto-js/aes");

var CRC32=function(str){var CRCTable=[0x00000000,0x77073096,0xEE0E612C,0x990951BA,0x076DC419,0x706AF48F,0xE963A535,0x9E6495A3,0x0EDB8832,0x79DCB8A4,0xE0D5E91E,0x97D2D988,0x09B64C2B,0x7EB17CBD,0xE7B82D07,0x90BF1D91,0x1DB71064,0x6AB020F2,0xF3B97148,0x84BE41DE,0x1ADAD47D,0x6DDDE4EB,0xF4D4B551,0x83D385C7,0x136C9856,0x646BA8C0,0xFD62F97A,0x8A65C9EC,0x14015C4F,0x63066CD9,0xFA0F3D63,0x8D080DF5,0x3B6E20C8,0x4C69105E,0xD56041E4,0xA2677172,0x3C03E4D1,0x4B04D447,0xD20D85FD,0xA50AB56B,0x35B5A8FA,0x42B2986C,0xDBBBC9D6,0xACBCF940,0x32D86CE3,0x45DF5C75,0xDCD60DCF,0xABD13D59,0x26D930AC,0x51DE003A,0xC8D75180,0xBFD06116,0x21B4F4B5,0x56B3C423,0xCFBA9599,0xB8BDA50F,0x2802B89E,0x5F058808,0xC60CD9B2,0xB10BE924,0x2F6F7C87,0x58684C11,0xC1611DAB,0xB6662D3D,0x76DC4190,0x01DB7106,0x98D220BC,0xEFD5102A,0x71B18589,0x06B6B51F,0x9FBFE4A5,0xE8B8D433,0x7807C9A2,0x0F00F934,0x9609A88E,0xE10E9818,0x7F6A0DBB,0x086D3D2D,0x91646C97,0xE6635C01,0x6B6B51F4,0x1C6C6162,0x856530D8,0xF262004E,0x6C0695ED,0x1B01A57B,0x8208F4C1,0xF50FC457,0x65B0D9C6,0x12B7E950,0x8BBEB8EA,0xFCB9887C,0x62DD1DDF,0x15DA2D49,0x8CD37CF3,0xFBD44C65,0x4DB26158,0x3AB551CE,0xA3BC0074,0xD4BB30E2,0x4ADFA541,0x3DD895D7,0xA4D1C46D,0xD3D6F4FB,0x4369E96A,0x346ED9FC,0xAD678846,0xDA60B8D0,0x44042D73,0x33031DE5,0xAA0A4C5F,0xDD0D7CC9,0x5005713C,0x270241AA,0xBE0B1010,0xC90C2086,0x5768B525,0x206F85B3,0xB966D409,0xCE61E49F,0x5EDEF90E,0x29D9C998,0xB0D09822,0xC7D7A8B4,0x59B33D17,0x2EB40D81,0xB7BD5C3B,0xC0BA6CAD,0xEDB88320,0x9ABFB3B6,0x03B6E20C,0x74B1D29A,0xEAD54739,0x9DD277AF,0x04DB2615,0x73DC1683,0xE3630B12,0x94643B84,0x0D6D6A3E,0x7A6A5AA8,0xE40ECF0B,0x9309FF9D,0x0A00AE27,0x7D079EB1,0xF00F9344,0x8708A3D2,0x1E01F268,0x6906C2FE,0xF762575D,0x806567CB,0x196C3671,0x6E6B06E7,0xFED41B76,0x89D32BE0,0x10DA7A5A,0x67DD4ACC,0xF9B9DF6F,0x8EBEEFF9,0x17B7BE43,0x60B08ED5,0xD6D6A3E8,0xA1D1937E,0x38D8C2C4,0x4FDFF252,0xD1BB67F1,0xA6BC5767,0x3FB506DD,0x48B2364B,0xD80D2BDA,0xAF0A1B4C,0x36034AF6,0x41047A60,0xDF60EFC3,0xA867DF55,0x316E8EEF,0x4669BE79,0xCB61B38C,0xBC66831A,0x256FD2A0,0x5268E236,0xCC0C7795,0xBB0B4703,0x220216B9,0x5505262F,0xC5BA3BBE,0xB2BD0B28,0x2BB45A92,0x5CB36A04,0xC2D7FFA7,0xB5D0CF31,0x2CD99E8B,0x5BDEAE1D,0x9B64C2B0,0xEC63F226,0x756AA39C,0x026D930A,0x9C0906A9,0xEB0E363F,0x72076785,0x05005713,0x95BF4A82,0xE2B87A14,0x7BB12BAE,0x0CB61B38,0x92D28E9B,0xE5D5BE0D,0x7CDCEFB7,0x0BDBDF21,0x86D3D2D4,0xF1D4E242,0x68DDB3F8,0x1FDA836E,0x81BE16CD,0xF6B9265B,0x6FB077E1,0x18B74777,0x88085AE6,0xFF0F6A70,0x66063BCA,0x11010B5C,0x8F659EFF,0xF862AE69,0x616BFFD3,0x166CCF45,0xA00AE278,0xD70DD2EE,0x4E048354,0x3903B3C2,0xA7672661,0xD06016F7,0x4969474D,0x3E6E77DB,0xAED16A4A,0xD9D65ADC,0x40DF0B66,0x37D83BF0,0xA9BCAE53,0xDEBB9EC5,0x47B2CF7F,0x30B5FFE9,0xBDBDF21C,0xCABAC28A,0x53B39330,0x24B4A3A6,0xBAD03605,0xCDD70693,0x54DE5729,0x23D967BF,0xB3667A2E,0xC4614AB8,0x5D681B02,0x2A6F2B94,0xB40BBE37,0xC30C8EA1,0x5A05DF1B,0x2D02EF8D];var len=str.length;var r=0xffffffff;for(var i=0;i<len;i++){r=(r>>8)^CRCTable[str[i]^(r&0x000000FF)];}
return~r;}

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

    const changeKey = async(keyNo, key, newKey, keyVersion) => {
      try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(NfcTech.IsoDep);
          // the resolved tag object will contain `ndefMessage` property

          const {sesAuthEncKey, sesAuthMacKey, ti} = await AuthEv2First(keyNo, key);
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

          if(keyNo == '00') {
            //if key 0 is to be changed
            //keyData = NewKey || KeyVer 17 byte
            // 0000000000000000000000000000
            // 0000000000000000000000000000
            const keyData = (newKey + keyVersion + "80").padEnd(64, "0"); //32 byte
            console.log('changeKey keyData', keyData, hexToBytes(keyData));
            const encCmdData = (
              AES.encrypt(
                CryptoJS.enc.Hex.parse(keyData), 
                CryptoJS.enc.Hex.parse(sesAuthEncKey), 
                aesEncryptOption
              )
            ).ciphertext.toString(CryptoJS.enc.Hex);
            const commandMac = CryptoJS.CMAC(
              CryptoJS.enc.Hex.parse(sesAuthMacKey), 
              CryptoJS.enc.Hex.parse("C4"+cmdCtr+ti+keyNo+encCmdData)
            );
            const commandMacHex = commandMac.toString();
            console.log('changeKey encCmdData', encCmdData, hexToBytes(encCmdData));
            console.log('changeKey commandmac', commandMacHex);
            
            const truncatedMacBytes = hexToBytes(commandMacHex).filter(function(element, index, array) {
              return ((index + 1) % 2 === 0);
            });
            const truncatedMac = bytesToHex(truncatedMacBytes);
            console.log('truncatedMac', truncatedMac, hexToBytes(truncatedMac));
            const data = encCmdData + truncatedMac;
            console.log('data', data, data.length);
            const lc = ((data.length / 2) + 1).toString(16);
            const changeKeyHex = "90C40000"+lc+keyNo+encCmdData+truncatedMac+"00";
            console.log('changeKeyHex', changeKeyHex);

            const changeKeyRes = Platform.OS == 'ios' ? await NfcManager.sendCommandAPDUIOS(hexToBytes(changeKeyHex)) : await NfcManager.transceive(hexToBytes(changeKeyHex));
            console.warn('changeKeyRes Result: ', Platform.OS == 'ios' ? bytesToHex([changeKeyRes.sw1, changeKeyRes.sw2]) : bytesToHex(changeKeyRes));

          } else {
            //if key 1 to 4 are to be changed
            //keyData = (NewKey XOR OldKey) || KeyVer || CRC32NK

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
            <View style={{flexDirection: 'column', justifyContent: 'space-evenly'}}>
            <Button title="Authenticate EV2 First And Get File Settings" onPress={readNdef}>
            </Button>
            <Button title="Change key" onPress={() => {
              changeKey("00", "00000000000000000000000000000000", "11111111111111111111111111111111", "01")
              // changeKey("00", "11111111111111111111111111111111", "00000000000000000000000000000000", "01")
            }}></Button>
            </View>
          </Card.Content>
        </Card>
        </ScrollView>
    )
}