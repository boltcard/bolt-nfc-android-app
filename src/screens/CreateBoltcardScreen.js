

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text, Platform } from 'react-native';
import Dialog from "react-native-dialog";
import { Card, Title } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DisplayAuthInfo from '../components/DisplayAuthInfo';
import NfcManager from '../helper/NfcManagerIOS';

export default function CreateBoltcardScreen({route}) {
    const { data, timestamp } = route.params;
    const navigation = useNavigation();


    const [promptVisible, setPromptVisible] = useState(false);
    const [pasteUrlValue, setPasteUrlValue] = useState();

    //setup
    const [keys, setKeys] = useState([])
    const [lnurlw_base, setlnurlw_base] = useState()
    const [cardName, setCardName] = useState()
    const [readyToWrite, setReadyToWrite] = useState(false);
    const [writeMode, setWriteMode] = useState(false);


    //output
    const [cardUID, setCardUID] = useState()
    const [tagname, setTagname] = useState()
    const [tagTypeError, setTagTypeError] = useState()
    
    const [key0Changed, setKey0Changed] = useState()
    const [key1Changed, setKey1Changed] = useState()
    const [key2Changed, setKey2Changed] = useState()
    const [key3Changed, setKey3Changed] = useState()
    const [key4Changed, setKey4Changed] = useState()

    const [ndefWritten, setNdefWritten] = useState()
    const [writekeys, setWriteKeys] = useState()
    const [ndefRead, setNdefRead] = useState()
    const [testp, setTestp] = useState()
    const [testc, setTestc] = useState()
    const [testBolt, setTestBolt] = useState()


    useFocusEffect(
        React.useCallback(() => {
            // NativeModules.MyReactModule.verifyLicense();
          // NativeModules.MyReactModule.setCardMode("read");
        }, [])
    );
    
    useEffect(() =>{
        const eventEmitter = new NativeEventEmitter(NativeModules.MyReactModule);
        const boltCardEventListener = eventEmitter.addListener('CreateBoltCard', (event) => {
            if(event.tagTypeError) setTagTypeError(event.tagTypeError);
            if(event.cardUID) setCardUID(event.cardUID);
            if(event.tagname) setTagname(event.tagname);

            if(event.key0Changed) setKey0Changed(event.key0Changed);
            if(event.key1Changed) setKey1Changed(event.key1Changed);
            if(event.key2Changed) setKey2Changed(event.key2Changed);
            if(event.key3Changed) setKey3Changed(event.key3Changed);
            if(event.key4Changed) setKey4Changed(event.key4Changed);

            if(event.ndefWritten) setNdefWritten(event.ndefWritten);
            if(event.writekeys) setWriteKeys(event.writekeys);
            
            if(event.readNDEF) {
                setNdefRead(event.readNDEF)
                //we have the latest read from the card fire it off to the server.
                const httpsLNURL = event.readNDEF.replace("lnurlw://", "https://");
                fetch(httpsLNURL)
                    .then((response) => response.json())
                    .then((json) => {
                        setTestBolt("success");
                    })
                    .catch(error => {
                        setTestBolt("Error: "+error.message);
                    });
            }

            if(event.testp) setTestp(event.testp);
            if(event.testc) setTestc(event.testc);


            NativeModules.MyReactModule.setCardMode('read');
            setWriteMode(false);
        });
    
        return () => {
          boltCardEventListener.remove();
        };
      }, [])

    const scanQRCode = () => {
        navigation.navigate('ScanScreen', {backScreen: 'CreateBoltcardScreen'});
    }

    const resetAll = () => {
        setKeys([]);
        setReadyToWrite(false);
        setWriteMode(false);
        resetOutput();
        navigation.navigate('CreateBoltcardScreen', {data:null});
    }

    const resetOutput = () => {
        setTagTypeError(null);
        setTagname(null);
        setCardUID(null);
        setKey0Changed(null);
        setKey1Changed(null);
        setKey2Changed(null);
        setKey3Changed(null);
        setKey4Changed(null);
        setNdefWritten(null);
        setWriteKeys(null);
    }

    const writeAgain = () => {
        resetOutput();
        if(Platform.OS === 'ios') {
            NativeModules.MyReactModule.setCardMode('createBoltcard', () => {
                NativeModules.MyReactModule.readNfc();
            });
        } else {
            NativeModules.MyReactModule.setCardMode('createBoltcard');
        }
        setWriteMode(true);
    }

    const showTickOrError = (good) => {
        return good ? 
            <Ionicons name="checkmark-circle"  size={20} color="green" />
            : <Ionicons name="alert-circle"  size={20} color="red" />
    }

    

    async function readNdef() {
        try {
          // register for the NFC tag with NDEF in it
          await NfcManager.requestTechnology(['Ndef']);
          // the resolved tag object will contain `ndefMessage` property
          const tag = await NfcManager.getTag();
          const ndefmessage = await NfcManager.getNdefMessage();
          console.warn('Tag found', tag);
          console.warn('NDEF message found', ndefmessage);
          const decodedNDEF = String.fromCharCode.apply(null, ndefmessage.ndefMessage[0].payload);
          //need to 
          console.log('NDEF?',decodedNDEF)
        } catch (ex) {
          console.warn('Oops!', ex, ex.);
        } finally {
          // stop the nfc scanning
          NfcManager.cancelTechnologyRequest();
        }
      }

    return (
        <ScrollView>
            <Button onPress={readNdef} title="read nfc" />
            {!data || data == null ?
                <>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title>Scan QR Code</Title>
                            <Text>Press the create card on LNBits or run the ./createboltcard command on your boltcard server</Text>
                        </Card.Content>
                        <Card.Actions style={{justifyContent: 'space-around'}}>
                            <Button onPress={scanQRCode} title="Scan QR Code" />
                            <Button onPress={() => setPromptVisible(true)} title="Paste Auth URL" />
                        </Card.Actions>  
                    </Card>
                    <Dialog.Container visible={promptVisible}>
                        <Dialog.Title style={styles.textBlack}>
                            Enter Auth URL
                        </Dialog.Title>
                        <Dialog.Description>
                            Paste your Auth URL from the console here to import the keys.
                        </Dialog.Description>
                        <Dialog.Input style={styles.textBlack} label="Auth URL" onChangeText={setPasteUrlValue} value={pasteUrlValue} />
                        <Dialog.Button label="Cancel"
                            onPress={() => {
                                setPromptVisible(false);
                                setPasteUrlValue();
                            }} />
                        <Dialog.Button label="Continue"
                            onPress={() => {
                                setPromptVisible(false);
                                setPasteUrlValue();
                                navigation.navigate('CreateBoltcardScreen',  {data: pasteUrlValue, timestamp: Date.now()});
                            }} />
                    </Dialog.Container>
                </>
                :
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Check URLs and Keys</Title>
                        <DisplayAuthInfo 
                            data={data} 
                            keys={keys} 
                            setKeys={setKeys} 
                            lnurlw_base={lnurlw_base} 
                            setlnurlw_base={setlnurlw_base} 
                            setReadyToWrite={setReadyToWrite}
                            cardName={cardName}
                            setCardName={setCardName}
                        />
                    </Card.Content>
                    <Card.Actions style={{justifyContent:'space-around'}}>
                        <Button 
                            title="Reset"
                            color="red"
                            onPress={resetAll} 
                        />
                        {readyToWrite && !writeMode &&
                            <Button 
                                title="Write Card Now"
                                onPress={writeAgain}
                            />
                        }
                    </Card.Actions>
                </Card>
            
            }
            
            {writeMode &&  
                <Card style={styles.card}>
                    <Card.Content>
                        <Ionicons name="card" size={50} color="green" />
                        <Text style={{fontSize:20, textAlign: 'center', borderColor:'black'}}>
                            Ready to write card. Hold NFC card to phone until all keys are changed.
                        </Text>
                    </Card.Content>
                    <Card.Actions style={{justifyContent:'center'}}>
                        <Button 
                            title="Cancel"
                            color="red"
                            onPress={() => {
                                NativeModules.MyReactModule.setCardMode('read');
                                setWriteMode(false);
                                setReadyToWrite(true);
                            }}
                        />
                    </Card.Actions>
                </Card>
            }
            {cardUID && 
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Output</Title>
                        {tagTypeError && <Text>Tag Type Error: {tagTypeError}<Ionicons name="alert-circle"  size={20} color="red" /></Text>}
                        {cardUID && <Text>Card UID: {cardUID}<Ionicons name="checkmark-circle"  size={20} color="green" /></Text>}
                        {tagname && <Text style={{lineHeight:30, textAlignVertical:"center"}}>Tag: {tagname}<Ionicons name="checkmark-circle"  size={20} color="green" /></Text>}
                        {key0Changed && <Text>Keys ready to change: {key0Changed == "no" ? "yes" : "no"}{key0Changed == "no" ? <Ionicons name="checkmark-circle"  size={20} color="green" /> : <Ionicons name="alert-circle"  size={20} color="red" />}</Text>}                       
                        {ndefWritten && <Text>NDEF written: {ndefWritten}{showTickOrError(ndefWritten == "success")}</Text>}
                        {writekeys && <Text>Keys Changed: {writekeys}{showTickOrError(writekeys == "success")}</Text>}
                        {ndefRead && <Text>Read NDEF: {ndefRead}</Text>}
                        {testp && <Text>Test PICC: {testp}{showTickOrError(testp == "ok")}</Text>}
                        {testc && <Text>Test CMAC: {testc}{showTickOrError(testc == "ok")}</Text>}
                        {testBolt && <Text>Bolt call test: {testBolt}{showTickOrError(testBolt == "success")}</Text>}
                    </Card.Content>
                    <Card.Actions style={{justifyContent:'space-around'}}>
                        <Button 
                            title="Write Again"
                            onPress={writeAgain}
                        />
                    </Card.Actions>
                </Card>
            }

            
        </ScrollView>
    );
    
}
const styles = StyleSheet.create({
  card: {
    margin:20
  },
  textBlack: {
    color:'#000'
  }
});
