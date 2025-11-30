import { pipeline, env } from '@xenova/transformers';

// Skip local model checks if we want to rely on CDN or bundled assets
// env.allowLocalModels = false;
// env.useBrowserCache = false; 

// Singleton to hold the pipeline
let extractor = null;
let isLoading = false;

export async function loadModel() {
    if (extractor) return extractor;
    if (isLoading) {
        // Wait for existing load to finish
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (extractor) return extractor;
        }
    }

    try {
        isLoading = true;
        console.log("Loading embedding model...");
        // Load the feature extraction pipeline
        // We use the quantized version by default which is much smaller (~20MB)
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("Model loaded successfully");
        return extractor;
    } catch (error) {
        console.error("Failed to load model:", error);
        throw error;
    } finally {
        isLoading = false;
    }
}

function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function semanticSearch(query, data) {
    if (!query || !query.trim()) return data;

    try {
        const pipe = await loadModel();
        if (!pipe) {
            console.warn("Model not loaded, returning original data");
            return data;
        }

        // Compute embedding for the query
        const output = await pipe(query, { pooling: 'mean', normalize: true });
        const queryEmbedding = Array.from(output.data);

        // Prepare for keyword matching
        const queryLower = query.toLowerCase();
        const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 2);

        // Calculate scores with hybrid approach
        const results = data.map(item => {
            // If item has no embedding, return very low score
            if (!item.embedding) return { ...item, score: -1, semanticScore: 0, keywordBonus: 0 };

            // 1. Calculate semantic similarity score (0 to 1)
            const semanticScore = cosineSimilarity(queryEmbedding, item.embedding);

            // 2. Calculate keyword match bonus
            let keywordBonus = 0;
            const searchableText = [
                item.name || '',
                item.description || '',
                item.capabilities || '',
                item.users || '',
                item.vendor || '',
                item.developed_by || '',
                item.department || '',
                item.results || ''
            ].join(' ').toLowerCase();

            // Exact phrase match gets highest bonus
            if (searchableText.includes(queryLower)) {
                keywordBonus += 0.5;
            }

            // Individual term matches
            queryTerms.forEach(term => {
                if (searchableText.includes(term)) {
                    keywordBonus += 0.1;
                }
            });

            // Cap keyword bonus at 0.7
            keywordBonus = Math.min(keywordBonus, 0.7);

            // 3. Combine scores (semantic similarity + keyword bonus)
            const finalScore = semanticScore + keywordBonus;

            return { ...item, score: finalScore, semanticScore, keywordBonus };
        });

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        // Filter by stricter relevance criteria
        // Show results only if they meet ANY of these conditions:
        // 1. Has keyword match (keyword bonus > 0) AND combined score > 0.5
        // 2. Very high semantic similarity alone (> 0.6) for synonym/concept matches
        const relevantResults = results.filter(r => {
            const hasKeywordMatch = r.keywordBonus > 0;
            const highSemanticScore = r.semanticScore > 0.6;
            const combinedRelevance = hasKeywordMatch && r.score > 0.5;

            return combinedRelevance || highSemanticScore;
        });

        // Return only relevant results - no minimum requirement
        // Better to show 0 results than irrelevant ones
        return relevantResults;
    } catch (error) {
        console.error("Search error:", error);
        // Fallback to basic text search if semantic search fails
        const lowerQuery = query.toLowerCase();
        return data.filter(item =>
            item.name.toLowerCase().includes(lowerQuery) ||
            item.description.toLowerCase().includes(lowerQuery) ||
            item.department.toLowerCase().includes(lowerQuery)
        );
    }
}
