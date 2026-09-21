import sys
sys.path.insert(0, './api')
from chatbot.engine import get_engine
bot = get_engine()
q = "what are the rules"
doc_matches = bot.doc_index.search(q, top_k=5)
faq_matches = bot.faq_index.search(q, top_k=5)
print("DOC MATCHES:")
for m in doc_matches:
    print(f"[{m.score:.4f}] {bot.doc_chunks[m.index]['text'][:50]}...")
print("FAQ MATCHES:")
for m in faq_matches:
    idx = bot._faq_variant_to_id[m.index]
    print(f"[{m.score:.4f}] {bot.faqs[idx]['questions'][0][:50]}...")
