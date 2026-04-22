// mobile/App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#16a34a" />
      <AppNavigator />
    </AuthProvider>
  );
}
