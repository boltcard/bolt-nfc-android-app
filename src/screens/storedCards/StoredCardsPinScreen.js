

import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StoredCardsList from './StoredCardsList';

const pincodeServiceName = "boltcard";

export default function StoredCardsPinScreen() {
    const navigation = useNavigation();
    const [pinSet, setPinSet] = useState(false);
    const [pinCorrect, setPinCorrect] = useState(false);
    
    useEffect(() => {
        hasUserSetPinCode(pincodeServiceName).then(result => {
            console.log('hasUserSetPinCode', result);
            setPinSet(result);
        });
    },[pinSet]);

    React.useLayoutEffect(() => {
        if (pinCorrect) navigation.setOptions({
          headerRight: () => (
            <View style={{paddingRight:20}}>
                <Button onPress={() => setPinCorrect(false)} textColor="orange" dark="true">
                    <Ionicons name="lock-open"  size={20} color="orange" /> Lock
                </Button>
            </View>
          ),
        });
    }, [navigation, pinCorrect]);

    if (pinSet && !pinCorrect) {
        return <PINCode 
            status={'enter'} 
            finishProcess={() => {setPinCorrect(true)}}
            pinCodeKeychainName={pincodeServiceName} 
        />;
    }
    else if(!pinSet) {
        return <PINCode 
            status={'choose'} 
            pinCodeKeychainName={pincodeServiceName} 
        />;
    }

    return (
        <StoredCardsList />
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
  paragraph: {
    marginBottom:20
  }
});
