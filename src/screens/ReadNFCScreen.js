import React, { useEffect, useState } from 'react';
import { ActivityIndicator, NativeEventEmitter, NativeModules, ScrollView, Text } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

export default function ReadNFCScreen(props) {

    const [cardReadInfo, setCardReadInfo] = useState("")
    const [ndef, setNdef] = useState("pending...")
    const [cardUID, setCardUID] = useState()
    const [key0Changed, setKey0Changed] = useState("Key 0 status pending")
    const [key1Changed, setKey1Changed] = useState("Key 1 status pending")
    const [key2Changed, setKey2Changed] = useState("Key 2 status pending")
    
    useEffect(() =>{
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const eventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
        setCardReadInfo(event.cardReadInfo)
        setNdef(event.ndef)
        setCardUID(event.cardUID)
        setKey0Changed(event.key0Changed == "yes" ? "Key 0 has been changed" : "Key 0 still set to default")
        setKey1Changed(event.key1Changed == "yes" ? "Key 1 has been changed" : "Key 1 still set to default")
        setKey2Changed(event.key2Changed == "yes" ? "Key 2 has been changed" : "Key 2 still set to default")
      });
  
      return () => {
        eventListener.remove();
      };
    })
    
    useFocusEffect(
      React.useCallback(() => {
        NativeModules.MyReactModule.setCardMode("read");
      }, [])
    );
    return (
      <ScrollView style={{ }}>
        
          <Text style={{ margin: 20, fontWeight:'bold', fontSize:15, textAlign:'center'}}>
            <ActivityIndicator /> Hold NFC card to Reader 
          </Text>
          <Card style={{marginBottom:20, marginHorizontal:10}}>
            <Card.Content>
              <Title>NDEF Record</Title>
              <Paragraph style={{fontWeight:'bold', fontSize:15}}>{ndef}</Paragraph>
            </Card.Content>
          </Card>
          <Card style={{marginBottom:20, marginHorizontal:10}}>
            <Card.Content>
              <Title>NFC Card Attributes</Title>
              <Paragraph>{cardReadInfo}</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={{marginBottom:20, marginHorizontal:10}}>
            <Card.Content>
              <Title>Card Keys</Title>
              <Paragraph>{key0Changed}</Paragraph>
              <Paragraph>{key1Changed}</Paragraph>
              <Paragraph>{key2Changed}</Paragraph>
            </Card.Content>
          </Card>
          
          <Text></Text>
  
      </ScrollView>
    );
}