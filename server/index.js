import express from 'express';
import Database from './db.js';
import cron from 'node-cron';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

const database = new Database('db.sqlite');
database.init();

const symbol = 'RNO.PA';
const apiKey = 'YOUR_ALPHA'


async function init() {
    console.log('Initializing the database...');
    const { price, change, changePercent } = await fetchStockData();
    await database.insertStockData(symbol, price, change, changePercent, new Date().toISOString());
    console.log('Stock data inserted into the database.');
}

// Function to fetch stock data
async function fetchStockData() {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data); // Process the data as needed
        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price']).toFixed(2);
        const change = parseFloat(quote['09. change']).toFixed(2);
        const changePercent = quote['10. change percent'];

        return {
            price,
            change,
            changePercent
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw new Error('Error fetching stock data');
    }
}
/**
 * @returns {Promise<StockData|null>}
 */
async function fetchLatestStockData() {
    try {
        /** @type {StockData} */
        const latestStockData = await database.getLatestStockData();
        console.log('Latest stock data:', latestStockData);
        return latestStockData;
    } catch (err) {
        console.error('Failed to fetch latest stock data:', err);
    }
}

// Fetch once when the server starts
await init();

// Schedule to fetch stock data twice a day
// At 09:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('Fetching stock data in the morning...');
    fetchStockData();
}, {
    scheduled: true,
    timezone: "Europe/Paris" // Adjust the timezone according to your needs
});

// At 03:00 PM
cron.schedule('0 15 * * *', () => {
    console.log('Fetching stock data in the afternoon...');
    fetchStockData();
}, {
    scheduled: true,
    timezone: "Europe/Paris" // Adjust the timezone according to your needs
});


app.get('/', async (req, res) => {
    const stocks = await fetchLatestStockData();
    if (!stocks) {
        res.status(404).send('Stock data not found');
        return;
    }
    res.send(stocks);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});