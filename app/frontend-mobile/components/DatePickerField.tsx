import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: "date" | "time" | "datetime";
}

export default function DatePickerField({
  value,
  onChange,
  mode = "datetime",
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  // Internal date state for native pickers
  const [internalDate, setInternalDate] = useState<Date>(
    value || new Date()
  );

  const [currentPickerMode, setCurrentPickerMode] = useState<
    "date" | "time"
  >("date");

  useEffect(() => {
    if (value) {
      setInternalDate(value);
    }
  }, [value]);

  // =========================
  // WEB IMPLEMENTATION
  // =========================
  if (Platform.OS === "web") {
    const handleWebChange = (momentDate: any) => {
      if (momentDate && typeof momentDate.toDate === "function") {
        onChange(momentDate.toDate());
      } else {
        onChange(null);
      }
    };

    return (
      <View>
        <Datetime
          value={value || undefined}
          onChange={handleWebChange}
          inputProps={{
            className:
              "border border-gray-300 rounded-2xl px-4 py-3 w-full bg-white",
            placeholder:
              mode === "date"
                ? "Select date"
                : mode === "time"
                ? "Select time"
                : "Select date and time",
          }}
          dateFormat={mode !== "time" ? "D MMM YYYY" : false}
          timeFormat={mode !== "date" ? "h:mm A" : false}
        />
      </View>
    );
  }

  // =========================
  // NATIVE IMPLEMENTATION
  // =========================

  const showPicker = (pickerMode: "date" | "time") => {
    setCurrentPickerMode(pickerMode);
    setShow(true);
  };

  const handleNativeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "dismissed") {
      setShow(false);
      return;
    }

    const chosenDate = selectedDate || internalDate;
    setInternalDate(chosenDate);

    if (mode === "datetime" && currentPickerMode === "date") {
      // After selecting date, show time picker
      showPicker("time");
      return;
    }

    onChange(chosenDate);
    setShow(false);
  };

  const getDisplayValue = () => {
    if (!value) {
      if (mode === "date") return "Select date";
      if (mode === "time") return "Select time";
      return "Select date and time";
    }

    if (mode === "date") return format(value, "PPP");
    if (mode === "time") return format(value, "p");
    return format(value, "PPP p");
  };

  return (
    <View>
      <Pressable
        onPress={() =>
          showPicker(mode === "time" ? "time" : "date")
        }
        className="border border-gray-300 rounded-2xl px-4 py-3"
      >
        <Text className={value ? "text-black" : "text-gray-400"}>
          {getDisplayValue()}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={internalDate}
          mode={currentPickerMode}
          display="default"
          onChange={handleNativeChange}
        />
      )}
    </View>
  );
}