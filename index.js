/**
 * BitLife Business Calculator - Complete with Percentage Toggles
 */

// ===== GLOBAL VARIABLES =====
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

// Percentage Toggle States
const toggleStates = {
    'forecast': 'increase',
    'buffer': 'increase',
    'buffer-analyst': 'increase'
};

// Store original values without commas for calculations
const rawValues = {
    'production-last-year': '',
    'sales': '',
    'forecast': '',
    'inventory': '',
    'min-buffer': '0',
    'production-analyst-last-year': '',
    'sales-analyst': '',
    'analyst-forecast': '',
    'inventory-analyst': '',
    'min-buffer-analyst': '0'
};

// ===== UTILITY FUNCTIONS =====
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
        let value = input.value;
        const id = input.id;
        
        // Store cursor position
        const cursorPosition = input.selectionStart;
        
        // Remove all non-numeric characters except minus sign for percentage fields
        const isPercentageField = id.includes('forecast') || id.includes('buffer');
        
        let cleanValue = value.replace(/[^0-9.-]/g, '');
        
        // Handle multiple decimal points or minus signs
        if (cleanValue.split('.').length > 2) {
            cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('.'));
        }
        if (cleanValue.split('-').length > 2) {
            cleanValue = '-' + cleanValue.replace(/-/g, '');
        }
        
        // Store raw value for calculations
        rawValues[id] = cleanValue;
        
        // Format with commas for display (but keep as text for number inputs)
        if (cleanValue === '' || cleanValue === '-') {
            input.value = cleanValue;
        } else {
            const numValue = parseFloat(cleanValue);
            if (!isNaN(numValue)) {
                // For percentage fields, allow decimal formatting
                if (isPercentageField) {
                    input.value = numValue.toString();
                } else {
                    input.value = numValue.toLocaleString('en-US');
                }
            } else {
                input.value = cleanValue;
            }
        }
        
        // Restore cursor position
        setTimeout(() => {
            const newLength = input.value.length;
            const offset = input.value.length - value.length;
            let newPosition = cursorPosition + offset;
            
            // Ensure cursor stays within bounds
            newPosition = Math.max(0, Math.min(newPosition, newLength));
            input.setSelectionRange(newPosition, newPosition);
        }, 0);
        
        // Trigger calculation
        if (method === '1') {
            BitLifeCalculator.calculateMethod1();
        } else if (method === '2') {
            BitLifeCalculator.calculateMethod2();
        }
    }

    /**
     * Get raw value for calculation
     */
    static getRawValue(inputId) {
        return rawValues[inputId] || '';
    }

    /**
     * Validate and format input on blur
     */
    static validateInput(input) {
        const id = input.id;
        let rawValue = rawValues[id] || '';
        
        if (rawValue === '' || rawValue === '-') {
            input.value = rawValue === '-' ? '-' : '';
            return;
        }
        
        const numValue = parseFloat(rawValue);
        if (!isNaN(numValue)) {
            const isPercentageField = id.includes('forecast') || id.includes('buffer');
            if (isPercentageField) {
                input.value = numValue.toString();
            } else {
                input.value = numValue.toLocaleString('en-US');
            }
        }
    }
}

// ===== PERCENTAGE TOGGLE SYSTEM =====
class PercentageToggle {
    /**
     * Initialize toggle buttons
     */
    static init() {
        // Set up click events for all toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(button => {
            button.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const direction = this.getAttribute('data-direction');
                
                // Update toggle state
                PercentageToggle.update(type, direction);
            });
        });
    }
    
    /**
     * Update toggle state and UI
     */
    static update(type, direction) {
        // Update state
        toggleStates[type] = direction;
        
        // Update UI for this toggle group
        const buttons = document.querySelectorAll(`.toggle-btn[data-type="${type}"]`);
        buttons.forEach(btn => {
            const btnDirection = btn.getAttribute('data-direction');
            btn.classList.toggle('active', btnDirection === direction);
        });
        
        // Trigger recalculation
        if (type === 'forecast' || type === 'buffer') {
            BitLifeCalculator.calculateMethod1();
        } else if (type === 'buffer-analyst') {
            BitLifeCalculator.calculateMethod2();
        }
    }
    
    /**
     * Get adjusted percentage value based on toggle state
     */
    static getAdjustedValue(type, rawValue) {
        const direction = toggleStates[type];
        const numValue = CalculatorUtils.parseInputValue(rawValue);
        
        if (direction === 'decrease') {
            return -Math.abs(numValue); // Negative for decrease
        }
        return Math.abs(numValue); // Positive for increase
    }
    
    /**
     * Get display value with sign
     */
    static getDisplayValue(type, rawValue) {
        const direction = toggleStates[type];
        const numValue = CalculatorUtils.parseInputValue(rawValue);
        
        if (numValue === 0) return '0';
        
        if (direction === 'decrease') {
            return `-${Math.abs(numValue)}`;
        }
        return `+${Math.abs(numValue)}`;
    }
}

