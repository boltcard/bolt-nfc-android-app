
import React from 'react';
import { Button, ScrollView, View } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import { Card, Title } from 'react-native-paper';

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

export default function TestScreen({ navigation }) {
    async function readNdef() {
        try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(NfcTech.IsoDep);

          //iso select file
          const isoselect = hexToBytes('00A4040007D276000085010100');
          console.log('isoselect', isoselect)
          const isoSelectResult = await NfcManager.transceive(isoselect);
          console.warn('isoSelectResult: ', bytesToHex(isoSelectResult));

          //auth ev2 first part 1
          const bytes = hexToBytes('9071000005000300000000');
          
          //get card UID
          // const bytes = hexToBytes('9051000000');
          
          //get key version
          // const bytes = hexToBytes('90640000010100');

          console.log('bytes', bytes)
          const Result = await NfcManager.transceive(bytes);
          console.warn('Result: ', bytesToHex(Result));
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