import {useFocusEffect, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Button,
  NativeEventEmitter,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Card, Title} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import DisplayAuthInfo from '../components/DisplayAuthInfo';
import Ntag424 from '../class/Ntag424';

export default function CreateBoltcardScreen({route}) {
  const {data, timestamp} = route.params;
  const navigation = useNavigation();

  const [promptVisible, setPromptVisible] = useState(false);
  const [pasteUrlValue, setPasteUrlValue] = useState();

  //setup
  const [keys, setKeys] = useState([]);
  const [lnurlw_base, setlnurlw_base] = useState();
  const [cardName, setCardName] = useState();
  const [readyToWrite, setReadyToWrite] = useState(false);
  const [writeMode, setWriteMode] = useState(false);

  //output
  const [cardUID, setCardUID] = useState();
  const [tagname, setTagname] = useState();
  const [tagTypeError, setTagTypeError] = useState();

  const [key0Changed, setKey0Changed] = useState();
  const [key1Changed, setKey1Changed] = useState();
  const [key2Changed, setKey2Changed] = useState();
  const [key3Changed, setKey3Changed] = useState();
  const [key4Changed, setKey4Changed] = useState();
  const [privateUID, setPrivateUID] = useState(false);

  const [ndefWritten, setNdefWritten] = useState();
  const [writekeys, setWriteKeys] = useState();
  const [ndefRead, setNdefRead] = useState();
  const [testp, setTestp] = useState();
  const [testc, setTestc] = useState();
  const [testBolt, setTestBolt] = useState();

  const scanQRCode = () => {
    navigation.navigate('ScanScreen', {backScreen: 'CreateBoltcardScreen'});
  };

  const resetAll = () => {
    setKeys([]);
    setReadyToWrite(false);
    setWriteMode(false);
    resetOutput();
    navigation.navigate('CreateBoltcardScreen', {data: null});
  };

  const resetOutput = () => {
    setTagTypeError(null);
    setTagname(null);
    setCardUID(null);
    setKey0Changed(null);
    setKey1Changed(null);
    setKey2Changed(null);
    setKey3Changed(null);
    setKey4Changed(null);
    setNdefWritten(null);
    setWriteKeys(null);
  };

  const writeAgain = async () => {
    resetOutput();
    console.log(keys);
    // NativeModules.MyReactModule.setCardMode('createBoltcard');
    setWriteMode(true);
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep, {
        alertMessage: "Ready to write card. Hold NFC card to phone until all keys are changed."
      });

      //set ndef
      const ndefMessage = lnurlw_base.includes('?')
        ? lnurlw_base + '&p=00000000000000000000000000000000&c=0000000000000000'
        : lnurlw_base +
          '?p=00000000000000000000000000000000&c=0000000000000000';


      const message = [Ndef.uriRecord(ndefMessage)];
      const bytes = Ndef.encodeMessage(message);

      await Ntag424.setNdefMessage(bytes);
      setNdefWritten('success');

      const key0 = '00000000000000000000000000000000';
      // //auth first     
      await Ntag424.AuthEv2First(
        '00',
        key0,
      );
      
      if(privateUID) {
        await Ntag424.setPrivateUid();
      }
      const piccOffset = ndefMessage.indexOf('p=') + 9;
      const macOffset = ndefMessage.indexOf('c=') + 9;
      //change file settings
      await Ntag424.setBoltCardFileSettings(
        piccOffset,
        macOffset,
      );
      //get uid
      const uid = await Ntag424.getCardUid();
      console.log('UID', uid);
      setCardUID(uid);
      
      //change keys
      console.log('changekey 1')
      await Ntag424.changeKey(
        '01',
        key0,
        keys[1],
        '01',
      );
      setKey1Changed(true);
      console.log('changekey 2')
      await Ntag424.changeKey(
        '02',
        key0,
        keys[2],
        '01',
      );
      setKey2Changed(true);
      console.log('changekey 3')
      await Ntag424.changeKey(
        '03',
        key0,
        keys[3],
        '01',
      );
      setKey3Changed(true);
      console.log('changekey 4')
      await Ntag424.changeKey(
        '04',
        key0,
        keys[4],
        '01',
      );
      setKey4Changed(true);
      console.log('changekey 0')
      await Ntag424.changeKey(
        '00',
        key0,
        keys[0],
        '01',
      );
      setKey0Changed(true);
      setWriteKeys('success');

      //set offset for ndef header
      const ndef = await Ntag424.readData("060000");
      const setNdefMessage = Ndef.uri.decodePayload(ndef);
      setNdefRead(setNdefMessage);

      //we have the latest read from the card fire it off to the server.
      const httpsLNURL = setNdefMessage.replace('lnurlw://', 'https://');
      fetch(httpsLNURL)
        .then(response => response.json())
        .then(json => {
          setTestBolt('success');
        })
        .catch(error => {
          setTestBolt('Error: ' + error.message);
        });

      await Ntag424.AuthEv2First(
        '00',
        keys[0],
      );

      const params = {};
      setNdefMessage.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
        function(m,key,value) {
          params[key] = value;
        }
      );
      if(!"p" in params) {
        setTestp("no p value to test")
        return;
      }
      if(!"c" in params) {
        setTestc("no c value to test")
        return;
      }

      const pVal = params['p'];
      const cVal = params['c'].slice(0,16);

      const testResult = await Ntag424.testPAndC(pVal, cVal, uid, keys[1], keys[2]);
      setTestp(testResult.pTest ? 'ok' : 'decrypt with key failed');
      setTestc(testResult.cTest ? 'ok' : 'decrypt with key failed');



    } catch (ex) {
      console.error('Oops!', ex);
      var error = ex;
      if(typeof ex === 'object') {
        error = "NFC Error: "+(ex.message? ex.message : ex.constructor.name);
      }
      setTagTypeError(error);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
      setWriteMode(false);
    }
  };

  const showTickOrError = good => {
    return good ? (
      <Ionicons name="checkmark-circle" size={20} color="green" />
    ) : (
      <Ionicons name="alert-circle" size={20} color="red" />
    );
  };

  return (
    <ScrollView>
      {!data || data == null ? (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Scan QR Code</Title>
              <Text>
                Press the create card on LNBits or run the ./createboltcard
                command on your boltcard server
              </Text>
            </Card.Content>
            <Card.Actions style={{justifyContent: 'space-around'}}>
              <Button onPress={scanQRCode} title="Scan QR Code" />
              <Button
                onPress={() => setPromptVisible(true)}
                title="Paste Auth URL"
              />
            </Card.Actions>
          </Card>
          <Dialog.Container visible={promptVisible}>
            <Dialog.Title style={styles.textBlack}>Enter Auth URL</Dialog.Title>
            <Dialog.Description>
              Paste your Auth URL from the console here to import the keys.
            </Dialog.Description>
            <Dialog.Input
              style={styles.textBlack}
              label="Auth URL"
              onChangeText={setPasteUrlValue}
              value={pasteUrlValue}
            />
            <Dialog.Button
              label="Cancel"
              onPress={() => {
                setPromptVisible(false);
                setPasteUrlValue();
              }}
            />
            <Dialog.Button
              label="Continue"
              onPress={() => {
                setPromptVisible(false);
                setPasteUrlValue();
                navigation.navigate('CreateBoltcardScreen', {
                  data: pasteUrlValue,
                  timestamp: Date.now(),
                });
              }}
            />
          </Dialog.Container>
        </>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Check URLs and Keys</Title>
            <DisplayAuthInfo
              data={data}
              keys={keys}
              setKeys={setKeys}
              lnurlw_base={lnurlw_base}
              setlnurlw_base={setlnurlw_base}
              setReadyToWrite={setReadyToWrite}
              cardName={cardName}
              setCardName={setCardName}
              privateUID={privateUID}
              setPrivateUID={setPrivateUID}
            />
          </Card.Content>
          <Card.Actions style={{justifyContent: 'space-around'}}>
            <Button title="Reset" color="red" onPress={resetAll} />
            {readyToWrite && !writeMode && (
              <Button title="Write Card Now" onPress={writeAgain} />
            )}
          </Card.Actions>
        </Card>
      )}

      {writeMode && (
        <Card style={styles.card}>
          <Card.Content>
            <Ionicons name="card" size={50} color="green" />
            <Text
              style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
              Ready to write card. Hold NFC card to phone until all keys are
              changed.
            </Text>
          </Card.Content>
          <Card.Actions style={{justifyContent: 'center'}}>
            <Button
              title="Cancel"
              color="red"
              onPress={() => {
                NfcManager.cancelTechnologyRequest();
                setWriteMode(false);
                setReadyToWrite(true);
              }}
            />
          </Card.Actions>
        </Card>
      )}
      {(cardUID || tagTypeError) && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Output</Title>
            {tagTypeError && (
              <Text>
                Tag Type Error: {tagTypeError}
                <Ionicons name="alert-circle" size={20} color="red" />
              </Text>
            )}
            {cardUID && (
              <Text>
                Card UID: {cardUID}
                <Ionicons name="checkmark-circle" size={20} color="green" />
              </Text>
            )}
            {tagname && (
              <Text style={{lineHeight: 30, textAlignVertical: 'center'}}>
                Tag: {tagname}
                <Ionicons name="checkmark-circle" size={20} color="green" />
              </Text>
            )}
            {ndefWritten && (
              <Text>
                NDEF written: {ndefWritten}
                {showTickOrError(ndefWritten == 'success')}
              </Text>
            )}
            {writekeys && (
              <Text>
                Keys Changed: {writekeys}
                {showTickOrError(writekeys == 'success')}
              </Text>
            )}
            {ndefRead && <Text>Read NDEF: {ndefRead}</Text>}
            {testp && (
              <Text>
                Test PICC:{' '}
                {cardUID && cardUID.length == 8 ? (
                  <>test skipped {showTickOrError(true)}</>
                ) : (
                  <>
                    {testp}
                    {showTickOrError(testp == 'ok')}
                  </>
                )}
              </Text>
            )}
            {testc && (
              <Text>
                Test CMAC: {testc}
                {showTickOrError(testc == 'ok')}
              </Text>
            )}
            {testBolt && (
              <Text>
                Bolt call test: {testBolt}
                {showTickOrError(testBolt == 'success')}
              </Text>
            )}
          </Card.Content>
          <Card.Actions style={{justifyContent: 'space-around'}}>
            <Button title="Write Again" onPress={writeAgain} />
          </Card.Actions>
        </Card>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  card: {
    margin: 20,
  },
  textBlack: {
    color: '#000',
  },
});
