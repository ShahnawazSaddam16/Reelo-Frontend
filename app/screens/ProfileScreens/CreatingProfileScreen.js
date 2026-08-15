import React from 'react'
import { StatusBar, View, Text } from 'react-native'
import CreatingProfile from '../../components/Profile/CreatingProfile'

export default function CreatingProfileScreen() {
  return (
    <>
     <View className="flex-1 justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light"/>
        <CreatingProfile />
    </View> 
    </>
  )
}
