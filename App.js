import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, NativeEventEmitter, NativeModules, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { LogBox } from 'react-native';
import KeyDisplayScreen from './src/screens/KeyDisplayScreen';
import ScanScreen from './src/screens/ScanScreen';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

function LogoTitle(props) {
  return (
    <View style={{flexDirection:'row'}}>
      <Image
        style={{width: 50, height: 50, marginRight:10 }}
        source={{uri:'https://avatars.githubusercontent.com/u/109875636?s=200&v=4'}}
      />
      <Text style={{lineHeight:50, fontSize:20}}>{props.title}</Text>
      </View>
  );
}
function ReadNFCScreen(props) {

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
      NativeModules.MyReactModule.setReadMode(true);
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

function WriteNFCScreen(props) {
  const [nodeURL, setNodeURL] = useState("")
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
      console.log('WriteNFCScreen');
      NativeModules.MyReactModule.setReadMode(false);
    }, [])
  );
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
       <Text>Please enter your node's domain and path</Text>
        <View style={{flexDirection:'row'}}>
          <Text style={{lineHeight:60}}>lnurlw://</Text>
          <TextInput 
            style={styles.input} 
            value={nodeURL} 
            onChangeText={(text) => updateNodeUrl(text)}
            placeholder="yourdomain.com/path"
          />

        </View>
        <Text>Then scan to write NFC card</Text>
        <Text style={{color: writeOutput == "Success" ? 'green' : 'orange'}}>{writeOutput}</Text>
    </View>
  );
}
const Tab = createBottomTabNavigator();


const KeyManagementStack = createNativeStackNavigator();

function KeyManagementStackScreen() {
  return (
    <KeyManagementStack.Navigator>
      <KeyManagementStack.Screen name="KeyDisplayScreen" component={KeyDisplayScreen} initialParams={{ data: "" }}/>
      <KeyManagementStack.Screen name="ScanScreen" component={ScanScreen} />
    </KeyManagementStack.Navigator>
  );
}

export default function App(props) {


  return (
    <>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Read NFC') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Write NFC') {
              iconName = focused ? 'save' : 'save-outline';
            } else if (route.name === 'Key Management') {
              iconName = focused ? 'key' : 'key-outline';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Read NFC" 
          component={ReadNFCScreen} 
          options={{ headerTitle: (props) => <LogoTitle title="Read NFC" {...props} />}} 
        />
        <Tab.Screen 
          name="Write NFC" 
          component={WriteNFCScreen} 
          options={{ headerTitle: (props) => <LogoTitle title="Write NFC" {...props} />}} 
        />
        <Tab.Screen 
          name="Key Management" 
          component={KeyManagementStackScreen} 
          options={{ headerTitle: (props) => <LogoTitle title="Key Management" {...props} />}} 
        />
      </Tab.Navigator>
    </NavigationContainer>
    </>
  );

  return (
    <View style={styles.container}>
      <Text>Bolt card programming app</Text>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => toggleReadMode(true)}
          style={{...styles.button, backgroundColor:readMode ? 'green' : 'grey'}}
        >
          <Text>Read Mode</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleReadMode(false)}
          style={{...styles.button, backgroundColor:!readMode ? 'green' : 'grey'}}
        >
          <Text>Write Mode</Text>
        </TouchableOpacity>
      </View>
      
      {readMode ? 
      <>
        <Text>Scan to read NFC card</Text>
        <Text style={{fontWeight:'bold', fontSize:20}}>{ndef}</Text>
        <Text>{cardReadInfo}</Text>
        <Text>{cardFileSettings}</Text>
      </>
      :
      <>
        <Text>Please enter your node's domain and path</Text>
        <View style={{flexDirection:'row'}}>
          <Text style={{lineHeight:60}}>lnurlw://</Text>
          <TextInput 
            style={styles.input} 
            value={nodeURL} 
            onChangeText={(text) => updateNodeUrl(text)}
            placeholder="yourdomain.com/path"
          />

        </View>
        <Text>Then scan to write NFC card</Text>
      </>
      }
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
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
