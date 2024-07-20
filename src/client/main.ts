import { backendUrl } from "./consts";

function updateProgress() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const progress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
    const percentage = parseFloat((progress * 100).toFixed(2));

    document.getElementById('progress').style.width = `${percentage}%`;
    document.getElementById('progress-glow').style.width = `${percentage}%`;
    document.getElementById('percentage').textContent = `${percentage}% of the year has passed`;

    const timeLeft = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
    document.getElementById('days-left').textContent = `${daysLeft} days left in the year`;

    document.getElementById('months').textContent = Math.floor(daysLeft / 30).toString();
    document.getElementById('weeks').textContent = Math.floor(daysLeft / 7).toString();
    document.getElementById('days').textContent = daysLeft.toString();

    updateMood(percentage);
    updateBackground(percentage);
}

function updateMood(percentage: number) {
    let mood: string;
    if (percentage < 25) {
        mood = "The year is young, full of possibilities!";
    } else if (percentage < 50) {
        mood = "Time's flying, but there's still so much to do!";
    } else if (percentage < 75) {
        mood = "More than halfway there, keep pushing!";
    } else {
        mood = "The year's almost over, finish strong!";
    }
    document.getElementById('mood').textContent = mood;
}

function updateBackground(percentage: number) {
    const hue = Math.floor(percentage * 3.6); // 0-360
    document.body.style.backgroundColor = `hsl(${hue}, 30%, 15%)`;
}

let isDarkTheme = true;
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.style.color = 'white';
        document.querySelector('.container').style.background = 'rgba(255, 255, 255, 0.1)';
        document.querySelector('path').setAttribute('fill', 'white');
    } else {
        document.body.style.color = 'black';
        document.querySelector('.container').style.background = 'rgba(0, 0, 0, 0.1)';
        document.querySelector('path').setAttribute('fill', 'black');
    }

    const button = document.getElementById('theme-toggle');
    button.classList.add('rotate');
    setTimeout(() => button.classList.remove('rotate'), 500);
}

function getStockData() {
    const url = backendUrl;
    const stockData = document.getElementById('stock-data');
    const template = document.getElementById('template-spinner');
    const spinnerTemplate = template.content.cloneNode(true);

    const stockPrice = document.getElementById('stock-price');
    const stockChange = document.getElementById('stock-change');
    const stockError = document.getElementById('stock-error');

    stockError.innerText = '';
    stockPrice.innerHTML = '';
    stockChange.innerHTML = '';
    stockData.appendChild(spinnerTemplate);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            stockData.getElementsByTagName('sl-spinner')[0].remove();
            console.log(data);
            const price = data['price'];
            const change = data['change'];
            const changePercent = data['changePercent'];

            stockPrice.textContent = `${price} €`;
            stockChange.textContent = `${change} (${changePercent})`;
            stockChange.className = 'stock-change ' + (change >= 0 ? 'positive' : 'negative');
        })
        .catch(error => {
            stockData.getElementsByTagName('sl-spinner')[0].remove();
            console.error('Error fetching stock data:', error);
            stockError.innerText = 'Failed to load stock data';
        });
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

updateProgress();
setInterval(updateProgress, 60000); // Update every minute
getStockData(); // Get stock data on page load
setInterval(getStockData, 300000); // Update stock data every 5 minutes