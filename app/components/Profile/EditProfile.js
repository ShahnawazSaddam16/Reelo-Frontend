import { View, Text } from "react-native"

export default function EditProfile({edit, setEdit}) {
  return (
    <>
    {edit && (

    <View className="fixed inset-0 bg-black w-full h-[40px]">
        <Text className="text-white" onPress={()=>{setEdit(false)}}>hello</Text>
    </View>

    )}
    </>
  )
}
