import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import { UserProvider } from "@/contexts/UserContext"; // import context provider

export default function RootLayout() {
  // const colorScheme = useColorScheme(); // original dynamic theme
  const colorScheme = "light"; // Force light theme
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <UserProvider> {/* wrap everything inside UserProvider */}
      {/* Original dynamic theme logic:
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}> */}
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {/* Index (landing page) will load first */}
          <Stack.Screen name="index"/>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </UserProvider>
  );
}