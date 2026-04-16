import sys
import json
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    print(json.dumps({"error": "Missing scikit-learn library"}))
    sys.exit(1)

def build_product_text(product):
    parts = []
    
    nom = product.get('nom', '') or product.get('name', '') or ''
    if nom: parts.extend([nom] * 3) # Weight name higher
    
    desc = product.get('description', '') or ''
    if desc: parts.append(desc)
    
    marque = product.get('marque', '') or product.get('brand', '') or ''
    if marque: parts.append(marque)
    
    ingredients = product.get('ingredients', [])
    if isinstance(ingredients, list):
        for ing in ingredients:
            if isinstance(ing, dict):
                ing_name = ing.get('nom', '') or ing.get('name', '') or ''
                if ing_name: parts.append(ing_name)
            elif isinstance(ing, str):
                parts.append(ing)
                
    return " ".join(parts).lower()

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return
            
        data = json.loads(input_data)
        query = data.get("query", "").strip().lower()
        products = data.get("products", [])
        
        if not query:
            # If no query, return everything as matches
            print(json.dumps({"success": True, "results": products}))
            return
            
        if not products:
            print(json.dumps({"success": True, "results": []}))
            return
            
        # 1. Build text corpus (Product texts + User Query at index 0)
        corpus = [query]
        for p in products:
            corpus.append(build_product_text(p))
            
        # 2. Vectorize
        vectorizer = TfidfVectorizer(stop_words=None)
        
        try:
            tfidf_matrix = vectorizer.fit_transform(corpus)
        except ValueError:
            # This can happen if the query/corpus is empty or contains only stop words
            print(json.dumps({"success": True, "results": products}))
            return
            
        # 3. Calculate cosine similarity between Query (index 0) and all products
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # 4. Filter and sort
        scored_products = []
        for i, score in enumerate(cosine_sim):
            # Include exact substring matches if TF-IDF misses them due to tokenization
            is_substring = query in corpus[i+1]
            final_score = score
            if is_substring and final_score < 0.1:
                final_score += 0.5
                
            if final_score > 0.01:
                product_copy = dict(products[i])
                product_copy['_search_score'] = float(final_score)
                scored_products.append(product_copy)
                
        scored_products.sort(key=lambda x: x.get('_search_score', 0), reverse=True)
        
        print(json.dumps({"success": True, "results": scored_products}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
