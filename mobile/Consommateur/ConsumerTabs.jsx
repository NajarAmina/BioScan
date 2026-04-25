// mobile/Consommateur/ConsumerTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { Home, Heart, Clock, MessageSquare, User } from 'lucide-react-native';

// ─── Screens partagés ───────────────────────────────────────────────────────
import HomeScreen from './screens/shared/HomeScreen';
import ScannerScreen from './screens/shared/ScannerScreen';
import ProductDetailScreen from './screens/shared/ProductDetailScreen';

// ─── Screens consommateur ────────────────────────────────────────────────────
import FavoritesScreen from './screens/consumer/FavoritesScreen';
import HistoryScreen from './screens/consumer/HistoryScreen';
import CommentsScreen from './screens/consumer/CommentsScreen';
import ChatbotScreen from './screens/consumer/ChatbotScreen';
import ProfileScreen from './screens/consumer/ProfileScreen';

// ─── Screens auth ────────────────────────────────────────────────────────────
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

const TAB_COLOR = '#16a34a';
const TAB_INACTIVE = '#9ca3af';
const ICON_SIZE = 22;

// ─── Stack Accueil ────────────────────────────────────────────────────────────
function HomeStackNav() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: TAB_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scanner' }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Produit' }} />
      <HomeStack.Screen name="Comments" component={CommentsScreen} options={{ title: 'Commentaires' }} />
      <HomeStack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
      <HomeStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
    </HomeStack.Navigator>
  );
}

// ─── Tab Principal ────────────────────────────────────────────────────────────
export default function ConsumerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: TAB_COLOR,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 12,
          right: 12,
          height: Platform.OS === 'ios' ? 72 : 64,
          borderRadius: 22,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          paddingBottom: Platform.OS === 'ios' ? 10 : 6,
          paddingTop: 6,
          paddingHorizontal: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 2,
        },
        headerStyle: { backgroundColor: TAB_COLOR },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStackNav}
        options={{
          headerShown: false,
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Favoris"
        component={FavoritesScreen}
        options={{
          title: 'Mes Favoris',
          tabBarLabel: 'Favoris',
          tabBarIcon: ({ color }) => <Heart size={ICON_SIZE} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{
          title: 'Historique',
          tabBarLabel: 'Historique',
          tabBarIcon: ({ color }) => <Clock size={ICON_SIZE} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: 'Chatbot',
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ color }) => <MessageSquare size={ICON_SIZE} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          title: 'Mon Profil',
          tabBarLabel: 'Mon Profil',
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}