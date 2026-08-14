import React, { useState } from "react";
import { View, StatusBar } from "react-native";
import Login from "../components/Auth/Login";
import SignIn from "../components/Auth/SignIn";

export default function AuthScreen() {
  const [signin, setSignIn] = useState(false);

  return (
    <View className="flex-1 justify-center items-center bg-[#0E0E10]">
      <StatusBar style="light" />
      {!signin ? (
        <Login setSignIn={setSignIn} />
      ) : (
        <SignIn setSignIn={setSignIn} />
      )}
    </View>
  );
}