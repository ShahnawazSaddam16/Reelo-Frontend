import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  Dimensions,
} from "react-native"
import { Video } from "expo-av"
import Swiper from "react-native-swiper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ImageOff, FileText, X, Heart, MessageCircle, Calendar } from "lucide-react-native"
import { useAuth } from "../../../contexts/AuthContext"

const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height
const SLIDE_HEIGHT = 420

export default function UserPosts () {
  const API_URL = "http://192.168.100.77:5015/api"
  const { token } = useAuth();
  const route = useRoute();
  const { profileId } = route.params;

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerUri, setViewerUri] = useState(null)

  const resolveMediaUrl = (path) => {
    if (!path) return null
    if (typeof path === "object") {
      path = path.url || path.path || path.content || path.file || path.src || null
    }
    if (typeof path !== "string") return null
    if (path.startsWith("http://") || path.startsWith("https://")) return path
    const baseUrl = API_URL.replace(/\/api$/, "")
    return `${baseUrl}/${path.replace(/\\/g, "/")}`
  }

  const formatPostDate = (dateStr) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }

  const getLikesCount = (item) => {
    if (typeof item.likes === "number") return item.likes
    if (Array.isArray(item.likes)) return item.likes.length
    return 0
  }

  const getCommentsCount = (item) => {
    if (Array.isArray(item.comments)) return item.comments.length
    if (typeof item.comments === "number") return item.comments
    return 0
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/blog/user-posts/${profileId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const safeParseJSON = async (r) => {
        const ct = r.headers.get('content-type') || ''
        if (ct.includes('application/json')) return await r.json()
        try {
          return await r.json()
        } catch (e) {
          const text = await r.text().catch(() => '')
          return { success: false, message: text || 'Non-JSON response' }
        }
      }

      const data = await safeParseJSON(res)

      if (data && data.success) {
        setPosts(data.userPosts || [])
      } else if (data && data.userPosts) {
        setPosts(data.userPosts || [])
      } else {
        console.warn('No posts returned for user', profileId, data)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !profileId) return
    fetchPosts()
  }, [token, profileId])

  const getMediaItems = (item) => {
    if (Array.isArray(item.content)) return item.content.filter(Boolean)
    if (item.content) return [item.content]
    return []
  }

  const isVideoItem = (m) => {
    if (m && m.contentType) return m.contentType.startsWith("video")
    if (typeof m === "string") return m.endsWith(".mp4") || m.endsWith(".mov")
    return false
  }

  const openViewer = (uri) => {
    setViewerUri(uri)
    setViewerVisible(true)
  }

  const closeViewer = () => {
    setViewerUri(null)
    setViewerVisible(false)
  }

  const renderMediaSlide = (m, isVideo) => {
    const uri = resolveMediaUrl(m)
    if (isVideo) {
      return (
        <Video
          source={{ uri }}
          style={{ width: SCREEN_WIDTH - 40, height: 260 }}
          useNativeControls
          resizeMode="cover"
        />
      )
    }
    return (
      <Pressable onPress={() => openViewer(uri)}>
        <Image
          source={{ uri }}
          style={{ width: SCREEN_WIDTH - 40, height: 260 }}
          resizeMode="cover"
        />
      </Pressable>
    )
  }

  const renderMedia = (item) => {
    const mediaItems = getMediaItems(item)

    if (mediaItems.length === 0) {
      return (
        <View className="items-center justify-center bg-white/[0.03] py-12">
          <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-white/[0.05]">
            <FileText size={20} color="#71717A" />
          </View>
          <Text className="text-[13px] text-zinc-500 px-4 text-center">No media attached</Text>
        </View>
      )
    }

    if (mediaItems.length === 1) {
      return renderMediaSlide(mediaItems[0], isVideoItem(mediaItems[0]))
    }

    return (
      <FlatList
        data={mediaItems}
        keyExtractor={(_, idx) => `${item._id}-${idx}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item: m }) => renderMediaSlide(m, isVideoItem(m))}
      />
    )
  }

  const renderPost = (item) => (
    <View className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#121216] shadow-lg">
      {renderMedia(item)}
      <View className="p-4">
        <Text className="text-[15px] font-semibold text-white">{item.title || "Untitled"}</Text>
        {item.desc ? (
          <Text className="mt-1 text-[13px] leading-5 text-zinc-400">{item.desc}</Text>
        ) : null}

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="flex-row items-center">
              <Heart size={15} color="#FB7185" />
              <Text className="ml-1.5 text-[13px] font-medium text-zinc-300">{getLikesCount(item)}</Text>
            </View>
            <View className="ml-[20px] flex-row items-center">
              <MessageCircle size={15} color="#A78BFA" />
              <Text className="ml-1.5 text-[13px] font-medium text-zinc-300">{getCommentsCount(item)}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Calendar size={13} color="#71717A" />
            <Text className="ml-1.5 text-[12px] text-zinc-500">{formatPostDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  )

  if (loading) {
    return (
      <View className="px-5 pb-8 items-center justify-center py-14">
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    )
  }

  return (
    <View className="px-5 pb-8">
      <Text className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
        Posts
      </Text>

      {posts.length === 0 ? (
        <View className="items-center justify-center rounded-[28px] border border-dashed border-white/[0.12] bg-white/[0.02] py-14">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6]/15">
            <ImageOff size={24} color="#A78BFA" />
          </View>
          <Text className="text-[15px] font-semibold text-zinc-200">No posts yet</Text>
          <Text className="mt-1 text-[13px] text-zinc-600">This user hasn't shared anything</Text>
        </View>
      ) : (
        <Swiper
          style={{ height: SLIDE_HEIGHT }}
          loop={false}
          autoplay={false}
          showsButtons={false}
          dotStyle={{
            backgroundColor: "rgba(255,255,255,0.25)",
            width: 6,
            height: 6,
            borderRadius: 3,
            marginHorizontal: 3,
          }}
          activeDotStyle={{
            backgroundColor: "#A78BFA",
            width: 6,
            height: 6,
            borderRadius: 3,
            marginHorizontal: 3,
          }}
          paginationStyle={{ bottom: 4 }}
        >
          {posts.map((item) => (
            <View key={item._id} className="px-1">
              {renderPost(item)}
            </View>
          ))}
        </Swiper>
      )}

      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.96)" }}>
          <Pressable
            onPress={closeViewer}
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 10,
              height: 40,
              width: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.1)",
            }}
          >
            <X size={20} color="#F4F4F5" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {viewerUri ? (
              <Image
                source={{ uri: viewerUri }}
                style={{ width: SCREEN_WIDTH, height: "70%" }}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  )
}