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

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const year = date.getFullYear();

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[date.getMonth()];

    // 12-hour time format
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // convert 0 to 12

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setPickerVisible(true)}
        className="border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50"
      >
        <Text className="text-gray-900">
          {value ? formatDate(value) : "Select date & time"}
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