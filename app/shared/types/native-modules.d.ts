declare module 'expo-constants' {
  const Constants: {
    expoConfig?: {
      extra?: {
        API_BASE_URL?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  export default Constants;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    [key: string]: any;
  };
  export default AsyncStorage;
}
