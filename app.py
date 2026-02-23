from flask import Flask, render_template, request, jsonify
from chatbot import get_response

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chatbot_response():
    try:
        data = request.get_json()
        user_msg = data.get("msg", "")
        reply = get_response(user_msg)
        return jsonify({"response": reply})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"response": "Sorry, I encountered an error."})

if __name__ == "__main__":
    print("\n" + "="*50)
    print("Starting Smart NLP Chatbot...")
    print("Go to: http://localhost:5000")
    print("="*50 + "\n")
    app.run(debug=True, port=5000)