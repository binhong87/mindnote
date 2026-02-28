// Simple TF-IDF based RAG indexer
export interface NoteIndex {
  path: string
  name: string
  terms: Map<string, number> // term -> tf-idf score
  content: string
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2)
}

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1)
  const total = tokens.length
  freq.forEach((v, k) => freq.set(k, v / total))
  return freq
}

export class RAGIndexer {
  private index: NoteIndex[] = []

  buildIndex(notes: Array<{ path: string; name: string; content: string }>) {
    // Compute IDF
    const docFreq = new Map<string, number>()
    const tokenSets = notes.map(n => {
      const tokens = tokenize(n.content)
      const unique = new Set(tokens)
      unique.forEach(t => docFreq.set(t, (docFreq.get(t) ?? 0) + 1))
      return tokens
    })

    const N = notes.length
    this.index = notes.map((note, i) => {
      const tf = termFrequency(tokenSets[i])
      const tfidf = new Map<string, number>()
      tf.forEach((tfVal, term) => {
        const idf = Math.log(N / (1 + (docFreq.get(term) ?? 0)))
        tfidf.set(term, tfVal * idf)
      })
      return { path: note.path, name: note.name, terms: tfidf, content: note.content }
    })
  }

  query(queryText: string, topK = 3): Array<{ path: string; name: string; snippet: string; score: number }> {
    if (this.index.length === 0) return []
    const qTokens = tokenize(queryText)
    const scores = this.index.map(doc => {
      let score = 0
      for (const t of qTokens) {
        score += doc.terms.get(t) ?? 0
      }
      return { path: doc.path, name: doc.name, content: doc.content, score }
    })
    return scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(s => ({
        path: s.path,
        name: s.name,
        snippet: s.content.slice(0, 200).replace(/\n+/g, ' '),
        score: s.score,
      }))
  }

  get size() {
    return this.index.length
  }
}

export const ragIndexer = new RAGIndexer()
