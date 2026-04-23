// mobile/navigation/ConsumerTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import HomeScreen from './screens/shared/HomeScreen';
import ScannerScreen from './screens/shared/ScannerScreen';
import ProductDetailScreen from './screens/shared/ProductDetailScreen';
import FavoritesScreen from './screens/consumer/FavoritesScreen';
import HistoryScreen from './screens/consumer/HistoryScreen';
import CommentsScreen from './screens/consumer/CommentsScreen';
import ChatbotScreen from './screens/consumer/ChatbotScreen';
import ProfileScreen from './screens/consumer/ProfileScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const TAB_COLOR = '#16a34a';

const icon = (emoji) => ({ focused }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

// Stack pour l'onglet Accueil (inclut Scanner + Détail)
function HomeStackNav() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: TAB_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scanner' }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produit' }} />
      <HomeStack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
      <HomeStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
      <HomeStack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Commentaires' }} />
    </HomeStack.Navigator>
  );
}

export default function ConsumerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: TAB_COLOR,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: TAB_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStackNav}
        options={{ headerShown: false, tabBarIcon: icon('🏠') }}
      />
      <Tab.Screen
        name="Favoris"
        component={FavoritesScreen}
        options={{ title: 'Mes Favoris', tabBarIcon: icon('❤️') }}
      />
      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{ title: 'Historique', tabBarIcon: icon('🕐') }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{ title: 'Assistant', tabBarIcon: icon('💬') }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ title: 'Mon Profil', tabBarIcon: icon('👤') }}
      />
    </Tab.Navigator>
  );
}
