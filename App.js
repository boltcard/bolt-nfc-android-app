import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, StyleSheet, Text, View } from 'react-native';

export default function App(props) {
  const [carddata, setCarddata] = useState("Please Scan NFC Card")
  useEffect(() =>{

    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('EventReminder', (event) => {
      setCarddata(event.eventProperty)
    });

    return () => {
      eventListener.remove();
    };
  })


  return (
    <View style={styles.container}>
      <Text>Bolt card programming app</Text>
      <Text>{carddata}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
