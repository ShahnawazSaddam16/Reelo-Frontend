import React, { useState } from 'react'
import { Modal, View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { X, Upload, AlertCircle } from 'lucide-react-native'

const API_URL = "https://api.reelo.buttnetworks.com/api";

export default function CreateStory({ visible, onClose, token, onCreated }) {
  const [media, setMedia] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const safeParseJSON = async (res) => {
    try {
      return await res.json()
    } catch (e) {
      const text = await res.text().catch(() => '')
      return { success: false, message: text || 'Non-JSON response from server' }
    }
  }

  const pickMedia = async () => {
    setError(null)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    })
    if (!result.canceled) setMedia(result.assets[0])
  }

  const handleUpload = async () => {
    if (!media) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', {
        uri: media.uri,
        name: media.fileName || `story.${media.uri.split('.').pop()}`,
        type: media.type === 'video' ? 'video/mp4' : 'image/jpeg',
      })

      const res = await fetch(`${API_URL}/story/create-story`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await safeParseJSON(res)

      if (data && data.success) {
        setMedia(null)
        onCreated()
        onClose()
      } else {
        setError(data?.message || 'Could not upload your story')
      }
    } catch (err) {
      setError('Something went wrong. Check your connection and try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#0E0E10' }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 50, paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text className="text-white text-lg font-semibold">Create Story</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={pickMedia}
            style={{
              height: 420,
              marginTop: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}
          >
            {media ? (
              <Image source={{ uri: media.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Upload size={32} color="#a855f7" />
                <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Tap to select photo or video</Text>
              </View>
            )}
          </TouchableOpacity>

          {error && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.25)',
              }}
            >
              <AlertCircle size={16} color="#f87171" />
              <Text style={{ color: '#f87171', marginLeft: 8, fontSize: 13, flex: 1 }}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleUpload}
            disabled={!media || uploading}
            style={{
              backgroundColor: media ? '#a855f7' : 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            {uploading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-semibold">Share Story</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}