import React from 'react'
import { Text, View } from 'react-native'

export default function Stories() {
  return (
    <>
      <View
        className="flex mt-10 justify-center items-center border-b"
        style={{ borderBottomColor: 'rgba(255,255,255,0.12)', borderBottomWidth: 1,}}
      >
        <Text className="text-2xl text-white mb-5">Story</Text>
      </View>
    </>
  )
}