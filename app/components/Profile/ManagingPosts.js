import React, { useState, useEffect, useRef } from "react"
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
import Swiper from "react-native-swiper"
import { useNavigation } from "@react-navigation/native"
import { PlusCircle, ImageOff, FileText, MoreVertical, X, RefreshCw } from "lucide-react-native"
import { useAuth } from "../../../contexts/AuthContext"
import PostOptionsMenu from "./PostOptionsMenu"
import DeleteConfirmModal from "./Deleteconfirmmodal"

const PAGE_SIZE = 6
const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height
const SLIDE_HEIGHT = 420

export default function ManagingPosts() {
  const API_URL = "http://192.168.100.77:5015/api"
  const navigation = useNavigation()
  const { token } = useAuth()

  const [allPosts, setAllPosts] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, right: 0 })
  const [selectedPost, setSelectedPost] = useState(null)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [viewerUri, setViewerUri] = useState(null)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const menuButtonRefs = useRef({})

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

  const handleIndexChanged = (index) => {
    if (index >= posts.length - 2) {
      handleLoadMore()
    }
  }

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

  const openMenu = (post) => {
    const ref = menuButtonRefs.current[post._id]
    if (ref) {
      ref.measureInWindow((x, y, width, height) => {
        setMenuPosition({
          bottom: Math.max(SCREEN_HEIGHT - y + 8, 60),
          right: Math.max(SCREEN_WIDTH - (x + width), 12),
        })
        setSelectedPost(post)
        setMenuVisible(true)
      })
    } else {
      setSelectedPost(post)
      setMenuVisible(true)
    }
  }

  const closeMenu = () => {
    setSelectedPost(null)
    setMenuVisible(false)
  }

  const handleEditPress = () => {
    const post = selectedPost
    closeMenu()
    navigation.navigate("CreatePostScreen", { post, edit: true })
  }

  const handleDeletePress = () => {
    const post = selectedPost
    closeMenu()
    setDeleteTarget(post)
    setDeleteVisible(true)
  }

  const cancelDelete = () => {
    if (deleting) return
    setDeleteVisible(false)
    setDeleteTarget(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/blog/delete-post/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setAllPosts((prev) => prev.filter((p) => p._id !== deleteTarget._id))
      }
    } catch (err) {
      console.log(err)
    } finally {
      setDeleting(false)
      setDeleteVisible(false)
      setDeleteTarget(null)
    }
  }

  const renderPost = (item) => (
    <View className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#121216] shadow-lg">
      {renderMedia(item)}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text className="text-[15px] font-semibold text-white">{item.title || "Untitled"}</Text>
            {item.desc ? (
              <Text className="mt-1 text-[13px] leading-5 text-zinc-400">{item.desc}</Text>
            ) : null}
          </View>
          <Pressable
            ref={(r) => (menuButtonRefs.current[item._id] = r)}
            onPress={() => openMenu(item)}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] active:bg-white/[0.09]"
          >
            <MoreVertical size={18} color="#A1A1AA" />
          </Pressable>
        </View>
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
      <View className="flex-row items-center mb-5">
        <Pressable
          onPress={() => navigation.navigate("CreatePostScreen")}
          className="flex-1 flex-row items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 py-3.5 active:opacity-70"
        >
          <PlusCircle size={16} color="#A78BFA" />
          <Text className="ml-2 text-[14px] font-semibold text-purple-300">Create a Post</Text>
        </Pressable>

        {allPosts.length > 0 ? (
          <Pressable
            onPress={() => fetchPosts(true)}
            disabled={refreshing}
            className="ml-3 h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] active:bg-white/[0.07]"
          >
            {refreshing ? (
              <ActivityIndicator color="#A78BFA" size="small" />
            ) : (
              <RefreshCw size={16} color="#A78BFA" />
            )}
          </Pressable>
        ) : null}
      </View>

      {allPosts.length === 0 ? (
        <View className="items-center justify-center rounded-[28px] border border-dashed border-white/[0.12] bg-white/[0.02] py-14">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6]/15">
            <ImageOff size={24} color="#A78BFA" />
          </View>
          <Text className="text-[15px] font-semibold text-zinc-200">No posts yet</Text>
          <Text className="mt-1 text-[13px] text-zinc-600">Share your first post with the world</Text>
        </View>
      ) : (
        <Swiper
          style={{ height: SLIDE_HEIGHT }}
          loop={false}
          autoplay={false}
          showsButtons={false}
          onIndexChanged={handleIndexChanged}
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

      <PostOptionsMenu
        visible={menuVisible}
        position={menuPosition}
        onClose={closeMenu}
        onEdit={handleEditPress}
        onDelete={handleDeletePress}
      />

      <DeleteConfirmModal
        visible={deleteVisible}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete post"
        message="This action cannot be undone. Are you sure you want to delete this post?"
      />

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