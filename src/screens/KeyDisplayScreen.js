import React, { useEffect, useState } from 'react';
import { Button, Modal, NativeEventEmitter, NativeModules, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Card } from 'react-native-paper';
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
      setReadyToChangeKeys(false);
      NativeModules.MyReactModule.setCardMode("read");
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
        setWriteKeysOutput(event.output + " Keys may have been changed already.");
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

  const key0display = key0 ? key0.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key0.substring(28) : "pending...";
  const key1display = key1 ? key1.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key1.substring(28) : "pending...";
  const key2display = key2 ? key2.substring(0, 4)+" XXXX XXXX XXXX XXXX XXXX XXXX "+ key2.substring(28) : "pending...";
  return (
    <ScrollView>
        
        <Text style={{marginTop:30}}></Text>
        
        <ErrorModal modalText={modalText} modalVisible={modalVisible} setModalVisible={setModalVisible} />
        
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
        <Button
          onPress={() => navigation.navigate('ScanScreen')}
          title="Scan QR code from console"
        />
       
    </ScrollView>
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