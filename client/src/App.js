import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [tickers, setTickers] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [images, setImages] = useState({});
  const [metrics, setMetrics] = useState({});
  const [mode, setMode] = useState("buy");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/tickers")
      .then((res) => setTickers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchStockData = () => {
    if (!selectedTicker) return;

    setLoading(true);
    axios
      .post("http://localhost:5000/stock-data", { ticker: selectedTicker })
      .then((res) => {
        setImages(res.data.images);
        setMetrics(res.data.metrics);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="App">
      <h1 className="titleh1">📈 Stock Prediction App</h1>

      <div className="button-container">
        <button
          className={mode === "buy" ? "active" : ""}
          onClick={() => setMode("buy")}
        >
          Buy
        </button>
        <button
          className={mode === "sell" ? "active" : ""}
          onClick={() => setMode("sell")}
        >
          Sell
        </button>
      </div>

      <div className="dropdown">
        <select
          onChange={(e) => setSelectedTicker(e.target.value)}
          value={selectedTicker}
        >
          <option value="">Select Company</option>
          {tickers.map((ticker) => (
            <option key={ticker} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>
        <button onClick={fetchStockData}>Fetch Graph</button>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="stock-chart-loader">
            <svg viewBox="0 0 100 40" className="chart">
              <polyline
                fill="none"
                stroke="#4caf50"
                strokeWidth="2"
                points="0,30 10,20 20,25 30,15 40,20 50,10 60,15 70,5 80,15 90,10 100,20"
              >
                <animate
                  attributeName="points"
                  dur="2s"
                  repeatCount="indefinite"
                  values="
              0,30 10,20 20,25 30,15 40,20 50,10 60,15 70,5 80,15 90,10 100,20;
              0,20 10,25 20,15 30,20 40,10 50,20 60,10 70,15 80,5 90,15 100,10;
              0,30 10,20 20,25 30,15 40,20 50,10 60,15 70,5 80,15 90,10 100,20
            "
                />
              </polyline>
            </svg>
            <p>Loading stock data...</p>
          </div>
        </div>
      )}

      {/* {loading && (
        <div className="loader-container">
          <div className="stock-loader">
            <div className="line"></div>
            <div className="dot"></div>
            <p>Loading stock data...</p>
          </div>
        </div>
      )} */}

      {!loading && selectedTicker && (
        <>
          {/* <div className="metrics">
            <h3>📊 Analysis Metrics</h3>
            <p>
              <strong>Volatility:</strong> {metrics.volatility}
            </p>
            <p>
              <strong>Sharpe Ratio:</strong> {metrics.sharpe_ratio}
            </p>
            <p>
              <strong>Max Drawdown:</strong> {metrics.max_drawdown}
            </p>
          </div> */}

          <div className="graph">
            <h2>
              {mode.toUpperCase()} Signals for {selectedTicker}
            </h2>

            {images.closingPrice && (
              <img
                src={`data:image/png;base64,${images.closingPrice}`}
                alt="Closing Prices"
              />
            )}
            {images.ma100 && (
              <img
                src={`data:image/png;base64,${images.ma100}`}
                alt="100 Day MA"
              />
            )}
            {images.ma100ma200 && (
              <img
                src={`data:image/png;base64,${images.ma100ma200}`}
                alt="100 & 200 Day MA"
              />
            )}
            {images.prediction && (
              <img
                src={`data:image/png;base64,${images.prediction}`}
                alt="Prediction Graph"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