// ===== ANIMATION MANAGER =====
class AnimationManager {
    static animateNumber(element, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        element.classList.add('animating');
        setTimeout(() => {
            element.classList.remove('animating');
        }, 400);
    }
    
    static animateStatus(element, message) {
        if (message) {
            element.textContent = message;
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'all 0.3s ease';
            }, 10);
        } else {
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                element.textContent = '';
            }, 300);
        }
    }
    
    static createConfetti() {
        // Simple confetti effect
        console.log('🎉 Success!');
    }
}

// ===== MAIN CALCULATOR =====
class BitLifeCalculator {
    /**
     * Method 1 Calculation (Percentage-Based)
     */
    static calculateMethod1() {
        try {
            // Get raw values for calculation
            const sales = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('sales'));
            const productionLastYear = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('production-last-year'));
            const forecastRaw = CalculatorUtils.getRawValue('forecast');
            const inventory = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('inventory'));
            const minBufferRaw = CalculatorUtils.getRawValue('min-buffer');
            
            // Apply toggle adjustments
            const forecastPct = PercentageToggle.getAdjustedValue('forecast', forecastRaw);
            const minBufferPct = PercentageToggle.getAdjustedValue('buffer', minBufferRaw);
            
            console.log('Method 1 Values:', { sales, productionLastYear, forecastPct, inventory, minBufferPct });
            
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
            const forecastDisplay = PercentageToggle.getDisplayValue('forecast', forecastRaw);
            const bufferDisplay = PercentageToggle.getDisplayValue('buffer', minBufferRaw);
            
            if (minBufferPct > 0 && requiredProduction === minProduction && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${bufferDisplay}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Buffer reduction (${bufferDisplay}%) - careful with low inventory`;
            } else if (forecastPct > 0 && CalculatorUtils.parseInputValue(forecastRaw) > 0) {
                statusMsg = `📈 Forecast: ${forecastDisplay}% increase`;
            } else if (forecastPct < 0) {
                statusMsg = `📉 Forecast: ${forecastDisplay}% decrease`;
            } else if (requiredProduction === 0) {
                statusMsg = '✓ Inventory sufficient. No production needed.';
            }
            
            // Update displays
            demandValue.textContent = CalculatorUtils.formatNumber(forecastDemand);
            productionValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            statusMessage.textContent = statusMsg;
            
        } catch (error) {
            console.error('Method 1 Calculation Error:', error);
            demandValue.textContent = '--';
            productionValue.textContent = '--';
            statusMessage.textContent = '';
        }
    }

    /**
     * Method 2 Calculation (Analyst Forecast)
     */
    static calculateMethod2() {
        try {
            // Get raw values for calculation
            const sales = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('sales-analyst'));
            const productionLastYear = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('production-analyst-last-year'));
            const additionalForecast = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('analyst-forecast'));
            const inventory = CalculatorUtils.parseInputValue(CalculatorUtils.getRawValue('inventory-analyst'));
            const minBufferRaw = CalculatorUtils.getRawValue('min-buffer-analyst');
            
            // Apply toggle adjustment for buffer
            const minBufferPct = PercentageToggle.getAdjustedValue('buffer-analyst', minBufferRaw);
            
            console.log('Method 2 Values:', { sales, productionLastYear, additionalForecast, inventory, minBufferPct });
            
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
            const bufferDisplay = PercentageToggle.getDisplayValue('buffer-analyst', minBufferRaw);
            
            if (minBufferPct > 0 && requiredProduction === minProduction && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${bufferDisplay}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Buffer reduction (${bufferDisplay}%) - careful with low inventory`;
            } else if (requiredProduction === 0) {
                statusMsg = '✓ Inventory sufficient. No production needed.';
            }
            
            // Update displays
            totalDemandValue.textContent = CalculatorUtils.formatNumber(totalForecastDemand);
            productionAnalystValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            statusAnalystMessage.textContent = statusMsg;
            
        } catch (error) {
            console.error('Method 2 Calculation Error:', error);
            totalDemandValue.textContent = '--';
            productionAnalystValue.textContent = '--';
            statusAnalystMessage.textContent = '';
        }
    }

    /**
     * Reset Method 1
     */
    static resetMethod1() {
        // Clear inputs
        salesInput.value = '';
        productionLastYearInput.value = '';
        forecastInput.value = '';
        inventoryInput.value = '';
        minBufferInput.value = '0';
        
        // Clear raw values
        rawValues['sales'] = '';
        rawValues['production-last-year'] = '';
        rawValues['forecast'] = '';
        rawValues['inventory'] = '';
        rawValues['min-buffer'] = '0';
        
        // Reset toggles to increase
        PercentageToggle.update('forecast', 'increase');
        PercentageToggle.update('buffer', 'increase');
        
        // Reset results
        demandValue.textContent = '0';
        productionValue.textContent = '0';
        statusMessage.textContent = '';
    }

    /**
     * Reset Method 2
     */
    static resetMethod2() {
        // Clear inputs
        salesAnalystInput.value = '';
        productionAnalystLastYearInput.value = '';
        analystForecastInput.value = '';
        inventoryAnalystInput.value = '';
        minBufferAnalystInput.value = '0';
        
        // Clear raw values
        rawValues['sales-analyst'] = '';
        rawValues['production-analyst-last-year'] = '';
        rawValues['analyst-forecast'] = '';
        rawValues['inventory-analyst'] = '';
        rawValues['min-buffer-analyst'] = '0';
        
        // Reset toggle to increase
        PercentageToggle.update('buffer-analyst', 'increase');
        
        // Reset results
        totalDemandValue.textContent = '0';
        productionAnalystValue.textContent = '0';
        statusAnalystMessage.textContent = '';
    }
}

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('🚀 BitLife Calculator Initializing...');
    
    // Initialize percentage toggles
    PercentageToggle.init();
    
    // Set up input event listeners with comma formatting
    setupEventListeners();
    
    // Load example data
    setTimeout(loadExampleData, 500);
}

