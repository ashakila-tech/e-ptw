// components/LoadingScreen.tsx
import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingScreenProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  size = "large",
  color = "#1D4ED8",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#374151", // gray-700
    textAlign: "center",
  },
});