import sys
sys.path.insert(0, './api')
from chatbot.ir_engine import IRIndex

corpus = ["what is the venue?", "where is the event held?", "tell me about the rules."]
index = IRIndex(corpus)
print(index.search("venue"))
print(index.search("rules"))
