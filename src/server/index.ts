import express from 'express';
import Database from './db.js';
import cron from 'node-cron';
import cors from 'cors';
import { AlphavantageStock, Stock } from './types.js';
import { Server } from 'socket.io';

const chatMessages = [];

const app = express();
const port = 5173;


app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['https://kougatsundew.github.io', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://ypa.komstaproductionstudio.com' , 'http://127.0.0.1:3000'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

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
        const data = await response.json() as AlphavantageStock;
        console.log(data); // Process the data as needed
        const quote = data['Global Quote'];
        const price = parseFloat(parseFloat(quote['05. price']).toFixed(2));
        const change = parseFloat(parseFloat(quote['09. change']).toFixed(2));
        const changePercent = parseFloat(quote['10. change percent']);

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

async function fetchLatestStockData(): Promise<Stock | null> {
    try {
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
cron.schedule('0 11 * * *', async () => {
    console.log('Fetching stock data in the morning...');
    const { price, change, changePercent } = await fetchStockData();
    await database.insertStockData(symbol, price, change, changePercent, new Date().toISOString());
}, {
    scheduled: true,
    timezone: "Europe/Paris" // Adjust the timezone according to your needs
});

// At 03:00 PM
cron.schedule('0 15 * * *', async () => {
    console.log('Fetching stock data in the afternoon...');
    const { price, change, changePercent } = await fetchStockData();
    await database.insertStockData(symbol, price, change, changePercent, new Date().toISOString());
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

app.get('/chat', async (req, res) => {
    res.send(chatMessages);
})

const httpServer = app.listen(port, () => {
    console.log(`Year progress app listening on port ${port}`)
});


const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('chat:message', (message) => {
        console.log('Message received:', message);
        chatMessages.push(message);
        io.emit('chat:message', message);
    });
});
