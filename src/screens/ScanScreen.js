
import React from 'react';

import {
    StyleSheet,
    Text
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';

function ScanScreen({ navigation }) {
    const onSuccess = e => {
        console.log(e.data);

        navigation.navigate('KeyDisplayScreen', {data: e.data, timestamp: Date.now()})
        // Linking.openURL(e.data).catch(err =>
        //     console.error('An error occured', err)
        // );
    };

    return (
        <QRCodeScanner
        onRead={onSuccess}
        // flashMode={RNCamera.Constants.FlashMode.torch}
        topContent={
            <Text style={styles.centerText}>
           Scan the QR code
            </Text>
        }
        // bottomContent={
        //     <TouchableOpacity style={styles.buttonTouchable}
        //         onPress={() => navigation.navigate('KeyDisplayScreen') }>
        //     <Text style={styles.buttonText}>OK. Got it!</Text>
        //     </TouchableOpacity>
        // }
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

export default ScanScreen;