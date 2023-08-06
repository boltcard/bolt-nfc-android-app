import React from 'react';
import {
  TouchableOpacity,
  Button,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  View,
} from 'react-native';
import {Card, Title} from 'react-native-paper';
import gitinfo from '../../gitinfo.json';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function HelpScreen({navigation}) {
  return (
    <>
      <ScrollView>
        <Card style={{marginBottom: 20, marginHorizontal: 10}}>
          <Card.Content>
            <Title selectable={true}>v0.1.9 ({gitinfo.commit})</Title>
          </Card.Content>
        </Card>
        <Card style={{marginBottom: 20, marginHorizontal: 10}}>
          <Card.Content>
            <Title>Built By</Title>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://onesandzeros.nz')}>
                <Image
                  style={{width: 120, height: 50}}
                  source={require('../image/OAZ-Logo.png')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL('https://www.whitewolftech.com')
                }>
                <Image
                  style={{width: 170, height: 50}}
                  source={require('../image/wwt-on-white-sample.png')}
                />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        <Card style={{marginBottom: 20, marginHorizontal: 10}}>
          <Card.Content>
            <Title>Card Errors</Title>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  Linking.openURL(
                    'https://github.com/boltcard/bolt-nfc-android-app/blob/master/card-programming-errors.md',
                  )
                }>
                <Text style={styles.buttonText}>
                  <Ionicons name="logo-github" size={20} color="white" /> Card
                  Programming Errors
                </Text>
              </TouchableOpacity>
            </Text>
            <Title>Instructions</Title>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  'https://lasereyes.cards/how-to-use/lnbits-bolt-card-setup-instructions/',
                )
              }>
              <Text style={styles.buttonText}>
                <Ionicons name="flash" size={20} color="white" /> LNBits Setup
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Linking.openURL(
                  'https://github.com/boltcard/boltcard/blob/main/docs/INSTALL.md',
                )
              }>
              <Text style={styles.buttonText}>
                <Ionicons name="logo-github" size={20} color="white" /> Bolt
                Card Service Setup
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        <Card style={{marginBottom: 20, marginHorizontal: 10}}>
          <Card.Content>
            <Title>Links</Title>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL('https://t.me/bolt_card')}>
                <Text style={styles.buttonText}>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="white"
                  />{' '}
                  Bolt Card Telegram Help
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL('https://github.com/boltcard')}>
                <Text style={styles.buttonText}>
                  <Ionicons name="logo-github" size={20} color="white" /> Bolt
                  Card Github
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL('https://lnbits.com')}>
                <Text style={styles.buttonText}>
                  <Ionicons name="flash" size={20} color="white" /> LNBits.com
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL('https://t.me/lnbits')}>
                <Text style={styles.buttonText}>
                  <Ionicons
                    name="paper-plane-outline"
                    size={20}
                    color="white"
                  />{' '}
                  LNBits Telegram Help
                </Text>
              </TouchableOpacity>
            </Text>
            <Text style={styles.paragraph}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Linking.openURL('https://boltcardwallet.com')}>
                <Text style={styles.buttonText}>
                  <Ionicons name="link-outline" size={20} color="white" />{' '}
                  BoltCardWallet.com
                </Text>
              </TouchableOpacity>
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgb(0,122,255)',
    padding: 5,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  buttonText: {
    textTransform: 'uppercase',
    color: 'white',
    fontWeight: 'bold',
    flexDirection: 'row',
    fontSize: 15,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },

  buttonTouchable: {
    padding: 16,
  },
  paragraph: {
    marginBottom: 20,
  },
});
