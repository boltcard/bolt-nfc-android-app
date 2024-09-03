import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import ResetBoltcard from '../components/ResetBoltcard';

export default function ProgramBoltcardScreen({route}) {
  return (
    <ScrollView>
      <ResetBoltcard url={route?.params?.url ? route.params.url : null} />
    </ScrollView>
  );
}
