import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Text, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

export default function ReadNFCScreen(props) {

    const [cardReadInfo, setCardReadInfo] = useState("")
    const [ndef, setNdef] = useState("pending...")
    const [cardFileSettings, setCardFileSettings] = useState("")
    
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
    
    useFocusEffect(
      React.useCallback(() => {
        console.log('ReadNFCScreen');
        NativeModules.MyReactModule.setCardMode("read");
      }, [])
    );
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  
          <Text>Scan to read NFC card</Text>
          <Text style={{fontWeight:'bold', fontSize:20}}>{ndef}</Text>
          <Text>{cardReadInfo}</Text>
          <Text>{cardFileSettings}</Text>
  
      </View>
    );
}