import React, { useEffect, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator, Button, NativeEventEmitter, NativeModules,
  ScrollView, StyleSheet, Text, TextInput, View
} from 'react-native';
import Dialog from "react-native-dialog";
import { Card, Title } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function ResetKeysScreen({route}) {

  const navigation = useNavigation();
  const [writeKeysOutput, setWriteKeysOutput] = useState();
  const defaultKey = "00000000000000000000000000000000";
  
  const [uid, setUid] = useState()
  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()
  const [key3, setKey3] = useState()
  const [key4, setKey4] = useState()

  const [pasteWipeKeysJSON, setPasteWipeKeysJSON] = useState()
  const [promptVisible, setPromptVisible] = useState(false)
  const [keyJsonError, setKeyJsonError] = useState(false)
  const [resetNow, setResetNow] = useState(false)
  
  const data = route && route.params ?  route.params.data : null;
  const timestamp = route && route.params ?  route.params.timestamp : null;

  useFocusEffect(
    React.useCallback(() => {
      NativeModules.MyReactModule.setCardMode("read");
    }, [])
  );
  // useFocusEffect(
  //   React.useCallback(() => {
  //     NativeModules.MyReactModule.setCardMode("resetkeys");
  //     NativeModules.MyReactModule.setResetKeys(key0,key1,key2,key3,key4,uid, ()=> {
  //       //callback
  //       console.log("reset keys set");
  //     });
  //     setWriteKeysOutput("pending...")
  //   }, [])
  // );
  useEffect(()=> {
    if(data) {
      try {
        const dataObj = JSON.parse(data);
        setUid(dataObj.uid);
        setKey0(dataObj.k0 || "00000000000000000000000000000000");
        setKey1(dataObj.k1 || "00000000000000000000000000000000");
        setKey2(dataObj.k2 || "00000000000000000000000000000000");
        setKey3(dataObj.k3 || "00000000000000000000000000000000");
        setKey4(dataObj.k4 || "00000000000000000000000000000000");
        let error = ''
        if(dataObj.action != 'wipe') {
          error = 'Wipe action not specified, proceed with caution.\r\n';
        }
        if(dataObj.version != '1') {
          error = error + ' Expected version 1, found version: '+dataObj.version+'\r\n';
        }
        if(!dataObj.k0 || !dataObj.k1 || !dataObj.k2 || !dataObj.k3 || !dataObj.k4) {
          error = error + ' Some keys missing, proceed with caution';
        }
        setKeyJsonError(error)
      }
      catch (exceptionVar) {
        setKeyJsonError(''+exceptionVar)
      }
    }
  }, [data, timestamp]);
  
  const enableResetMode = () => {
    NativeModules.MyReactModule.setCardMode("resetkeys");
    NativeModules.MyReactModule.setResetKeys(key0,key1,key2,key3,key4,uid, ()=> {
      //callback
      console.log("reset keys set");
    });
    setWriteKeysOutput(null)
    setResetNow(true);
  }

  const disableResetMode = () => {
    NativeModules.MyReactModule.setCardMode("read");
    setResetNow(false);
  }
  
  const Done = e => {
    navigation.navigate('ResetKeysScreen', {data: e.data, timestamp: Date.now()})
  };

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('ChangeKeysResult', (event) => {
      if(event.output == "success") {
        setWriteKeysOutput("Keys reset successfully");
      }
      else {
        setWriteKeysOutput(event.output);
      }
    });
    
    return () => {
      eventListener.remove();
    };
  }, [])

  // useEffect(() =>{
  //   NativeModules.MyReactModule.setResetKeys(key0,key1,key2,key3,key4,uid, ()=> {
  //     //callback
  //     console.log("reset keys set");
  //   });
  // },[key0,key1,key2,key3,key4,uid]);

  const scanQRCode = () => {
    navigation.navigate('ScanScreen', {backRoot: 'Advanced', backScreen: 'ResetKeysScreen'});
  }

  const clearKeys = () => {
    setKey0(null);
    setKey1(null);
    setKey2(null);
    setKey3(null);
    setKey4(null);
  }

  return (
    <ScrollView style={{ padding:10 }}>
      <Card style={styles.card}>
        <Card.Content>
            <Title>Wipe Keys QR code</Title>
            <Text>Click on the wipe keys button on LNBits or run the ./wipeboltcard command on your boltcard server</Text>
        </Card.Content>
        <Card.Actions style={{justifyContent: 'space-around'}}>
            <Button onPress={scanQRCode} title="Scan QR Code" />
            <Button onPress={() => setPromptVisible(true)} title="Paste Key JSON" />
            
        </Card.Actions>  
      </Card>
      <Dialog.Container visible={promptVisible}>
        <Dialog.Title style={styles.textBlack}>
            Enter Wipe Key JSON
        </Dialog.Title>
        <Dialog.Description>
            Paste your wipe keys JSON here.
        </Dialog.Description>
        <Dialog.Input style={styles.textBlack} label="Wipe Key JSON" onChangeText={setPasteWipeKeysJSON} value={pasteWipeKeysJSON} />
        <Dialog.Button label="Cancel"
            onPress={() => {
                setPromptVisible(false);
                setPasteWipeKeysJSON();
            }} />
        <Dialog.Button label="Continue"
            onPress={() => {
                setPromptVisible(false);
                setPasteWipeKeysJSON();
                navigation.navigate('ResetKeysScreen',  {data: pasteWipeKeysJSON, timestamp: Date.now()});
            }} />
      </Dialog.Container>
      <Dialog.Container visible={keyJsonError}>
        <Dialog.Title style={styles.textBlack}>
          Wipe Keys Issue
        </Dialog.Title>
        <Text>{keyJsonError}</Text>
        <Dialog.Button label="I understand"
          onPress={() => {
            setKeyJsonError(false);
          }} />
      </Dialog.Container>

      <Dialog.Container visible={resetNow}>
        <Dialog.Title style={styles.textBlack}>
        <Ionicons name="card" size={30} color="green" /> Tap NFC Card 
        </Dialog.Title>
        {!writeKeysOutput && <Text style={{fontSize:20, textAlign: 'center', borderColor:'black'}}>
          Hold NFC card to reader when ready 
        </Text>}
        
        <Text style={{fontSize:20, textAlign: 'center', borderColor:'black'}}>
          {writeKeysOutput ? writeKeysOutput : <ActivityIndicator />}
        </Text>
        <Dialog.Button label="Cancel"
          onPress={() => {
            disableResetMode();
          }} />
      </Dialog.Container>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Card Details</Title>
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 0</Text>
          </View>
          <TextInput 
            style={styles.input} 
            value={key0} 
            maxLength={32}
            multiline = {true}
            numberOfLines = {1}
            autoCapitalize='none'
            onChangeText={(text) => setKey0(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 1</Text>
          </View>
          <TextInput 
            style={styles.input} 
            value={key1} 
            maxLength={32}
            multiline = {true}
            numberOfLines = {1}
            autoCapitalize='none'
            onChangeText={(text) => setKey1(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 2</Text>
          </View>
          <TextInput 
            style={styles.input} 
            value={key2} 
            maxLength={32}
            multiline = {true}
            numberOfLines = {1}
            autoCapitalize='none'
            onChangeText={(text) => setKey2(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 3</Text>
          </View>
          <TextInput 
            style={styles.input} 
            value={key3} 
            maxLength={32}
            multiline = {true}
            numberOfLines = {1}
            autoCapitalize='none'
            onChangeText={(text) => setKey3(text)}
            placeholder={defaultKey}
          />
          <View style={styles.titlecontainer}>
            <Text style={styles.title}>Key 4</Text>
          </View>
          <TextInput 
            style={styles.input} 
            value={key4} 
            maxLength={32}
            multiline = {true}
            numberOfLines = {1}
            autoCapitalize='none'
            onChangeText={(text) => setKey4(text)}
            placeholder={defaultKey}
          />
          
          <Card.Actions style={{justifyContent: 'space-around'}}>
            <Button  onPress={() => enableResetMode()} title="Reset Card Now" />
            <Button color="red" onPress={() => clearKeys()} title="Clear Inputs" />
          </Card.Actions>

        </Card.Content>
      </Card>
    </ScrollView>
  );

}

const styles = StyleSheet.create({
  card: {
    margin:10
  },
  title: {
    fontSize:16
  },
  titlecontainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between'
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  },
  uid: {
    height: 30,
    width: '60%',
    marginBottom: 12,
    padding: 5,
    borderWidth: 1
  },
  input: {
    height: 30,
    width: '100%',
    marginBottom: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    padding: 5,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    color:'#000'
  },
  textBlack: {
    color:'#000'
  }
});
