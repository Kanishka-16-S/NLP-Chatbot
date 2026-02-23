import json
print("Testing intents.json...")
with open("intents.json", encoding="utf-8") as f:
    data = json.load(f)
print(f"Loaded {len(data['intents'])} intents")

import pickle
print("\nTesting model...")
try:
    model = pickle.load(open("model.pkl", "rb"))
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
    print("Model loaded successfully!")
except Exception as e:
    print(f"Model error: {e}")

from chatbot import get_response
print("\nTesting get_response...")
print("Response for 'hello':", get_response("hello"))
print("Response for 'what is AI':", get_response("what is AI"))