import React, { useEffect, useState } from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
        <ErrorModal modalText={modalText} modalVisible={modalVisible} setModalVisible={setModalVisible} />
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