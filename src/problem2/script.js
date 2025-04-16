/**
 * Crypto Swap Application
 * 
 * A modern interface for swapping cryptocurrency tokens with real-time
 * price data and balance tracking.
 */

// Constants
const API_URL = 'https://interview.switcheo.com/prices.json';
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

// Application state
const appState = {
  prices: [],
  tokens: [],
  connected: false,
  currentFromToken: 'ETH',
  currentToToken: 'SWTH',
  fromAmount: 0,
  toAmount: 0,
  walletBalances: {
    'ETH': 1.5,
    'SWTH': 10000,
    'USDC': 2000,
    'BTC': 0.05,
    'BUSD': 1500,
    'DAI': 1500,
  }
};

// DOM Elements - organized by functional area
const elements = {
  // Token selection
  fromTokenSelector: document.getElementById('from-token-selector'),
  toTokenSelector: document.getElementById('to-token-selector'),
  fromTokenImg: document.getElementById('from-token-img'),
  fromTokenName: document.getElementById('from-token-name'),
  toTokenImg: document.getElementById('to-token-img'),
  toTokenName: document.getElementById('to-token-name'),
  
  // Amount inputs
  inputAmount: document.getElementById('input-amount'),
  outputAmount: document.getElementById('output-amount'),
  maxBtn: document.getElementById('max-btn'),
  
  // Balances and rates
  fromBalance: document.getElementById('from-balance'),
  toBalance: document.getElementById('to-balance'),
  exchangeRate: document.getElementById('exchange-rate'),
  
  // Action buttons
  swapBtn: document.getElementById('swap-btn'),
  swapDirectionBtn: document.getElementById('swap-direction-btn'),
  
  // Error display
  inputError: document.getElementById('input-error'),
  
  // Modal elements
  tokenModal: document.getElementById('token-modal'),
  closeModal: document.getElementById('close-modal'),
  tokenList: document.getElementById('token-list'),
  tokenSearch: document.getElementById('token-search'),
};

/**
 * Initializes the application by fetching token prices and setting up the UI
 */
async function initializeApp() {
  try {
    await fetchPrices();
    setupEventListeners();
  } catch (error) {
    handleError('Failed to initialize application', error);
  }
}

/**
 * Fetches token prices from the API and initializes the UI
 */
async function fetchPrices() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    appState.prices = data;
    
    // Extract available tokens with prices
    appState.tokens = [...new Set(appState.prices.map(item => item.currency))]
      .filter(token => appState.prices.some(price => 
        price.currency === token && price.price
      ))
      .sort();
    
    // Initialize UI with default values
    updateBalances();
    updateExchangeRate();
    
    // Simulate wallet connection (for demo purposes)
    simulateWalletConnection();
    
  } catch (error) {
    handleError('Failed to fetch prices', error);
  }
}

/**
 * Simulates connecting to a wallet
 */
function simulateWalletConnection() {
  elements.swapBtn.textContent = 'Connecting...';
  
  setTimeout(() => {
    appState.connected = true;
    elements.swapBtn.disabled = false;
    elements.swapBtn.textContent = 'Swap';
  }, 1500);
}

/**
 * Returns the price for a given token
 * @param {string} token - The token symbol
 * @returns {number} - The token price or 0 if not found
 */
function getTokenPrice(token) {
  const tokenPrice = appState.prices.find(price => price.currency === token);
  return tokenPrice?.price || 0;
}

/**
 * Calculates the output amount based on input and exchange rates
 */
function calculateOutput() {
  const fromPrice = getTokenPrice(appState.currentFromToken);
  const toPrice = getTokenPrice(appState.currentToToken);
  
  if (fromPrice && toPrice) {
    appState.toAmount = (appState.fromAmount * fromPrice) / toPrice;
    elements.outputAmount.value = formatAmount(appState.toAmount);
    updateExchangeRate();
  } else {
    elements.outputAmount.value = '0.00';
    elements.exchangeRate.textContent = 'Price not available';
  }
}

/**
 * Updates the displayed exchange rate
 */
function updateExchangeRate() {
  const fromPrice = getTokenPrice(appState.currentFromToken);
  const toPrice = getTokenPrice(appState.currentToToken);
  
  if (fromPrice && toPrice) {
    const rate = fromPrice / toPrice;
    elements.exchangeRate.textContent = 
      `1 ${appState.currentFromToken} = ${formatAmount(rate)} ${appState.currentToToken}`;
  } else {
    elements.exchangeRate.textContent = 'Price not available';
  }
}

/**
 * Updates the balance displays
 */
