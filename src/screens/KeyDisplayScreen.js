import React, { useEffect, useState } from 'react';
import { Button, Modal, NativeEventEmitter, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';


function KeyDisplayScreen({ route, navigation }) {
  //auth url will be in the data
  const { data, timestamp } = route.params;
  
  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()

  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState();
  const [loading, setLoading] = useState(false);
  const [readyToChangeKeys, setReadyToChangeKeys] = useState(false);
  const [writeKeysOutput, setWriteKeysOutput] = useState();

  useFocusEffect(
    React.useCallback(() => {
      console.log('KeyDisplayScreen');
      setReadyToChangeKeys(false);
      setKey0(null);
      setKey0(null);
      setKey1(null);
      setKey2(null);
      NativeModules.MyReactModule.setCardMode("read");
      console.log("Set card mode to read")
    }, [])
  );

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('WriteKeysResult', (event) => {
      if(event.output == "success") {
        setWriteKeysOutput("Keys changed successfully");
        setReadyToChangeKeys(false);
        NativeModules.MyReactModule.setCardMode("read");
      }
      else {
        setWriteKeysOutput(event.output);
      }
    });

    return () => {
      eventListener.remove();
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
            console.log('Change Keys Callback',response);
            if (response == "Success") setReadyToChangeKeys(true);
          }
        );

      })
      .catch((error) => {
        setLoading(false);
        console.error(error);
        setModalText("Problem loading keys, error: " + error.message);
        setModalVisible(true);
      });
    }
    
  }, [data, timestamp])

  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button
          onPress={() => navigation.navigate('ResetKeysScreen')}
          title="Debug Reset Keys to Default"
        />
        <Text style={{marginTop:30}}></Text>
        
        <ErrorModal modalText={modalText} modalVisible={modalVisible} setModalVisible={setModalVisible} />
        
        {writeKeysOutput && 
          <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
            {writeKeysOutput == "success" && <Ionicons name="checkmark" size={50} color="green" />}
            {writeKeysOutput}
          </Text>
        }
        {readyToChangeKeys && <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}><Ionicons name="card" size={50} color="green" />Tap NFC card now to change keys</Text>}
        <Text>URL: {data}</Text>
        {loading ? 
          <Text>Loading....</Text>
          :
          <>
            <Text>Key 0: {key0}</Text>
            <Text>Key 1: {key1}</Text>
            <Text>Key 2: {key2}</Text>
          </>
        }
        <Button
          onPress={() => navigation.navigate('ScanScreen')}
          title="Scan QR code from console"
        />
       
    </View>
  );
}

const ErrorModal = (props) => {
  const {modalVisible, setModalVisible, modalText} = props;
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Ionicons name="warning" size={50} color="red" />
            <Text style={styles.modalText}>{modalText}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});


export default KeyDisplayScreen;