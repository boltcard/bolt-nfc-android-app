

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Title } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DisplayAuthInfo from '../components/DisplayAuthInfo';
export default function CreateBoltcardScreen({route}) {
    const { data, timestamp } = route.params;
    const navigation = useNavigation();

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

    useFocusEffect(
        React.useCallback(() => {
          NativeModules.MyReactModule.setCardMode("read");
        }, [])
    );
    
    useEffect(() =>{
        const eventEmitter = new NativeEventEmitter();
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
        NativeModules.MyReactModule.setCardMode('createBoltcard');
        setWriteMode(true);
    }

    const showTickOrError = (good) => {
        return good ? 
            <Ionicons name="checkmark-circle"  size={20} color="green" />
            : <Ionicons name="alert-circle"  size={20} color="red" />
    }

    return (
        <ScrollView>
            {!data || data == null ?
                <Card style={styles.card}>
                    <Card.Content>
                        <Title>Scan QR Code</Title>
                        <Text>Run the ./createboltcard command on the boltcard server</Text>
                        
                    </Card.Content>
                    <Card.Actions>
                        <Button onPress={scanQRCode} title="Scan QR Code" />
                    </Card.Actions>  
                </Card>
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
                        {key0Changed && <Text>Key 0 changed: {key0Changed}{key0Changed == "no" ? <Ionicons name="checkmark-circle"  size={20} color="green" /> : <Ionicons name="alert-circle"  size={20} color="red" />}</Text>}
                        {key1Changed && <Text>Key 1 changed: {key1Changed}{key1Changed == "no" ? <Ionicons name="checkmark-circle"  size={20} color="green" /> : <Ionicons name="alert-circle"  size={20} color="red" />}</Text>}
                        {key2Changed && <Text>Key 2 changed: {key2Changed}{key2Changed == "no" ? <Ionicons name="checkmark-circle"  size={20} color="green" /> : <Ionicons name="alert-circle"  size={20} color="red" />}</Text>}
                        {key3Changed && <Text>Key 3 changed: {key3Changed}</Text>}
                        {key4Changed && <Text>Key 4 changed: {key4Changed}</Text>}

                        {ndefWritten && <Text>NDEF written: {ndefWritten}{showTickOrError(ndefWritten == "success")}</Text>}
                        {writekeys && <Text>Keys Changed: {writekeys}{showTickOrError(writekeys == "success")}</Text>}
                        
                    </Card.Content>
                    <Card.Actions style={{justifyContent:'space-around'}}>
                        <Button 
                            title="Write Again"
                            onPress={writeAgain}
                        />
                        {/* <Button 
                            title="Reset Keys"
                            color="red"
                            onPress={() => {
                                navigation.navigate('ResetKeysScreen');
                            }}
                        /> */}
                    </Card.Actions>
                </Card>
            }

            
        </ScrollView>
    );
    
}
const styles = StyleSheet.create({
  card: {
    margin:20
  }
});
