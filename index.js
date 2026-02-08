/**
 * BitLife Business Calculator - Complete with Percentage Toggles & Minimum Production
 * + ANNUAL CYCLE SILENT LEARNING SYSTEM
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

// ===== ANNUAL CYCLE SILENT LEARNING SYSTEM =====
class AnnualCycleLearner {
    constructor() {
        this.history = this.loadHistory();
        this.currentYear = this.getCurrentYear();
        this.lastPrediction = {
            method1: null,
            method2: null
        };
    }

    // Load learning history from localStorage
    loadHistory() {
        try {
            const saved = localStorage.getItem('bitlife_annual_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure we have proper structure
                return {
                    years: parsed.years || {},
                    patterns: parsed.patterns || this.initializePatterns(),
                    businessProfile: parsed.businessProfile || this.initializeBusinessProfile(),
                    lastResetYear: parsed.lastResetYear || 0
                };
            }
        } catch (e) {
            console.warn('Failed to load learning history:', e);
        }
        
        return {
            years: {},
            patterns: this.initializePatterns(),
            businessProfile: this.initializeBusinessProfile(),
            lastResetYear: 0
        };
    }

    // Initialize business patterns by size
    initializePatterns() {
        return {
            small: { // < 50,000 units
                overprediction: [],
                underprediction: [],
                accuracy: [],
                totalYears: 0
            },
            medium: { // 50,000-200,000 units
                overprediction: [],
                underprediction: [],
                accuracy: [],
                totalYears: 0
            },
            large: { // 200,000-500,000 units
                overprediction: [],
                underprediction: [],
                accuracy: [],
                totalYears: 0
            },
            corporation: { // > 500,000 units
                overprediction: [],
                underprediction: [],
                accuracy: [],
                totalYears: 0
            }
        };
    }

    // Initialize business profile
    initializeBusinessProfile() {
        return {
            industryStability: 0.5, // 0-1, higher = more stable
            userPlaystyle: 0.5, // 0-1, 0=conservative, 1=aggressive
            businessAge: 0, // Years of operation
            predictabilityScore: 0.5, // How predictable this business is
            learningStrength: 1.0 // How much to adjust based on history
        };
    }

    // Get current BitLife year
    getCurrentYear() {
        const now = new Date();
        return now.getFullYear();
    }

    // Determine business size based on actual sales
    getBusinessSize(actualSales) {
        if (actualSales < 50000) return 'small';
        if (actualSales < 200000) return 'medium';
        if (actualSales < 500000) return 'large';
        return 'corporation';
    }

    // Calculate prediction error percentage
    calculateError(predicted, actual) {
        if (predicted === 0) return actual > 0 ? 100 : 0;
        return ((predicted - actual) / predicted) * 100;
    }

    // Store last prediction for later comparison
    recordPrediction(method, predictedDemand) {
        this.lastPrediction[method] = {
            demand: predictedDemand,
            year: this.currentYear,
            timestamp: Date.now()
        };
    }

    // Process completed year when reset is clicked
    processCompletedYear(method, actualSales, context) {
        try {
            const lastPred = this.lastPrediction[method];
            if (!lastPred || !actualSales || actualSales <= 0) {
                return null;
            }

            // Calculate accuracy metrics
            const error = this.calculateError(lastPred.demand, actualSales);
            const absoluteError = Math.abs(error);
            const accuracy = Math.max(0, 100 - absoluteError);
            const isOverprediction = error > 0;
            
            // Get business size
            const businessSize = this.getBusinessSize(actualSales);
            
            // Update year record
            const yearKey = `${this.currentYear}-${method}`;
            this.history.years[yearKey] = {
                method: method,
                predicted: lastPred.demand,
                actual: actualSales,
                error: error,
                accuracy: accuracy,
                businessSize: businessSize,
                context: context,
                timestamp: Date.now()
            };

            // Update patterns for this business size
            const pattern = this.history.patterns[businessSize];
            pattern.totalYears++;
            
            if (isOverprediction) {
                pattern.overprediction.push(error);
                // Keep only last 10 entries for relevance
                if (pattern.overprediction.length > 10) {
                    pattern.overprediction.shift();
                }
            } else {
                pattern.underprediction.push(error);
                if (pattern.underprediction.length > 10) {
                    pattern.underprediction.shift();
                }
            }
            
            pattern.accuracy.push(accuracy);
            if (pattern.accuracy.length > 20) {
                pattern.accuracy.shift();
            }

            // Update business profile
            this.updateBusinessProfile(actualSales, accuracy, context);
            
            // Save updated history
            this.saveHistory();
            
            // Calculate learning adjustments
            const adjustments = this.calculateAdjustments(businessSize, method);
            
            // Show subtle learning notification
            this.showLearningNotification(method, error, accuracy);
            
            return adjustments;
            
        } catch (error) {
            console.error('Error processing completed year:', error);
            return null;
        }
    }

    // Update business profile based on performance
    updateBusinessProfile(actualSales, accuracy, context) {
        const profile = this.history.businessProfile;
        
        // Update business age (increment counter)
        profile.businessAge++;
        
        // Calculate stability based on accuracy trends
        const allAccuracies = Object.values(this.history.patterns)
            .flatMap(p => p.accuracy)
            .filter(a => a > 0);
        
        if (allAccuracies.length > 5) {
            const stabilityScore = this.calculateStability(allAccuracies);
            profile.industryStability = stabilityScore;
        }
        
        // Update user playstyle based on forecast aggressiveness
        if (context.forecastPct) {
            const forecastAggressiveness = Math.abs(context.forecastPct) / 100;
            profile.userPlaystyle = (profile.userPlaystyle * 0.9) + (forecastAggressiveness * 0.1);
        }
        
        // Update predictability score
        profile.predictabilityScore = accuracy / 100;
        
        // Increase learning strength as we get more data
        profile.learningStrength = Math.min(2.0, 1.0 + (profile.businessAge * 0.1));
    }

    // Calculate stability from accuracy array
    calculateStability(accuracies) {
        if (accuracies.length < 2) return 0.5;
        
        // Calculate standard deviation
        const mean = accuracies.reduce((a, b) => a + b) / accuracies.length;
        const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
        const stdDev = Math.sqrt(variance);
        
        // Convert to 0-1 scale where lower stdDev = higher stability
        const maxExpectedStdDev = 30; // Assuming worst case
        const stability = 1 - Math.min(1, stdDev / maxExpectedStdDev);
        
        return Math.max(0.1, Math.min(0.9, stability));
    }

    // Calculate adjustments for next year's prediction
    calculateAdjustments(businessSize, method) {
        const pattern = this.history.patterns[businessSize];
        const profile = this.history.businessProfile;
        
        if (pattern.totalYears === 0) {
            return { adjustment: 0, confidence: 0 };
        }
        
        // Calculate average error for this business size
        const allErrors = [...pattern.overprediction, ...pattern.underprediction];
        if (allErrors.length === 0) {
            return { adjustment: 0, confidence: 0 };
        }
        
        const avgError = allErrors.reduce((a, b) => a + b, 0) / allErrors.length;
        
        // Calculate confidence based on data points and stability
        const dataPoints = allErrors.length;
        const confidence = Math.min(0.95, 
            (dataPoints / 10) * // More data = more confidence
            profile.predictabilityScore * // Business predictability
            profile.industryStability // Industry stability
        );
        
        // Apply learning strength
        const adjustment = avgError * profile.learningStrength * confidence * -1; // Inverse adjustment
        
        // Cap adjustment to reasonable limits
        const maxAdjustment = method === 1 ? 15 : 0.3; // Percentage vs unit adjustment
        const cappedAdjustment = Math.max(-maxAdjustment, Math.min(maxAdjustment, adjustment));
        
        return {
            adjustment: cappedAdjustment,
            confidence: confidence,
            dataPoints: dataPoints,
            avgAccuracy: pattern.accuracy.length > 0 ? 
                pattern.accuracy.reduce((a, b) => a + b, 0) / pattern.accuracy.length : 0
        };
    }

    // Apply learning to forecast
    applyLearning(method, originalValue, businessSize) {
        const adjustments = this.calculateAdjustments(businessSize, method);
        
        if (Math.abs(adjustments.adjustment) < 0.1 || adjustments.confidence < 0.3) {
            return originalValue;
        }
        
        // Apply adjustment
        if (method === 1) {
            // Method 1: Percentage forecast adjustment
            return originalValue * (1 + (adjustments.adjustment / 100));
        } else {
            // Method 2: Unit forecast adjustment
            return originalValue * (1 + adjustments.adjustment);
        }
    }

    // Show subtle learning notification
    showLearningNotification(method, error, accuracy) {
        // Only show for significant learning moments
        if (Math.abs(error) < 5) return;
        
        const methodName = method === 1 ? 'Percentage-Based' : 'Analyst Forecast';
        const direction = error > 0 ? 'overpredicted' : 'underpredicted';
        const errorAbs = Math.abs(error).toFixed(1);
        
        // Create notification element
        let notification = document.getElementById('learning-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'learning-notification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                border-left: 4px solid #d4af37;
                max-width: 300px;
                z-index: 1000;
                font-size: 0.9em;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 4px; color: #d4af37">
                📈 BitLife Learning Active
            </div>
            <div style="font-size: 0.85em; opacity: 0.9">
                ${methodName}: ${direction} by ${errorAbs}%<br>
                Accuracy: ${accuracy.toFixed(1)}%
            </div>
            <div style="font-size: 0.75em; margin-top: 4px; opacity: 0.7">
                Adjusting next year's forecast...
            </div>
        `;
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Get learning summary for display
    getLearningSummary() {
        const profile = this.history.businessProfile;
        const totalYears = Object.keys(this.history.years).length;
        
        if (totalYears === 0) {
            return null;
        }
        
        // Calculate overall accuracy
        const allAccuracies = Object.values(this.history.years)
            .map(y => y.accuracy)
            .filter(a => a > 0);
        
        const avgAccuracy = allAccuracies.length > 0 ? 
            allAccuracies.reduce((a, b) => a + b, 0) / allAccuracies.length : 0;
        
        // Determine most common business size
        const sizeCounts = {};
        Object.values(this.history.years).forEach(year => {
            const size = year.businessSize;
            sizeCounts[size] = (sizeCounts[size] || 0) + 1;
        });
        
        const mostCommonSize = Object.keys(sizeCounts).reduce((a, b) => 
            sizeCounts[a] > sizeCounts[b] ? a : b, 'small');
        
        return {
            totalYears: totalYears,
            avgAccuracy: avgAccuracy,
            businessSize: mostCommonSize,
            businessAge: profile.businessAge,
            predictability: profile.predictabilityScore,
            stability: profile.industryStability,
            learningStrength: profile.learningStrength
        };
    }

    // Save history to localStorage
    saveHistory() {
        try {
            localStorage.setItem('bitlife_annual_history', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Failed to save learning history:', e);
        }
    }

    // Clear learning history (for testing)
    clearHistory() {
        this.history = {
            years: {},
            patterns: this.initializePatterns(),
            businessProfile: this.initializeBusinessProfile(),
            lastResetYear: 0
        };
        this.saveHistory();
    }

    // Debug: Show learning status in console
    debugStatus() {
        const summary = this.getLearningSummary();
        console.log('=== BitLife Learning Status ===');
        if (summary) {
            console.log(`Years tracked: ${summary.totalYears}`);
            console.log(`Avg Accuracy: ${summary.avgAccuracy.toFixed(1)}%`);
            console.log(`Business Size: ${summary.businessSize}`);
            console.log(`Business Age: ${summary.businessAge} years`);
            console.log(`Predictability: ${(summary.predictability * 100).toFixed(1)}%`);
            console.log(`Learning Strength: ${summary.learningStrength.toFixed(2)}x`);
        } else {
            console.log('No learning data yet. Complete a BitLife year to start!');
        }
    }
}

// Initialize the learner
const annualLearner = new AnnualCycleLearner();

// Add learning CSS styles
function addLearningCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .learning-indicator {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #d4af37;
            animation: learningPulse 2s infinite;
        }
        
        @keyframes learningPulse {
            0%, 100% { 
                transform: scale(1); 
                opacity: 0.7; 
            }
            50% { 
                transform: scale(1.3); 
                opacity: 1; 
            }
        }
        
        .learning-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8em;
            white-space: nowrap;
            z-index: 1000;
            border: 1px solid #d4af37;
            display: none;
        }
        
        .learning-active .learning-tooltip {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        .learning-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 12px;
            font-size: 0.75em;
            color: #d4af37;
            margin-left: 8px;
        }
        
        .method-card.learning-active {
            position: relative;
            border-color: rgba(212, 175, 55, 0.5);
        }
        
        .method-card.learning-active::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .learning-stats {
            margin-top: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            border-left: 3px solid #d4af37;
            font-size: 0.85em;
        }
        
        .learning-stats .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        .learning-stats .stat-label {
            color: #b0b0b0;
        }
        
        .learning-stats .stat-value {
            color: #d4af37;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}

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
            
            // Apply annual learning if we have history
            let learnedForecastPct = forecastPct;
            if (sales > 0) {
                const businessSize = annualLearner.getBusinessSize(sales);
                learnedForecastPct = annualLearner.applyLearning(1, forecastPct, businessSize);
            }
            
            // Calculate average base from Sales and Last Year Production
            let baseForecast;
            if (sales + productionLastYear > 0) {
                baseForecast = (sales + productionLastYear) / 2;
            } else {
                baseForecast = sales;
            }
            
            // Forecast Demand = Base × (1 + Analyst Percentage / 100)
            const forecastDemand = baseForecast * (1 + learnedForecastPct / 100);
            
            // Record prediction for later learning
            annualLearner.recordPrediction('method1', forecastDemand);
            
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
            
            // Add learning indicator if active
            const learningSummary = annualLearner.getLearningSummary();
            if (learningSummary && learningSummary.totalYears > 0) {
                statusMsg += `\n📈 Learning Active (${learningSummary.totalYears} years analyzed)`;
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
            
            // Apply annual learning if we have history
            let learnedAdditionalForecast = additionalForecast;
            if (sales > 0) {
                const businessSize = annualLearner.getBusinessSize(sales);
                learnedAdditionalForecast = annualLearner.applyLearning(2, additionalForecast, businessSize);
            }
            
            // Calculate average base from Sales and Last Year Production
            let baseForecast;
            if (sales + productionLastYear > 0) {
                baseForecast = (sales + productionLastYear) / 2;
            } else {
                baseForecast = sales;
            }
            
            // Total Forecast Demand = Base Average + Additional Forecast
            const totalForecastDemand = baseForecast + learnedAdditionalForecast;
            
            // Record prediction for later learning
            annualLearner.recordPrediction('method2', totalForecastDemand);
            
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
            
            // Add learning indicator if active
            const learningSummary = annualLearner.getLearningSummary();
            if (learningSummary && learningSummary.totalYears > 0) {
                statusMsg += `\n📈 Learning Active (${learningSummary.totalYears} years analyzed)`;
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
     * Reset Method 1 - Now includes Annual Learning Processing
     */
    static resetMethod1() {
        try {
            // Capture actual sales before resetting (this is the completed year's data)
            const actualSales = CalculatorUtils.parseInputValue(salesInput.value);
            
            // Get context for learning
            const context = {
                productionLastYear: CalculatorUtils.parseInputValue(productionLastYearInput.value),
                forecastPct: PercentageToggle.getAdjustedValue('forecast', CalculatorUtils.getRawValue('forecast')),
                inventory: CalculatorUtils.parseInputValue(inventoryInput.value),
                minBufferPct: PercentageToggle.getAdjustedValue('buffer', CalculatorUtils.getRawValue('min-buffer')),
                businessScenario: currentScenario
            };
            
            // Process completed year for learning
            if (actualSales > 0) {
                const adjustments = annualLearner.processCompletedYear('method1', actualSales, context);
                
                // Show learning stats if we have them
                if (adjustments && Math.abs(adjustments.adjustment) > 0.1) {
                    const summary = annualLearner.getLearningSummary();
                    if (summary) {
                        console.log(`📊 Year Complete! Adjusted forecast by ${adjustments.adjustment.toFixed(2)}%`);
                        console.log(`   Accuracy: ${summary.avgAccuracy.toFixed(1)}% over ${summary.totalYears} years`);
                    }
                }
            }
            
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
            
        } catch (error) {
            console.error('Error in resetMethod1:', error);
            // Fallback to original reset behavior
            salesInput.value = '';
            productionLastYearInput.value = '';
            forecastInput.value = '';
            inventoryInput.value = '';
            minBufferInput.value = '0';
            
            demandValue.textContent = '0';
            productionValue.textContent = '0';
            minProductionValue.textContent = '0';
            statusMessage.textContent = '';
        }
    }

    /**
     * Reset Method 2 - Now includes Annual Learning Processing
     */
    static resetMethod2() {
        try {
            // Capture actual sales before resetting
            const actualSales = CalculatorUtils.parseInputValue(salesAnalystInput.value);
            
            // Get context for learning
            const context = {
                productionLastYear: CalculatorUtils.parseInputValue(productionAnalystLastYearInput.value),
                additionalForecast: CalculatorUtils.parseInputValue(analystForecastInput.value),
                inventory: CalculatorUtils.parseInputValue(inventoryAnalystInput.value),
                minBufferPct: PercentageToggle.getAdjustedValue('buffer-analyst', CalculatorUtils.getRawValue('min-buffer-analyst'))
            };
            
            // Process completed year for learning
            if (actualSales > 0) {
                const adjustments = annualLearner.processCompletedYear('method2', actualSales, context);
                
                // Show learning stats if we have them
                if (adjustments && Math.abs(adjustments.adjustment) > 0.1) {
                    const summary = annualLearner.getLearningSummary();
                    if (summary) {
                        console.log(`📊 Year Complete! Adjusted forecast by ${(adjustments.adjustment * 100).toFixed(2)}%`);
                    }
                }
            }
            
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
            
        } catch (error) {
            console.error('Error in resetMethod2:', error);
            // Fallback to original reset behavior
            salesAnalystInput.value = '';
            productionAnalystLastYearInput.value = '';
            analystForecastInput.value = '';
            inventoryAnalystInput.value = '';
            minBufferAnalystInput.value = '0';
            
            totalDemandValue.textContent = '0';
            productionAnalystValue.textContent = '0';
            minProductionAnalystValue.textContent = '0';
            statusAnalystMessage.textContent = '';
        }
    }
}

