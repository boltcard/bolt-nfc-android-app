import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

export default function WriteNFCScreen(props) {
    const [nodeURL, setNodeURL] = useState()
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
        NativeModules.MyReactModule.setCardMode("write");
      }, [])
    );
    return (
      <View style={{ flex: 1, flexDirection:'column', justifyContent: 'center', alignItems: 'center' }}>
          <View>
            <Text style={{textAlign:'center'}}>Please enter your lnurlw (must start with lnurlw://)</Text>
            <Text style={{textAlign:'center'}}>For Bolt Card server be sure to add /ln to the end of the domain</Text>
          </View>
          <View style={{flexDirection:'column', flex: 3, padding: 20}}>
          <Text style={{textAlign:'center', marginTop:30}}></Text>
            <TextInput 
              style={styles.input} 
              value={nodeURL} 
              multiline = {true}
              numberOfLines = {4}
              autoCapitalize='none'
              onChangeText={(text) => updateNodeUrl(text)}
              placeholder="lnurlw://yourboltcard.domain.com/ln"
            />
          </View>
          <View style={{flex:1}}>
            <Text style={{textAlign:'center'}}>Scan when ready to write NFC card</Text>
            <Text style={{textAlign:'center', color: writeOutput == "success" ? 'green' : 'red'}}>{writeOutput}</Text>
            { writeOutput.indexOf("91AE") != -1 && <Text style={{color: writeOutput == "success" ? 'green' : 'red'}}>This card's write key may have been changed</Text>}
          </View>
      </View>
    );
}
const styles = StyleSheet.create({
    input: {
      height: 160,
      margin: 12,
      borderWidth: 1,
      flexWrap: 'wrap',
      padding: 10,
      fontFamily: 'monospace',
      textAlignVertical: 'top'
    },
  });
  