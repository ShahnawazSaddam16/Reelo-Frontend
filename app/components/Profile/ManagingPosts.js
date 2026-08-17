import React, { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native"
import { Video } from "expo-av"
import { useNavigation } from "@react-navigation/native"
import { PlusCircle, ImageOff, FileText } from "lucide-react-native"
import { useAuth } from "../../../contexts/AuthContext"

const PAGE_SIZE = 6

export default function ManagingPosts() {
  const API_URL = "http://192.168.100.77:5015/api"
  const navigation = useNavigation()
  const { token } = useAuth()

  const [allPosts, setAllPosts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const resolveMediaUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    const baseUrl = API_URL.replace(/\/api$/, "")
    return `${baseUrl}/${path.replace(/\\/g, "/")}`
  }

  const fetchPosts = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const res = await fetch(`${API_URL}/blog/user-posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        setAllPosts(data.userPosts || [])
        setVisibleCount(PAGE_SIZE)
      }
    } catch (err) {
      console.log(err)
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchPosts()
  }, [token])

  const handleLoadMore = () => {
    if (loadingMore) return
    if (visibleCount >= allPosts.length) return
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allPosts.length))
      setLoadingMore(false)
    }, 350)
  }

  const renderMedia = (item) => {
    if (item.contentType?.startsWith("image")) {
      return (
        <Image
          source={{ uri: resolveMediaUrl(item.content) }}
          style={{ width: "100%", height: 220 }}
          resizeMode="cover"
        />
      )
    }
    if (item.contentType?.startsWith("video")) {
      return (
        <Video
          source={{ uri: resolveMediaUrl(item.content) }}
          style={{ width: "100%", height: 220 }}
          useNativeControls
          resizeMode="cover"
        />
      )
    }
    return (
      <View className="items-center justify-center bg-white/[0.03] py-10">
        <FileText size={24} color="#71717A" />
        <Text className="mt-2 text-[13px] text-zinc-400 px-4 text-center">
          {item.content}
        </Text>
      </View>
    )
  }

  const renderPost = ({ item }) => (
    <View className="mb-4 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#121216]">
      {renderMedia(item)}
      <View className="p-4">
        <Text className="text-[15px] font-semibold text-white">{item.title}</Text>
        {item.desc ? (
          <Text className="mt-1 text-[13px] leading-5 text-zinc-400">{item.desc}</Text>
        ) : null}
      </View>
    </View>
  )

  const posts = allPosts.slice(0, visibleCount)

  if (loading) {
    return (
      <View className="px-5 pb-8 items-center justify-center py-14">
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    )
  }

  return (
    <View className="px-5 pb-8">
      <Pressable
        onPress={() => navigation.navigate("CreatePostScreen")}
        className={`flex-row items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 py-3.5 active:opacity-70 ${
          allPosts.length > 0 ? "mb-5" : ""
        }`}
      >
        <PlusCircle size={16} color="#A78BFA" />
        <Text className="ml-2 text-[14px] font-semibold text-purple-300">Create a Post</Text>
      </Pressable>

      {allPosts.length === 0 ? (
        <View className="items-center justify-center rounded-[28px] border border-dashed border-white/[0.12] bg-white/[0.02] py-14">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6]/15">
            <ImageOff size={24} color="#A78BFA" />
          </View>
          <Text className="text-[15px] font-semibold text-zinc-200">No posts yet</Text>
          <Text className="mt-1 text-[13px] text-zinc-600">Share your first post with the world</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          scrollEnabled={false}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchPosts(true)}
              tintColor="#8B5CF6"
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#8B5CF6" size="small" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}