import React, { useEffect, useState } from 'react';
import { Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';


function KeyDisplayScreen({ route, navigation }) {
  //auth url will be in the data
  const { data, timestamp } = route.params;
  
  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()
  const [cardUID, setCardUID] = useState()

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState();
  const [loading, setLoading] = useState(false);
  const [readyToChangeKeys, setReadyToChangeKeys] = useState(false);
  const [writeKeysOutput, setWriteKeysOutput] = useState();

  const showModalError = (errorText) => {
    setModalText(errorText);
    setModalVisible(true);
  }

  useFocusEffect(
    React.useCallback(() => {
      setReadyToChangeKeys(false);
      NativeModules.MyReactModule.setCardMode("read");
    }, [])
  );

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter();
    const readCardEventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
      setCardUID(event.cardUID)
    });
    const writeKeyseventListener = eventEmitter.addListener('WriteKeysResult', (event) => {
      if(event.output == "success") {
        setWriteKeysOutput("Keys changed successfully");
        setReadyToChangeKeys(false);
        NativeModules.MyReactModule.setCardMode("read");
      }
      else {
        setWriteKeysOutput(event.output + " Keys may have been changed already.");
        showModalError(event.output + " Keys may have been changed already.");
      }
    });

    return () => {
      readCardEventListener.remove();
      writeKeyseventListener.remove();
    };
  }, [])

  useEffect(() => {
    if(data && data != "") {
    setLoading(true);
    fetch(data)
      .then((response) => response.json())
      .then((json) => {
        setLoading(false);
        setKey0(json.k0);
        setKey1(json.k1);
        setKey2(json.k2);

        NativeModules.MyReactModule.changeKeys(json.k0, json.k1, json.k2, 
          (response) => {
            if (response == "Success") setReadyToChangeKeys(true);
          }
        );

      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        setModalText("Problem loading keys, error: " + error.message);
        setModalVisible(true);
        showModalError("Problem loading keys, error: " + error.message);

      });
    }
    
  }, [data, timestamp])

  const key0display = key0 ? key0.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key0.substring(28) : "pending...";
  const key1display = key1 ? key1.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key1.substring(28) : "pending...";
  const key2display = key2 ? key2.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key2.substring(28) : "pending...";
  return (
    <ScrollView>
      <Text style={{marginTop:30}}></Text>

      <Card style={{marginBottom:20, marginHorizontal:10}}>
        <Card.Content>
          <Text style={{...styles.paragraph, fontSize:20}}>Scan QR code</Text>
          <Text style={styles.paragraph}>Run the ./createboltcard command on the server as per docs, then press below to scan the QR code shown</Text>
          <Button
            onPress={() => navigation.navigate('ScanScreen')}
            title="Scan QR code from console"
          />
        </Card.Content>
      </Card>
     
      {writeKeysOutput && 
        <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
          {writeKeysOutput == "success" && <Ionicons name="checkmark" size={50} color="green" />}
          {writeKeysOutput}
        </Text>
      }
      {readyToChangeKeys && 
        <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
          <Ionicons name="card" size={50} color="green" />
          Hold NFC card to phone until all keys are changed.
        </Text>
      }
      <Card style={{marginBottom:20, marginHorizontal:10}}>
        <Card.Content>
        <Text>URL: {data}</Text>
          {loading ? 
            <Text>Loading....</Text>
            :
            <>
              <Text>Key 0: {key0display}</Text>
              <Text>Key 1: {key1display}</Text>
              <Text>Key 2: {key2display}</Text>
            </>
            }
        </Card.Content>
      </Card>
      
      
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  paragraph: {
    marginBottom:5
  }
});


export default KeyDisplayScreen;