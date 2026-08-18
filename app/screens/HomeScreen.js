import React from "react";
import { StatusBar, View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../components/App-Shell/BottomBar";
import Stories from "../components/Home/Stories";
import PostCards from "../components/Home/PostCards";
import { useAuth } from "../../contexts/AuthContext";



export default function HomeScreen() {
  const navigation = useNavigation();
  const {logout} = useAuth();

  const LogoutBtn = async()=>{
    await logout();
    navigation.replace("AuthScreen");
  }

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />
      <Stories/>
      <View className="flex-1 justify-center items-center">
        <Text className="text-white" onPress={()=>{LogoutBtn()}}>Hello</Text>
        <PostCards />
      </View>
      <BottomBar />
    </View>
  );
}