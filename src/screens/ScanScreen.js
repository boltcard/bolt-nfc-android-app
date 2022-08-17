
import React from 'react';

import {
  StyleSheet,
  Text
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

export default function ScanScreen({ navigation }) {
    const onSuccess = e => {
      navigation.navigate('KeyDisplayScreen', {data: e.data, timestamp: Date.now()})
    };

    return (
        <QRCodeScanner
        onRead={onSuccess}
        topContent={
            <Text style={styles.centerText}>
           Scan the QR code
            </Text>
        }
        />
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
