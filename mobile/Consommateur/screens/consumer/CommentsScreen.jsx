// mobile/screens/consumer/CommentsScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import useComments from '../../../hooks/useComments';

export default function CommentsScreen({ route }) {
  const { product } = route?.params || {};
  const { user } = useAuth();
  const { getProductComments, addComment, deleteComment } = useComments();

  const [text, setText] = useState('');
  const [note, setNote] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!product) return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Aucun produit sélectionné</Text>
    </View>
  );

  const comments = getProductComments(product._id || product.id);

  const handleSubmit = async () => {
    if (!text.trim()) { Alert.alert('Erreur', 'Le commentaire ne peut pas être vide'); return; }
    setLoading(true);
    await addComment(product, text, note);
    setText('');
    setNote(5);
    setLoading(false);
  };

  const handleDelete = (commentId, commentUserId) => {
    const userId = user?.id || user?._id;
    if (String(commentUserId) !== String(userId)) {
      Alert.alert('Erreur', 'Vous ne pouvez supprimer que vos propres commentaires.');
      return;
    }
    Alert.alert('Supprimer', 'Supprimer ce commentaire ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteComment(commentId) },
    ]);
  };

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View>
          <Text style={styles.title}>💬 Commentaires — {product.nom}</Text>

          {/* Formulaire ajout commentaire */}
          {user?.role === 'consommateur' && (
            <View style={styles.form}>
              <Text style={styles.label}>Votre commentaire</Text>
              <TextInput
                style={styles.textarea}
                value={text}
                onChangeText={setText}
                placeholder="Votre avis sur ce produit..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Note : {note}/10</Text>
              <View style={styles.noteRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.noteBtn, note === n && styles.noteBtnActive]}
                    onPress={() => setNote(n)}
                  >
                    <Text style={[styles.noteBtnText, note === n && styles.noteBtnTextActive]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>Publier</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.commentsCount}>
            {comments.length} commentaire{comments.length > 1 ? 's' : ''}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Soyez le premier à commenter !</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{item.nom_utilisateur}</Text>
            <View style={styles.commentRight}>
              <Text style={styles.commentNote}>⭐ {item.note}/10</Text>
              {String(item.id_utilisateur) === String(user?.id || user?._id) && (
                <TouchableOpacity onPress={() => handleDelete(item.id, item.id_utilisateur)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text style={styles.commentText}>{item.texte}</Text>
          <Text style={styles.commentDate}>
            {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : ''}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 16 },

  form: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 8 },
  textarea: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#0f172a',
    textAlignVertical: 'top', minHeight: 100,
  },
  noteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  noteBtn: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center',
  },
  noteBtnActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  noteBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  noteBtnTextActive: { color: '#fff' },
  submitBtn: {
    backgroundColor: '#16a34a', borderRadius: 12, padding: 14,
    alignItems: 'center', marginTop: 16,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  commentsCount: { fontSize: 14, color: '#64748b', marginBottom: 12 },

  commentCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  commentRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  commentAuthor: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  commentNote: { fontSize: 13, color: '#f59e0b', fontWeight: '600' },
  deleteText: { fontSize: 16 },
  commentText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  commentDate: { fontSize: 11, color: '#94a3b8', marginTop: 6 },

  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: '#94a3b8', fontSize: 15 },
});
