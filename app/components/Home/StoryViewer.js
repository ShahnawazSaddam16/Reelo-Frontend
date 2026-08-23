import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { X, Heart, Eye } from 'lucide-react-native'

export default function StoryViewer({ visible, onClose, story, avatar }) {
  const [liked, setLiked] = useState(false)

  if (!story) return null

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#0E0E10' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 }}>
          <Image source={{ uri: avatar }} style={{ width: 34, height: 34, borderRadius: 17 }} />
          <Text className="text-white ml-3 font-semibold">You</Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
            <X size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, marginTop: 16 }}>
          {story.mediaType === 'video' ? (
            <Video
              source={{ uri: story.content }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
          ) : (
            <Image source={{ uri: story.content }} style={{ flex: 1 }} resizeMode="cover" />
          )}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Eye size={16} color="rgba(255,255,255,0.6)" />
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 6, fontSize: 13 }}>
              Seen by {story.views?.length || 0}
            </Text>
          </View>

          <TouchableOpacity onPress={() => setLiked(!liked)}>
            <Heart size={26} color={liked ? '#a855f7' : '#fff'} fill={liked ? '#a855f7' : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}