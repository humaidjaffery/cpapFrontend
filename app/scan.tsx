import { StyleSheet, Text, View } from 'react-native';
import React from 'react'; 
import { Link } from 'expo-router';

const  Scan = () => {
    return (
        <View className="h-full w-full bg-background flex items-center justify-center gap-5">
              <Text className="text-5xl text-primary outline outline-5 outline-accent p-4 rounded-md ">Prepare To Scan</Text>
              <Text className="text-3xl text-accent "> Ensure Ample Lighting </Text>
        
              <Link href={{
                pathname: "/(tabs)/cart"
              }}> Home </Link>
        
        </View>
    )
}

export default Scan
const styles = StyleSheet.create({})