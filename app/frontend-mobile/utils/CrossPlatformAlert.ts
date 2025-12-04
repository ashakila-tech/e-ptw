import { Alert, Platform } from "react-native";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

/**
 * Displays a platform-specific alert.
 * On native, it uses `Alert.alert`.
 * On web, it uses `alert()` for simple messages and `confirm()` for dialogs with buttons.
 */
export function crossPlatformAlert(
  title: string,
  message: string,
  buttons?: AlertButton[],
  options?: { cancelable?: boolean }
) {
  if (Platform.OS === "web") {
    // Simple alert with no buttons
    if (!buttons || buttons.length === 0) {
      alert(`${title}\n\n${message}`);
      return;
    }

    // Confirmation dialog (handles up to two buttons: confirm/cancel)
    const confirmButton = buttons.find((b) => b.style !== "cancel");
    const cancelButton = buttons.find((b) => b.style === "cancel");

    if (window.confirm(`${title}\n\n${message}`)) {
      if (confirmButton?.onPress) {
        confirmButton.onPress();
      }
    } else {
      if (cancelButton?.onPress) {
        cancelButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons, options);
  }
}