/**
 * BitLife Business Calculator - With Fixed Input Handling
 */

// DOM elements for Method 1
const productionLastYearInput = document.getElementById('production-last-year');
const salesInput = document.getElementById('sales');
const forecastInput = document.getElementById('forecast');
const inventoryInput = document.getElementById('inventory');
const minBufferInput = document.getElementById('min-buffer');
const demandValue = document.getElementById('demand-value');
const productionValue = document.getElementById('production-value');
const statusMessage = document.getElementById('status-message');
const resetMethod1Btn = document.getElementById('reset-method1');

// DOM elements for Method 2
const productionAnalystLastYearInput = document.getElementById('production-analyst-last-year');
const salesAnalystInput = document.getElementById('sales-analyst');
const analystForecastInput = document.getElementById('analyst-forecast');
const inventoryAnalystInput = document.getElementById('inventory-analyst');
const minBufferAnalystInput = document.getElementById('min-buffer-analyst');
const totalDemandValue = document.getElementById('total-demand-value');
const productionAnalystValue = document.getElementById('production-analyst-value');
const statusAnalystMessage = document.getElementById('status-analyst-message');
const resetMethod2Btn = document.getElementById('reset-method2');

// Animation Manager
class AnimationManager {
    static animateNumber(element, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        element.classList.add('animating');
        setTimeout(() => {
            element.classList.remove('animating');
        }, 400);
        
        if (element.classList.contains('demand-value')) {
            element.classList.add('info-glow');
            setTimeout(() => element.classList.remove('info-glow'), 1500);
        } else if (element.classList.contains('production-value')) {
            element.classList.add('success-glow');
            setTimeout(() => element.classList.remove('success-glow'), 1500);
        }
    }
    
    static animateStatus(element, message) {
        if (message) {
            element.textContent = message;
            element.classList.add('show');
        } else {
            element.classList.remove('show');
            setTimeout(() => {
                element.textContent = '';
            }, 400);
        }
    }
    
    static animateInputFocus(input) {
        input.classList.add('focus-animation');
        setTimeout(() => {
            input.classList.remove('focus-animation');
        }, 1000);
    }
    
    static createConfetti() {
        const colors = ['#d4af37', '#60a5fa', '#4ade80'];
        
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.left = `${Math.random() * 100}vw`;
                confetti.style.top = '-10px';
                confetti.style.width = `${Math.random() * 6 + 3}px`;
                confetti.style.height = `${Math.random() * 6 + 3}px`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = '50%';
                confetti.style.opacity = '0.8';
                
                const animationName = `confetti-${Date.now()}-${i}`;
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes ${animationName} {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(80vh) rotate(${Math.random() * 360}deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                confetti.style.animation = `${animationName} ${Math.random() * 2 + 1.5}s ease-out forwards`;
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    if (confetti.parentNode) confetti.remove();
                    if (style.parentNode) style.remove();
                }, 2000);
            }, i * 100);
        }
    }
}

// Utility functions - FIXED VERSION
class CalculatorUtils {
    /**
     * Format number with commas
     */
    static formatNumber(num) {
        if (isNaN(num) || num === null) return '0';
        return Math.round(num).toLocaleString('en-US');
    }

    /**
     * Parse input value - FIXED for negative numbers
     */
    static parseInputValue(value) {
        if (!value || value.trim() === '') return 0;
        
        // Remove commas if present
        const cleanValue = value.replace(/,/g, '');
        
        // Parse as float (allows negative numbers and decimals)
        const parsed = parseFloat(cleanValue);
        
        // Return 0 if NaN, otherwise the parsed value
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Format input field with commas as user types - FIXED
     * This handles both positive and negative numbers with commas
     */
    static formatInput(input) {
        const method = input.getAttribute('data-method');
        let value = input.value;
        
        // Store cursor position
        const cursorPosition = input.selectionStart;
        
        // Check if we should allow negative (only for forecast and buffer fields)
        const allowNegative = input.id.includes('forecast') || input.id.includes('buffer');
        
        // Remove all commas to work with raw number
        const rawValue = value.replace(/,/g, '');
        
        // Check if valid number (including negative if allowed)
        if (rawValue === '' || rawValue === '-') {
            // Allow empty or just minus sign for negative numbers
            if (method === '1') calculateMethod1();
            if (method === '2') calculateMethod2();
            return;
        }
        
        // Check if it's a valid number
        const numValue = parseFloat(rawValue);
        
        if (!isNaN(numValue)) {
            // Check if negative is allowed
            if (numValue < 0 && !allowNegative) {
                // Don't allow negative for this field
                input.value = Math.abs(numValue).toLocaleString('en-US');
            } else {
                // Format with commas
                input.value = numValue.toLocaleString('en-US');
            }
            
            // Try to restore cursor position (approximate)
            setTimeout(() => {
                const newLength = input.value.length;
                const newPosition = Math.min(cursorPosition + (input.value.length - value.length), newLength);
                input.setSelectionRange(newPosition, newPosition);
            }, 0);
        }
        
        // Animate the input focus
        AnimationManager.animateInputFocus(input);
        
        // Trigger calculation
        if (method === '1') {
            calculateMethod1();
        } else if (method === '2') {
            calculateMethod2();
        }
    }

    /**
     * Validate input on blur - ensure proper formatting
     */
    static validateInput(input) {
        let value = input.value.replace(/,/g, '');
        
        if (value === '' || value === '-') {
            input.value = value === '-' ? '-' : '';
            return;
        }
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            input.value = numValue.toLocaleString('en-US');
        }
    }
}

