// mobile/screens/auth/RegisterScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    password: '', confirmPassword: '', role: 'consommateur',
  });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    const { nom, prenom, email, password, confirmPassword } = formData;
    if (!nom || !prenom || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Mot de passe : minimum 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      // AppNavigator redirige automatiquement
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Inscription</Text>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} value={formData.nom}
              onChangeText={(v) => set('nom', v)} placeholder="Votre nom"
              placeholderTextColor="#9ca3af" />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} value={formData.prenom}
              onChangeText={(v) => set('prenom', v)} placeholder="Votre prénom"
              placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} value={formData.email}
          onChangeText={(v) => set('email', v)} placeholder="votre@email.com"
          placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Type de compte *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.role}
            onValueChange={(v) => set('role', v)}
            style={{ color: '#0f172a' }}
          >
            <Picker.Item label="Consommateur" value="consommateur" />
            <Picker.Item label="Fournisseur" value="fournisseur" />
          </Picker>
        </View>

        <Text style={styles.label}>Mot de passe *</Text>
        <TextInput style={styles.input} value={formData.password}
          onChangeText={(v) => set('password', v)} placeholder="••••••••"
          placeholderTextColor="#9ca3af" secureTextEntry />

        <Text style={styles.label}>Confirmer le mot de passe *</Text>
        <TextInput style={styles.input} value={formData.confirmPassword}
          onChangeText={(v) => set('confirmPassword', v)} placeholder="••••••••"
          placeholderTextColor="#9ca3af" secureTextEntry />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>S'inscrire</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f8fafc', padding: 20,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    width: '100%', maxWidth: 480,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
  },
  title: {
    fontSize: 28, fontWeight: '800', textAlign: 'center',
    color: '#0f172a', marginBottom: 24,
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc',
  },
  pickerWrapper: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    overflow: 'hidden', backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#16a34a', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: {
    textAlign: 'center', color: '#16a34a', marginTop: 20,
    fontSize: 14, fontWeight: '600', textDecorationLine: 'underline',
  },
});
