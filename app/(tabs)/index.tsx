import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-full w-full bg-background flex items-center justify-center gap-5">
      <Text className="text-5xl text-primary outline outline-5 outline-accent p-4 rounded-md ">Welcome</Text>
      <Text className="text-3xl text-accent ">Accent Color</Text>

      <Link href={"./scan"}> Scan </Link>

    </View>
  );
}
