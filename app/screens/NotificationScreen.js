import React from 'react'
import { StatusBar, View, Text } from 'react-native';
import MyNotifications from "../components/Notification/MyNotifications";

export default function NotificationScreen() {
  return (
    <>
    <View className="flex-1 justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light"/>
        <MyNotifications />
      </View> 
    </>
  )
}
