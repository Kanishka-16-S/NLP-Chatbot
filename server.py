from flask import Flask, render_template, request, jsonify
from chatbot import get_response

app = Flask(__name__)

# Home page
@app.route("/")
def home():
    return render_template("index.html")

# Chat API (must allow POST)
@app.route("/get", methods=["POST"])
def chatbot_response():
    data = request.get_json()
    user_msg = data.get("msg")
    response = get_response(user_msg)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
