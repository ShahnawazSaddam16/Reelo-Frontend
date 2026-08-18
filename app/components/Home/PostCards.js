import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = 'http://192.168.100.77:5015/api';

const SCREEN_WIDTH = Dimensions.get('window').width

function resolveMediaUrl(path) {
  if (!path) return null
  let p = path
  if (typeof p === 'object') {
    p = p.url || p.path || p.content || p.file || p.src || null
  }
  if (!p) return null
  if (typeof p === 'string' && (p.startsWith('http://') || p.startsWith('https://'))) return p
  const baseUrl = API_URL.replace(/\/api$/, '')
  return `${baseUrl}/${String(p).replace(/\\/g, '/')}`
}

export default function PostCards() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const {token} = useAuth();
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/blog/all-posts`,{
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to load posts');
      const list = json.allposts || json.posts || json.data || [];
      setPosts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('PostCards fetch error', e);
      setError(e.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openComments = (id) => {
    setCommentText('');
    setShowCommentsFor(id);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
        <Text className="text-white/50 mt-3">Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Text className="text-red-400 text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={fetchAllPosts} className="bg-white px-5 py-3 rounded-xl">
          <Text className="text-black font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 30 }}
      >
        {posts.length > 0 ? (
          posts.map((item) => {
            const imageUrl = resolveMediaUrl(item.content || item);
            return (
              <View
                key={item._id || item.id}
                className="mx-4 mb-5 bg-[#111113] rounded-2xl overflow-hidden border border-white/10"
              >
                {/* Image */}
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={{ width: SCREEN_WIDTH - 32, height: 260 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-60 bg-white/5 items-center justify-center">
                        <Text className="text-white/40">No Image</Text>
                      </View>
                    )}

                {/* Details */}
                <View className="px-4 py-4">
                  {item.title ? (
                    <Text className="text-white text-lg font-semibold">{item.title}</Text>
                  ) : null}

                  {item.desc ? (
                    <Text className="text-white/60 mt-2">{item.desc}</Text>
                  ) : null}

                  <View className="flex-row items-center mt-4 justify-between">
                    <View className="flex-row items-center">
                      <View className="bg-white/5 rounded-full px-4 py-2">
                        <Text className="text-white/70">♥ {item.likes || 0} likes</Text>
                      </View>

                      <TouchableOpacity onPress={() => openComments(item._id)} className="ml-3">
                        <View className="bg-white/5 rounded-full px-4 py-2">
                          <Text className="text-white">Comments</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    <Text className="text-white text-xs opacity-60">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                    </Text>
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

      <Modal visible={!!showCommentsFor} transparent animationType="fade" onRequestClose={() => setShowCommentsFor(null)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#0E0E10] p-4 rounded-t-2xl">
            <Text className="text-white text-lg mb-2">Add comment</Text>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Write a comment..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="bg-white/5 rounded p-3 text-white mb-3"
            />

            <View className="flex-row justify-between">
              <TouchableOpacity onPress={() => setShowCommentsFor(null)} className="px-4 py-2">
                <Text className="text-white">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setCommentText('');
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
    </>
  );
}
 