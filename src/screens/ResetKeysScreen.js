import React, { useEffect, useState } from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { Button, NativeEventEmitter, NativeModules, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function ResetKeysScreen({ navigation }) {
    const [writeKeysOutput, setWriteKeysOutput] = useState("pending...");

    useFocusEffect(
        React.useCallback(() => {
          console.log('ResetKeysScreen');
          NativeModules.MyReactModule.setCardMode("resetkeys");
        }, [])
      );
      
    const Done = e => {
        console.log(e.data);

        navigation.navigate('ResetKeysScreen', {data: e.data, timestamp: Date.now()})
        
    };

    useEffect(() =>{
        const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
        const eventListener = eventEmitter.addListener('ChangeKeysResult', (event) => {
            if(event.output == "success") {
                setWriteKeysOutput("Keys reset successfully");
            }
            else {
                setWriteKeysOutput(event.output);
            }
        });

        return () => {
            eventListener.remove();
        };
    }, [])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
                <Ionicons name="card" size={50} color="green" />
                Tap NFC card now to reset keys
            </Text>    

            <Text>{writeKeysOutput}</Text>

            <Button
                onPress={() => navigation.navigate('KeyDisplayScreen')}
                title="Back"
            />
        </View>
    );
  
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});
