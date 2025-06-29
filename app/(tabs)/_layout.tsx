import { Stack, Tabs } from 'expo-router';
import { defaultRouteInfo } from 'expo-router/build/global-state/routeInfo';
import React from 'react';

const _Layout = () => {
    return (
        <Tabs>
            <Tabs.Screen 
                name='browse'
                options={{
                    title: "Browse",
                    headerShown: true
                }}
            />
            <Tabs.Screen 
                name='index'
                options={{
                    title: "Home",
                    headerShown: false
                }}
            />
            <Tabs.Screen 
                name='cart'
                options={{
                    title: "Cart",
                    headerShown: true
                }}
            /> 
        </Tabs>
    )
}

export default _Layout
