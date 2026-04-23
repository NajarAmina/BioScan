// mobile/Consommateur/screens/shared/ScannerScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import useHistory from '../../../hooks/useHistory';
import ProductDetailScreen from './ProductDetailScreen';
import useFavorites from '../../../hooks/useFavorites';

export default function ScannerScreen({ navigation }) {
  const { user } = useAuth();
  const isConsommateur = user?.role === 'consommateur';
  const { addToHistory } = useHistory(isConsommateur ? user?.id : null);
  const { isFavorite, addFavorite } = useFavorites(user?.id, user?.role);

  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanError, setScanError] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanned, setScanned] = useState(false);

  // ✅ Attend que la permission soit chargée avant d'ouvrir la caméra
  useEffect(() => {
    if (permission === null) return; // pas encore chargée

    if (permission.granted) {
      // Permission déjà accordée → ouvre directement
      setScanned(false);
      setShowCamera(true);
    } else {
      // Demande la permission puis ouvre
      requestPermission().then(({ granted }) => {
        if (granted) {
          setScanned(false);
          setShowCamera(true);
        } else {
          Alert.alert('Permission refusée', "Autorisez l'accès à la caméra dans les paramètres.");
        }
      });
    }
  }, [permission]);  // se déclenche quand permission est chargée

  const handleBarcodeScan = async (code) => {
    const query = (code || barcode).trim();
    if (!query) return;
    setScanError(false);
    setIsAnalyzing(true);
    setShowCamera(false);

    try {
      const res = await api.post('/produits/scan', { code_barre: query });
      const product = res.data;

      try {
        const ingredients = product?.ingredients || [];
        const text = ingredients.map((i) => i.nom || '').join(', ') || product?.nom || '';
        const aiRes = await api.post('/analyses/predict', { ingredients_text: text });
        const predictions = aiRes.data.predictions || {};
        setScannedProduct({
          ...product,
          ai_predictions: predictions,
          scoreBio: predictions.bioscore ?? product.scoreBio,
          nova_group: predictions.nova_group ?? product.nova_group,
        });
      } catch {
        setScannedProduct(product);
      }

      if (isConsommateur) addToHistory(query);
    } catch (err) {
      if (err.response?.status === 404) setScanError(true);
      else Alert.alert('Erreur', 'Impossible de scanner ce produit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    setBarcode(data);
    handleBarcodeScan(data);
  };

  const openCamera = () => {
    setScanned(false);
    setShowCamera(true);
  };

  if (scannedProduct) {
    return (
      <ProductDetailScreen
        product={scannedProduct}
        onBack={() => {
          setScannedProduct(null);
          setBarcode('');
          setScanError(false);
          setScanned(false);
          setShowCamera(true); // ✅ rouvre caméra après retour
        }}
        isFavorite={isFavorite}
        onFavorite={addFavorite}
        user={user}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>L'Analyseur</Text>
      <Text style={styles.subtitle}>
        Scannez ou tapez un code-barres pour analyser un produit
      </Text>

      {/* Caméra — s'affiche directement sans bouton intermédiaire */}
      {showCamera ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'upc_a'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.cameraHint}>Pointez vers le code-barres</Text>
          </View>
          <TouchableOpacity style={styles.closeCamera} onPress={() => setShowCamera(false)}>
            <Text style={styles.closeCameraText}>✕ Fermer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Bouton visible uniquement si caméra fermée manuellement ou refus permission
        !isAnalyzing && (
          <TouchableOpacity style={styles.cameraBtn} onPress={openCamera}>
            <Text style={styles.cameraBtnText}>📷  Ouvrir la caméra</Text>
          </TouchableOpacity>
        )
      )}

      {/* Séparateur */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Saisie manuelle */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={barcode}
          onChangeText={(v) => {
            setBarcode(v.replace(/\D/g, '').slice(0, 13));
            setScanError(false);
          }}
          placeholder="Entrez le code-barres (13 chiffres)"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
          maxLength={13}
        />
        <TouchableOpacity
          style={[styles.analyzeBtn, barcode.length !== 13 && styles.analyzeBtnDisabled]}
          onPress={() => handleBarcodeScan()}
          disabled={barcode.length !== 13}
        >
          <Text style={styles.analyzeBtnText}>Analyser ⚡</Text>
        </TouchableOpacity>
      </View>

      {/* Analyse en cours */}
      {isAnalyzing && (
        <View style={styles.analyzing}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.analyzingText}>Analyse IA en cours...</Text>
        </View>
      )}

      {/* Erreur produit introuvable */}
      {scanError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>⚠️ Produit introuvable</Text>
          <Text style={styles.errorText}>
            Aucun produit trouvé pour ce code-barres. Vérifiez le code.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: '#f8fafc',
    padding: 20, gap: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 15, color: '#64748b', lineHeight: 22 },

  cameraBtn: {
    backgroundColor: '#16a34a', borderRadius: 14, padding: 18, alignItems: 'center',
  },
  cameraBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  cameraContainer: {
    height: 300, borderRadius: 16, overflow: 'hidden', position: 'relative',
  },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  scanFrame: {
    width: 200, height: 120,
    borderWidth: 2, borderColor: '#16a34a', borderRadius: 12,
    backgroundColor: 'transparent',
  },
  cameraHint: {
    marginTop: 12, color: '#fff', fontWeight: '600', fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
  },
  closeCamera: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  closeCameraText: { color: '#fff', fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: { color: '#9ca3af', fontWeight: '500' },

  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#0f172a', backgroundColor: '#fff',
    letterSpacing: 1,
  },
  analyzeBtn: {
    backgroundColor: '#16a34a', borderRadius: 12,
    paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center',
  },
  analyzeBtnDisabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  analyzing: { alignItems: 'center', gap: 10, padding: 20 },
  analyzingText: { color: '#64748b', fontSize: 15 },

  errorBox: {
    backgroundColor: '#fef2f2', borderLeftWidth: 4, borderLeftColor: '#ef4444',
    borderRadius: 10, padding: 16, gap: 4,
  },
  errorTitle: { color: '#991b1b', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#b91c1c', fontSize: 13, lineHeight: 18 },
});
