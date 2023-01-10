import Clipboard from '@react-native-clipboard/clipboard';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, NativeEventEmitter, NativeModules, ScrollView, Text, ToastAndroid, View } from 'react-native';
import { Card, Paragraph, Title } from 'react-native-paper';

export default function ReadNFCScreen(props) {

    const [cardReadInfo, setCardReadInfo] = useState("")
    const [ndef, setNdef] = useState("pending...")
    const [cardUID, setCardUID] = useState()
    const [key0Changed, setKey0Changed] = useState("Key 0 status pending")
    const [key1Changed, setKey1Changed] = useState("Key 1 status pending")
    const [key2Changed, setKey2Changed] = useState("Key 2 status pending")
    const [key3Changed, setKey3Changed] = useState("Key 3 status pending")
    const [key4Changed, setKey4Changed] = useState("Key 4 status pending")
    
    useEffect(() =>{
      const eventEmitter = new NativeEventEmitter(NativeModules.MyReactModule);
      const eventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
        setCardReadInfo(event.cardReadInfo)
        setNdef(event.ndef)
        setCardUID(event.cardUID && event.cardUID.toLowerCase())
        setKey0Changed(event.key0Changed == "yes" ? "Key 0 has been changed" : "Key 0 still set to default")
        setKey1Changed(event.key1Changed == "yes" ? "Key 1 has been changed" : "Key 1 still set to default")
        setKey2Changed(event.key2Changed == "yes" ? "Key 2 has been changed" : "Key 2 still set to default")
        setKey3Changed(event.key3Changed == "yes" ? "Key 3 has been changed" : "Key 3 still set to default")
        setKey4Changed(event.key4Changed == "yes" ? "Key 4 has been changed" : "Key 4 still set to default")
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

    const copyToClipboard = () => {
      Clipboard.setString(cardUID);
      ToastAndroid.showWithGravity(
        "Copied to clipboard",
        ToastAndroid.SHORT,
        ToastAndroid.TOP
      );
    }

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
            <Title>Card UID</Title>
            <View style={{alignItems: 'flex-start', flexDirection: 'row'}}>
              {cardUID && <Button onPress={copyToClipboard} title="Copy" />}
              <Text style={{lineHeight:35, marginLeft:10}}>{cardUID}</Text>
            </View>
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
            <Paragraph>{key3Changed}</Paragraph>
            <Paragraph>{key4Changed}</Paragraph>
          </Card.Content>
        </Card>
        
        <Text></Text>

      </ScrollView>
    );
}