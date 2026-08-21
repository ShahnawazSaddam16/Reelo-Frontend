import React from 'react';
import {View, Text, StatusBar} from "react-native";
import DangerZone from '../components/Settings/DangerZone';

export default function SettingScreen() {
  return (
    <>
     <View className="flex-1 bg-[#0E0E10]">
        <StatusBar style="light"/>
        <View className="flex-1 justify-center items-center">
        <DangerZone />
        </View>
    </View> 
    </>
  )
}
