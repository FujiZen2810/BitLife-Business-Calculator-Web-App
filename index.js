/**
 * BitLife Business Calculator - Complete with Percentage Toggles & Minimum Production
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
const minProductionValue = document.getElementById('min-production-value');
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
const minProductionAnalystValue = document.getElementById('min-production-analyst-value');
const statusAnalystMessage = document.getElementById('status-analyst-message');
const resetMethod2Btn = document.getElementById('reset-method2');

// Business Scenario Factors
const BUSINESS_SCENARIOS = {
    normal: {
        name: "Normal Market",
        minMultiplier: 0.85,
        description: "Stable market conditions",
        color: "#3498db",
        icon: "🏢"
    },
    volatile: {
        name: "Volatile Market",
        minMultiplier: 0.75,
        description: "High market fluctuations",
        color: "#e74c3c",
        icon: "🌪️"
    },
    seasonal: {
        name: "Seasonal Business",
        minMultiplier: 0.80,
        description: "Seasonal demand patterns",
        color: "#f39c12",
        icon: "📅"
    },
    luxury: {
        name: "Luxury Goods",
        minMultiplier: 0.90,
        description: "Premium market segment",
        color: "#9b59b6",
        icon: "💎"
    },
    essential: {
        name: "Essential Goods",
        minMultiplier: 0.95,
        description: "Stable essential demand",
        color: "#2ecc71",
        icon: "🛒"
    }
};

// Current business scenario
let currentScenario = 'normal';

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
        
        // Check if this is a percentage field or regular number field
        const isPercentageField = id.includes('forecast') && id !== 'analyst-forecast' || 
                                 id.includes('buffer');
        const isNumberField = !isPercentageField;
        
        // Remove all non-numeric characters except minus sign
        let cleanValue;
        if (isPercentageField) {
            // For percentage fields: allow numbers, decimal points, and minus sign
            cleanValue = value.replace(/[^0-9.-]/g, '');
        } else {
            // For number fields: allow only numbers
            cleanValue = value.replace(/[^0-9]/g, '');
        }
        
        // Handle multiple decimal points or minus signs
        if (cleanValue.split('.').length > 2) {
            cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('.'));
        }
        if (cleanValue.split('-').length > 2) {
            cleanValue = '-' + cleanValue.replace(/-/g, '');
        }
        
        // Store raw value for calculations
        rawValues[id] = cleanValue;
        
        // Format with commas for display
        if (cleanValue === '' || cleanValue === '-') {
            input.value = cleanValue;
        } else {
            const numValue = parseFloat(cleanValue);
            if (!isNaN(numValue)) {
                if (isPercentageField) {
                    // Percentage fields: no commas, just the number
                    input.value = numValue.toString();
                } else {
                    // Regular number fields: add commas
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
            const isPercentageField = (id.includes('forecast') && id !== 'analyst-forecast') || 
                                     id.includes('buffer');
            if (isPercentageField) {
                input.value = numValue.toString();
            } else {
                input.value = numValue.toLocaleString('en-US');
            }
        }
    }

    /**
     * Calculate minimum production based on business scenario
     */
    static calculateMinimumProduction(requiredProduction, businessScenario = 'normal') {
        if (requiredProduction <= 0) return 0;
        
        const scenario = BUSINESS_SCENARIOS[businessScenario] || BUSINESS_SCENARIOS.normal;
        let minProduction = requiredProduction * scenario.minMultiplier;
        
        // Add some randomness (±5%) to simulate real-world variability
        const randomFactor = 0.95 + (Math.random() * 0.1); // 0.95 to 1.05
        minProduction = minProduction * randomFactor;
        
        // Round to nearest 100 for realistic numbers
        minProduction = Math.round(minProduction / 100) * 100;
        
        // Ensure minimum production is at least 100 units if original production is significant
        if (requiredProduction > 1000 && minProduction < 100) {
            minProduction = 100;
        }
        
        // Don't let minimum production be higher than required production
        return Math.min(Math.max(0, Math.round(minProduction)), requiredProduction);
    }

    /**
     * Get random business scenario based on inputs
     */
    static getBusinessScenario(sales, productionLastYear, forecastPct) {
        // Analyze inputs to determine likely scenario
        const volatility = Math.abs(forecastPct);
        const salesGrowth = sales > 0 && productionLastYear > 0 ? 
            ((sales - productionLastYear) / productionLastYear) * 100 : 0;
        
        // Determine scenario based on characteristics
        if (volatility > 30) {
            return 'volatile';
        } else if (Math.abs(salesGrowth) > 20) {
            return 'seasonal';
        } else if (forecastPct > 15) {
            return 'luxury';
        } else if (forecastPct < -10) {
            return 'essential';
        }
        
        return 'normal';
    }

    /**
     * Get scenario info HTML
     */
    static getScenarioHTML(scenarioKey) {
        const scenario = BUSINESS_SCENARIOS[scenarioKey] || BUSINESS_SCENARIOS.normal;
        return `
            <div class="scenario-badge" style="background-color: ${scenario.color}20; border-left: 4px solid ${scenario.color}">
                <div class="scenario-icon">${scenario.icon}</div>
                <div class="scenario-info">
                    <strong style="color: ${scenario.color}">${scenario.name}</strong>
                    <small>${scenario.description}</small>
                    <div class="scenario-multiplier">${Math.round(scenario.minMultiplier * 100)}% of calculated production</div>
                </div>
            </div>
        `;
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

// ===== MINIMUM PRODUCTION STYLING =====
class MinimumProductionStyler {
    /**
     * Style minimum production display
     */
    static styleDisplay(productionElement, minProductionElement, requiredProduction, minProduction) {
        // Clear previous styling
        minProductionElement.className = 'value min-production-value';
        
        if (requiredProduction <= 0 || minProduction <= 0) {
            minProductionElement.textContent = '0';
            return;
        }
        
        const diffPercent = Math.round(((requiredProduction - minProduction) / requiredProduction) * 100);
        
        // Add appropriate class based on difference
        if (diffPercent >= 20) {
            minProductionElement.classList.add('high-buffer');
        } else if (diffPercent >= 10) {
            minProductionElement.classList.add('medium-buffer');
        } else if (diffPercent >= 5) {
            minProductionElement.classList.add('low-buffer');
        } else {
            minProductionElement.classList.add('minimal-buffer');
        }
        
        // Add tooltip with details
        minProductionElement.title = `${diffPercent}% safety buffer\nMinimum production recommendation`;
        
        // Add sparkle animation for new minimum production
        if (!minProductionElement.dataset.lastValue || 
            parseInt(minProductionElement.dataset.lastValue.replace(/,/g, '')) !== minProduction) {
            minProductionElement.classList.add('new-value');
            setTimeout(() => {
                minProductionElement.classList.remove('new-value');
            }, 1000);
        }
        
        minProductionElement.dataset.lastValue = CalculatorUtils.formatNumber(minProduction);
    }
    
    /**
     * Update scenario display
     */
    static updateScenarioDisplay(scenarioKey, method = 1) {
        const scenarioDisplayId = method === 1 ? 'scenario-display' : 'scenario-analyst-display';
        let scenarioDisplay = document.getElementById(scenarioDisplayId);
        
        if (!scenarioDisplay) {
            // Create scenario display element if it doesn't exist
            scenarioDisplay = document.createElement('div');
            scenarioDisplay.id = scenarioDisplayId;
            scenarioDisplay.className = 'scenario-display';
            
            const resultsContainer = method === 1 ? 
                document.querySelector('.method-1-results') : 
                document.querySelector('.method-2-results');
            
            if (resultsContainer) {
                resultsContainer.appendChild(scenarioDisplay);
            }
        }
        
        scenarioDisplay.innerHTML = CalculatorUtils.getScenarioHTML(scenarioKey);
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
            const minProductionBuffer = minBufferPct > 0 ? forecastDemand * (minBufferPct / 100) : 0;
            
            // Never recommend negative production, but enforce minimum buffer if set
            requiredProduction = Math.max(requiredProduction, minProductionBuffer);
            
            // Calculate smart minimum production based on business scenario
            const businessScenario = CalculatorUtils.getBusinessScenario(sales, productionLastYear, forecastPct);
            currentScenario = businessScenario;
            const smartMinProduction = CalculatorUtils.calculateMinimumProduction(requiredProduction, businessScenario);
            
            // Update scenario display
            MinimumProductionStyler.updateScenarioDisplay(businessScenario, 1);
            
            // Style the minimum production display
            MinimumProductionStyler.styleDisplay(
                productionValue, 
                minProductionValue, 
                requiredProduction, 
                smartMinProduction
            );
            
            // Determine status message
            let statusMsg = '';
            const forecastDisplay = PercentageToggle.getDisplayValue('forecast', forecastRaw);
            const bufferDisplay = PercentageToggle.getDisplayValue('buffer', minBufferRaw);
            const scenarioInfo = BUSINESS_SCENARIOS[businessScenario];
            
            if (minBufferPct > 0 && requiredProduction === minProductionBuffer && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${bufferDisplay}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Buffer reduction (${bufferDisplay}%) - careful with low inventory`;
            } else if (forecastPct > 0 && CalculatorUtils.parseInputValue(forecastRaw) > 0) {
                statusMsg = `${scenarioInfo.icon} ${scenarioInfo.name}: ${forecastDisplay}% increase forecast`;
            } else if (forecastPct < 0) {
                statusMsg = `${scenarioInfo.icon} ${scenarioInfo.name}: ${forecastDisplay}% decrease forecast`;
            } else if (requiredProduction === 0) {
                statusMsg = '✅ Inventory sufficient. No production needed.';
            } else {
                statusMsg = `${scenarioInfo.icon} ${scenarioInfo.name}: ${scenarioInfo.description}`;
            }
            
            // Add smart minimum production recommendation
            if (requiredProduction > 0 && smartMinProduction > 0) {
                const diffPercent = Math.round(((requiredProduction - smartMinProduction) / requiredProduction) * 100);
                if (diffPercent > 5) {
                    statusMsg += `\n🎯 Smart Minimum: ${CalculatorUtils.formatNumber(smartMinProduction)} (${diffPercent}% safety buffer)`;
                }
            }
            
            // Update displays
            demandValue.textContent = CalculatorUtils.formatNumber(forecastDemand);
            productionValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            minProductionValue.textContent = CalculatorUtils.formatNumber(smartMinProduction);
            statusMessage.textContent = statusMsg;
            
        } catch (error) {
            console.error('Method 1 Calculation Error:', error);
            demandValue.textContent = '--';
            productionValue.textContent = '--';
            minProductionValue.textContent = '--';
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
            const minProductionBuffer = minBufferPct > 0 ? totalForecastDemand * (minBufferPct / 100) : 0;
            
            // Never recommend negative production, but enforce minimum buffer if set
            requiredProduction = Math.max(requiredProduction, minProductionBuffer);
            
            // Calculate smart minimum production based on business scenario
            const estimatedForecastPct = additionalForecast > 0 ? 
                (additionalForecast / baseForecast) * 100 : 0;
            const businessScenario = CalculatorUtils.getBusinessScenario(sales, productionLastYear, estimatedForecastPct);
            const smartMinProduction = CalculatorUtils.calculateMinimumProduction(requiredProduction, businessScenario);
            
            // Update scenario display
            MinimumProductionStyler.updateScenarioDisplay(businessScenario, 2);
            
            // Style the minimum production display
            MinimumProductionStyler.styleDisplay(
                productionAnalystValue, 
                minProductionAnalystValue, 
                requiredProduction, 
                smartMinProduction
            );
            
            // Determine status message
            let statusMsg = '';
            const bufferDisplay = PercentageToggle.getDisplayValue('buffer-analyst', minBufferRaw);
            const scenarioInfo = BUSINESS_SCENARIOS[businessScenario];
            
            if (minBufferPct > 0 && requiredProduction === minProductionBuffer && requiredProduction > 0) {
                statusMsg = `🛡️ Minimum buffer applied (${bufferDisplay}% of demand)`;
            } else if (minBufferPct < 0) {
                statusMsg = `⚠️ Buffer reduction (${bufferDisplay}%) - careful with low inventory`;
            } else if (requiredProduction === 0) {
                statusMsg = '✅ Inventory sufficient. No production needed.';
            } else {
                statusMsg = `${scenarioInfo.icon} ${scenarioInfo.name}: ${scenarioInfo.description}`;
            }
            
            // Add smart minimum production recommendation
            if (requiredProduction > 0 && smartMinProduction > 0) {
                const diffPercent = Math.round(((requiredProduction - smartMinProduction) / requiredProduction) * 100);
                if (diffPercent > 5) {
                    statusMsg += `\n🎯 Smart Minimum: ${CalculatorUtils.formatNumber(smartMinProduction)} (${diffPercent}% safety buffer)`;
                }
            }
            
            // Update displays
            totalDemandValue.textContent = CalculatorUtils.formatNumber(totalForecastDemand);
            productionAnalystValue.textContent = CalculatorUtils.formatNumber(requiredProduction);
            minProductionAnalystValue.textContent = CalculatorUtils.formatNumber(smartMinProduction);
            statusAnalystMessage.textContent = statusMsg;
            
        } catch (error) {
            console.error('Method 2 Calculation Error:', error);
            totalDemandValue.textContent = '--';
            productionAnalystValue.textContent = '--';
            minProductionAnalystValue.textContent = '--';
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
        minProductionValue.textContent = '0';
        minProductionValue.className = 'value min-production-value';
        statusMessage.textContent = '';
        
        // Clear scenario display
        const scenarioDisplay = document.getElementById('scenario-display');
        if (scenarioDisplay) {
            scenarioDisplay.innerHTML = '';
        }
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
        minProductionAnalystValue.textContent = '0';
        minProductionAnalystValue.className = 'value min-production-value';
        statusAnalystMessage.textContent = '';
        
        // Clear scenario display
        const scenarioDisplay = document.getElementById('scenario-analyst-display');
        if (scenarioDisplay) {
            scenarioDisplay.innerHTML = '';
        }
    }
}

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('🚀 BitLife Calculator Initializing...');
    
    // Initialize percentage toggles
    PercentageToggle.init();
    
    // Set up input event listeners with comma formatting
    setupEventListeners();
    
    // Add CSS for minimum production styling
    addMinimumProductionCSS();
    
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

function addMinimumProductionCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .min-production-value {
            font-weight: bold;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .min-production-value.high-buffer {
            background-color: #ffebee;
            color: #d32f2f;
            border: 2px solid #ffcdd2;
            animation: pulse-high 2s ease-in-out;
        }
        
        .min-production-value.medium-buffer {
            background-color: #fff3e0;
            color: #f57c00;
            border: 2px solid #ffe0b2;
            animation: pulse-medium 2s ease-in-out;
        }
        
        .min-production-value.low-buffer {
            background-color: #e8f5e9;
            color: #388e3c;
            border: 2px solid #c8e6c9;
        }
        
        .min-production-value.minimal-buffer {
            background-color: #f5f5f5;
            color: #616161;
            border: 2px solid #e0e0e0;
        }
        
        .min-production-value.new-value {
            animation: sparkle 0.5s ease-out;
        }
        
        .scenario-display {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #dee2e6;
        }
        
        .scenario-badge {
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 6px;
            margin: 5px 0;
        }
        
        .scenario-icon {
            font-size: 24px;
            margin-right: 12px;
        }
        
        .scenario-info {
            flex: 1;
        }
        
        .scenario-info strong {
            display: block;
            margin-bottom: 4px;
        }
        
        .scenario-info small {
            color: #666;
            display: block;
            margin-bottom: 4px;
        }
        
        .scenario-multiplier {
            font-size: 0.85em;
            color: #888;
            font-style: italic;
        }
        
        @keyframes pulse-high {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes pulse-medium {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
        }
        
        @keyframes sparkle {
            0% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .min-production-label {
            cursor: help;
            position: relative;
        }
        
        .min-production-label:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9em;
            white-space: pre-line;
            z-index: 100;
            min-width: 200px;
            text-align: center;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
    `;
    document.head.appendChild(style);
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