import React from 'react';
import {View, Text, StatusBar} from "react-native";
import CreatePost from "../../components/Blogs/CreatePost";
import BottomBar from "../../components/App-Shell/BottomBar";

export default function CreatePostScreen() {
  return (
    <>
      <View className="flex-1 justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light"/>
        <CreatePost />
        <BottomBar />
      </View>
    </>
  )
}
