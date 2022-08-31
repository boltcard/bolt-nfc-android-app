import React, { useEffect, useState } from 'react';
import { ActivityIndicator, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Card, Title } from 'react-native-paper';

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
      <ScrollView>
          <Card style={styles.card}>
            <Card.Content>
              <Title>Please enter your LNURLW</Title>
              <Text>For Bolt Card server be sure to add /ln to the end of the domain & must start with lnurlw://</Text>
              <TextInput 
                style={styles.input} 
                value={nodeURL} 
                multiline = {true}
                numberOfLines = {4}
                autoCapitalize='none'
                onChangeText={(text) => updateNodeUrl(text)}
                placeholder="lnurlw://yourboltcard.domain.com/ln"
              />
              <Text style={{ margin: 20, fontWeight:'bold', fontSize:15, textAlign:'center'}}>
                <ActivityIndicator /> Hold NFC card to write 
              </Text>
            <Text style={{textAlign:'center', color: writeOutput == "success" ? 'green' : 'red'}}>{writeOutput}</Text>
            { writeOutput.indexOf("91AE") != -1 && <Text style={{color: writeOutput == "success" ? 'green' : 'red'}}>This card's write key may have been changed</Text>}
            </Card.Content>
          </Card>
      </ScrollView>
    );
}
const styles = StyleSheet.create({
  card: {
    margin:20
  },
  input: {
    height: 160,
    marginVertical: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    padding: 10,
    fontFamily: 'monospace',
    textAlignVertical: 'top'
  },
});
  