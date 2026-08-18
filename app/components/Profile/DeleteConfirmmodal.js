import React from "react"
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native"

export default function DeleteConfirmModal({ visible, onCancel, onConfirm, title = "Confirm", message = "Are you sure?", loading = false }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: "86%", borderRadius: 12, padding: 16, backgroundColor: "#0E0E10", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
          <Text style={{ color: "#EDE9FE", fontWeight: "700", fontSize: 16, marginBottom: 8 }}>{title}</Text>
          <Text style={{ color: "#A1A1AA", fontSize: 14, marginBottom: 16 }}>{message}</Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity onPress={onCancel} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 10, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)" }}>
              <Text style={{ color: "#9CA3AF", fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: "#4C1D95" }} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#F8F3FF", fontWeight: "700" }}>Delete</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
