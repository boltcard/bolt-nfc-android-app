import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import ResetBoltcard from '../components/ResetBoltcard';

export default function ProgramBoltcardScreen({route}) {
  const {url} = route.params;

  return (
    <ScrollView>
      <ResetBoltcard url={url} />
    </ScrollView>
  );
}
