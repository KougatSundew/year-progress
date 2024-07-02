import sqlite3 from 'sqlite3';

/**
 * @typedef {Object} StockData
 * @property {string} symbol - The stock symbol.
 * @property {number} price - The current price of the stock.
 * @property {number} change - The change in stock price.
 * @property {number} changePercent - The percentage change in stock price.
 * @property {string} date - The date of the stock data.
 */

export default class Database {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database', err);
            } else {
                console.log('Connected to the SQLite database.');
            }
        });
    }

    async init() {
        const checkTableExistsSql = `
            SELECT name FROM sqlite_master WHERE type='table' AND name='renaultStocks';
        `;

        this.query(checkTableExistsSql).then((rows) => {
            if (rows.length === 0) {
                // Table does not exist, create it
                const createTableSql = `
                    CREATE TABLE IF NOT EXISTS renaultStocks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        symbol text NOT NULL,
                        price REAL,
                        change REAL,
                        changePercent REAL,
                        date TEXT
                    )
                `;
                return this.query(createTableSql);
            } else {
                console.log('Table renaultStocks already exists.');
            }
        }).catch((err) => {
            console.error('Error checking if renaultStocks table exists', err);
        });
    }

    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    console.error('Error running sql: ' + sql);
                    console.error(err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing the database connection.');
                    reject(err);
                } else {
                    console.log('Database connection closed.');
                    resolve();
                }
            });
        });
    }

    /**
     * Inserts stock data into the renaultStocks table.
     * @param {string} symbol - The stock symbol.
     * @param {number} price - The current price of the stock.
     * @param {number} change - The change in stock price.
     * @param {number} changePercent - The percentage change in stock price.
     * @param {string} date - The date of the stock data.
     * @returns {Promise<StockData|null>}
     */
    async insertStockData(symbol, price, change, changePercent, date) {
        const sql = `
            INSERT INTO renaultStocks (symbol, price, change, changePercent, date)
            VALUES (?, ?, ?, ?, ?)
        `;
        return this.query(sql, [symbol, price, change, changePercent, date]);
    }

    /**
     * Inserts stock data into the renaultStocks table.
     * @param {string} symbol - The stock symbol.
     * @param {number} price - The current price of the stock.
     * @param {number} change - The change in stock price.
     * @param {number} changePercent - The percentage change in stock price.
     * @param {string} date - The date of the stock data.
     * @returns {Promise<StockData|null>}
     */
    async getLatestStockData() {
        const sql = `
            SELECT * FROM renaultStocks ORDER BY date DESC LIMIT 1
        `;
        try {
            const rows = await this.query(sql);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Error fetching latest stock data:', err);
            throw err;
        }
    }
}