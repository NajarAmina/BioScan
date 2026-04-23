// mobile/Consommateur/ConsumerTabs.jsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform, StyleSheet } from 'react-native';

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

// ─── Navigateurs ─────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

// ─── Constantes ──────────────────────────────────────────────────────────────
const TAB_COLOR = '#16a34a';
const TAB_INACTIVE = '#9ca3af';

// ✅ Valeurs fixes — plus besoin de useSafeAreaInsets
const TAB_HEIGHT = Platform.OS === 'ios' ? 80 : 60;
const TAB_PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 8;

// ─── Icône emoji ─────────────────────────────────────────────────────────────
const icon = (emoji) =>
  ({ focused }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );

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
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{ title: 'Scanner' }}
      />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Produit' }}
      />
      <HomeStack.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ title: 'Commentaires' }}
      />
      <HomeStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Connexion' }}
      />
      <HomeStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Inscription' }}
      />
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
          height: TAB_HEIGHT,
          paddingBottom: TAB_PADDING_BOTTOM,
          paddingTop: 4,
          backgroundColor: '#ffffff',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#d1fae5',
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 0,
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
          tabBarIcon: icon('🏠'),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Favoris"
        component={FavoritesScreen}
        options={{
          title: 'Mes Favoris',
          tabBarIcon: icon('❤️'),
          tabBarLabel: 'Favoris',
        }}
      />
      <Tab.Screen
        name="Historique"
        component={HistoryScreen}
        options={{
          title: 'Historique',
          tabBarIcon: icon('🕐'),
          tabBarLabel: 'Historique',
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          title: 'Assistant',
          tabBarIcon: icon('💬'),
          tabBarLabel: 'Assistant',
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          title: 'Mon Profil',
          tabBarIcon: icon('👤'),
          tabBarLabel: 'Mon Profil',
        }}
      />
    </Tab.Navigator>
  );
}
