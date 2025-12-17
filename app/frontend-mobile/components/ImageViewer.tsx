import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export default function ImageViewer({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const pinch = Gesture.Pinch().onUpdate(e => {
    scale.value = Math.min(Math.max(1, e.scale), 4);
  });

  const pan = Gesture.Pan().onUpdate(e => {
    x.value = e.translationX;
    y.value = e.translationY;
  });

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: x.value },
      { translateY: y.value },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
      <Animated.Image
        source={{ uri }}
        style={[{ width: "100%", height: "100%" }, style]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
}
