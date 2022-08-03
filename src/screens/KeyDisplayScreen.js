import React, { useEffect, useState } from 'react';
import { Button, NativeEventEmitter, NativeModules, Text, View } from 'react-native';


function KeyDisplayScreen({ route, navigation }) {
  const { data } = route.params;
  // console.log('KeyDisplayScreen: '+data)
  
  const [authURL, setAuthURL] = useState()
  const [key0, setKey0] = useState()
  const [key1, setKey1] = useState()
  const [key2, setKey2] = useState()

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('CardHasBeenRead', (event) => {
      
    });

    return () => {
      eventListener.remove();
    };
  })

  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>URL: {data}</Text>
        <Button
          onPress={() => navigation.navigate('ScanScreen')}
          title="Scan QR code from console"
        />

    </View>
  );
}

export default KeyDisplayScreen;