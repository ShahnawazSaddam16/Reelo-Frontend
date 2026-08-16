import React from 'react'
import { Text, View } from 'react-native'

export default function ManagingPosts() {
  return (
    <View className="px-5 pb-8">
      <View className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] p-4">
        <Text className="text-white">No posts</Text>
      </View>
    </View>
  )
}
