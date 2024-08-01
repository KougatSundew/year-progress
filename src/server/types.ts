export interface Stock {
    id: number;
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    date: string;
}

export interface AlphavantageStock {
    "Global Quote": {
        "01. symbol": string;
        "05. price": string;
        "09. change": string;
        "10. change percent": string;
    };

}

export interface Message {
    id: number;
    message: string;
    sender: string;
    timestamp: string;
}