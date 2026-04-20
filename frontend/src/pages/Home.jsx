// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Navbar from '../components/Home/Navbar';
import HeroSection from '../components/Home/HeroSection';
import ScannerSection from '../components/Home/ScannerSection';
import ProductsSection from '../components/Home/ProductsSection';
import Footer from '../components/Home/Footer';
import ResultatAnalyse from '../components/Shared/ResultatAnalyse';
import Chatbot from '../components/Home/Chatbot';

import useFavorites from '../hooks/useFavorites';
import useHistory from '../hooks/useHistory';
import useComments from '../hooks/useComments';

const Home = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const isConsommateur = user?.role === 'consommateur';

  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcode, setBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scanError, setScanError] = useState(false);

  const [searchMode, setSearchMode] = useState('produit');
  const [ingredientResult, setIngredientResult] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSearchProduct, setSelectedSearchProduct] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id, user?.role);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } = useHistory(
    isConsommateur ? user?.id : null
  );
  const { comments, getProductComments, getAverageRating, addComment, editComment, deleteComment } = useComments();

  // ── Redirection admin ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === 'administrateur') {
      navigate('/dashboard/AdminDashboard', { replace: true });
    }
  }, [user, navigate]);

  // ── Chargement produits ────────────────────────────────────────────────────
  useEffect(() => {
    const cached = localStorage.getItem('cached_produits');
    if (cached) {
      const parsed = JSON.parse(cached);
      setAllProducts(parsed);
      if (!searchQuery.trim()) setDisplayProducts(parsed);
    }

    fetch('http://localhost:5000/api/produits?status=approved')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllProducts(data);
          localStorage.setItem('cached_produits', JSON.stringify(data));
          setSearchQuery((currentQuery) => {
            if (!currentQuery.trim()) setDisplayProducts(data);
            return currentQuery;
          });
        } else {
          console.error("L'API n'a pas retourné un tableau :", data);
        }
      })
      .catch(() => console.log('API indisponible'));
  }, []);

  // ── Réinitialise displayProducts quand la recherche est effacée ────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayProducts(allProducts);
      setIngredientResult(null);
      setSelectedProduct(null);
      setSelectedSearchProduct(null);
    }
  }, [searchQuery, allProducts]);

  // ── Recherche ──────────────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      setDisplayProducts(allProducts);
      setIngredientResult(null);
      return;
    }

    setIsAnalyzing(true);
    setIngredientResult(null);

    if (searchMode === 'produit') {
      try {
        const response = await fetch(
          `http://localhost:5000/api/produits/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error('Erreur serveur OCR/NLP');
        const results = await response.json();

        if (Array.isArray(results)) {
          setDisplayProducts(results);
          if (isConsommateur && results.length > 0) addToHistory(query);
        } else {
          setDisplayProducts([]);
        }
      } catch (err) {
        console.error('Erreur avec la recherche NLP:', err);
        const lowerQuery = query.toLowerCase();
        const results = allProducts.filter(
          (p) =>
            p.nom?.toLowerCase().includes(lowerQuery) ||
            p.name?.toLowerCase().includes(lowerQuery) ||
            p.description?.toLowerCase().includes(lowerQuery) ||
            (p.ingredients &&
              p.ingredients.some((ing) => ing.nom?.toLowerCase().includes(lowerQuery)))
        );
        setDisplayProducts(results);
        if (isConsommateur && results.length > 0) addToHistory(query);
      }
    } else {
      try {
        const ingList = query.split(',').map((s) => s.trim()).filter((s) => s);
        const aiResponse = await fetch('http://localhost:5000/api/analyses/predict-ingredients-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ingredients_text: query }),
        });
        if (!aiResponse.ok) throw new Error(`Erreur ${aiResponse.status}`);
        const data = await aiResponse.json();
        const predictions = data.predictions || {};

        const customProduct = {
          nom: "Analyse des ingrédients",
          description: `Ingrédients analysés : ${query}`,
          ingredients: ingList.map((nom) => ({ nom, estBio: false })),
          ai_predictions: predictions,
          scoreBio: predictions.bioscore || 0,
          nova_group: predictions.nova_group || 1,
          image: null,
          origine: 'Analyse personnalisée',
          marque: 'BioScan AI',
        };

        setIngredientResult(customProduct);
        if (isConsommateur) addToHistory(query);
      } catch (err) {
        console.error("Erreur avec l'analyse d'ingrédients:", err);
      }
    }

    setIsAnalyzing(false);
  };

  // ── Helpers IA ─────────────────────────────────────────────────────────────
  const buildMinimalPayload = (produit) => {
    const ingredients = produit?.ingredients || [];
    const ingredientsText =
      ingredients.length > 0
        ? ingredients.map((ing) => ing.nom || ing.name || '').filter(Boolean).join(', ')
        : produit?.description || produit?.nom || produit?.name || '';
    return { ingredients_text: ingredientsText };
  };

  const fetchAIForProduct = async (produit) => {
    if (!produit) return produit;
    try {
      const response = await fetch('http://localhost:5000/api/analyses/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildMinimalPayload(produit)),
      });
      const data = await response.json();
      const predictions = data.predictions || {};
      return {
        ...produit,
        ai_predictions: predictions,
        scoreBio: predictions.bioscore ?? produit.scoreBio,
        nova_group: predictions.nova_group ?? produit.nova_group,
      };
    } catch (err) {
      console.error('Erreur IA pour le produit :', produit?.nom || produit?.name, err);
      return produit;
    }
  };

  const handleSelectProduct = async (produit) => {
    setIsAnalyzing(true);
    const enriched = await fetchAIForProduct(produit);
    setSelectedProduct(enriched);
    setIsAnalyzing(false);
  };

  const handleSelectSearchProduct = async (produit) => {
    setIsAnalyzing(true);
    const enriched = await fetchAIForProduct(produit);
    setSelectedSearchProduct(enriched);
    setIsAnalyzing(false);
  };

  // ── Reset produit scanné ───────────────────────────────────────────────────
  const handleResetScannedProduct = () => {
    setScannedProduct(null);
    setBarcode('');
    setScanError(false);
  };

  // ── Recherche par code-barres ──────────────────────────────────────────────
  const handleBarcodeScan = async () => {
    setScanError(false);
    const query = barcode.trim();
    if (!query) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch('http://localhost:5000/api/produits/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_barre: query }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setScanError(true);
          setScannedProduct(null);
          return;
        }
        throw new Error(`Échec du scan : ${response.status}`);
      }

      const product = await response.json();
      const enriched = await fetchAIForProduct(product);
      setScannedProduct(enriched);

      setAllProducts((prevProducts) => {
        const existingIndex = prevProducts.findIndex(
          (p) =>
            (p._id && product._id && p._id === product._id) ||
            p.code_barre === product.code_barre ||
            p.codeBarres === product.codeBarres
        );

        if (existingIndex !== -1) {
          const copy = [...prevProducts];
          copy[existingIndex] = enriched;
          return copy;
        }

        return prevProducts;
      });

      if (isConsommateur) addToHistory(query);
    } catch (err) {
      console.error("Erreur lors de l'appel de scan produit : ", err);
      setScanError(true);
      setScannedProduct(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Commentaires ───────────────────────────────────────────────────────────
  const handleOpenComments = (product) => {
    navigate('/commentaires', { state: { product } });
  };

  // ── Déconnexion ────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <Navbar
        user={user}
        favoritesCount={isConsommateur ? favorites.length : 0}
        onFavoritesClick={() => navigate('/favoris')}
        onHistoryClick={() => navigate('/historique')}
        onProfileClick={() => navigate('/profil')}
        onLogout={handleLogout}
      />

      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        displayProducts={displayProducts}
        handleSearch={handleSearch}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
      />

      <ScannerSection
        barcode={barcode}
        setBarcode={(val) => {
          setBarcode(val);
          setScanError(false);
          if (val === '') setScannedProduct(null);
        }}
        handleBarcodeScan={handleBarcodeScan}
        scannedProduct={scannedProduct}
        scanError={scanError}
        onResetProduct={handleResetScannedProduct}
      />

      {isAnalyzing && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 0',
            fontSize: '1.2rem',
            color: '#64748b',
            backgroundColor: '#f8fafc',
          }}
        >
          <span style={{ display: 'inline-block', animation: 'spin 2s linear infinite', marginRight: '0.5rem' }}>
            ⏳
          </span>
          Analyse IA en cours...
        </div>
      )}

      {!isAnalyzing && selectedProduct ? (
        <section
          id="products-section"
          style={{ backgroundColor: '#f8fafc', padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
                Résultat de l'analyse IA
              </h2>
              <button
                style={{ padding: '0.75rem 1.2rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}
                onClick={() => setSelectedProduct(null)}
              >
                Retour au scan
              </button>
            </div>
            <ResultatAnalyse product={selectedProduct} />
          </div>
        </section>
      ) : !isAnalyzing && selectedSearchProduct ? (
        <section
          id="products-section"
          style={{ backgroundColor: '#f8fafc', padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
                Résultat de l'analyse IA
              </h2>
              <button
                style={{ padding: '0.75rem 1.2rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}
                onClick={() => setSelectedSearchProduct(null)}
              >
                Retour aux résultats
              </button>
            </div>
            <ResultatAnalyse product={selectedSearchProduct} />
          </div>
        </section>
      ) : !isAnalyzing && ingredientResult ? (
        <section
          id="products-section"
          style={{ backgroundColor: '#f8fafc', padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ maxWidth: '1000px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Résultat de l'analyse IA
              </h2>
              <button
                style={{ padding: '0.75rem 1.2rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}
                onClick={() => {
                  setIngredientResult(null);
                  setSearchQuery('');
                }}
              >
                ← Nouvelle recherche
              </button>
            </div>
            <ResultatAnalyse product={ingredientResult} isIngredientSearch={true} />
          </div>
        </section>
      ) : (
        <ProductsSection
          displayProducts={displayProducts}
          user={user}
          handleAddFavorite={addFavorite}
          handleOpenComments={handleOpenComments}
          onClickCard={handleSelectSearchProduct}
          isFavorite={isFavorite}
          getAverageRating={getAverageRating}
          getProductComments={getProductComments}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {isConsommateur && <Chatbot user={user} addToHistory={addToHistory} />}

      <Footer />
    </div>
  );
};

export default Home;