from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
import base64
from io import BytesIO
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route("/tickers", methods=["GET"])
def get_tickers():
    # Get S&P 500 tickers dynamically (or adjust as needed)
    table = pd.read_html("https://en.wikipedia.org/wiki/List_of_S%26P_500_companies")
    sp500 = table[0]['Symbol'].tolist()
    return jsonify(sp500)

@app.route("/stock-data", methods=["POST"])
def get_stock_data():
    data = request.json
    ticker = data.get("ticker")
    start = '2010-01-01'
    end = '2019-12-31'

    try:
        df = yf.download(ticker, start=start, end=end)

        if df.empty:
            return jsonify({"error": "No data found"}), 404

        images = {}

        # Plot 1: Closing Prices
        images['closingPrice'] = generate_plot(df['Close'], 'Stock Closing Prices Over Time')

        # MA 100
        ma100 = df['Close'].rolling(100).mean()
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(df['Close'], label='Closing Price')
        ax.plot(ma100, 'r', label='100-Day Moving Average')
        ax.set_title('Stock Closing Price with 100-Day MA')
        ax.set_xlabel('Time')
        ax.set_ylabel('Price')
        ax.legend()
        images['ma100'] = fig_to_base64(fig)

        # MA 100 and 200
        ma200 = df['Close'].rolling(200).mean()
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(df['Close'], label='Closing Price')
        ax.plot(ma100, 'r', label='100-Day MA')
        ax.plot(ma200, 'g', label='200-Day MA')
        ax.set_title('Closing Price with 100-Day and 200-Day MA')
        ax.set_xlabel('Time')
        ax.set_ylabel('Price')
        ax.legend()
        images['ma100ma200'] = fig_to_base64(fig)

        # Prediction Graph (dummy logic for now — replace with your model if needed)
        df = df[['Close']]
        train_size = int(len(df) * 0.7)
        test = df[train_size:]
        y_test = test['Close']
        y_predicted = test['Close'].rolling(5).mean()  # dummy prediction

        fig, ax = plt.subplots(figsize=(12, 6))
        ax.plot(y_test.values, label='Original Price', color='blue')
        ax.plot(y_predicted.values, label='Predicted Price', color='red')
        ax.set_title('Original vs Predicted Price')
        ax.set_xlabel('Time')
        ax.set_ylabel('Price')
        ax.legend()
        images['prediction'] = fig_to_base64(fig)

        # Metrics
        returns = df['Close'].pct_change().dropna()
        volatility = float(np.std(returns))
        sharpe_ratio = float(np.mean(returns) / (np.std(returns) + 1e-9))  # Avoid zero div
        running_max = df['Close'].cummax()
        drawdown = (df['Close'] - running_max) / running_max
        max_drawdown = float(drawdown.min())

        metrics = {
            "volatility": round(volatility, 4),
            "sharpe_ratio": round(sharpe_ratio, 4),
            "max_drawdown": round(max_drawdown, 4)
        }

        return jsonify({
            "images": images,
            "metrics": metrics
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_plot(series, title):
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(series)
    ax.set_title(title)
    ax.set_xlabel("Time")
    ax.set_ylabel("Price")
    return fig_to_base64(fig)

def fig_to_base64(fig):
    buf = BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    image = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return image

if __name__ == "__main__":
    app.run(debug=True)
