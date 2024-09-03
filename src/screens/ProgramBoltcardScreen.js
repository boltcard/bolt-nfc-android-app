import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import SetupBoltcard from '../components/SetupBoltcard';

export default function ProgramBoltcardScreen({route}) {
  return (
    <ScrollView>
      <SetupBoltcard
        url={route?.params?.url ? route.params.url : null}
        navigation={navigation}
      />
    </ScrollView>
  );
}
