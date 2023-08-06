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
      await Ntag424.resetFileSettings(sesAuthEncKey, sesAuthMacKey, ti);
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
      const key0 = '00000000000000000000000000000000';
      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        key0,
      );
      console.log('key1');

      await Ntag424.changeKey(
        '01',
        key0,
        '22222222222222222222222222222222',
        '01',
      );
      console.log('key2');
      await Ntag424.changeKey(
        '02',
        key0,
        '33333333333333333333333333333333',
        '01',
      );
      console.log('key3');
      await Ntag424.changeKey(
        '03',
        key0,
        '44444444444444444444444444444444',
        '01',
      );
      console.log('key4');
      await Ntag424.changeKey(
        '04',
        key0,
        '55555555555555555555555555555555',
        '01',
      );
      console.log('key0');
      await Ntag424.changeKey(
        '00',
        key0,
        '11111111111111111111111111111111',
        '01',
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
      const defaultkey = '00000000000000000000000000000000';
      await Ntag424.AuthEv2First(
        '00',
        '11111111111111111111111111111111',
      );
      console.log('key1')
      await Ntag424.changeKey(
        "01",
        "22222222222222222222222222222222",
        defaultkey,
        "00",
      );
      console.log('key2')
      await Ntag424.changeKey(
        "02",
        "33333333333333333333333333333333",
        defaultkey,
        "00",
      );
      console.log('key3');
      await Ntag424.changeKey(
        '03',
        '44444444444444444444444444444444',
        defaultkey,
        '00',
      );
      console.log('key4');
      await Ntag424.changeKey(
        '04',
        '55555555555555555555555555555555',
        defaultkey,
        '00',
      );
      console.log('key0');
      await Ntag424.changeKey(
        '00',
        '11111111111111111111111111111111',
        defaultkey,
        '00',
      );
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  };

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
      await Ntag424.setBoltCardFileSettings(
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
      await Ntag424.requestTechnology(NfcTech.IsoDep);
      const url = 'lnurlw://your.domain.com/ln?p=00000000000000000000000000000000&c=0000000000000000';

      const message = [Ndef.uriRecord(url)];
      const bytes = Ndef.encodeMessage(message);
      console.log(Ntag424.util.bytesToHex(bytes))

      await Ntag424.setNdefMessage(bytes);

      //set offset for ndef header
      const ndef = await Ntag424.readData("060000");
      console.log(Ndef.uri.decodePayload(ndef));

    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      Ntag424.cancelTechnologyRequest();
    }
  };

  const getCardUid = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First(
        '00',
        '00000000000000000000000000000000',
      );
      const uid = await Ntag424.getCardUid(sesAuthEncKey, sesAuthMacKey, ti);
      console.log(uid);
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  };

  const testcandp = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep);

      const ndef = await Ntag424.readData("060000");
      const ndefMessage = Ndef.uri.decodePayload(ndef);
      const params = {};
      ndefMessage.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
        function(m,key,value) {
          params[key] = value;
        }
      );
      console.log(params);
      const pVal = params['p'];
      const cVal = params['c'].slice(0,16);
      console.log(ndefMessage, pVal, cVal)
      
      // const key0 = "00000000000000000000000000000000";
      // const key1 = "00000000000000000000000000000000";
      // const key2 = "00000000000000000000000000000000";

      const key0 = "11111111111111111111111111111111";
      const key1 = "22222222222222222222222222222222";
      const key2 = "33333333333333333333333333333333";
      await Ntag424.AuthEv2First(
        '00',
        key0,
      );
      const uid = await Ntag424.getCardUid();

      const result = await Ntag424.testPAndC(pVal, cVal, uid, key1, key2);
      console.log(result);
    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
    }
  }

  const wipeNdef = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await Ntag424.requestTechnology(NfcTech.IsoDep);

      const message = [Ndef.uriRecord('')];
      const bytes = Ndef.encodeMessage(message);
      console.log('WIPE', Ntag424.util.bytesToHex(bytes))

      // await Ntag424.ndefHandler.writeNdefMessage(bytes);
      await Ntag424.setNdefMessage(bytes);

      const testNdef = await NfcManager.ndefHandler.getNdefMessage();
      console.log('TEST NDEF', Ndef.uri.decodePayload(testNdef.ndefMessage[0].payload));

    } catch (ex) {
      console.warn('Oops!', ex);
    } finally {
      // stop the nfc scanning
      Ntag424.cancelTechnologyRequest();
    }
  }

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
              title="Authenticate EV2 First"
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
            <Button title="WIPE NDEF" onPress={wipeNdef}></Button>
            <Button title="Change key" onPress={changeKey}></Button>
            <Button title="Reset key" onPress={resetKey}></Button>
            <Button title="Get card uid" onPress={getCardUid}></Button>
            <Button title="Test C and P values" onPress={testcandp}></Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
