import json
import pickle
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from nltk.stem import WordNetLemmatizer

print("Downloading NLTK data...")
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('punkt_tab')

lemmatizer = WordNetLemmatizer()

print("Loading intents...")
with open("intents.json", encoding="utf-8") as file:
    data = json.load(file)

sentences = []
labels = []

print("Processing patterns...")
for intent in data["intents"]:
    for pattern in intent["patterns"]:
        words = nltk.word_tokenize(pattern.lower())
        words = [lemmatizer.lemmatize(w) for w in words if w.isalnum()]
        sentences.append(" ".join(words))
        labels.append(intent["tag"])

print(f"Total patterns: {len(sentences)}")

print("Training model...")
vectorizer = TfidfVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(sentences)
y = labels

model = LogisticRegression(max_iter=2000)
model.fit(X, y)

print("Saving model...")
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("="*50)
print("Training completed successfully!")
print("="*50)