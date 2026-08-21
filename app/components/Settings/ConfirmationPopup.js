import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

export default function ConfirmationPopup({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  destructive,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable onPress={onCancel} className="flex-1 bg-black/70 justify-center items-center px-6">
        <Pressable className="w-full bg-[#18181B] rounded-2xl p-5">
          <Text className="text-white text-lg font-semibold text-center">{title}</Text>
          <Text className="text-[#A1A1AA] text-sm text-center mt-2">{message}</Text>

          <View className="w-full flex-row mt-6">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 rounded-xl bg-[#27272A] mr-2 items-center"
            >
              <Text className="text-white text-base font-medium">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 py-3 rounded-xl ml-2 items-center ${destructive ? 'bg-[#EF4444]' : 'bg-[#8B5CF6]'}`}
            >
              <Text className="text-white text-base font-medium">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}