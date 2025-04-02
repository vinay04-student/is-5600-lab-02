/* add your code here */
// DOM Elements
const userList = document.getElementById('user-list');
const portfolioDisplay = document.getElementById('portfolio-display');
const stockInfoDisplay = document.getElementById('stock-info-display');
const userForm = document.getElementById('user-form');
const userNameInput = document.getElementById('user-name');
const saveButton = document.getElementById('save-user-btn');
const deleteButton = document.getElementById('delete-user-btn');

// Global variables
let users = [];
let stocks = [];
let selectedUserId = null;

// Initialize the application
async function init() {
    await loadData();
    renderUserList();
    setupEventListeners();
}

// Load data from JSON files
async function loadData() {
    try {
        const [usersResponse, stocksResponse] = await Promise.all([
            fetch('data/users.json'),
            fetch('data/stocks-complete.json')
        ]);
        
        users = await usersResponse.json();
        stocks = await stocksResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Render the user list
function renderUserList() {
    userList.innerHTML = users.map(user => `
        <li data-user-id="${user.id}" class="${user.id === selectedUserId ? 'selected' : ''}">
            ${user.name}
        </li>
    `).join('');
}

// Render the portfolio for the selected user
function renderPortfolio(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    portfolioDisplay.innerHTML = user.portfolio.map(item => {
        const stock = stocks.find(s => s.symbol === item.symbol);
        return `
            <div class="stock" data-stock-symbol="${item.symbol}">
                ${item.symbol} - ${item.shares} shares
                <span class="stock-value">$${(item.shares * stock.price).toFixed(2)}</span>
            </div>
        `;
    }).join('');
}

// Render stock details
function renderStockDetails(symbol) {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    stockInfoDisplay.innerHTML = `
        <h3>${stock.symbol} - ${stock.company}</h3>
        <p>Price: $${stock.price.toFixed(2)}</p>
        <p>Change: <span class="${stock.change >= 0 ? 'positive' : 'negative'}">
            ${stock.change >= 0 ? '+' : ''}${stock.change}%
        </span></p>
        <p>Market Cap: $${(stock.marketCap / 1000000000).toFixed(2)}B</p>
    `;
}

// Event Listeners
function setupEventListeners() {
    // User selection
    userList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            selectedUserId = parseInt(e.target.dataset.userId);
            renderUserList();
            renderPortfolio(selectedUserId);
            loadUserData(selectedUserId);
            stockInfoDisplay.innerHTML = ''; // Clear previous stock info
        }
    });

    // Stock selection
    portfolioDisplay.addEventListener('click', (e) => {
        const stockElement = e.target.closest('.stock');
        if (stockElement) {
            const symbol = stockElement.dataset.stockSymbol;
            renderStockDetails(symbol);
        }
    });

    // Save user
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedUserId && userNameInput.value.trim()) {
            const user = users.find(u => u.id === selectedUserId);
            if (user) {
                user.name = userNameInput.value.trim();
                renderUserList();
            }
        }
    });

    // Delete user
    deleteButton.addEventListener('click', () => {
        if (selectedUserId) {
            users = users.filter(u => u.id !== selectedUserId);
            selectedUserId = null;
            renderUserList();
            portfolioDisplay.innerHTML = '';
            stockInfoDisplay.innerHTML = '';
            userNameInput.value = '';
        }
    });
}

// Load user data into form
function loadUserData(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        userNameInput.value = user.name;
    }
}

// Initialize the app
init();
