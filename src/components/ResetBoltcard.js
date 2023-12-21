import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import nfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import {Card, Text, ActivityIndicator, Button, Title} from 'react-native-paper';
import Ntag424 from '../class/Ntag424';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SetupStep = {
  Init: 1,
  Restart: 2,
  HoldCard: 3,
  ReadingUid: 4,
  RequestingKeys: 5,
  WritingCard: 6,
};

const WithStep = ({step, current, children}) => {
  return step === current ? children : null;
};
export default function SetupBoltcard({url}) {
  const [step, setStep] = useState(SetupStep.Init);
  const [readingNfc, setReadingNfc] = useState(false);
  const [error, setError] = useState('');

  //output
  const [tagTypeError, setTagTypeError] = useState('');
  const [writingCard, setWritingCard] = useState(false);

  const [writeKeysOutput, setWriteKeysOutput] = useState('');

  if (!url) {
    return (
      <View>
        <Text>No valid URL passed.</Text>
      </View>
    );
  }

  useEffect(() => {
    readNfc();
  }, []);

  const reset = () => {
    setError('');
    setTagTypeError('');
    setWriteKeysOutput('');
  };

  const readNfc = async () => {
    reset();
    setStep(SetupStep.HoldCard);
    var result = [];
    try {
      setReadingNfc(true);
      await nfcManager.requestTechnology(NfcTech.IsoDep, {
        alertMessage:
          'Ready to write card. Hold NFC card to phone until all keys are changed.',
      });
      setStep(SetupStep.ReadingUid);
      const tag = await nfcManager.getTag();
      if (!tag) throw new Error('Error reading card. No tag detected');
      const uid = tag?.id;

      setStep(SetupStep.RequestingKeys);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UID: uid,
          onExisting: 'KeepVersion',
        }),
      });
      if (!response.ok) {
        console.log(response);
        console.log(await response.text());
        throw new Error('Error fetching the keys');
      }
      const json = await response.json();
      console.log(json);
      const {K0, K1, K2, K3, K4, LNURLW: lnurlw_base} = json;
      if (!K0 || !K1 || !K2 || !K3 || !K4 || !lnurlw_base) {
        throw new Error('Error fetching the keys');
      }

      setWritingCard(true);
      setStep(SetupStep.WritingCard);

      const defaultKey = '00000000000000000000000000000000';
      // //auth first
      await Ntag424.AuthEv2First('00', K0);

      //reset file settings
      await Ntag424.resetFileSettings();

      //change keys
      await Ntag424.changeKey('01', K1, defaultKey, '00');
      result.push('Change Key1: Success');
      console.log('changekey 2');
      await Ntag424.changeKey('02', K2, defaultKey, '00');
      result.push('Change Key2: Success');
      console.log('changekey 3');
      await Ntag424.changeKey('03', K3, defaultKey, '00');
      result.push('Change Key3: Success');
      await Ntag424.changeKey('04', K4, defaultKey, '00');
      result.push('Change Key4: Success');
      await Ntag424.changeKey('00', K0, defaultKey, '00');
      result = ['Change Key0: Success', ...result];

      const message = [Ndef.uriRecord('')];
      const bytes = Ndef.encodeMessage(message);
      await Ntag424.setNdefMessage(bytes);

      result.push('NDEF and SUN/SDM cleared');
    } catch (ex) {
      console.error('Oops!', ex);
      var error = ex;
      if (typeof ex === 'object') {
        error = ex.message ? ex.message : ex.constructor.name;
      }
      if (error == 'You can only issue one request at a time') {
        setStep(SetupStep.Restart);
        return;
      }
      error = 'NFC Error: ' + error;
      setTagTypeError(error);
    } finally {
      setWritingCard(false);
      nfcManager.cancelTechnologyRequest();
      setReadingNfc(false);
      setWriteKeysOutput(result.join('\r\n'));
    }
  };

  const showTickOrError = good => {
    return good ? (
      <Ionicons name="checkmark-circle" size={20} color="green" />
    ) : (
      <Ionicons name="alert-circle" size={20} color="red" />
    );
  };

  return (
    <Card
      style={{
        marginVertical: 20,
        marginHorizontal: 10,
        textAlign: 'center',
        paddingVertical: 30,
      }}>
      <WithStep step={SetupStep.Init} current={step}>
        <Card.Content>
          <ActivityIndicator size="large" />
        </Card.Content>
      </WithStep>
      <WithStep step={SetupStep.Restart} current={step}>
        <Card.Content>
          <Button onPress={readNfc}>Start resetting the card</Button>
        </Card.Content>
      </WithStep>
      {readingNfc && (
        <Card.Content>
          <Title style={styles.textCenter}>
            Hold your card until it's finished
          </Title>
        </Card.Content>
      )}
      <WithStep step={SetupStep.HoldCard} current={step}>
        <Card.Content>
          <View>
            <Ionicons
              name="card"
              size={50}
              color="green"
              style={{alignSelf: 'center'}}
            />
            <Text
              style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
              Ready to reset card. Hold NFC card to phone until all keys are
              changed.
            </Text>
          </View>
        </Card.Content>
      </WithStep>
      <WithStep step={SetupStep.ReadingUid} current={step}>
        <Card.Content>
          <View>
            <Ionicons
              name="card"
              size={50}
              color="green"
              style={{alignSelf: 'center'}}
            />
            <Text
              style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
              Reading your card UID.
            </Text>
            <ActivityIndicator />
          </View>
        </Card.Content>
      </WithStep>
      <WithStep step={SetupStep.RequestingKeys} current={step}>
        <Card.Content>
          <View>
            <Ionicons
              name="card"
              size={50}
              color="green"
              style={{alignSelf: 'center'}}
            />
            <Text
              style={{fontSize: 20, textAlign: 'center', borderColor: 'black'}}>
              Requesting keys to wipe.
            </Text>
            <ActivityIndicator />
          </View>
        </Card.Content>
      </WithStep>
      <WithStep step={SetupStep.WritingCard} current={step}>
        <View>
          <Card.Content>
            {writingCard && (
              <View>
                <Text>Writing card...</Text>
                <ActivityIndicator />
              </View>
            )}
            <Title>Output</Title>
            {tagTypeError && (
              <Text>
                Tag Type Error: {tagTypeError}
                <Ionicons name="alert-circle" size={20} color="red" />
              </Text>
            )}
            {writeKeysOutput && <Text>{writeKeysOutput}</Text>}
            <Button onPress={readNfc}>Wipe again</Button>
          </Card.Content>
        </View>
      </WithStep>
    </Card>
  );
}

const styles = StyleSheet.create({
  textCenter: {
    textAlign: 'center',
  },
});
