import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Home, Target, Camera, Activity, User } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: '5%',
          right: '5%',
          height: 72,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 24,
          elevation: 0,
          shadowOpacity: 0,
        },
        sceneStyle: {
          backgroundColor: '#0A0A0A',
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Home
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              color={focused ? Colors.pastelPurple : 'rgba(255,255,255,0.5)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rules"
        options={{
          tabBarIcon: ({ focused }) => (
            <Target
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              color={focused ? Colors.pastelPink : 'rgba(255,255,255,0.5)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          tabBarIcon: () => (
            <View
              className="bg-pastel-orange rounded-full p-4 -mt-10"
              style={{
                shadowColor: Colors.pastelOrange,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              <Camera size={28} strokeWidth={2.5} color="#000" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => (
            <Activity
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              color={focused ? Colors.pastelYellow : 'rgba(255,255,255,0.5)'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <User
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              color={focused ? Colors.pastelGreen : 'rgba(255,255,255,0.5)'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
