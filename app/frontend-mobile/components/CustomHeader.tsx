import React from "react";
import { View, Text, Pressable, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

type CustomHeaderProps = {
  title: string;
  onBack?: () => void;
};

export default function CustomHeader({ title, onBack }: CustomHeaderProps) {
  return (
    <View
      style={{
        width: "100%",
        height: 56 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
        backgroundColor: Colors.bg1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      {onBack && (
        <Pressable onPress={onBack} style={{ padding: 8, marginRight: 16 }}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>
      )}
      <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>{title}</Text>
    </View>
  );
}