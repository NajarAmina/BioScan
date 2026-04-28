// mobile/navigation/AppNavigator.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import VisitorStack from '../Consommateur/VisitorStack';
import ConsumerTabs from '../Consommateur/ConsumerTabs';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user?.role === 'consommateur' ? <ConsumerTabs /> : <VisitorStack />}
    </NavigationContainer>
  );
}
