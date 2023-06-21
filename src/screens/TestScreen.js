import React from 'react';
import { TouchableOpacity, Button, Linking, ScrollView, StyleSheet, Text, Image, View, Platform } from 'react-native';
import { Card, Title } from 'react-native-paper';
import gitinfo from '../../gitinfo.json';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcTech} from 'react-native-nfc-manager';
import { randomBytes } from 'crypto';

var CryptoJS = require("crypto-js");
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
            const key = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
            const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
            const RndBDec = AES.decrypt(resultData, key, {padding: CryptoJS.pad.NoPadding, mode: CryptoJS.mode.CBC, iv: iv});
            console.log('rndb',CryptoJS.enc.Hex.stringify(RndBDec));
            const RndB = CryptoJS.enc.Hex.stringify(RndBDec);
            const RndA = randomBytes(16);
            console.log('rnda', RndA);
            const RndBRotlBytes = leftRotate(hexToBytes(RndB));
            const RndBRotl = bytesToHex(RndBRotlBytes);
            console.log('RndBRotl', RndBRotlBytes, RndBRotl);
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
            <Button title="Authenticate EV2 First" onPress={readNdef}>
            </Button>

            </View>
          </Card.Content>
        </Card>
        </ScrollView>
    )
}