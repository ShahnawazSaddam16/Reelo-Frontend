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
import { useVideoPlayer, VideoView } from "expo-video"
import Swiper from "react-native-swiper"
import { useNavigation } from "@react-navigation/native"
import { PlusCircle, ImageOff, FileText, MoreVertical, X, RefreshCw, Heart, MessageCircle, Calendar } from "lucide-react-native"
import { useAuth } from "../../../contexts/AuthContext"
import PostOptionsMenu from "./PostOptionsMenu"
import DeleteConfirmModal from "./DeleteConfirmmodal"

const PAGE_SIZE = 6
const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height
const SLIDE_HEIGHT = 420

function PostVideoSlide({ uri }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false
  })

  return (
    <VideoView
      player={player}
      style={{ width: SCREEN_WIDTH - 40, height: 260 }}
      nativeControls
      contentFit="cover"
    />
  )
}

export default function ManagingPosts({ onPostsUpdated }) {
const API_URL = "https://api.reelo.buttnetworks.com/api";
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

  const fetchPosts = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const res = await fetch(`${API_URL}/blog/my-posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const ct = res.headers.get('content-type') || '';
      let data;
      if (ct.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text().catch(() => '');
          data = { success: false, message: text || 'Non-JSON response from server' };
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { success: false, message: text || 'Non-JSON response from server' };
      }

      if (data && data.success) {
        setAllPosts(data.userPosts || [])
        setVisibleCount(PAGE_SIZE)
        if (typeof onPostsUpdated === "function") onPostsUpdated(data.userPosts || [])
      } else {
        console.warn('Unexpected response from blog/my-posts', data)
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
    const unsub = navigation.addListener("focus", () => {
      fetchPosts()
    })
    return unsub
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
      return <PostVideoSlide uri={uri} />
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
        await fetchPosts()
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

        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="flex-row items-center">
              <Heart size={15} color="#FB7185" />
              <Text className="ml-1.5 text-[13px] font-medium text-zinc-300">{getLikesCount(item)}</Text>
            </View>
            <View className="ml-[20px] flex-row items-center">
              <MessageCircle size={15} color="#A78BFA"/>
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