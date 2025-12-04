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
  // --- State for multi-step native picker ---
  const [date, setDate] = useState(value || new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');

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
  const showPicker = (currentMode: 'date' | 'time') => {
    setShow(true);
    setMode(currentMode);
  };

  const onNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;

    // On Android, the picker is dismissed automatically. On iOS, we need to hide it.
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set') {
      setDate(currentDate);
      if (mode === 'date') {
        // After picking a date, automatically show the time picker.
        showPicker('time');
      } else {
        // After picking a time, the process is complete.
        onChange(currentDate);
        if (Platform.OS === 'ios') setShow(false); // Hide iOS picker
      }
    } else {
      // User cancelled, hide the picker.
      setShow(false);
    }
  };

  return (
    <View>
      <Pressable onPress={() => showPicker('date')} className="border border-gray-300 rounded-2xl px-4 py-3">
        <Text className={value ? "text-black" : "text-gray-400"}>
          {value ? format(value, "PPP p") : "Select date and time"}
        </Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode={mode} // Use dynamic mode ('date' then 'time')
          display="default"
          onChange={onNativeChange}
        />
      )}
    </View>
  );
}