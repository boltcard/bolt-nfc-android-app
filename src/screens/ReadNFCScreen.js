import Clipboard from '@react-native-clipboard/clipboard';
import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {Button, Card, Paragraph, Title} from 'react-native-paper';
import Ntag424 from '../class/Ntag424';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';

export default function ReadNFCScreen(props) {
  const [cardReadInfo, setCardReadInfo] = useState('');
  const [ndef, setNdef] = useState('pending...');
  const [cardUID, setCardUID] = useState();
  const [key0Changed, setKey0Changed] = useState('Key 0 version pending');
  const [key1Changed, setKey1Changed] = useState('Key 1 version pending');
  const [key2Changed, setKey2Changed] = useState('Key 2 version pending');
  const [key3Changed, setKey3Changed] = useState('Key 3 version pending');
  const [key4Changed, setKey4Changed] = useState('Key 4 version pending');

  const [readyToRead, setReadyToRead] = useState(false);
  const [readError, setReadError] = useState(null);

  // useEffect(() => {
  //   const eventEmitter = new NativeEventEmitter();
  //   const eventListener = eventEmitter.addListener('CardHasBeenRead', event => {
  //     setCardReadInfo(event.cardReadInfo);
  //     setNdef(event.ndef);
  //     setCardUID(event.cardUID && event.cardUID.toLowerCase());
  //     console.log(
  //       event.key0Changed,
  //       event.key1Changed,
  //       event.key2Changed,
  //       event.key3Changed,
  //       event.key4Changed,
  //     );
  //     setKey0Changed('Key 0 version: ' + event.key0Changed);
  //     setKey1Changed('Key 1 version: ' + event.key1Changed);
  //     setKey2Changed('Key 2 version: ' + event.key2Changed);
  //     setKey3Changed('Key 3 version: ' + event.key3Changed);
  //     setKey4Changed('Key 4 version: ' + event.key4Changed);
  //   });

  //   return () => {
  //     eventListener.remove();
  //   };
  // });

  const copyToClipboard = () => {
    Clipboard.setString(cardUID);
    ToastAndroid.showWithGravity(
      'Copied to clipboard',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
    );
  };

  const readNfc = async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.IsoDep);
      setReadyToRead(true);

      const ndef = await Ntag424.readData("060000");
      const ndefMessage = Ndef.uri.decodePayload(ndef);
      setNdef(ndefMessage);

      const {sesAuthEncKey, sesAuthMacKey, ti} = await Ntag424.AuthEv2First("00", "00000000000000000000000000000000");
      const uid = await Ntag424.getCardUid(sesAuthEncKey, sesAuthMacKey, ti);
      setCardUID(uid);
      const key0Version = await Ntag424.getKeyVersion("00");
      setKey0Changed("Key 0 version: "+key0Version);
      const key1Version = await Ntag424.getKeyVersion("01");
      setKey1Changed("Key 1 version: "+key1Version);
      const key2Version = await Ntag424.getKeyVersion("02");
      setKey2Changed("Key 2 version: "+key2Version);
      const key3Version = await Ntag424.getKeyVersion("03");
      setKey3Changed("Key 3 version: "+key3Version);
      const key4Version = await Ntag424.getKeyVersion("04");
      setKey4Changed("Key 4 version: "+key4Version);
      

    } catch (ex) {
      console.warn('Oops!', ex);
      setReadError(ex);
    } finally {
      // stop the nfc scanning
      await NfcManager.cancelTechnologyRequest();
      setReadyToRead(false);
    }
  }

  return (
    <ScrollView style={{}}>
      {readyToRead ? 
        <Text
          style={{
            margin: 20,
            fontWeight: 'bold',
            fontSize: 15,
            textAlign: 'center',
          }}>
          <ActivityIndicator /> Hold NFC card to Reader
        </Text>
        :
        <View style={{marginHorizontal: 10, marginVertical: 20, flexDirection: 'row', justifyContent: 'center'}}>
          <Button icon="nfc" mode="contained" onPress={readNfc} compact={true} color="#f79928">Read NFC</Button>
        </View>
      }

      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title>NDEF Record</Title>
          <Paragraph style={{fontWeight: 'bold', fontSize: 15}}>
            {ndef}
          </Paragraph>
        </Card.Content>
      </Card>
      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title>Card UID</Title>
          <View style={{alignItems: 'flex-start', flexDirection: 'row'}}>
            {cardUID && <Button onPress={copyToClipboard} title="Copy" />}
            <Text style={{lineHeight: 35, marginLeft: 10}}>{cardUID}</Text>
          </View>
        </Card.Content>
      </Card>
      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title>NFC Card Attributes</Title>
          <Paragraph>{cardReadInfo}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={{marginBottom: 20, marginHorizontal: 10}}>
        <Card.Content>
          <Title>Card Keys</Title>
          <Paragraph>{key0Changed}</Paragraph>
          <Paragraph>{key1Changed}</Paragraph>
          <Paragraph>{key2Changed}</Paragraph>
          <Paragraph>{key3Changed}</Paragraph>
          <Paragraph>{key4Changed}</Paragraph>
        </Card.Content>
      </Card>

      <Text></Text>
    </ScrollView>
  );
}
