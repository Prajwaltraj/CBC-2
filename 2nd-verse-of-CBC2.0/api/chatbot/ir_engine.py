from __future__ import annotations
from dataclasses import dataclass
from typing import List, Sequence
import math
import re
from collections import Counter

@dataclass
class Match:
    index: int
    score: float

STOPWORDS = {"i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"}

def tokenize(text: str) -> List[str]:
    words = re.findall(r'\b\w+\b', text.lower())
    return [w for w in words if w not in STOPWORDS]

def get_ngrams(tokens: List[str], n: int) -> List[str]:
    return [" ".join(tokens[i:i+n]) for i in range(len(tokens)-n+1)]

class IRIndex:
    def __init__(self, corpus: Sequence[str]):
        self.corpus = list(corpus)
        self.doc_freqs = Counter()
        self.idf = {}
        self.doc_vecs = []
        self.vocab = set()
        
        if not self.corpus:
            return
            
        # Parse documents
        parsed_docs = []
        for doc in self.corpus:
            tokens = tokenize(doc)
            terms = tokens
            parsed_docs.append(terms)
            for term in set(terms):
                self.doc_freqs[term] += 1
                self.vocab.add(term)
                
        N = len(self.corpus)
        for term, df in self.doc_freqs.items():
            self.idf[term] = math.log((N + 1) / (df + 1)) + 1
            
        for terms in parsed_docs:
            tf = Counter(terms)
            vec = {term: count * self.idf[term] for term, count in tf.items()}
            norm = math.sqrt(sum(v*v for v in vec.values()))
            if norm > 0:
                vec = {k: v/norm for k, v in vec.items()}
            self.doc_vecs.append(vec)

    @property
    def is_empty(self) -> bool:
        return not self.corpus

    def search(self, query: str, top_k: int = 1) -> List[Match]:
        if self.is_empty or not query.strip():
            return []
            
        tokens = tokenize(query)
        terms = tokens
        tf = Counter(terms)
        query_vec = {term: count * self.idf.get(term, math.log((len(self.corpus) + 1) / 1) + 1) for term, count in tf.items()}
        norm = math.sqrt(sum(v*v for v in query_vec.values()))
        if norm > 0:
            query_vec = {k: v/norm for k, v in query_vec.items()}
            
        scores = []
        for i, doc_vec in enumerate(self.doc_vecs):
            score = sum(query_vec.get(term, 0) * weight for term, weight in doc_vec.items())
            scores.append((score, i))
            
        scores.sort(reverse=True)
        return [Match(index=idx, score=score) for score, idx in scores[:top_k]]
