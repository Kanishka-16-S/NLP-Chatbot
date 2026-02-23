import json
import pickle
import random
import nltk
from nltk.stem import PorterStemmer

stemmer = PorterStemmer()

print("Loading model and vectorizer...")
try:
    model = pickle.load(open("model.pkl", "rb"))
    vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    vectorizer = None

print("Loading intents...")
with open("intents.json", "r", encoding="utf-8") as file:
    intents = json.load(file)

def preprocess(text):
    tokens = nltk.word_tokenize(text.lower())
    tokens = [stemmer.stem(word) for word in tokens if word.isalnum()]
    return " ".join(tokens)

def get_response(user_input):
    if not user_input.strip():
        return "Hello! How can I assist you today?"
    
    if model is None or vectorizer is None:
        return "Chatbot model is not loaded. Please train the model first."
    
    processed = preprocess(user_input)
    X = vectorizer.transform([processed])
    prediction = model.predict(X)[0]
    
    for intent in intents["intents"]:
        if intent["tag"] == prediction:
            return random.choice(intent["responses"])
    
    return "I'm not sure I understand. Could you please rephrase?"