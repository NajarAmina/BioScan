// mobile/screens/consumer/ProfileScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setPass = (key, val) => setPasswordForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put(`/users/${user.id}`, form);
      await updateUser(res.data.user || form);
      Alert.alert('Succès', 'Profil mis à jour !');
      setEditing(false);
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    }
    if (passwordForm.newPassword.length < 6) {
      return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
    }
    setLoadingPassword(true);
    try {
      await api.put(`/users/${user.id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert('Succès', 'Mot de passe mis à jour !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de mettre à jour le mot de passe.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const roleLabel = {
    consommateur: 'Consommateur',
  }[user?.role] || user?.role;

  const PasswordField = ({ label, value, onChange, show, onToggle }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          {show
            ? <EyeOff size={20} color="#9ca3af" strokeWidth={2} />
            : <Eye size={20} color="#9ca3af" strokeWidth={2} />
          }
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{roleLabel}</Text>
        </View>
      </View>

      {/* Infos */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mes informations</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputReadonly]}
          value={form.nom}
          onChangeText={(v) => set('nom', v)}
          editable={editing}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputReadonly]}
          value={form.prenom}
          onChangeText={(v) => set('prenom', v)}
          editable={editing}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, !editing && styles.inputReadonly]}
          value={form.email}
          onChangeText={(v) => set('email', v)}
          editable={editing}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        {editing && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setEditing(false);
                setForm({ nom: user?.nom || '', prenom: user?.prenom || '', email: user?.email || '' });
              }}
            >
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.saveBtnText}>Enregistrer</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sécurité du compte */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sécurité du compte</Text>
        <Text style={styles.securitySubtitle}>Changez votre mot de passe pour protéger votre compte.</Text>

        <PasswordField
          label="Mot de passe actuel"
          value={passwordForm.currentPassword}
          onChange={(v) => setPass('currentPassword', v)}
          show={showCurrent}
          onToggle={() => setShowCurrent(!showCurrent)}
        />
        <PasswordField
          label="Nouveau mot de passe"
          value={passwordForm.newPassword}
          onChange={(v) => setPass('newPassword', v)}
          show={showNew}
          onToggle={() => setShowNew(!showNew)}
        />
        <PasswordField
          label="Confirmer le mot de passe"
          value={passwordForm.confirmPassword}
          onChange={(v) => setPass('confirmPassword', v)}
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
        />

        <TouchableOpacity
          style={[styles.saveBtn, { marginTop: 20 }, loadingPassword && styles.saveBtnDisabled]}
          onPress={handleUpdatePassword}
          disabled={loadingPassword}
        >
          {loadingPassword
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.saveBtnText}>Mettre à jour le mot de passe</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    gap: 16,
    // ✅ Compense la hauteur de la barre flottante
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },

  avatarSection: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  roleBadge: {
    backgroundColor: '#f0fdf4', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6,
    borderWidth: 1, borderColor: '#86efac',
  },
  roleText: { color: '#16a34a', fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  securitySubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, marginBottom: 8 },
  editBtn: {
    backgroundColor: '#f0fdf4', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { color: '#16a34a', fontWeight: '600', fontSize: 13 },

  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc',
  },
  inputReadonly: { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#f1f5f9' },

  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  passwordInput: {
    flex: 1, padding: 14, fontSize: 15, color: '#0f172a',
  },
  eyeBtn: { paddingHorizontal: 14 },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 15 },
  saveBtn: {
    flex: 1, backgroundColor: '#16a34a',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  logoutBtn: {
    backgroundColor: '#fef2f2', borderRadius: 16, padding: 18,
    alignItems: 'center', borderWidth: 1, borderColor: '#fca5a5',
    marginTop: 8,
  },
  logoutBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
});