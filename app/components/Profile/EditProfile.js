import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {useAuth} from "../../../contexts/AuthContext";

export default function EditProfile({ edit, setEdit, profile, setProfile }) {

const API_URL = "http://192.168.100.77:8081/api";
  const [username, setUsername] = useState(profile?.username || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [links, setLinks] = useState(profile?.links?.join(", ") || "")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("");
  const {token} = useAuth();
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/my-profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()

        if (data.success) {
          setUsername(data.profile?.username || "")
          setBio(data.profile?.bio || "")
          setLinks(data.profile?.links?.join(", ") || "")
        }
      } catch (err) {
        console.log(err)
      }
    }

    if (edit && token) {
      fetchProfile()
    }
  }, [edit, token])

  const handleUpdate = async () => {
    try {
      setLoading(true)
      setStatus(null)

      const res = await fetch(`${API_URL}/profile/edit-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          links: links.split(",").map((link) => link.trim()).filter(Boolean)
        })
      })

      const contentType = res.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        setStatus({ type: "error", message: "Server error, please try again" })
        setTimeout(() => setStatus(null), 2500)
        return
      }

      const data = await res.json()

      if (data.success) {
        setProfile(data.profile)
        setStatus({ type: "success", message: data.message || "Profile Updated Successfully" })
        setTimeout(() => {
          setStatus(null)
          setEdit(false)
        }, 1200)
      } else {
        setStatus({ type: "error", message: data.message || "Something went wrong" })
        setTimeout(() => setStatus(null), 2500)
      }
    } catch (err) {
      console.log(err)
      setStatus({ type: "error", message: typeof err?.message === "string" ? err.message : "Something went wrong" })
      setTimeout(() => setStatus(null), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {edit && (
        <View className="absolute inset-0 bg-black justify-center z-50">
          <Pressable className="absolute inset-0" onPress={() => setEdit(false)} />

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
              <View className="bg-neutral-950 rounded-t-3xl min-h-[300px] px-6 pt-0 pb-0 border-t border-purple-500/20">
                <View className="w-12 h-1.5 bg-neutral-700 rounded-full self-center mb-6" />

                <View className="mt-10 flex-row items-center justify-between mb-8">
                  <Text className="text-white text-xl font-semibold">Edit Profile</Text>
                  <Pressable
                    onPress={() => setEdit(false)}
                    className="w-9 h-9 rounded-full bg-neutral-900 items-center justify-center"
                  >
                    <Text className="text-neutral-400 text-base">✕</Text>
                  </Pressable>
                </View>

                {status && (
                  <View
                    className={`mb-5 px-4 py-3 rounded-2xl border ${
                      status.type === "success"
                        ? "bg-purple-500/10 border-purple-500"
                        : "bg-red-500/10 border-red-500"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        status.type === "success" ? "text-purple-400" : "text-red-400"
                      }`}
                    >
                      {status.message}
                    </Text>
                  </View>
                )}

                <View className="mb-5">
                  <Text className="text-neutral-400 text-xs mb-2 ml-1">Username</Text>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Enter username"
                    placeholderTextColor="#525252"
                    className={`bg-neutral-900 text-white px-4 py-4 rounded-2xl border ${
                      focusedField === "username" ? "border-purple-500" : "border-neutral-800"
                    }`}
                  />
                </View>

                <View className="mb-5">
                  <Text className="text-neutral-400 text-xs mb-2 ml-1">Bio</Text>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    onFocus={() => setFocusedField("bio")}
                    onBlur={() => setFocusedField("")}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#525252"
                    multiline
                    numberOfLines={3}
                    className={`bg-neutral-900 text-white px-4 py-4 rounded-2xl border h-24 ${
                      focusedField === "bio" ? "border-purple-500" : "border-neutral-800"
                    }`}
                    style={{ textAlignVertical: "top" }}
                  />
                </View>

                <View className="mb-8">
                  <Text className="text-neutral-400 text-xs mb-2 ml-1">Links</Text>
                  <TextInput
                    value={links}
                    onChangeText={setLinks}
                    onFocus={() => setFocusedField("links")}
                    onBlur={() => setFocusedField("")}
                    placeholder="example.com, twitter.com/you"
                    placeholderTextColor="#525252"
                    className={`bg-neutral-900 text-white px-4 py-4 rounded-2xl border ${
                      focusedField === "links" ? "border-purple-500" : "border-neutral-800"
                    }`}
                  />
                </View>

                <Pressable
                  onPress={handleUpdate}
                  disabled={loading}
                  className="bg-purple-600 rounded-full py-4 items-center active:bg-purple-700"
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold text-base">Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </>
  )
}