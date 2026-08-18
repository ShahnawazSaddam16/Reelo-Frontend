import React from 'react';
import {View, StatusBar, ScrollView} from "react-native";
import CreatePost from "../../components/Blogs/CreatePost";
import BottomBar from "../../components/App-Shell/BottomBar";

export default function CreatePostScreen() {
  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar style="light"/>
      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <CreatePost />
      </ScrollView>
      <BottomBar />
    </View>
  )
}