// ===== INITIALIZATION =====
function initializeApp() {
    console.log('🚀 BitLife Calculator Initializing...');
    console.log('📊 Annual Cycle Learning System Active');
    
    // Initialize theme system
    initializeTheme();
    
    // Initialize percentage toggles
    PercentageToggle.init();
    
    // Set up input event listeners with comma formatting
    setupEventListeners();
    
    // Add CSS for minimum production styling
    addMinimumProductionCSS();
    
    // Add CSS for learning system
    addLearningCSS();
    
    // Show learning status in console
    annualLearner.debugStatus();
    
    // Load example data
    setTimeout(loadExampleData, 500);
}

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get saved theme or use system preference
    const savedTheme = localStorage.getItem('bitlife-theme');
    
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
    } else if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = false;
    } else if (prefersDarkScheme.matches) {
        // Use system preference if no saved theme
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = false;
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
    }
    
    // Theme toggle event listener
    themeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('bitlife-theme', 'light');
            console.log('🌞 Switched to Light Mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('bitlife-theme', 'dark');
            console.log('🌙 Switched to Dark Mode');
        }
    });
    
    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('bitlife-theme')) {
            // Only auto-switch if user hasn't manually set a preference
            if (e.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.checked = false;
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggle.checked = true;
            }
        }
    });
    
    // Log initial theme
    console.log(`🎨 Current theme: ${document.documentElement.getAttribute('data-theme') || 'dark'}`);
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
    
    // Reset buttons - enhanced with learning
    resetMethod1Btn.addEventListener('click', () => {
        console.log('🔄 Method 1 Reset - Processing Year Completion...');
        BitLifeCalculator.resetMethod1();
    });
    
    resetMethod2Btn.addEventListener('click', () => {
        console.log('🔄 Method 2 Reset - Processing Year Completion...');
        BitLifeCalculator.resetMethod2();
    });
    
    // Add learning stats button to footer
    addLearningStatsButton();
}

