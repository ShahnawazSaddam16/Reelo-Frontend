import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { X, Send, Trash2, User } from "lucide-react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

function getInitial(name) {
  if (!name) return "?";
  return String(name).trim().charAt(0).toUpperCase();
}

function resolveAvatarUrl(path, apiUrl) {
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
  const baseUrl = apiUrl.replace(/\/api$/, "");
  return `${baseUrl}/${String(p).replace(/\\/g, "/")}`;
}

export default function PostCommentsModal({
  visible,
  postId,
  apiUrl,
  token,
  currentUserId,
  onClose,
  onCommentCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const onCommentCountChangeRef = useRef(onCommentCountChange);
  useEffect(() => {
    onCommentCountChangeRef.current = onCommentCountChange;
  }, [onCommentCountChange]);

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

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiUrl}/blog/${postId}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await parseResponse(res);
      if (!res.ok) throw new Error(json?.message || json?.bodyText || "Failed to load comments");
      const list = Array.isArray(json.comments) ? json.comments : [];
      setComments(list);
      onCommentCountChangeRef.current?.(postId, list.length);
    } catch (e) {
      console.error("Fetch comments error", e);
      setError(e.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, apiUrl, token]);

  useEffect(() => {
    if (visible && postId) {
      fetchComments();
    }
    if (!visible) {
      setCommentText("");
      setError(null);
    }
  }, [visible, postId, fetchComments]);

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || !postId || posting) return;

    try {
      setPosting(true);
      const res = await fetch(`${apiUrl}/blog/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      const json = await parseResponse(res);
      if (!res.ok) throw new Error(json?.message || json?.bodyText || "Failed to post comment");

      const newComment = json.comment;
      setComments((prev) => {
        const updated = newComment ? [...prev, newComment] : prev;
        onCommentCountChangeRef.current?.(postId, updated.length);
        return updated;
      });
      setCommentText("");
    } catch (e) {
      console.error("Post comment error", e);
      setError(e.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!postId || !commentId || deletingId) return;
    try {
      setDeletingId(commentId);
      const res = await fetch(
        `${apiUrl}/blog/${postId}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await parseResponse(res);
      if (!res.ok) throw new Error(json?.message || json?.bodyText || "Failed to delete comment");

      setComments((prev) => {
        const updated = prev.filter((c) => String(c._id || c.id) !== String(commentId));
        onCommentCountChangeRef.current?.(postId, updated.length);
        return updated;
      });
    } catch (e) {
      console.error("Delete comment error", e);
      setError(e.message || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  const renderComment = ({ item }) => {
    const commentId = item._id || item.id;
    const commenterId =
      item.userId?._id ||
      item.userId ||
      item.user?._id ||
      item.user ||
      item.profileId?._id ||
      item.profileId ||
      null;
    const isMine = currentUserId && String(commenterId) === String(currentUserId);

    const avatarSource =
      item.avator ||
      item.avatar ||
      item.profileId?.avator ||
      item.profileId?.avatar ||
      item.user?.avator ||
      item.user?.avatar ||
      null;
    const avatarUrl = resolveAvatarUrl(avatarSource, apiUrl);

    return (
      <View className="flex-row px-4 py-3 border-b border-white/5">
        <View className="h-9 w-9 rounded-full bg-[#1B1B1F] border border-white/10 items-center justify-center mr-3 overflow-hidden">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              resizeMode="cover"
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <Text className="text-white/70 text-xs font-semibold">
              {getInitial(item.username)}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-sm font-semibold">
              {item.username || "Unknown"}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white/40 text-xs mr-3">
                {timeAgo(item.createdAt)}
              </Text>
              {isMine ? (
                <TouchableOpacity
                  onPress={() => handleDeleteComment(commentId)}
                  disabled={deletingId === commentId}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {deletingId === commentId ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Trash2 size={14} color="#EF4444" />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
          <Text className="text-white/80 text-sm mt-1">{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}
        >
          <View className="bg-[#0E0E10] rounded-t-3xl overflow-hidden border border-white/10">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
              <Text className="text-white text-base font-semibold">
                Comments
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 40 }} className="items-center justify-center">
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : error ? (
              <View style={{ paddingVertical: 30 }} className="items-center justify-center px-4">
                <Text className="text-red-400 text-center mb-3">{error}</Text>
                <TouchableOpacity
                  onPress={fetchComments}
                  className="bg-white/10 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : comments.length === 0 ? (
              <View style={{ paddingVertical: 40 }} className="items-center justify-center">
                <User size={22} color="#A1A1AA" />
                <Text className="text-white/50 mt-2">
                  No comments yet. Be the first!
                </Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item, idx) => item._id || item.id || String(idx)}
                renderItem={renderComment}
                style={{ maxHeight: SCREEN_HEIGHT * 0.5 }}
                showsVerticalScrollIndicator={false}
              />
            )}

            <View className="flex-row items-center px-4 py-3 border-t border-white/10">
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="flex-1 bg-white/5 rounded-full px-4 py-2.5 text-white mr-3"
                editable={!posting}
                multiline
              />
              <TouchableOpacity
                onPress={handlePostComment}
                disabled={!commentText.trim() || posting}
                className={`h-10 w-10 rounded-full items-center justify-center ${
                  commentText.trim() && !posting ? "bg-purple-600" : "bg-white/10"
                }`}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}