from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the simple Flask server!"

if __name__ == '__main__':
    app.run(debug=False, port=8000, host="0.0.0.0")
