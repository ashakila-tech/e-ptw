import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

// In-component styles for the web date picker popup.
const WebDatePickerStyles = () => (
  <style>
    {`
      .rdtPicker {
        background-color: white !important;
        z-index: 9999 !important;
        border: 1px solid #ccc !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2) !important;
      }
    `}
  </style>
);

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export default function DatePickerField({ value, onChange }: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  // --- Web Implementation ---
  if (Platform.OS === "web") {
    const handleWebChange = (momentDate: any) => {
      // react-datetime returns a Moment.js object or a string
      if (momentDate && typeof momentDate.toDate === "function") {
        onChange(momentDate.toDate());
      } else {
        onChange(null);
      }
    };

    return (
      <View>
        <WebDatePickerStyles />
        <Datetime
          value={value || undefined}
          onChange={handleWebChange}
          inputProps={{
            className: "border border-gray-300 rounded-2xl px-4 py-3 w-full bg-white",
            placeholder: "Select date and time",
          }}
          dateFormat="D MMM YYYY"
          timeFormat="h:mm A"
        />
      </View>
    );
  }

  // --- Native (Android/iOS) Implementation ---
  const onNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === "ios"); // On iOS, the picker is a modal
    if (event.type === "set" && selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      <Pressable onPress={() => setShow(true)} className="border border-gray-300 rounded-2xl px-4 py-3">
        <Text className={value ? "text-black" : "text-gray-400"}>
          {value ? format(value, "PPP p") : "Select date and time"}
        </Text>
      </Pressable>
      {show && <DateTimePicker value={value || new Date()} mode="datetime" display="default" onChange={onNativeChange} />}
    </View>
  );
}