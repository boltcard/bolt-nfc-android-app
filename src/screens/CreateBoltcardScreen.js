

import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useEffect, useState } from 'react';
import { Button, NativeEventEmitter, NativeModules, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, Title } from 'react-native-paper';
import DisplayAuthInfo from '../components/DisplayAuthInfo';
export default function CreateBoltcardScreen({route}) {
    const { data, timestamp } = route.params;
    const navigation = useNavigation();

    //setup
    const [keys, setKeys] = useState([])
    const [lnurlw_base, setlnurlw_base] = useState()
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
        navigation.navigate('CreateBoltcardScreen', {data:null});
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
                        />
                    </Card.Content>
                    <Card.Actions style={{justifyContent:'space-around'}}>
                        <Button 
                            title="Reset"
                            color="red"
                            onPress={resetAll} 
                        />
                        {readyToWrite && 
                            <Button 
                                title="Write Card Now"
                                onPress={() => {
                                    NativeModules.MyReactModule.setCardMode('createBoltcard');
                                    setWriteMode(true);
                                }}
                            />
                        }
                    </Card.Actions>
                </Card>
            
            }
            
            {writeMode &&  
                <>
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
                    <Card style={styles.card}>
                        <Card.Content>
                            <Title>Output</Title>
                            {tagTypeError && <Text>Tag Type Error: {tagTypeError}</Text>}
                            {cardUID && <Text>Card UID: {cardUID}</Text>}
                            {tagname && <Text>Tag: {tagname}</Text>}
                            {key0Changed && <Text>Key 0: {key0Changed}</Text>}
                            {key1Changed && <Text>Key 1: {key1Changed}</Text>}
                            {key2Changed && <Text>Key 2: {key2Changed}</Text>}
                            {key3Changed && <Text>Key 3: {key3Changed}</Text>}
                            {key4Changed && <Text>Key 4: {key4Changed}</Text>}

                            {ndefWritten && <Text>NDEF written: {ndefWritten}</Text>}
                            {writekeys && <Text>Keys Changed: {writekeys}</Text>}
                            
                        </Card.Content>
                        <Card.Actions style={{justifyContent:'center'}}>
                            <Button 
                                title="Reset Keys"
                                color="red"
                                onPress={() => {
                                   navigation.navigate('ResetKeysScreen');
                                }}
                            />
                        </Card.Actions>
                    </Card>
                </>
            }

            
        </ScrollView>
    );
    
}
const styles = StyleSheet.create({
  card: {
    margin:20
  }
});
