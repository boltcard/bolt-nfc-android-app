import { useFocusEffect } from '@react-navigation/native';
import React from 'react';

import { ActivityIndicator, NativeModules, ScrollView, StyleSheet, Text } from 'react-native';
import { Card } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function ResetCardScreen({route}) {

    useFocusEffect(
        React.useCallback(() => {
          NativeModules.MyReactModule.setCardMode("resetcard");
        }, [])
      );
      
    return (
        <ScrollView>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={{fontSize:30, textAlign: 'center', borderColor:'black'}}>
                    <Ionicons name="card" size={50} color="green" />
                        Wipe card. (this doesnt work yet. LOL)
                    </Text>
                    <Text style={{ textAlign: 'center'}}> Keys must be reset first. </Text>
                    <Text style={{ textAlign: 'center'}}> Hold card to reader when ready.</Text>
                </Card.Content>
                <Card.Actions style={{justifyContent:'center'}}>
                    <ActivityIndicator />
                </Card.Actions>
            </Card>

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