// Calculator logic with animations
class BitLifeCalculator {
    /**
     * Method 1 Calculation (Percentage-Based)
     */
    static calculateMethod1() {
        try {
            // Get input values
            const sales = CalculatorUtils.parseInputValue(salesInput.value);
            const productionLastYear = CalculatorUtils.parseInputValue(productionLastYearInput.value);
            const forecastPct = CalculatorUtils.parseInputValue(forecastInput.value);
            const inventory = CalculatorUtils.parseInputValue(inventoryInput.value);
            const minBufferPct = CalculatorUtils.parseInputValue(minBufferInput.value);
            
            // Calculate average base from Sales and Last Year Production
            let baseForecast;
            if (sales + productionLastYear > 0) {
                baseForecast = (sales + productionLastYear) / 2;
            } else {
                baseForecast = sales;
            }
            
            // Forecast Demand = Base × (1 + Analyst Percentage / 100)
            const forecastDemand = baseForecast * (1 + forecastPct / 100);
            
            // Required Production = Forecast Demand − Current Inventory
            let requiredProduction = forecastDemand - inventory;
            
            // Calculate minimum production buffer
            const minProduction = minBufferPct > 0 ? forecastDemand * (minBufferPct / 100) : 0;
            
            // Never recommend negative production, but enforce minimum buffer if set
            requiredProduction = Math.max(requiredProduction, minProduction);
            
            // Determine status message
            let statusMsg = '';
            if (minBufferPct > 0 && requiredProduction === minProduction && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${minBufferPct}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Negative buffer (${minBufferPct}%) - careful!`;
            } else if (forecastPct < 0) {
                statusMsg = `📉 Negative forecast (${forecastPct}%) - decreasing production`;
            } else if (requiredProduction === 0) {
                statusMsg = '✓ Inventory sufficient. No production needed.';
                if (sales > 0 || productionLastYear > 0) {
                    AnimationManager.createConfetti();
                }
            }
            
            // Get current values for animation comparison
            const currentDemand = CalculatorUtils.parseInputValue(demandValue.textContent);
            const currentProduction = CalculatorUtils.parseInputValue(productionValue.textContent);
            
            // Update displays with animations
            demandValue.textContent = CalculatorUtils.formatNumber(forecastDemand);
            productionValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            
            // Animate number changes
            AnimationManager.animateNumber(demandValue, currentDemand, forecastDemand);
            AnimationManager.animateNumber(productionValue, currentProduction, requiredProduction);
            
            // Animate status message
            AnimationManager.animateStatus(statusMessage, statusMsg);
            
        } catch (error) {
            demandValue.textContent = '--';
            productionValue.textContent = '--';
            statusMessage.textContent = '';
            statusMessage.classList.remove('show');
        }
    }

    /**
     * Method 2 Calculation (Analyst Forecast)
     */
    static calculateMethod2() {
        try {
            // Get input values
            const sales = CalculatorUtils.parseInputValue(salesAnalystInput.value);
            const productionLastYear = CalculatorUtils.parseInputValue(productionAnalystLastYearInput.value);
            const additionalForecast = CalculatorUtils.parseInputValue(analystForecastInput.value);
            const inventory = CalculatorUtils.parseInputValue(inventoryAnalystInput.value);
            const minBufferPct = CalculatorUtils.parseInputValue(minBufferAnalystInput.value);
            
            // Calculate average base from Sales and Last Year Production
            let baseForecast;
            if (sales + productionLastYear > 0) {
                baseForecast = (sales + productionLastYear) / 2;
            } else {
                baseForecast = sales;
            }
            
            // Total Forecast Demand = Base Average + Additional Forecast
            const totalForecastDemand = baseForecast + additionalForecast;
            
            // Required Production = Total Forecast Demand − Current Inventory
            let requiredProduction = totalForecastDemand - inventory;
            
            // Calculate minimum production buffer
            const minProduction = minBufferPct > 0 ? totalForecastDemand * (minBufferPct / 100) : 0;
            
            // Never recommend negative production, but enforce minimum buffer if set
            requiredProduction = Math.max(requiredProduction, minProduction);
            
            // Determine status message
            let statusMsg = '';
            if (minBufferPct > 0 && requiredProduction === minProduction && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${minBufferPct}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Negative buffer (${minBufferPct}%) - careful!`;
            } else if (requiredProduction === 0) {
                statusMsg = '✓ Inventory sufficient. No production needed.';
                if (sales > 0 || productionLastYear > 0) {
                    AnimationManager.createConfetti();
                }
            }
            
            // Get current values for animation comparison
            const currentTotalDemand = CalculatorUtils.parseInputValue(totalDemandValue.textContent);
            const currentProduction = CalculatorUtils.parseInputValue(productionAnalystValue.textContent);
            
            // Update displays with animations
            totalDemandValue.textContent = CalculatorUtils.formatNumber(totalForecastDemand);
            productionAnalystValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            
            // Animate number changes
            AnimationManager.animateNumber(totalDemandValue, currentTotalDemand, totalForecastDemand);
            AnimationManager.animateNumber(productionAnalystValue, currentProduction, requiredProduction);
            
            // Animate status message
            AnimationManager.animateStatus(statusAnalystMessage, statusMsg);
            
        } catch (error) {
            totalDemandValue.textContent = '--';
            productionAnalystValue.textContent = '--';
            statusAnalystMessage.textContent = '';
            statusAnalystMessage.classList.remove('show');
        }
    }

