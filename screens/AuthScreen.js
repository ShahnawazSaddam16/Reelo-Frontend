import { View, Text, StatusBar } from "react-native";


export default function AuthScreen() {
  return (
    <>
     <View className="flex justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light"/>
        <Text>Welcome to AuthScreen</Text>
    </View> 
    </>
  )
}
