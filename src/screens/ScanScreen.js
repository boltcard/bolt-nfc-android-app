
import React from 'react';

import {
  Button,
  StyleSheet,
  Text
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

export default function ScanScreen({ route, navigation }) {

  const { backScreen, backRoot } = route.params;
  console.log('Scan Screen backScreen, backRoot', backScreen, backRoot);

  const onSuccess = e => {
    console.log('scan success');
    navigation.navigate(backScreen, {data: e.data, timestamp: Date.now()})
  };

  const goBack = e => {
    navigation.navigate(backScreen);
  };

  return (
    <>
      <QRCodeScanner
      onRead={onSuccess}
      topContent={
          <Text style={styles.centerText}>
          Scan the QR code
          </Text>
      }
      />
      <Button onPress={goBack} title="Close" />
    </>
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
