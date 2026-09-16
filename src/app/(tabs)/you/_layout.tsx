import Stack from 'expo-router/stack';

export default function YouLayout() {
  return <Stack screenOptions={{ headerShown: false, fullScreenGestureEnabled: true }} />;
}
