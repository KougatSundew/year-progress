import sqlite3, { Database as SQLiteDatabase } from 'sqlite3';
import { Stock } from './types';

export default class Database {
    readonly db: SQLiteDatabase;
    readonly dbPath: string;

    constructor(dbPath: string) {
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

    query(sql: string, params = []){
        return new Promise<Stock[]>((resolve, reject) => {
            this.db.all<Stock>(sql, params, (err, rows) => {
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
        return new Promise<void>((resolve, reject) => {
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

    async insertStockData(symbol: string, price: number, change: number, changePercent: number, date: string) {
        const sql = `
            INSERT INTO renaultStocks (symbol, price, change, changePercent, date)
            VALUES (?, ?, ?, ?, ?)
        `;
        return this.query(sql, [symbol, price, change, changePercent, date]);
    }

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