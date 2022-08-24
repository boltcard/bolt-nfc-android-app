import React, { useEffect, useState } from 'react';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function ResetKeysScreen() {
  const navigation = useNavigation();
  const [writeKeysOutput, setWriteKeysOutput] = useState("pending...");
  const defaultKey = "00000000000000000000000000000000";
  
  const [key0, setKey0] = useState("11111111111111111111111111111111")
  const [key1, setKey1] = useState("22222222222222222222222222222222")
  const [key2, setKey2] = useState("33333333333333333333333333333333")
  const [key3, setKey3] = useState("44444444444444444444444444444444")
  const [key4, setKey4] = useState("55555555555555555555555555555555")
  
  // React.useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerRight: () => (
  //       <Button title={writeKeysOutput =="pending..." ? "ready" : "executed"} color={writeKeysOutput =="pending..."? "red" : "blue"} />
  //     ),
  //   });
  // }, [navigation, writeKeysOutput]);

  useFocusEffect(
    React.useCallback(() => {
      NativeModules.MyReactModule.setCardMode("resetkeys");
      NativeModules.MyReactModule.setResetKeys(key0,key1,key2,key3,key4, ()=> {
        //callback
        console.log("reset keys set");
      });
      setWriteKeysOutput("pending...")
    }, [])
  );
  
  const Done = e => {
    navigation.navigate('ResetKeysScreen', {data: e.data, timestamp: Date.now()})
  };

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    const eventListener = eventEmitter.addListener('ChangeKeysResult', (event) => {
      if(event.output == "success") {
        setWriteKeysOutput("Keys reset successfully");
      }
      else {
        // if(event.output.indexOf("91AE")!=-1) {
        //   setWriteKeysOutput("Authentication error, key0 may not be correct");
        // }
        // else {
          setWriteKeysOutput(event.output);
        // }
      }
    });
    
    return () => {
        eventListener.remove();
    };
  }, [])

  useEffect(() =>{
    NativeModules.MyReactModule.setResetKeys(key0,key1,key2,key3,key4, ()=> {
      //callback
      console.log("reset keys set");
    });
  },[key0,key1,key2,key3,key4]);

  return (
    <ScrollView style={{ padding:10 }}>
      <Text style={{fontSize:20, textAlign: 'center', borderColor:'black'}}>{writeKeysOutput}</Text>

      <Text>Key 0 <Button title="Clear" size="small" onPress={()=> setKey0(defaultKey)} /></Text>
      <TextInput 
        style={styles.input} 
        value={key0} 
        maxLength={32}
        multiline = {true}
        numberOfLines = {2}
        autoCapitalize='none'
        onChangeText={(text) => setKey0(text)}
        placeholder={defaultKey}
      />
      <Text>Key 1</Text>
      <TextInput 
        style={styles.input} 
        value={key1} 
        maxLength={32}
        multiline = {true}
        numberOfLines = {2}
        autoCapitalize='none'
        onChangeText={(text) => setKey1(text)}
        placeholder={defaultKey}
      />
      <Text>Key 2</Text>
      <TextInput 
        style={styles.input} 
        value={key2} 
        maxLength={32}
        multiline = {true}
        numberOfLines = {2}
        autoCapitalize='none'
        onChangeText={(text) => setKey2(text)}
        placeholder={defaultKey}
      />
      <Text>Key 3</Text>
      <TextInput 
        style={styles.input} 
        value={key3} 
        maxLength={32}
        multiline = {true}
        numberOfLines = {2}
        autoCapitalize='none'
        onChangeText={(text) => setKey3(text)}
        placeholder={defaultKey}
      />
      <Text>Key 4</Text>
      <TextInput 
        style={styles.input} 
        value={key4} 
        maxLength={32}
        multiline = {true}
        numberOfLines = {2}
        autoCapitalize='none'
        onChangeText={(text) => setKey4(text)}
        placeholder={defaultKey}
      />
      
      <Text style={{fontSize:20, textAlign: 'center', borderColor:'black'}}>
          <Ionicons name="card" size={30} color="green" />
          Tap NFC card when ready to reset keys
      </Text>    


    </ScrollView>
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
  },
  input: {
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    padding: 10,
    fontFamily: 'monospace',
    textAlignVertical: 'top'
  },
});
