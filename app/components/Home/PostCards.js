import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { X, MessageCircle, Heart, User } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "http://192.168.100.77:5015/api";

const SCREEN_WIDTH = Dimensions.get("window").width;

function resolveMediaUrl(path) {
  if (!path) return null;
  let p = path;
  if (typeof p === "object") {
    p = p.url || p.path || p.content || p.file || p.src || null;
  }
  if (!p) return null;
  if (
    typeof p === "string" &&
    (p.startsWith("http://") || p.startsWith("https://"))
  )
    return p;
  const baseUrl = API_URL.replace(/\/api$/, "");
  return `${baseUrl}/${String(p).replace(/\\/g, "/")}`;
}

function isVideoItem(m) {
  if (!m) return false;
  if (m.contentType) return String(m.contentType).startsWith("video");
  if (typeof m === "string")
    return m.endsWith(".mp4") || m.endsWith(".mov") || m.endsWith(".webm");
  return false;
}

export default function PostCards() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const navigation = useNavigation();
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/blog/all-posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load posts");
      const list = json.allposts || json.posts || json.data || [];
      setPosts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("PostCards fetch error", e);
      setError(e.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openComments = (id) => {
    setCommentText("");
    setShowCommentsFor(id);
  };

  const goToProfile = (profileId) => {
    if (!profileId) return;
    navigation.navigate("UserProfileScreen", { profileId });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white mt-3">Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-red-400 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={fetchAllPosts}
          className="bg-white px-5 py-3 rounded-xl"
        >
          <Text className="text-black font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 120 }}
      >
        {posts.length > 0 ? (
          posts.map((item) => {
            const mediaItem = Array.isArray(item.content)
              ? item.content[0]
              : (item.content ?? item);
            const mediaUrl = resolveMediaUrl(mediaItem || item);
            const mediaIsVideo = isVideoItem(mediaItem || item);
            const avatarUrl = resolveMediaUrl(
              item.profileId?.avator || item.profileId?.avatar,
            );
            const authorName =
              item.profileId?.username || item.email || "Unknown user";
            const authorProfileId = item.profileId?._id || item.profileId;
            return (
              <View
                key={item._id || item.id}
                className=" mb-5 bg-[#111113] rounded-2xl overflow-hidden border border-white/10"
              >
                <TouchableOpacity
                  onPress={() => goToProfile(authorProfileId)}
                  activeOpacity={0.8}
                  className="flex-row items-center justify-start px-4 pt-4 mb-3"
                >
                  <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#1B1B1F] border border-white/10">
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        resizeMode="cover"
                        style={{ width: 36, height: 36, borderRadius: 18 }}
                      />
                    ) : (
                      <User size={16} color="#A1A1AA" />
                    )}
                  </View>
                  <Text className="ml-2.5 text-white text-[14px] font-semibold">
                    {authorName}
                  </Text>
                </TouchableOpacity>

                {/* Image */}
                {mediaUrl ? (
                  mediaIsVideo ? (
                    <Video
                      source={{ uri: mediaUrl }}
                      style={{ width: SCREEN_WIDTH, height: 260 }}
                      useNativeControls
                      resizeMode="cover"
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setViewerUri(mediaUrl);
                        setViewerVisible(true);
                      }}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: mediaUrl }}
                        style={{ width: SCREEN_WIDTH, height: 260 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )
                ) : (
                  <View className="w-full h-60 bg-white/5 items-center justify-center">
                    <Text className="text-white/40">No Image</Text>
                  </View>
                )}

                {/* Details */}
                <View className="px-4 py-4">
                  {item.title ? (
                    <Text className="text-white text-lg font-semibold">
                      {item.title}
                    </Text>
                  ) : null}

                  {item.desc ? (
                    <Text className="text-white/60 mt-2">{item.desc}</Text>
                  ) : null}

                  <View className="flex-row items-center mt-1 justify-between">
                    <Text className="text-white text-xs opacity-60">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </Text>

                    <View className="flex-row items-center">
                      <TouchableOpacity className="flex-row items-center mr-4">
                        <Heart size={16} color="#FB7185" />
                        <Text className="ml-2 text-white">
                          {item.likes || 0}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openComments(item._id)}
                        className="flex-row items-center"
                      >
                        <MessageCircle size={16} color="#A78BFA" />
                        <Text className="ml-2 text-white">
                          {(item.comments && item.comments.length) || 0}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-white text-lg">No posts yet</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!showCommentsFor}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCommentsFor(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#000",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{ width: SCREEN_WIDTH - 48 }}
            className="bg-[#0E0E10] p-4 rounded-2xl"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg">Add comment</Text>
              <TouchableOpacity onPress={() => setShowCommentsFor(null)}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="bg-white/5 rounded p-3 text-white mb-3"
            />

            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => {
                  setCommentText("");
                  setShowCommentsFor(null);
                }}
                className="px-4 py-2 bg-blue-600 rounded"
              >
                <Text className="text-white">Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setViewerVisible(false);
          setViewerUri(null);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.98)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setViewerVisible(false);
              setViewerUri(null);
            }}
            style={{
              position: "absolute",
              top: 48,
              right: 20,
              zIndex: 10,
              padding: 8,
            }}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {viewerUri ? (
            <Image
              source={{ uri: viewerUri }}
              style={{ width: SCREEN_WIDTH, height: "80%" }}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>
    </>
  );
}