function updateBalances() {
  const fromBalanceValue = appState.walletBalances[appState.currentFromToken] || 0;
  const toBalanceValue = appState.walletBalances[appState.currentToToken] || 0;
  
  elements.fromBalance.textContent = `Balance: ${formatAmount(fromBalanceValue, 4)} ${appState.currentFromToken}`;
  elements.toBalance.textContent = `Balance: ${formatAmount(toBalanceValue, 4)} ${appState.currentToToken}`;
}

/**
 * Validates the input amount
 * @returns {boolean} - True if valid, false otherwise
 */
function validateInput() {
  const balance = appState.walletBalances[appState.currentFromToken] || 0;
  
  if (appState.fromAmount <= 0) {
    setError('Amount must be greater than 0');
    return false;
  } else if (appState.fromAmount > balance) {
    setError('Insufficient balance');
    return false;
  } else {
    clearError();
    return true;
  }
}

/**
 * Displays an error message and disables swap button
 * @param {string} message - The error message to display
 */
function setError(message) {
  elements.inputError.textContent = message;
  elements.swapBtn.disabled = true;
}

/**
 * Clears error messages and enables swap button if connected
 */
function clearError() {
  elements.inputError.textContent = '';
  elements.swapBtn.disabled = !appState.connected;
}

/**
 * Swaps the direction of the tokens
 */
function swapDirection() {
  // Swap token references
  [appState.currentFromToken, appState.currentToToken] = 
    [appState.currentToToken, appState.currentFromToken];
  
  // Update UI
  updateTokenDisplay(elements.fromTokenImg, elements.fromTokenName, appState.currentFromToken);
  updateTokenDisplay(elements.toTokenImg, elements.toTokenName, appState.currentToToken);
  
  // Swap values
  const tempValue = elements.inputAmount.value;
  elements.inputAmount.value = elements.outputAmount.value;
  elements.outputAmount.value = tempValue;
  
  appState.fromAmount = parseFloat(elements.inputAmount.value) || 0;
  
  // Update UI
  updateBalances();
  updateExchangeRate();
  validateInput();
}

/**
 * Updates token display elements
 * @param {HTMLElement} imgElement - The image element
 * @param {HTMLElement} nameElement - The name element 
 * @param {string} token - The token symbol
 */
function updateTokenDisplay(imgElement, nameElement, token) {
  imgElement.src = `${TOKEN_ICON_BASE_URL}/${token}.svg`;
  nameElement.textContent = token;
}

/**
 * Selects a token from the modal
 * @param {string} token - The selected token
 * @param {boolean} isFromToken - Whether selecting "from" or "to" token
 */
function selectToken(token, isFromToken) {
  if (isFromToken) {
    if (token === appState.currentToToken) {
      swapDirection();
      return;
    }
    appState.currentFromToken = token;
    updateTokenDisplay(elements.fromTokenImg, elements.fromTokenName, token);
  } else {
    if (token === appState.currentFromToken) {
      swapDirection();
      return;
    }
    appState.currentToToken = token;
    updateTokenDisplay(elements.toTokenImg, elements.toTokenName, token);
  }
  
  updateBalances();
  calculateOutput();
  validateInput();
  closeTokenModal();
}

/**
 * Populates the token list in the modal
 * @param {boolean} isFromToken - Whether selecting "from" or "to" token
 */
function populateTokenList(isFromToken) {
  elements.tokenList.innerHTML = '';
  const searchValue = elements.tokenSearch.value.toLowerCase();
  
  const filteredTokens = appState.tokens.filter(token => 
    token.toLowerCase().includes(searchValue)
  );
  
  if (filteredTokens.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No tokens found';
    elements.tokenList.appendChild(noResults);
    return;
  }
  
  filteredTokens.forEach(token => {
    const tokenBalance = appState.walletBalances[token] || 0;
    
    const tokenItem = document.createElement('div');
    tokenItem.className = 'token-item';
    tokenItem.innerHTML = `
      <img src="${TOKEN_ICON_BASE_URL}/${token}.svg" alt="${token}">
      <div class="token-info">
        <div class="token-name">${token}</div>
      </div>
      <div class="token-balance">${formatAmount(tokenBalance, 4)}</div>
    `;
    
    tokenItem.addEventListener('click', () => {
      selectToken(token, isFromToken);
    });
    
    elements.tokenList.appendChild(tokenItem);
  });
}

/**
 * Opens the token selection modal
 * @param {boolean} isFromToken - Whether selecting "from" or "to" token
 */
