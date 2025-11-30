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

export async function semanticSearch(query, data, topK = 20) {
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

        // Calculate scores
        const results = data.map(item => {
            // If item has no embedding, return -1 score
            if (!item.embedding) return { ...item, score: -1 };

            const score = cosineSimilarity(queryEmbedding, item.embedding);
            return { ...item, score };
        });

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        // Return top K, but filter out very low scores if needed
        // For now, just return top K
        return results.slice(0, topK);
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
