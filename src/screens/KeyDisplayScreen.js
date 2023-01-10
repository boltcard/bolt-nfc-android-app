import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

function KeyDisplayScreen({ route }) {
  //auth url will be in the data
  const { data, timestamp } = route.params;
  const navigation = useNavigation();

  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()
  const [key3, setKey3] = useState()
  const [key4, setKey4] = useState()
  const [lnurlw_base, setlnurlw_base] = useState()
  const [cardUID, setCardUID] = useState()
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState();
  const [loading, setLoading] = useState(false);
  const [readyToChangeKeys, setReadyToChangeKeys] = useState(false);
  const [writeKeysOutput, setWriteKeysOutput] = useState();

  useFocusEffect(
    React.useCallback(() => {
      setReadyToChangeKeys(false);
      NativeModules.MyReactModule.setCardMode("read");
    }, [])
  );

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.MyReactModule);
    const readCardEventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
      setCardUID(event.cardUID)
    });
    const writeKeyseventListener = eventEmitter.addListener('WriteKeysResult', (event) => {
      if(event.output == "success") {
        setWriteKeysOutput("Keys changed successfully");
        setReadyToChangeKeys(false);
        NativeModules.MyReactModule.setCardMode("read");
        fetch(lnurlw_base.replace('lnurlw://', 'https://'))
        .then((response) => response.json())
        .then((json) => {
          console.log('Calling boltserver: '+ lnurlw_base.replace('lnurlw://', 'https://'), json)
        });
      }
      else {
        setWriteKeysOutput(event.output + " Keys may have been changed already.");
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
        setlnurlw_base(json.lnurlw_base);
        setKey0(json.k0);
        setKey1(json.k1);
        setKey2(json.k2);
        setKey3(json.k3);
        setKey4(json.k4);

        NativeModules.MyReactModule.changeKeys(
          json.lnurlw_base,
          json.k0, 
          json.k1, 
          json.k2, 
          json.k3, 
          json.k4, 
          (response) => {
            console.log('Change keys response', response)
            if (response == "Success") setReadyToChangeKeys(true);
          }
        );

      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        showModalError(error);
      });
    }
    
  }, [data, timestamp])

  const key0display = key0 ? key0.substring(0, 4)+"............"+ key0.substring(28) : "pending...";
  const key1display = key1 ? key1.substring(0, 4)+"............"+ key1.substring(28) : "pending...";
  const key2display = key2 ? key2.substring(0, 4)+"............"+ key2.substring(28) : "pending...";
  const key3display = key3 ? key3.substring(0, 4)+"............"+ key3.substring(28) : "pending...";
  const key4display = key4 ? key4.substring(0, 4)+"............"+ key4.substring(28) : "pending...";
  return (
    <ScrollView>
      <Text style={{marginTop:30}}></Text>

      <Card style={{marginBottom:20, marginHorizontal:10}}>
        <Card.Content>
          <Text style={{...styles.paragraph, fontSize:20}}>Scan QR code</Text>
          <Text style={styles.paragraph}>Run the ./createboltcard command on the server as per docs, then press below to scan the QR code shown</Text>
          <Button
            onPress={() => navigation.navigate('ScanScreen', {backScreen: 'KeyDisplayScreen'})}
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
      
      <Card style={{marginBottom:20, marginHorizontal:10}}>
        <Card.Content>
        <Text>QR code URL:</Text>
        <Text style={{...styles.monospace, marginBottom: 20}}>{data}</Text>
          {loading ? 
            <Text><ActivityIndicator /> Loading....</Text>
            :
            <>
              <Text style={styles.monospace}>lnurl: {lnurlw_base}</Text>
              <Text style={styles.monospace}>Key 0: {key0display}</Text>
              <Text style={styles.monospace}>Key 1: {key1display}</Text>
              <Text style={styles.monospace}>Key 2: {key2display}</Text>
              <Text style={styles.monospace}>Key 3: {key3display}</Text>
              <Text style={styles.monospace}>Key 4: {key4display}</Text>
            </>
            }
        </Card.Content>
      </Card>
      {readyToChangeKeys && 
        <Card style={{marginBottom:20, marginHorizontal:10}}>
          <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
            <Ionicons name="card" size={50} color="green" />
            Ready to write card. Hold NFC card to phone until all keys are changed.
          </Text>
        </Card>
      }
      
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  paragraph: {
    marginBottom:5
  },
  monospace: {
    
    fontFamily: Platform.OS === 'ios' ? "Courier New" : "monospace"
  }
});


export default KeyDisplayScreen;