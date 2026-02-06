/**
 * BitLife Business Calculator - With Enhanced Animations
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
        
        // Add animation class
        element.classList.add('animating');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('animating');
        }, 400);
        
        // Add success/info glow based on element type
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
        // Create subtle confetti effect on success
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
                
                // Animation
                const animationName = `confetti-${Date.now()}-${i}`;
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes ${animationName} {
                        0% {
                            transform: translateY(0) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(80vh) rotate(${Math.random() * 360}deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(style);
                
                confetti.style.animation = `${animationName} ${Math.random() * 2 + 1.5}s ease-out forwards`;
                
                document.body.appendChild(confetti);
                
                // Cleanup
                setTimeout(() => {
                    if (confetti.parentNode) confetti.remove();
                    if (style.parentNode) style.remove();
                }, 2000);
            }, i * 100);
        }
    }
}

// Utility functions
class CalculatorUtils {
    /**
     * Format number with commas
     */
    static formatNumber(num) {
        if (isNaN(num) || num === null) return '0';
        return Math.round(num).toLocaleString('en-US');
    }

    /**
     * Parse input value, remove commas
     */
    static parseInputValue(value) {
        if (!value || value.trim() === '') return 0;
        // Remove commas and parse as float
        const cleanValue = value.replace(/,/g, '');
        const parsed = parseFloat(cleanValue);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * Format input field with commas as user types
     */
    static formatInput(input) {
        const method = input.getAttribute('data-method');
        
        // For number inputs, we need to handle the value differently
        const rawValue = input.value;
        
        // Remove any commas for calculation
        const cleanValue = rawValue.replace(/,/g, '');
        
        // Only format if it's a valid number and not empty
        if (cleanValue && !isNaN(cleanValue) && cleanValue !== '') {
            // For display, add commas
            const numValue = parseFloat(cleanValue);
            if (!isNaN(numValue)) {
                input.value = numValue.toLocaleString('en-US');
            }
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
            // Invalid input: clear results
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
            // Invalid input: clear results
            totalDemandValue.textContent = '--';
            productionAnalystValue.textContent = '--';
            statusAnalystMessage.textContent = '';
            statusAnalystMessage.classList.remove('show');
        }
    }

    /**
     * Reset Method 1 inputs and results
     */
    static resetMethod1() {
        // Animate the reset
        AnimationManager.animateNumber(demandValue, CalculatorUtils.parseInputValue(demandValue.textContent), 0);
        AnimationManager.animateNumber(productionValue, CalculatorUtils.parseInputValue(productionValue.textContent), 0);
        
        // Clear inputs
        salesInput.value = '';
        productionLastYearInput.value = '';
        forecastInput.value = '';
        inventoryInput.value = '';
        minBufferInput.value = '0';
        
        // Animate status message removal
        AnimationManager.animateStatus(statusMessage, '');
        
        // Create confetti effect
        AnimationManager.createConfetti();
        
        // Add small delay before setting final values
        setTimeout(() => {
            demandValue.textContent = '0';
            productionValue.textContent = '0';
        }, 300);
    }

    /**
     * Reset Method 2 inputs and results
     */
    static resetMethod2() {
        // Animate the reset
        AnimationManager.animateNumber(totalDemandValue, CalculatorUtils.parseInputValue(totalDemandValue.textContent), 0);
        AnimationManager.animateNumber(productionAnalystValue, CalculatorUtils.parseInputValue(productionAnalystValue.textContent), 0);
        
        // Clear inputs
        salesAnalystInput.value = '';
        productionAnalystLastYearInput.value = '';
        analystForecastInput.value = '';
        inventoryAnalystInput.value = '';
        minBufferAnalystInput.value = '0';
        
        // Animate status message removal
        AnimationManager.animateStatus(statusAnalystMessage, '');
        
        // Create confetti effect
        AnimationManager.createConfetti();
        
        // Add small delay before setting final values
        setTimeout(() => {
            totalDemandValue.textContent = '0';
            productionAnalystValue.textContent = '0';
        }, 300);
    }
}

// Initialize everything
function initializeApp() {
    console.log('BitLife Calculator Initializing...');
    
    // Set up event listeners
    setupEventListeners();
    
    // Add initial animations to elements
    addInitialAnimations();
    
    // Load example data after a delay
    setTimeout(loadExampleData, 800);
}

function setupEventListeners() {
    // Method 1 inputs
    productionLastYearInput.addEventListener('input', () => CalculatorUtils.formatInput(productionLastYearInput));
    salesInput.addEventListener('input', () => CalculatorUtils.formatInput(salesInput));
    forecastInput.addEventListener('input', () => CalculatorUtils.formatInput(forecastInput));
    inventoryInput.addEventListener('input', () => CalculatorUtils.formatInput(inventoryInput));
    minBufferInput.addEventListener('input', () => CalculatorUtils.formatInput(minBufferInput));
    resetMethod1Btn.addEventListener('click', () => BitLifeCalculator.resetMethod1());
    
    // Method 2 inputs
    productionAnalystLastYearInput.addEventListener('input', () => CalculatorUtils.formatInput(productionAnalystLastYearInput));
    salesAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(salesAnalystInput));
    analystForecastInput.addEventListener('input', () => CalculatorUtils.formatInput(analystForecastInput));
    inventoryAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(inventoryAnalystInput));
    minBufferAnalystInput.addEventListener('input', () => CalculatorUtils.formatInput(minBufferAnalystInput));
    resetMethod2Btn.addEventListener('click', () => BitLifeCalculator.resetMethod2());
    
    // Add focus animations to all inputs
    const allInputs = document.querySelectorAll('input[type="text"]');
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            AnimationManager.animateInputFocus(input);
        });
    });
}

function addInitialAnimations() {
    // Add staggered animation classes to input groups
    const inputGroups = document.querySelectorAll('.input-group');
    inputGroups.forEach((group, index) => {
        group.classList.add('fade-in-up');
        group.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
    
    // Add animation to section cards
    const sectionCards = document.querySelectorAll('.section-card');
    sectionCards.forEach(card => {
        card.classList.add('fade-in-up');
    });
    
    // Add animation to title
    const title = document.querySelector('.bitlife-title');
    const subtitle = document.querySelector('.bitlife-subtitle');
    title.classList.add('fade-in');
    subtitle.classList.add('fade-in');
}

function loadExampleData() {
    console.log('Loading example data...');
    // Calculate both methods
    BitLifeCalculator.calculateMethod1();
    BitLifeCalculator.calculateMethod2();
}

// Make functions globally available
window.calculateMethod1 = BitLifeCalculator.calculateMethod1;
window.calculateMethod2 = BitLifeCalculator.calculateMethod2;
window.resetMethod1 = BitLifeCalculator.resetMethod1;
window.resetMethod2 = BitLifeCalculator.resetMethod2;

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Offline support
window.addEventListener('offline', function() {
    console.log('You are offline');
    showToast('⚠️ You are offline - calculations saved locally');
});

window.addEventListener('online', function() {
    console.log('You are back online');
    showToast('✅ Back online');
});

// Toast notification function
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = 'var(--bg-secondary)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.border = '1px solid var(--accent-color)';
    toast.style.zIndex = '10000';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if(toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}