import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function App(props) {
  const [prompt, setPrompt] = useState("Scan to read NFC card")
  const [nodeURL, setNodeURL] = useState("")
  const [readMode, setReadMode] = useState(true)

  const [cardReadInfo, setCardReadInfo] = useState("pending...")
  const [ndef, setNdef] = useState("pending...")
  const [cardFileSettings, setCardFileSettings] = useState("pending...")

  
  useEffect(() =>{

    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
      setCardReadInfo(event.cardReadInfo)
      setNdef(event.ndef)
      setCardFileSettings(event.cardFileSettings)
    });

    return () => {
      eventListener.remove();
    };
  })

  const toggleReadMode = (mode) => {
    NativeModules.MyReactModule.setReadMode(mode);
    setPrompt(!mode ? "Scan to write NFC card" : "Scan to read NFC card");
    setReadMode(mode);
  }

  const updateNodeUrl = text => {
    setNodeURL(text);
    NativeModules.MyReactModule.setNodeURL(text);
  }

  return (
    <View style={styles.container}>
      <Text>Bolt card programming app</Text>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => toggleReadMode(true)}
          style={{...styles.button, backgroundColor:readMode ? 'green' : 'grey'}}
        >
          <Text>Read Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleReadMode(false)}
          style={{...styles.button, backgroundColor:!readMode ? 'green' : 'grey'}}
        >
          <Text>Write Mode</Text>
        </TouchableOpacity>
      </View>
      <Text>{prompt}</Text>
      {readMode ? 
      <>
        <Text>{ndef}</Text>
        <Text>{cardReadInfo}</Text>
        <Text>{cardFileSettings}</Text>
      </>
      :
      <>
        <Text>Please enter your node's domain and path</Text>
        <View style={{flexDirection:'row'}}>
          <Text style={{lineHeight:60}}>lnurlw://</Text>
          <TextInput 
            style={styles.input} 
            value={nodeURL} 
            onChangeText={(text) => updateNodeUrl(text)}
            placeholder="yourdomain.com/path"
          />
        </View>
      </>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
