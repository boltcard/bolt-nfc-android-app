import React, { useEffect, useState } from 'react';
import { ActivityIndicator, NativeEventEmitter, NativeModules, ScrollView, Text } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

export default function ReadNFCScreen(props) {

    const [cardReadInfo, setCardReadInfo] = useState("")
    const [ndef, setNdef] = useState("pending...")
    const [defaultKeyUsed, setDefaultKeyUsed] = useState()
    
    useEffect(() =>{
      const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
      const eventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
        setCardReadInfo(event.cardReadInfo)
        setNdef(event.ndef)
        console.log('NDEF:'+event.ndef);
        setDefaultKeyUsed(event.defaultKeyUsed)
        });
  
      return () => {
        eventListener.remove();
      };
    })
    
    useFocusEffect(
      React.useCallback(() => {
        console.log('ReadNFCScreen');
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
          {defaultKeyUsed ? 
            defaultKeyUsed == "yes" ? 
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>Default Key Used</Title>
                <Paragraph>The default keys are still used on this card.</Paragraph>
              </Card.Content>
            </Card>
            :
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>Key Changed</Title>
                <Paragraph>One or more keys have been changed on this card.</Paragraph>
              </Card.Content>
            </Card>
            :
            <></>
          }
          <Text></Text>
  
      </ScrollView>
    );
}