import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function DatePickerField({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (date: Date) => void;
}) {
  const [isPickerVisible, setPickerVisible] = useState(false);

  const handleConfirm = (date: Date) => {
    onChange(date);
    setPickerVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        className="border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50"
      >
        <Text className="text-gray-900">
          {value ? value.toLocaleString() : "Select date & time"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isPickerVisible}
        mode="datetime"
        date={value || new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setPickerVisible(false)}
      />
    </View>
  );
}