import React from "react";
import { Text, View } from "react-native";

export default function Login({ setSignIn }) {
  return (
    <View className="flex flex-col justify-center items-center">
      <Text className="text-[16px] text-white">LoginScreen</Text>
      <Text className="text-white" onPress={() => setSignIn(true)}>
        SignIn
      </Text>
    </View>
  );
}