function addLearningStatsButton() {
    const footerNote = document.querySelector('.footer-note');
    if (footerNote) {
        const statsBtn = document.createElement('button');
        statsBtn.innerHTML = '📊 Show Learning Stats';
        statsBtn.className = 'btn-bitlife ml-2 text-xs';
        statsBtn.style.marginTop = '8px';
        statsBtn.addEventListener('click', () => showLearningStats());
        
        footerNote.appendChild(document.createElement('br'));
        footerNote.appendChild(statsBtn);
    }
}

function showLearningStats() {
    const summary = annualLearner.getLearningSummary();
    if (!summary) {
        alert('No learning data yet. Complete a BitLife year to start!');
        return;
    }
    
    const statsHTML = `
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; border: 1px solid var(--accent-color); max-width: 400px; width: 90vw;">
            <h3 style="color: var(--accent-color); margin-bottom: 15px; text-align: center;">📈 BitLife Learning Statistics</h3>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Years Tracked:</span>
                    <span style="color: var(--accent-color); font-weight: bold;">${summary.totalYears}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Average Accuracy:</span>
                    <span style="color: var(--accent-color); font-weight: bold;">${summary.avgAccuracy.toFixed(1)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Business Size:</span>
                    <span style="color: var(--accent-color); font-weight: bold; text-transform: capitalize;">${summary.businessSize}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Business Age:</span>
                    <span style="color: var(--accent-color); font-weight: bold;">${summary.businessAge} years</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Predictability:</span>
                    <span style="color: var(--accent-color); font-weight: bold;">${(summary.predictability * 100).toFixed(1)}%</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 4px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                    <span style="color: var(--text-secondary);">Learning Strength:</span>
                    <span style="color: var(--accent-color); font-weight: bold;">${summary.learningStrength.toFixed(2)}x</span>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button id="close-stats-btn" style="flex: 1; padding: 10px; background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    Close
                </button>
                <button id="delete-learning-btn" style="flex: 1; padding: 10px; background: rgba(248, 113, 113, 0.1); border: 1px solid #f87171; color: #f87171; border-radius: 4px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    <i class="fas fa-trash-alt" style="margin-right: 5px;"></i>Delete Data
                </button>
            </div>
            
            <div style="font-size: 0.85em; color: var(--text-secondary); border-top: 1px solid rgba(212, 175, 55, 0.3); padding-top: 15px; margin-top: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <i class="fas fa-info-circle" style="color: var(--accent-color); margin-right: 8px;"></i>
                    <strong>How it works:</strong>
                </div>
                <ol style="margin-left: 20px; margin-top: 8px; line-height: 1.6;">
                    <li>Plan Year N with calculator</li>
                    <li>Get Annual Report in BitLife</li>
                    <li>Enter actual results</li>
                    <li>Click Reset to complete year</li>
                    <li>System learns from differences</li>
                    <li>Gets better at predicting YOUR business!</li>
                </ol>
                
                <div style="margin-top: 15px; padding: 10px; background: rgba(212, 175, 55, 0.05); border-radius: 6px; border-left: 3px solid var(--accent-color);">
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <i class="fas fa-lightbulb" style="color: var(--accent-color); margin-right: 8px;"></i>
                        <strong>Pro Tip:</strong>
                    </div>
                    <small>The more BitLife years you complete, the smarter the calculator becomes!</small>
                </div>
            </div>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
    `;
    
    modal.innerHTML = statsHTML;
    
    // Add close button (X)
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid var(--accent-color);
        color: var(--accent-color);
        font-size: 18px;
        cursor: pointer;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(212, 175, 55, 0.2)';
        closeBtn.style.transform = 'rotate(90deg)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(212, 175, 55, 0.1)';
        closeBtn.style.transform = 'rotate(0deg)';
    });
    
    // Close functions
    const closeModal = () => {
        modal.style.opacity = '0';
        modal.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 200);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.appendChild(closeBtn);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add event listeners for modal buttons
    setTimeout(() => {
        const closeStatsBtn = document.getElementById('close-stats-btn');
        const deleteLearningBtn = document.getElementById('delete-learning-btn');
        
        if (closeStatsBtn) {
            closeStatsBtn.addEventListener('click', closeModal);
            
            // Button hover effects
            closeStatsBtn.addEventListener('mouseenter', () => {
                closeStatsBtn.style.background = 'rgba(212, 175, 55, 0.1)';
                closeStatsBtn.style.transform = 'translateY(-2px)';
            });
            closeStatsBtn.addEventListener('mouseleave', () => {
                closeStatsBtn.style.background = 'transparent';
                closeStatsBtn.style.transform = 'translateY(0)';
            });
        }
        
        if (deleteLearningBtn) {
            deleteLearningBtn.addEventListener('click', () => {
                // Confirmation dialog
                const confirmDelete = confirm(`⚠️ Delete all learning data?\n\nThis will reset ${summary.totalYears} years of learning history.\nThe calculator will start fresh from zero.\n\nThis action cannot be undone!`);
                
                if (confirmDelete) {
                    // Clear learning data
                    annualLearner.clearHistory();
                    
                    // Show confirmation message
                    const confirmationDiv = document.createElement('div');
                    confirmationDiv.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: var(--bg-tertiary);
                        padding: 20px;
                        border-radius: 8px;
                        border: 2px solid var(--accent-color);
                        z-index: 10000;
                        text-align: center;
                        animation: fadeIn 0.3s ease-out;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    `;
                    confirmationDiv.innerHTML = `
                        <div style="font-size: 48px; color: var(--accent-color); margin-bottom: 15px;">🗑️</div>
                        <h4 style="color: var(--accent-color); margin-bottom: 10px;">Learning Data Deleted!</h4>
                        <p style="color: var(--text-primary); margin-bottom: 5px;">${summary.totalYears} years of history cleared.</p>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 20px;">The calculator will start fresh.</p>
                        <button id="confirm-close-btn" style="padding: 8px 20px; background: var(--accent-color); color: var(--bg-primary); border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                            OK
                        </button>
                    `;
                    
                    document.body.appendChild(confirmationDiv);
                    
                    // Close confirmation
                    document.getElementById('confirm-close-btn').addEventListener('click', () => {
                        document.body.removeChild(confirmationDiv);
                        closeModal(); // Also close the stats modal
                        
                        // Update UI to reflect cleared data
                        const statusElements = document.querySelectorAll('.status-message');
                        statusElements.forEach(el => {
                            if (el.textContent.includes('Learning Active')) {
                                el.textContent = el.textContent.replace(/Learning Active.*/, '✅ Learning reset. Start fresh!');
                            }
                        });
                        
                        // Log to console
                        console.log('🧹 Learning data cleared. Starting fresh!');
                    });
                    
                    // Auto-close after 3 seconds
                    setTimeout(() => {
                        if (document.body.contains(confirmationDiv)) {
                            document.body.removeChild(confirmationDiv);
                            closeModal();
                        }
                    }, 3000);
                }
            });
            
            // Button hover effects
            deleteLearningBtn.addEventListener('mouseenter', () => {
                deleteLearningBtn.style.background = 'rgba(248, 113, 113, 0.2)';
                deleteLearningBtn.style.transform = 'translateY(-2px)';
            });
            deleteLearningBtn.addEventListener('mouseleave', () => {
                deleteLearningBtn.style.background = 'rgba(248, 113, 113, 0.1)';
                deleteLearningBtn.style.transform = 'translateY(0)';
            });
        }
        
        // Add Escape key support
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Cleanup on close
        const originalCloseModal = closeModal;
        closeModal = () => {
            document.removeEventListener('keydown', handleEscape);
            originalCloseModal();
        };
        
    }, 100);
    
    document.body.appendChild(modal);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        
        button {
            transition: all 0.2s ease !important;
        }
        
        button:hover {
            transform: translateY(-2px) !important;
        }
        
        button:active {
            transform: translateY(1px) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Clean up style on modal close
    modal.addEventListener('animationend', () => {
        if (modal.style.opacity === '0') {
            document.head.removeChild(style);
        }
    });
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
window.showLearningStats = showLearningStats;
window.annualLearner = annualLearner; // Expose for debugging