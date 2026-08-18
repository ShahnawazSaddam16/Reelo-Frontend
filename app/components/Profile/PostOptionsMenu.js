import React, { useRef, useEffect } from "react"
import { Modal, TouchableOpacity, View, Text, Animated } from "react-native"
import { Pencil, Trash2, X } from "lucide-react-native"

export default function PostOptionsMenu({ visible, position = { bottom: 60, right: 12 }, onClose, onEdit, onDelete }) {
  const scale = useRef(new Animated.Value(0.85)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 90 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start()
    } else {
      scale.setValue(0.85)
      opacity.setValue(0)
    }
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={{
            position: "absolute",
            bottom: position.bottom,
            right: position.right,
            width: 190,
            borderRadius: 18,
            paddingVertical: 6,
            backgroundColor: "#18181D",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            opacity,
            transform: [{ scale }],
          }}
        >
          <TouchableOpacity
            onPress={onEdit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Pencil size={16} color="#A78BFA" />
            <Text style={{ marginLeft: 10, color: "#EDE9FE", fontWeight: "600", fontSize: 14 }}>
              Edit
            </Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <TouchableOpacity
            onPress={onDelete}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Trash2 size={16} color="#FB7185" />
            <Text style={{ marginLeft: 10, color: "#FB7185", fontWeight: "600", fontSize: 14 }}>
              Delete
            </Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
          <TouchableOpacity
            onPress={onClose}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <X size={16} color="#9CA3AF" />
            <Text style={{ marginLeft: 10, color: "#9CA3AF", fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  )
}
