

import { Button, Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Title } from 'react-native-paper';

export default function HelpScreen({ navigation }) {

    return (
        <ScrollView>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>v0.0.5</Title>
              </Card.Content>
            </Card>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title>Usage Instructions</Title>
                <Text style={styles.paragraph}>
                    1. Install Boltcard Server and aquire some blank NTAG424DNA tags. 
                </Text>
                <Text style={styles.paragraph}>
                    2. When app has loaded go to the write screen and put your lnurlw domain and path in to the text box.
                </Text>
                <Text style={styles.paragraph}>
                    3. When finished tap a card on the NFC scanner to write the card.
                </Text>
                <Text style={styles.paragraph}>
                    4. Go to the read screen and check that your URL looks correct. Should also be outputting the PICC and CMAC as URL paramters
                </Text>
                <Text style={styles.paragraph}>
                    5. To change your keys (to prevent malicious re-writing of your card) Go to the boltcard server terminal and run the command to show the card key change URL in QR code form and then scan this with the phone camera to load the server keys.
                </Text>
                <Text style={styles.paragraph}>
                    5.1. Please note, once you have changed the keys on your card you can then no longer change your boltcard's URL without resetting the keys.
                </Text>
                <Text style={styles.paragraph}>
                    6. When the keys are loaded, Hold the NFC card to the phone to run the key change on the card. Do not move the card until the key change has completed. 
                </Text>
                <Text style={styles.paragraph}>
                    Warning! If you lose the new keys then you will be unable to reprogram the card again
                </Text>
              </Card.Content>
            </Card>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
                <Card.Content>
                    <Title>Links</Title>
                    <Text style={styles.paragraph}>
                        <Button title="Boltcard Telegram Help Channel" onPress={() => Linking.openURL("https://t.me/bolt_card")}/>
                    </Text>
                    <Text style={styles.paragraph}>
                        <Button title="Boltcard Github" onPress={() => Linking.openURL("https://github.com/boltcard")}/>
                    </Text>
                </Card.Content>
            </Card>

            <Card style={{marginBottom:20, marginHorizontal:10}}>
                <Card.Content>
                    <Title>Key Change Instructions</Title>
                    <Text style={styles.paragraph}>
                        On your boltcard server, run the createboltcard command. You might have to compile this executable first.
                    </Text>
                    <Text style={styles.paragraph}>
                        Scan the QR code in the console with the phone to load the keys
                    </Text>
                    <Text style={styles.paragraph}>
                        When the keys are loaded hold your NFC card to the phone to update the keys. Keep the card held still until all keys are written. Moving the card mid-operation can leave the card in an inconsistent state or brick the card.
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
