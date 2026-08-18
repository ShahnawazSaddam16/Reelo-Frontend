import React from 'react'
import { View, Text, StatusBar } from 'react-native';
import BottomBar from "../components/App-Shell/BottomBar";

export default function SearchScreen() {
  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Search Screen</Text>
      </View>
      <BottomBar />
    </View>
  )
}
