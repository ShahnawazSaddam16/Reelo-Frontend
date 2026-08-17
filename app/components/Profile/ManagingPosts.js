import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native';
import {useNavigation} from "@react-navigation/native";

export default function ManagingPosts() {
  const navigation = useNavigation();
  return (
    <View className="px-5 pb-8">
      <View className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] p-4">
        <Text className="text-white">No posts</Text>
        <TouchableOpacity onPress={()=>{navigation.navigate("CreatePostScreen")}}>
          <Text>Create a Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
