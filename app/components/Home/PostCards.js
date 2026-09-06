import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useNavigation } from "@react-navigation/native";
import { Heart, MessageCircle, User, ImageOff } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import PostCommentsModal from "./PostCommentsModal";

const API_URL = "https://api.reelo.buttnetworks.com/api";

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

function PostVideo({ uri }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width: SCREEN_WIDTH, height: 260 }}
      nativeControls
      contentFit="cover"
    />
  );
}

export default function PostCards() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigation = useNavigation();

  const [showCommentsFor, setShowCommentsFor] = useState(null);

  const [likesState, setLikesState] = useState({});
  const [commentCounts, setCommentCounts] = useState({});

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState(null);

  const currentUserId = user?._id || user?.id || null;

  const parseResponse = async (res) => {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        return await res.json();
      } catch (e) {
        const text = await res.text();
        return { message: "Non-JSON response from server", bodyText: text };
      }
    }
    const text = await res.text();
    return { message: "Non-JSON response from server", bodyText: text };
  };

  useEffect(() => {
    if (token) fetchAllPosts();
  }, [token]);

  const fetchAllPosts = async () => {
    if (!token) return;
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
      const json = await parseResponse(res);
      if (!res.ok) throw new Error(json?.message || json?.bodyText || "Failed to load posts");
      const list = json.allposts || json.posts || json.data || [];
      const safeList = Array.isArray(list) ? list : [];
      setPosts(safeList);

      const initialLikes = {};
      const initialComments = {};
      safeList.forEach((p) => {
        const id = p._id || p.id;
        if (!id) return;
        const likedByMe = Array.isArray(p.likedBy)
          ? p.likedBy.some((uid) => String(uid) === String(currentUserId))
          : false;
        initialLikes[id] = { liked: likedByMe, likes: p.likes || 0 };
        initialComments[id] = Array.isArray(p.comments)
          ? p.comments.length
          : 0;
      });
      setLikesState(initialLikes);
      setCommentCounts(initialComments);
    } catch (e) {
      console.error("PostCards fetch error", e);
      setError(e.message || "Failed to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (postId) => {
    if (!postId) return;

    setLikesState((prev) => {
      const current = prev[postId] || { liked: false, likes: 0 };
      const nextLiked = !current.liked;
      return {
        ...prev,
        [postId]: {
          liked: nextLiked,
          likes: Math.max(0, current.likes + (nextLiked ? 1 : -1)),
        },
      };
    });

    try {
      const res = await fetch(`${API_URL}/blog/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await parseResponse(res);
      if (!res.ok) throw new Error(json?.message || json?.bodyText || "Failed to like post");

      setLikesState((prev) => ({
        ...prev,
        [postId]: { liked: !!json.liked, likes: json.likes ?? 0 },
      }));
    } catch (e) {
      console.error("Like error", e);
      setLikesState((prev) => {
        const current = prev[postId] || { liked: false, likes: 0 };
        const revertedLiked = !current.liked;
        return {
          ...prev,
          [postId]: {
            liked: revertedLiked,
            likes: Math.max(0, current.likes + (revertedLiked ? 1 : -1)),
          },
        };
      });
    }
  };

  const openComments = (id) => {
    setShowCommentsFor(id);
  };

  const closeComments = () => {
    setShowCommentsFor(null);
  };

  const handleCommentCountChange = (postId, newCount) => {
    setCommentCounts((prev) => ({ ...prev, [postId]: newCount }));
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
        contentContainerStyle={
          posts.length > 0
            ? { paddingTop: 10, paddingBottom: 120 }
            : { flexGrow: 1, paddingTop: 10, paddingBottom: 120 }
        }
      >
        {posts.length > 0 ? (
          posts.map((item) => {
            const postId = item._id || item.id;
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

            const likeInfo = likesState[postId] || {
              liked: false,
              likes: item.likes || 0,
            };
            const commentCount =
              commentCounts[postId] ??
              (Array.isArray(item.comments) ? item.comments.length : 0);

            return (
              <View
                key={postId}
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

                {mediaUrl ? (
                  mediaIsVideo ? (
                    <PostVideo uri={mediaUrl} />
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
                      <TouchableOpacity
                        onPress={() => handleToggleLike(postId)}
                        className="flex-row items-center mr-4"
                        activeOpacity={0.7}
                      >
                        <Heart
                          size={16}
                          color="#FB7185"
                          fill={likeInfo.liked ? "#FB7185" : "transparent"}
                        />
                        <Text className="ml-2 text-white">
                          {likeInfo.likes}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openComments(postId)}
                        className="flex-row items-center"
                        activeOpacity={0.7}
                      >
                        <MessageCircle size={16} color="#A78BFA" />
                        <Text className="ml-2 text-white">
                          {commentCount}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
              <ImageOff size={32} color="#A1A1AA" />
            </View>
            <Text className="text-white text-lg font-extrabold">No posts yet</Text>
          </View>
        )}
      </ScrollView>

      <PostCommentsModal
        visible={!!showCommentsFor}
        postId={showCommentsFor}
        apiUrl={API_URL}
        token={token}
        currentUserId={currentUserId}
        onClose={closeComments}
        onCommentCountChange={handleCommentCountChange}
      />

      <Modal
        visible={viewerVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
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
            <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
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