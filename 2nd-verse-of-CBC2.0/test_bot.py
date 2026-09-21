import sys
sys.path.insert(0, './api')
from chatbot.engine import get_engine
bot = get_engine()
queries = [
    "when is the event",
    "what are the rules",
    "who is the convenor",
    "how to register"
]
for q in queries:
    print(f"Q: {q}")
    res = bot.answer(q)
    print(f"Score: {res.get('score')} | Source: {res.get('source')}")
    print(res["answer"])
    print("-" * 40)
