import React, { useState } from 'react';

const IngredientAnalysisCard = ({ ingredient }) => {
  const [expandedGroup, setExpandedGroup] = useState(null);

  if (!ingredient) return null;

  // Helpers
  const getOriginColor = (origine) => {
    if (origine === 'naturelle') return '#10b981'; // green
    if (origine === 'synthétique') return '#f97316'; // orange
    return '#64748b';
  };

  const getDangerColor = (dangerosité) => {
    if (dangerosité === 'Faible') return '#10b981'; // green
    if (dangerosité === 'Modérée') return '#f59e0b'; // amber
    if (dangerosité === 'Élevée') return '#ef4444'; // red
    return '#64748b';
  };

  const getCategoryColor = (categorie) => {
    const categoryColors = {
      'E-number': '#8b5cf6',
      'Conservateur': '#ec4899',
      'Émulsifiant': '#8b5cf6',
      'Colorant': '#06b6d4',
      'Sucre': '#f59e0b',
      'Sel': '#94a3b8',
      'Huile': '#d4a574',
      'Farine': '#d2691e',
      'Protéine': '#8b0000',
      'Amidon': '#deb887',
      'Thickener': '#696969',
      'Antioxydant': '#228b22',
      'Acidifiant': '#4169e1',
      'Arôme': '#ff69b4',
      'Autre': '#64748b',
    };
    return categoryColors[categorie] || categoryColors['Autre'];
  };

  // Components
  const OriginBadge = ({ origine }) => (
    <span
      style={{
        display: 'inline-block',
        padding: '0.3rem 0.7rem',
        borderRadius: '2rem',
        backgroundColor: getOriginColor(origine) + '20',
        color: getOriginColor(origine),
        fontSize: '0.8rem',
        fontWeight: '600',
        marginRight: '0.5rem',
      }}
    >
      {origine === 'naturelle' ? '🌱' : '🧪'} {origine}
    </span>
  );

  const DangerBadge = ({ dangerosité }) => (
    <span
      style={{
        display: 'inline-block',
        padding: '0.3rem 0.7rem',
        borderRadius: '2rem',
        backgroundColor: getDangerColor(dangerosité) + '20',
        color: getDangerColor(dangerosité),
        fontSize: '0.8rem',
        fontWeight: '600',
        marginRight: '0.5rem',
      }}
    >
      ⚠️ {dangerosité}
    </span>
  );

  const CategoryTag = ({ categorie }) => (
    <span
      style={{
        display: 'inline-block',
        padding: '0.3rem 0.7rem',
        borderRadius: '0.3rem',
        backgroundColor: getCategoryColor(categorie) + '20',
        color: getCategoryColor(categorie),
        fontSize: '0.75rem',
        fontWeight: '600',
        marginRight: '0.5rem',
        marginBottom: '0.5rem',
      }}
    >
      {categorie}
    </span>
  );

  const RecommendationItem = ({ groupe, texte }) => {
    const groupLabels = {
      sportifs: '⚽ Sportifs',
      femmes_enceintes: '🤰 Femmes enceintes',
      diabetiques: '🩺 Diabétiques',
    };

    return (
      <div
        style={{
          padding: '0.75rem',
          backgroundColor: '#f8fafc',
          borderLeft: `3px solid ${getDangerColor('Faible')}`,
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>
          {groupLabels[groupe] || groupe}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#475569' }}>{texte}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* Header: Ingredient Name + NOVA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#0f172a',
            textTransform: 'capitalize',
          }}
        >
          {ingredient.nom}
        </h3>
        <div
          style={{
            display: 'inline-block',
            padding: '0.35rem 0.75rem',
            borderRadius: '2rem',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            fontSize: '0.75rem',
            fontWeight: '700',
          }}
        >
          NOVA {ingredient.nova}
        </div>
      </div>

      {/* Badges: Origin + Danger */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem' }}>
              ORIGINE
            </div>
            <OriginBadge origine={ingredient.origine || 'Inconnue'} />
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem' }}>
              DANGEROSITÉ
            </div>
            <DangerBadge dangerosité={ingredient.dangerosité || ingredient.dangerosite || 'Modérée'} />
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem' }}>
          CATÉGORIE
        </div>
        <CategoryTag categorie={ingredient.categorie || 'Autre'} />
      </div>

      {/* Side Effects */}
      {ingredient.effets_secondaires && ingredient.effets_secondaires.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            ⚠️ EFFETS SECONDAIRES
          </div>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {ingredient.effets_secondaires.map((effet, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '0.85rem',
                  color: '#475569',
                  paddingLeft: '1.25rem',
                  marginBottom: '0.3rem',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    color: '#ef4444',
                  }}
                >
                  •
                </span>
                {effet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {ingredient.recommandations && ingredient.recommandations.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>
            💡 RECOMMANDATIONS CIBLÉES
          </div>
          {ingredient.recommandations.map((rec, idx) => (
            <RecommendationItem key={idx} groupe={rec.groupe} texte={rec.texte} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IngredientAnalysisCard;
