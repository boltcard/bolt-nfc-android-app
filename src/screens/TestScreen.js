import React, {useEffect} from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
  Platform,
} from 'react-native';
import {Card, Title} from 'react-native-paper';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import Ntag424 from '../class/Ntag424';
import {randomBytes} from 'crypto';
import crc from 'crc';

var CryptoJS = require('../utils/Cmac');
var AES = require('crypto-js/aes');

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
    hex.push((current & 0xf).toString(16));
  }
  return hex.join('');
}

function leftRotate(bytesArr, rotatebit = 1) {
  let first = bytesArr.shift();
  bytesArr.push(first);
  return bytesArr;
}

//Encrypted IV
function ivEncryption(ti, cmdCtr, sesAuthEncKey) {
  const ivData = AES.encrypt(
    CryptoJS.enc.Hex.parse('A55A' + ti + cmdCtr + '0000000000000000'),
    CryptoJS.enc.Hex.parse(sesAuthEncKey),
    {
      mode: CryptoJS.mode.ECB,
      // iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000"),
      keySize: 128 / 8,
      padding: CryptoJS.pad.NoPadding,
    },
  );
  return ivData.ciphertext.toString(CryptoJS.enc.Hex);
}

function padForEnc(data, byteLen) {
  console.log('padforenc', data, data.length, byteLen);
  var paddedData = data;
  if (data.length < byteLen * 2) {
    console.log('padforEnc22', byteLen * 2);
    paddedData += '80';
    paddedData = paddedData.padEnd(byteLen * 2, '00');
  }
  return paddedData;
}

function decToHex(dec, bytes) {
  return ((dec.toString(16).padStart(2, '0')).padEnd((bytes * 2), '0'))
}

export default function TestScreen({navigation}) {
  async function readNdef() {
    try {
      // register for the NFC tag with NDEF in it
      await Ntag424.requestTechnology(NfcTech.IsoDep);
      // the resolved tag object will contain `ndefMessage` property

      const {sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        '00000000000000000000000000000000',
      );

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
      Ntag424.cancelTechnologyRequest();
    }
  }

  const wipeNdefResetFileSettings = async masterKey => {
    //RESET FILE SETTINGS
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      // the resolved tag object will contain `ndefMessage` property

      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        masterKey,
      );
      const cmdCtr = '0000';
      await Ntag424.resetFileSettings(sesAuthEncKey, sesAuthMacKey, ti, cmdCtr);
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  };

  const changeKey = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      // the resolved tag object will contain `ndefMessage` property

      //have to auth with key 0
      const key0 = "00000000000000000000000000000000";
      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        key0,
      );
      var cmdCtr = 0;
      console.log('key1', decToHex(cmdCtr, 2));
      
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "01",
        key0,
        "22222222222222222222222222222222",
        "01",
      );
      // await Ntag424.AuthEv2NonFirst("00", key0);
      cmdCtr += 1;
      console.log('key2', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "02",
        key0,
        "33333333333333333333333333333333",
        "01",
      );
      cmdCtr += 1;
      console.log('key3', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "03",
        key0,
        "44444444444444444444444444444444",
        "01",
      );
      console.log('key4')
      cmdCtr += 1;
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "04",
        key0,
        "55555555555555555555555555555555",
        "01",
      );
      console.log('key0')
      cmdCtr += 1;
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "00",
        key0,
        "11111111111111111111111111111111",
        "01",
      );
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  };

  const resetKey = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      // the resolved tag object will contain `ndefMessage` property

      //have to auth with key 0
      const defaultkey = "00000000000000000000000000000000";
      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        "11111111111111111111111111111111",
      );
      var cmdCtr = 0;
      console.log('key1', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "01",
        "22222222222222222222222222222222",
        defaultkey,
        "00",
      );
      cmdCtr += 1;
      console.log('key2', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "02",
        "33333333333333333333333333333333",
        defaultkey,
        "00",
      );
      cmdCtr += 1;
      console.log('key3', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "03",
        "44444444444444444444444444444444",
        defaultkey,
        "00",
      );
      cmdCtr += 1;
      console.log('key4', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "04",
        "55555555555555555555555555555555",
        defaultkey,
        "00",
      );
      cmdCtr += 1;
      console.log('key0', decToHex(cmdCtr, 2))
      await Ntag424.changeKey(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        decToHex(cmdCtr, 2),
        "00",
        "11111111111111111111111111111111",
        defaultkey,
        "00",
      );
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  const writeNdefSetFileSettings = async (masterKey, ndefMessage) => {
    if (!ndefMessage.includes('p=')) {
      return Promise.reject('No p value set');
    }
    if (!ndefMessage.includes('c=')) {
      return Promise.reject('No c value set');
    }
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      const url = ndefMessage;

      const message = [Ndef.uriRecord(url)];
      const bytes = Ndef.encodeMessage(message);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);

      const ndef = await NfcManager.ndefHandler.getNdefMessage();
      console.log(Ndef.uri.decodePayload(ndef.ndefMessage[0].payload));

      const piccOffset = ndefMessage.indexOf('p=') + 9;
      const macOffset = ndefMessage.indexOf('c=') + 9;

      //set file settings
      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        masterKey,
      );
      const cmdCtr = '0000';
      await Ntag424.changeFileSettings(
        sesAuthEncKey,
        sesAuthMacKey,
        ti,
        cmdCtr,
        piccOffset,
        macOffset,
      );
    } catch (ex) {
      console.warn('Oops!', ex, ex.message);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  };

  const writeNdef = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      const url =
        'lnurlw://your.domain.com/ln?p=00000000000000000000000000000000&c=0000000000000000';

      const message = [Ndef.uriRecord(url)];
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
  };

  return (
    <ScrollView>
      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title selectable={true}>Testing </Title>
        </Card.Content>
      </Card>
      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title>Test Buttons</Title>
          <View
            style={{flexDirection: 'column', justifyContent: 'space-evenly'}}>
            <Button
              title="Authenticate EV2 First And Get File Settings"
              onPress={readNdef}></Button>
            <Button
              title="Write NDEF & Set File Settings"
              onPress={() => {
                // setFileSettings("00000000000000000000000000000000", 32, 67);
                writeNdefSetFileSettings(
                  '00000000000000000000000000000000',
                  'lnurlw://your.domain.com/ln?p=00000000000000000000000000000000&c=0000000000000000',
                );
              }}></Button>
            <Button
              title="Reset File Settings"
              onPress={() => {
                wipeNdefResetFileSettings('00000000000000000000000000000000');
              }}></Button>
            <Button title="WRITE NDEF" onPress={writeNdef}></Button>
            <Button
              title="Change key"
              onPress={changeKey}></Button>
            <Button
              title="Reset key"
              onPress={resetKey}></Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
