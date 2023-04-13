import React, { useEffect, useState } from 'react';
import { Image, Modal, NativeEventEmitter, Pressable, StyleSheet, Text, View, NativeModules } from 'react-native';

import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CreateBoltcardScreen from './src/screens/CreateBoltcardScreen';
import HelpScreen from './src/screens/HelpScreen';
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
const CreateBoltcardStack = createNativeStackNavigator();
const AdvancedStack = createNativeStackNavigator();

function CreateBoltcardStackScreen() {
  return (
    <CreateBoltcardStack.Navigator screenOptions={{
      headerShown: false
    }}>
      <CreateBoltcardStack.Screen name="CreateBoltcardScreen" component={CreateBoltcardScreen} initialParams={{ data: null }}/>
      <CreateBoltcardStack.Screen name="ScanScreen" component={ScanScreen} />
    </CreateBoltcardStack.Navigator>
  );
}

function AdvancedTabScreen() {
  return (
    <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Read NFC') {
                iconName = focused ? 'book' : 'book-outline';
              } else if (route.name === 'Write NFC') {
                iconName = focused ? 'save' : 'save-outline';
              } else if (route.name === 'Reset Keys') {
                iconName = focused ? 'key' : 'key-outline';
              } else if (route.name === 'Wipe Card') {
                iconName = focused ? 'trash' : 'trash-outline';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#f58340',
            tabBarInactiveTintColor: 'gray',
          })}
        >
      
      <Tab.Screen 
        name="Reset Keys" 
        children={() => 
          <CreateBoltcardStack.Navigator screenOptions={{
            headerShown: false
          }}>
            <CreateBoltcardStack.Screen name="ResetKeysScreen" component={ResetKeysScreen} initialParams={{ data: null }}/>
            <CreateBoltcardStack.Screen name="ScanScreen" component={ScanScreen} />
          </CreateBoltcardStack.Navigator>
        } 
      />
      <Tab.Screen 
        name="Read NFC" 
        component={ReadNFCScreen} 
      />
      <Tab.Screen 
        name="Write NFC" 
        component={WriteNFCScreen} 
      />
    </Tab.Navigator>
    
  );
}

function LogoTitle(props) {
  return (
    <View style={{flexDirection:'row'}}>
      <Image
        style={{width: 50, height: 50, marginRight:10, marginTop:0}}
        source={{uri:'https://avatars.githubusercontent.com/u/109875636?s=200&v=4'}}
      />
      <Text style={{lineHeight:50, fontSize:20}}>{props.title}</Text>
      </View>
  );
}


const ErrorModal = (props) => {
  const {modalVisible, setModalVisible, modalText} = props;
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Ionicons name="warning" size={30} color="red" />
            <Text style={styles.modalText}>{modalText}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function App(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState();

  const showModalError = (errorText) => {
    setModalText(errorText);
    setModalVisible(true);
  }

  useEffect(() =>{
    const eventEmitter = new NativeEventEmitter(NativeModules.MyReactModule);
    const eventListener = eventEmitter.addListener('NFCError', (event) => {
      setModalText(event.message);
      setModalVisible(true);
    });

    // if(Platform.OS === 'ios') {
    //   NativeModules.MyReactModule.initializeLib();
    // }

    return () => {
      eventListener.remove();
    };
  }, [])

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Create Bolt Card') {
                iconName = focused ? 'card' : 'card-outline';
              } else if (route.name === 'Help') {
                iconName = focused ? 'information' : 'information-outline';
              } else if (route.name === 'Advanced') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#f58340',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Create Bolt Card" 
            children={() => <CreateBoltcardStackScreen />} 
            options={{ headerTitle: (props) => <LogoTitle title="Create Bolt Card" {...props} />}} 
          />
          
          <Tab.Screen 
            name="Advanced" 
            component={AdvancedTabScreen} 
            options={{ headerTitle: (props) => <LogoTitle title="Advanced" {...props} />}} 
          />
          <Tab.Screen 
            name="Help" 
            component={HelpScreen} 
            options={{ headerTitle: (props) => <LogoTitle title="Help" {...props} />}} 
          />
          
        </Tab.Navigator>
      </NavigationContainer>
      <ErrorModal modalText={modalText} modalVisible={modalVisible} setModalVisible={setModalVisible} />
      
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
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
});
