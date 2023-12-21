import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import SetupBoltcard from '../components/SetupBoltcard';

export default function ProgramBoltcardScreen({route}) {
  const {url} = route.params;

  return (
    <ScrollView>
      <SetupBoltcard url={url} />
    </ScrollView>
  );
}
