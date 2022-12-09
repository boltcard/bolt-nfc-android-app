

import { Button, Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Title } from 'react-native-paper';
import gitinfo from '../../gitinfo.json';
export default function HelpScreen({ navigation }) {

    return (
        <ScrollView>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title selectable={true}>v0.1.3 ({gitinfo.commit})</Title>
              </Card.Content>
            </Card>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>Usage Instructions</Title>
                <Text style={styles.paragraph}>
                    1. Install Bolt Card Server (follow instructions in the Git Repo) and aquire some blank NTAG424DNA cards. 
                </Text>
                <Text style={styles.paragraph}>
                    2. On your Bolt Card server, run the createboltcard command. You might have to compile this executable first.
                </Text>
                <Text style={styles.paragraph}>
                    3. Scan the QR code in the console with the phone to load the Card keys and LNURLW
                </Text>
                <Text style={styles.paragraph}>
                    4. Check everything looks OK and then press "Write Card"
                </Text>
                <Text style={styles.paragraph}>
                    5. Hold your card to the NFC reader on your phone untill you see the success message.
                </Text>
                <Text style={styles.paragraph}>
                    Note: Keep your keys secret, and when creating cards ensure there are no other potential listening devices in range!
                </Text>
              </Card.Content>
            </Card>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>Links</Title>
                <Text style={styles.paragraph}>
                    <Button title="Bolt Card Telegram Help Channel" onPress={() => Linking.openURL("https://t.me/bolt_card")}/>
                </Text>
                <Text style={styles.paragraph}>
                    <Button title="Bolt Card Github" onPress={() => Linking.openURL("https://github.com/boltcard")}/>
                </Text>
              </Card.Content>
            </Card>

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
  paragraph: {
    marginBottom:20
  }
});
