import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';


export default function WriteNFCScreen(props) {
    const [nodeURL, setNodeURL] = useState("")
    const [writeOutput, setWriteOutput] = useState("pending...")
  
    useEffect(() =>{
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const eventListener = eventEmitter.addListener('WriteResult', (event) => {
        setWriteOutput(event.output)
      });
  
      return () => {
        eventListener.remove();
      };
    })
  
    const updateNodeUrl = text => {
      setNodeURL(text);
      NativeModules.MyReactModule.setNodeURL(text);
    }
  
    useFocusEffect(
      React.useCallback(() => {
        console.log('WriteNFCScreen');
        NativeModules.MyReactModule.setCardMode("write");
      }, [])
    );
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          <Text>Then scan to write NFC card</Text>
          <Text style={{color: writeOutput == "success" ? 'green' : 'orange'}}>{writeOutput}</Text>
      </View>
    );
}
const styles = StyleSheet.create({
    input: {
      height: 40,
      margin: 12,
      borderWidth: 1,
      padding: 10,
    },
  });
  