    static resetMethod1() {
        AnimationManager.animateNumber(demandValue, CalculatorUtils.parseInputValue(demandValue.textContent), 0);
        AnimationManager.animateNumber(productionValue, CalculatorUtils.parseInputValue(productionValue.textContent), 0);
        
        salesInput.value = '';
        productionLastYearInput.value = '';
        forecastInput.value = '';
        inventoryInput.value = '';
        minBufferInput.value = '0';
        
        AnimationManager.animateStatus(statusMessage, '');
        AnimationManager.createConfetti();
        
        setTimeout(() => {
            demandValue.textContent = '0';
            productionValue.textContent = '0';
        }, 300);
    }

    static resetMethod2() {
        AnimationManager.animateNumber(totalDemandValue, CalculatorUtils.parseInputValue(totalDemandValue.textContent), 0);
        AnimationManager.animateNumber(productionAnalystValue, CalculatorUtils.parseInputValue(productionAnalystValue.textContent), 0);
        
        salesAnalystInput.value = '';
        productionAnalystLastYearInput.value = '';
        analystForecastInput.value = '';
        inventoryAnalystInput.value = '';
        minBufferAnalystInput.value = '0';
        
        AnimationManager.animateStatus(statusAnalystMessage, '');
        AnimationManager.createConfetti();
        
        setTimeout(() => {
            totalDemandValue.textContent = '0';
            productionAnalystValue.textContent = '0';
        }, 300);
    }
}

// Initialize everything
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Load example data after a delay
    setTimeout(() => {
        // Calculate both methods
        BitLifeCalculator.calculateMethod1();
        BitLifeCalculator.calculateMethod2();
    }, 800);
}

function setupEventListeners() {
    // Method 1 inputs
    productionLastYearInput.addEventListener('input', () => CalculatorUtils.formatInput(productionLastYearInput));
    salesInput.addEventListener('input', () => CalculatorUtils.formatInput(salesInput));
    forecastInput.addEventListener('input', () => CalculatorUtils.formatInput(forecastInput));
    inventoryInput.addEventListener('input', () => CalculatorUtils.formatInput(inventoryInput));
    minBufferInput.addEventListener('input', () => CalculatorUtils.formatInput(minBufferInput));
    
    // Add blur validation
    productionLastYearInput.addEventListener('blur', () => CalculatorUtils.validateInput(productionLastYearInput));
    salesInput.addEventListener('blur', () => CalculatorUtils.validateInput(salesInput));
    forecastInput.addEventListener('blur', () => CalculatorUtils.validateInput(forecastInput));
    inventoryInput.addEventListener('blur', () => CalculatorUtils.validateInput(inventoryInput));
    minBufferInput.addEventListener('blur', () => CalculatorUtils.validateInput(minBufferInput));
    
    // Method 2 inputs
    productionAnalystLastYearInput.addEventListener('input', () => CalculatorUtils.formatInput(productionAnalystLastYearInput));
    salesAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(salesAnalystInput));
    analystForecastInput.addEventListener('input', () => CalculatorUtils.formatInput(analystForecastInput));
    inventoryAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(inventoryAnalystInput));
    minBufferAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(minBufferAnalystInput));
    
    // Add blur validation for method 2
    productionAnalystLastYearInput.addEventListener('blur', () => CalculatorUtils.validateInput(productionAnalystLastYearInput));
    salesAnalystInput.addEventListener('blur', () => CalculatorUtils.validateInput(salesAnalystInput));
    analystForecastInput.addEventListener('blur', () => CalculatorUtils.validateInput(analystForecastInput));
    inventoryAnalystInput.addEventListener('blur', () => CalculatorUtils.validateInput(inventoryAnalystInput));
    minBufferAnalystInput.addEventListener('blur', () => CalculatorUtils.validateInput(minBufferAnalystInput));
    
    // Reset buttons
    resetMethod1Btn.addEventListener('click', () => BitLifeCalculator.resetMethod1());
    resetMethod2Btn.addEventListener('click', () => BitLifeCalculator.resetMethod2());
}

// Make functions globally available
window.calculateMethod1 = BitLifeCalculator.calculateMethod1;
window.calculateMethod2 = BitLifeCalculator.calculateMethod2;
window.resetMethod1 = BitLifeCalculator.resetMethod1;
window.resetMethod2 = BitLifeCalculator.resetMethod2;

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);