function openTokenModal(isFromToken) {
  elements.tokenSearch.value = '';
  populateTokenList(isFromToken);
  elements.tokenModal.style.display = 'flex';
  
  // Store current selection type
  elements.tokenModal.dataset.isFromToken = isFromToken;
  
  // Focus the search input
  setTimeout(() => elements.tokenSearch.focus(), 100);
}

/**
 * Closes the token selection modal
 */
function closeTokenModal() {
  elements.tokenModal.style.display = 'none';
}

/**
 * Executes the token swap
 */
function executeSwap() {
  if (!validateInput()) return;
  
  // Show loading state
  setSwapButtonLoading(true);
  
  // Simulate API call for demo purposes
  setTimeout(() => {
    try {
      // Update balances
      appState.walletBalances[appState.currentFromToken] -= appState.fromAmount;
      appState.walletBalances[appState.currentToToken] += appState.toAmount;
      
      // Reset form
      resetForm();
      
      // Update UI
      updateBalances();
      
      // Show success and reset button
      setSwapButtonLoading(false);
      
      // Notify user
      showSuccessMessage('Swap executed successfully!');
    } catch (error) {
      handleError('Failed to execute swap', error);
      setSwapButtonLoading(false);
    }
  }, 2000);
}

/**
 * Sets the swap button loading state
 * @param {boolean} isLoading - Whether button is in loading state
 */
function setSwapButtonLoading(isLoading) {
  const btn = elements.swapBtn;
  
  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('loading');
    btn.textContent = '';
  } else {
    btn.classList.remove('loading');
    btn.textContent = 'Swap';
    btn.disabled = false;
  }
}

/**
 * Resets the form inputs
 */
function resetForm() {
  elements.inputAmount.value = '';
  elements.outputAmount.value = '';
  appState.fromAmount = 0;
  appState.toAmount = 0;
}

/**
 * Handles maximum amount button click
 */
function handleMaxButtonClick() {
  const balance = appState.walletBalances[appState.currentFromToken] || 0;
  elements.inputAmount.value = formatAmount(balance, 8, false);
  appState.fromAmount = balance;
  calculateOutput();
  validateInput();
}

/**
 * Handles input amount changes
 * @param {Event} e - The input event
 */
function handleInputAmountChange(e) {
  appState.fromAmount = parseFloat(e.target.value) || 0;
  calculateOutput();
  validateInput();
}

/**
 * Shows a success message to the user
 * @param {string} message - The success message
 */
function showSuccessMessage(message) {
  // In a real app, you might use a toast or notification system
  // For this demo, we'll use a simple alert
  alert(message);
}

/**
 * Formats an amount with proper decimal places
 * @param {number} value - The amount to format
 * @param {number} decimals - The number of decimal places (default: 6)
 * @param {boolean} trim - Whether to trim trailing zeros (default: true)
 * @returns {string} - The formatted amount
 */
function formatAmount(value, decimals = 6, trim = true) {
  if (isNaN(value)) return '0.00';
  
  const formatted = value.toFixed(decimals);
  
  if (trim) {
    // Remove trailing zeros after decimal point
    return formatted.replace(/\.?0+$/, '');
  }
  
  return formatted;
}

/**
 * Handles errors throughout the application
 * @param {string} context - Description of where the error occurred
 * @param {Error} error - The error object
 */
function handleError(context, error) {
  console.error(`${context}:`, error);
  
  // In a real app, you might want to show a user-friendly error message
  // or send the error to a monitoring service
}

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
  // Amount input
  elements.inputAmount.addEventListener('input', handleInputAmountChange);
  
  // Action buttons
  elements.swapBtn.addEventListener('click', executeSwap);
  elements.swapDirectionBtn.addEventListener('click', swapDirection);
  elements.maxBtn.addEventListener('click', handleMaxButtonClick);
  
  // Token selection
  elements.fromTokenSelector.addEventListener('click', () => openTokenModal(true));
  elements.toTokenSelector.addEventListener('click', () => openTokenModal(false));
  
  // Modal interactions
  elements.closeModal.addEventListener('click', closeTokenModal);
  elements.tokenSearch.addEventListener('input', () => {
    const isFromToken = elements.tokenModal.dataset.isFromToken === 'true';
    populateTokenList(isFromToken);
  });
  
  // Close modal when clicking outside
  elements.tokenModal.addEventListener('click', (e) => {
    if (e.target === elements.tokenModal) {
      closeTokenModal();
    }
  });
  
  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.tokenModal.style.display === 'flex') {
      closeTokenModal();
    }
  });
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);