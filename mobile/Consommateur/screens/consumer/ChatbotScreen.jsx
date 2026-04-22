// mobile/screens/consumer/ChatbotScreen.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

export default function ChatbotScreen() {
  const { user } = useAuth();
  const listRef = useRef(null);

  const [messages, setMessages] = useState([{
    id: 1,
    from: 'bot',
    text: `Bonjour ${user?.prenom || ''} ! Je suis votre assistant BioScan. Posez-moi vos questions sur les produits alimentaires ou envoyez une photo.`,
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isTyping]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const removeImage = () => { setImageUri(null); setImageBase64(null); };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && !imageBase64) return;

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: text || '📷 Image envoyée',
      image: imageUri,
      imageBase64,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    removeImage();
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        from: m.from, text: m.text, imageBase64: m.imageBase64 || null,
      }));
      const body = { message: text || 'Analyse ce produit alimentaire.', history };
      if (imageBase64) body.image = imageBase64;

      const res = await api.post('/chatbot', body);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, from: 'bot', text: res.data.reply,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: 'Désolé, je rencontre des difficultés techniques.',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgWrapperUser : styles.msgWrapperBot]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.msgImage} resizeMode="cover" />
          )}
          {item.text && (
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
              {item.text}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 Assistant BioScan</Text>
        <Text style={styles.headerSub}>Posez vos questions sur les aliments</Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messagesList}
        renderItem={renderMessage}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.msgWrapperBot, { marginBottom: 8 }]}>
              <View style={styles.bubbleBot}>
                <ActivityIndicator size="small" color="#16a34a" />
              </View>
            </View>
          ) : null
        }
      />

      {/* Aperçu image */}
      {imageUri && (
        <View style={styles.previewRow}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.previewLabel}>Image prête à envoyer</Text>
        </View>
      )}

      {/* Zone de saisie */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
          <Text style={{ fontSize: 20 }}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Posez votre question..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() && !imageBase64) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() && !imageBase64}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    backgroundColor: '#16a34a', padding: 16, paddingTop: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  messagesList: { padding: 12, paddingBottom: 8, gap: 8 },

  msgWrapper: { marginBottom: 8 },
  msgWrapperUser: { alignItems: 'flex-end' },
  msgWrapperBot: { alignItems: 'flex-start' },

  bubble: {
    maxWidth: '82%', borderRadius: 16, padding: 12, gap: 6,
  },
  bubbleUser: { backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: '#fff', borderBottomLeftRadius: 4,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextBot: { color: '#1f2937' },

  msgImage: { width: 180, height: 140, borderRadius: 10 },

  previewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  previewImage: { width: 50, height: 50, borderRadius: 8 },
  removeImageBtn: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center',
  },
  removeImageText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  previewLabel: { color: '#64748b', fontSize: 13 },

  inputArea: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  imagePickerBtn: {
    width: 40, height: 40, borderRadius: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#0f172a', maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#16a34a', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 18 },
});
