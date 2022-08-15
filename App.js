import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import KeyDisplayScreen from './src/screens/KeyDisplayScreen';
import ReadNFCScreen from './src/screens/ReadNFCScreen';
import ResetKeysScreen from './src/screens/ResetKeysScreen';
import ScanScreen from './src/screens/ScanScreen';
import WriteNFCScreen from './src/screens/WriteNFCScreen';

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();

const theme = {
  ...DefaultTheme,
  dark: false,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: '#f1c40f',
  },
};

const Tab = createBottomTabNavigator();
const KeyManagementStack = createNativeStackNavigator();

function KeyManagementStackScreen() {
  return (
    <KeyManagementStack.Navigator>
      <KeyManagementStack.Screen name="KeyDisplayScreen" component={KeyDisplayScreen} initialParams={{ data: "" }}/>
      <KeyManagementStack.Screen name="ScanScreen" component={ScanScreen} />
      <KeyManagementStack.Screen name="ResetKeysScreen" component={ResetKeysScreen} />
    </KeyManagementStack.Navigator>
  );
}

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
export default function App(props) {


  return (
    <PaperProvider theme={theme}>
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
    </PaperProvider>
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
});
