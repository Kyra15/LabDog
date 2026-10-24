import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import type { MainTabParamList } from './types';
import { colors, fonts } from '../theme';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.terracotta,
        tabBarInactiveTintColor: colors.navy,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.navy, borderTopWidth: 1 },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.cream },
        tabBarIcon: ({ focused, color, size }) => {
          const name =
            route.name === 'Library'
              ? focused ? 'documents' : 'documents-outline'
              : focused ? 'chatbubbles' : 'chatbubbles-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Library" component={HomeScreen} />
      <Tab.Screen name="Assistant" component={ChatScreen} />
    </Tab.Navigator>
  );
}