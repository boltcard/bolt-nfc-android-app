

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, Text, Title } from 'react-native-paper';

const pincodeServiceName = "boltcard";

export default function StoredCardsList() {

    const [cards, setCards] = useState([]);

    const clearData = async (value) => {
        try {
          await AsyncStorage.removeItem('@stored_boltcards')
        } catch (e) {
          // saving error
          console.error(e)
        }
    }

    const getData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('@stored_boltcards')
          const cardsArray = jsonValue != null ? JSON.parse(jsonValue) : [];

          setCards(cardsArray);
          
        } catch(e) {
          // error reading value
          console.error(e)
        }
    }

    useEffect(() => {
        getData();
    }, [cards])

    return (
        <ScrollView>
            <Card style={{marginBottom:20, marginHorizontal:10}}>
              <Card.Content>
                <Title selectable={true}>Store and Get</Title>

                <Button onPress={() => {
                    clearData();
                }}>
                    Clear Data
                </Button>

                <Button onPress={() => {
                    getData().then(result => console.log("getData", result));
                }}>
                    Get Data
                </Button>
              </Card.Content>
            </Card>
            {cards && cards.map((card, index) => {
                // console.log('card', card)
                return(
                    <Card id={index} style={{marginBottom:20, marginHorizontal:10}}>
                        <Card.Content>
                            <Title>{card.cardName} (ID:{card.id})</Title>
                            <Text>lnurlw: {card.lnurlw_base}</Text>
                            <Text>key0: {card.k0}</Text>
                            <Text>key1: {card.k1}</Text>
                            <Text>key2: {card.k2}</Text>
                            <Text>key3: {card.k3}</Text>
                            <Text>key4: {card.k4}</Text>
                        </Card.Content>
                        <Card.Actions style={{justifyContent:'space-around'}}>
                            <Button 
                                title=""
                                color="red"
                                onPress={async(index)=> {
                                    let cardsLeft = cards;
                                    cardsLeft.splice(index,1);
                                    setCards(cardsLeft);
                                    await AsyncStorage.setItem('@stored_boltcards', JSON.stringify(cardsLeft))
                                }} 
                            >Delete</Button>
                        </Card.Actions>
                    </Card>
                );
            })}

        </ScrollView>
    );

}