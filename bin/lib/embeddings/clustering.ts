// GitHub issues analyser
// Copyright © 2026 Alexander Thoukydides

// A single embedding vector
export type Embedding = number[];

// Statistics for a collection of embeddings
export interface EmbeddingsStats {
    centroid:   Embedding;
    distance: {
        mean:   number;
        sd:     number;
    }
}

// Normalise an embedding and apply rounding
export function normaliseEmbedding(values: Embedding): Embedding {
    const magnitude = Math.sqrt(values.reduce((acc, v) => acc + v * v, 0));
    if (magnitude === 0) return values;
    return values.map(v => v / magnitude);
}

// Euclidean distance between two embeddings
export function euclideanDistance(a: Embedding, b: Embedding): number {
    if (a.length !== b.length) throw new Error('Embedding dimension mismatch');
    const sum = a.reduce((acc, v, i) => acc + Math.pow(v - (b[i] ?? 0), 2), 0);
    return Math.sqrt(sum);
}

// Generate statistics for a set of (normalised) embeddings
export function embeddingsStats(embeddings: Embedding[]): EmbeddingsStats {
    // Calculate the centroid (per-dimension mean) of the set
    const anyEmbedding = embeddings[0];
    if (!anyEmbedding) throw new Error('No embeddings provided');
    const centroid = normaliseEmbedding(anyEmbedding.map((_, i) =>
        embeddings.reduce((acc, emb) => acc + (emb[i] ?? 0), 0)));

    // Calculate the mean and standard deviation of distances from the centroid
    const distances = embeddings.map(e => euclideanDistance(e, centroid));
    const mean = distances.reduce((acc, d) => acc + d, 0) / distances.length;
    const sd = Math.sqrt(distances.reduce((acc, d) => acc + Math.pow(d - mean, 2), 0) / distances.length);
    return { centroid, distance: { mean, sd } };
}

// Minimum distance to a member of a set of embeddings
export function minEuclideanDistance(target: Embedding, members: Embedding[]): number {
    return Math.min(...members.map(member => euclideanDistance(target, member)));
}