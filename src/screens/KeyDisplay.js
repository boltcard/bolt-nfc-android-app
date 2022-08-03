import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Text, View } from 'react-native';


function KeyDisplayScreen(props) {

  const [authURL, setAuthURL] = useState()
  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()
  
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
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

        <Text>Scan QR code from console</Text>
        

    </View>
  );
}

export default KeyDisplayScreen;