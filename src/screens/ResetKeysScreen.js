import React, {useEffect, useState} from 'react';

import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  Button,
  NativeEventEmitter,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import Dialog from 'react-native-dialog';
import {Card, Title} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NfcManager, {NfcTech, Ndef} from 'react-native-nfc-manager';
import Ntag424 from '../class/Ntag424';

export default function ResetKeysScreen({route}) {
  const navigation = useNavigation();
  const [writeKeysOutput, setWriteKeysOutput] = useState();

  const defaultKey = '00000000000000000000000000000000';

  const [uid, setUid] = useState()
  const [key0, setKey0] = useState(defaultKey)
  const [key1, setKey1] = useState(defaultKey)
  const [key2, setKey2] = useState(defaultKey)
  const [key3, setKey3] = useState(defaultKey)
  const [key4, setKey4] = useState(defaultKey)

  const [pasteWipeKeysJSON, setPasteWipeKeysJSON] = useState();
  const [promptVisible, setPromptVisible] = useState(false);
  const [keyJsonError, setKeyJsonError] = useState(false);
  const [resetNow, setResetNow] = useState(false);

  const data = route && route.params ? route.params.data : null;
  const timestamp = route && route.params ? route.params.timestamp : null;

  useEffect(() => {
    if (data) {
      try {
        const dataObj = JSON.parse(data);
        setUid(dataObj.uid);

        setKey0(dataObj.k0 || defaultKey);
        setKey1(dataObj.k1 || defaultKey);
        setKey2(dataObj.k2 || defaultKey);
        setKey3(dataObj.k3 || defaultKey);
        setKey4(dataObj.k4 || defaultKey);
        let error = ''
        if(dataObj.action != 'wipe') {
          error = 'Wipe action not specified, proceed with caution.\r\n';
        }
        if (dataObj.version != '1') {
          error =
            error +
            ' Expected version 1, found version: ' +
            dataObj.version +
            '\r\n';
        }
        if (
          !dataObj.k0 ||
          !dataObj.k1 ||
          !dataObj.k2 ||
          !dataObj.k3 ||
          !dataObj.k4
        ) {
          error = error + ' Some keys missing, proceed with caution';
        }
        setKeyJsonError(error);
      } catch (exceptionVar) {
        setKeyJsonError('' + exceptionVar);
      }
    }
  }, [data, timestamp]);

  const enableResetMode = async() => {
    setResetNow(true);
    setWriteKeysOutput(null);
    var result = [];
    try {
      // register for the NFC tag with NDEF in it
      await NfcManager.requestTechnology(NfcTech.IsoDep, {
        alertMessage: "Ready to write card. Hold NFC card to phone until all keys are changed."
      });
      
      const defaultKey = '00000000000000000000000000000000';
      
      // //auth first     
      await Ntag424.AuthEv2First(
        '00',
        key0,
      );

      //reset file settings
      await Ntag424.resetFileSettings();
      
      //change keys
      await Ntag424.changeKey(
        '01',
        key1,
        defaultKey,
        '00',
      );
      result.push("Change Key1: Success");
      console.log('changekey 2')
      await Ntag424.changeKey(
        '02',
        key2,
        defaultKey,
        '00',
      );
      result.push("Change Key2: Success");
      console.log('changekey 3')
      await Ntag424.changeKey(
        '03',
        key3,
        defaultKey,
        '00',
      );
      result.push("Change Key3: Success");
      await Ntag424.changeKey(
        '04',
        key4,
        defaultKey,
        '00',
      );
      result.push("Change Key4: Success");
      await Ntag424.changeKey(
        '00',
        key0,
        defaultKey,
        '00',
      );
      result = ["Change Key0: Success", ...result];

      const message = [Ndef.uriRecord('')];
      const bytes = Ndef.encodeMessage(message);
      await Ntag424.setNdefMessage(bytes);

      result.push("NDEF and SUN/SDM cleared");

    } catch (ex) {
      console.error('Oops!', ex, ex.constructor.name);
      var error = ex;
      if(typeof ex === 'object') {
        error = "NFC Error: "+(ex.message? ex.message : ex.constructor.name);
      }
      result.push(error);
      setWriteKeysOutput(error);
    } finally {
      // stop the nfc scanning
      NfcManager.cancelTechnologyRequest();
      setWriteKeysOutput(result.join('\r\n'));
      // setResetNow(false);
    }
  };

  const disableResetMode = () => {
    NfcManager.cancelTechnologyRequest();
    setResetNow(false);
  };

  const Done = e => {
    navigation.navigate('ResetKeysScreen', {
      data: e.data,
      timestamp: Date.now(),
    });
  };

  const scanQRCode = () => {
    navigation.navigate('ScanScreen', {
      backRoot: 'Advanced',
      backScreen: 'ResetKeysScreen',
    });
  };

  const clearKeys = () => {
    setKey0(defaultKey);
    setKey1(defaultKey);
    setKey2(defaultKey);
    setKey3(defaultKey);
    setKey4(defaultKey);
  }

  return (
    <ScrollView style={{padding: 10}}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Wipe Keys QR code</Title>
          <Text>
            Click on the wipe keys button on LNBits or run the ./wipeboltcard
            command on your boltcard server
          </Text>
        </Card.Content>
        <Card.Actions style={{justifyContent: 'space-around'}}>
          <Button onPress={scanQRCode} title="Scan QR Code" />
          <Button
            onPress={() => setPromptVisible(true)}
            title="Paste Key JSON"
          />
        </Card.Actions>
      </Card>
      <Dialog.Container visible={promptVisible}>
        <Dialog.Title style={styles.textBlack}>
          Enter Wipe Key JSON
        </Dialog.Title>
        <Dialog.Description>Paste your wipe keys JSON here.</Dialog.Description>
        <Dialog.Input
          style={styles.textBlack}
          label="Wipe Key JSON"
          onChangeText={setPasteWipeKeysJSON}
          value={pasteWipeKeysJSON}
        />
        <Dialog.Button
          label="Cancel"
          onPress={() => {
            setPromptVisible(false);
            setPasteWipeKeysJSON();
          }}
        />
        <Dialog.Button
          label="Continue"
          onPress={() => {
            setPromptVisible(false);
            setPasteWipeKeysJSON();
            navigation.navigate('ResetKeysScreen', {
              data: pasteWipeKeysJSON,
              timestamp: Date.now(),
            });
          }}
        />
      </Dialog.Container>
      <Dialog.Container visible={keyJsonError}>
        <Dialog.Title style={styles.textBlack}>Wipe Keys Issue</Dialog.Title>
        <Text>{keyJsonError}</Text>
        <Dialog.Button
          label="I understand"
          onPress={() => {
            setKeyJsonError(false);
          }}
        />
      </Dialog.Container>

      <Dialog.Container visible={resetNow}>
        <Dialog.Title style={styles.textBlack}>
          <Ionicons name="card" size={30} color="green" /> Tap NFC Card
        </Dialog.Title>
        {!writeKeysOutput && (
          <Text
            style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
            Hold NFC card to reader when ready
          </Text>
        )}

        <Text style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
          {writeKeysOutput ? writeKeysOutput : <ActivityIndicator />}
        </Text>
        <Dialog.Button
          label="Close"
          onPress={() => {
            disableResetMode();
          }}
        />
      </Dialog.Container>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Card Details</Title>
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 0</Text>
            <Button onPress={()=>{setKey0('00000000000000000000000000000000')}} title="Set to Zeros" />
          </View>
          <TextInput
            style={styles.input}
            value={key0}
            maxLength={32}
            multiline={true}
            numberOfLines={1}
            autoCapitalize="none"
            onChangeText={text => setKey0(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 1</Text>
            <Button onPress={()=>{setKey1('00000000000000000000000000000000')}} title="Set to Zeros" />
          </View>
          <TextInput
            style={styles.input}
            value={key1}
            maxLength={32}
            multiline={true}
            numberOfLines={1}
            autoCapitalize="none"
            onChangeText={text => setKey1(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 2</Text>
            <Button onPress={()=>{setKey2('00000000000000000000000000000000')}} title="Set to Zeros" />
          </View>
          <TextInput
            style={styles.input}
            value={key2}
            maxLength={32}
            multiline={true}
            numberOfLines={1}
            autoCapitalize="none"
            onChangeText={text => setKey2(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 3</Text>
            <Button onPress={()=>{setKey3('00000000000000000000000000000000')}} title="Set to Zeros" />
          </View>
          <TextInput
            style={styles.input}
            value={key3}
            maxLength={32}
            multiline={true}
            numberOfLines={1}
            autoCapitalize="none"
            onChangeText={text => setKey3(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 4</Text>
            <Button onPress={()=>{setKey4('00000000000000000000000000000000')}} title="Set to Zeros" />
          </View>
          <TextInput
            style={styles.input}
            value={key4}
            maxLength={32}
            multiline={true}
            numberOfLines={1}
            autoCapitalize="none"
            onChangeText={text => setKey4(text)}
            placeholder={defaultKey}
          />
          <Card.Actions style={{justifyContent: 'space-around'}}>
            <Button  onPress={() => enableResetMode()} title="Reset Card Now" />
            <Button color="red" onPress={() => clearKeys()} title="Reset Inputs" />
          </Card.Actions>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
  },
  title: {
    fontSize: 16,
  },
  titlecontainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  uid: {
    height: 30,
    width: '60%',
    marginBottom: 12,
    padding: 5,
    borderWidth: 1,
  },
  input: {
    height: 30,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    padding: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlignVertical: 'top',
    color: '#000',
  },
  textBlack: {
    color: '#000',
  },
});