function setupEventListeners() {
    // Method 1 inputs
    const method1Inputs = [
        productionLastYearInput,
        salesInput,
        forecastInput,
        inventoryInput,
        minBufferInput
    ];
    
    method1Inputs.forEach(input => {
        input.addEventListener('input', () => CalculatorUtils.formatInput(input));
        input.addEventListener('blur', () => CalculatorUtils.validateInput(input));
    });
    
    // Method 2 inputs
    const method2Inputs = [
        productionAnalystLastYearInput,
        salesAnalystInput,
        analystForecastInput,
        inventoryAnalystInput,
        minBufferAnalystInput
    ];
    
    method2Inputs.forEach(input => {
        input.addEventListener('input', () => CalculatorUtils.formatInput(input));
        input.addEventListener('blur', () => CalculatorUtils.validateInput(input));
    });
    
    // Reset buttons
    resetMethod1Btn.addEventListener('click', () => BitLifeCalculator.resetMethod1());
    resetMethod2Btn.addEventListener('click', () => BitLifeCalculator.resetMethod2());
}

function loadExampleData() {
    // Calculate both methods
    BitLifeCalculator.calculateMethod1();
    BitLifeCalculator.calculateMethod2();
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally
window.calculateMethod1 = BitLifeCalculator.calculateMethod1;
window.calculateMethod2 = BitLifeCalculator.calculateMethod2;
window.resetMethod1 = BitLifeCalculator.resetMethod1;
window.resetMethod2 = BitLifeCalculator.resetMethod2;