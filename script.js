// Models
class Lease {
    constructor(data = {}) {
        this.startingMileage = data.startingMileage || 0;
        this.milesPerYear = data.milesPerYear || 0;
        this.leaseDuration = data.leaseDuration || 0;
        this.costPerMile = data.costPerMile || 0;
        this.budgetedOverMiles = data.budgetedOverMiles || 0;
        this.startDate = data.startDate ? new Date(data.startDate) : new Date();
        
        this.calculateDerivedFields();
    }

    calculateDerivedFields() {
        this.totalAllowedMiles = Math.round((this.milesPerYear * this.leaseDuration) / 12);
        this.totalTargetMiles = this.totalAllowedMiles + this.budgetedOverMiles;
    }

    static validateFormData(formData) {
        const errors = [];
        
        const startingMileage = parseInt(formData.startingMileage);
        if (!formData.startingMileage || isNaN(startingMileage) || startingMileage < 0) {
            errors.push('Starting mileage must be a positive number');
        }
        
        const milesPerYear = parseInt(formData.milesPerYear);
        if (!formData.milesPerYear || isNaN(milesPerYear) || milesPerYear <= 0 || milesPerYear > 100000) {
            errors.push('Miles per year must be between 1 and 100,000');
        }
        
        const leaseDuration = parseInt(formData.leaseDuration);
        if (!formData.leaseDuration || isNaN(leaseDuration) || leaseDuration <= 0 || leaseDuration > 120) {
            errors.push('Lease duration must be between 1 and 120 months');
        }
        
        const costPerMile = parseFloat(formData.costPerMile);
        if (!formData.costPerMile || isNaN(costPerMile) || costPerMile < 0 || costPerMile > 10) {
            errors.push('Cost per mile must be between $0 and $10');
        }
        
        const budgetedOverMiles = formData.budgetedOverMiles ? parseInt(formData.budgetedOverMiles) : 0;
        if (formData.budgetedOverMiles && (isNaN(budgetedOverMiles) || budgetedOverMiles < 0 || budgetedOverMiles > 50000)) {
            errors.push('Budgeted extra miles must be between 0 and 50,000');
        }
        
        if (!formData.startDate) {
            errors.push('Please select a lease start date');
        } else {
            const startDateObj = new Date(formData.startDate);
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
            
            if (isNaN(startDateObj.getTime())) {
                errors.push('Invalid start date');
            } else if (startDateObj < fiveYearsAgo || startDateObj > twoYearsFromNow) {
                errors.push('Start date must be within the last 5 years or next 2 years');
            }
        }
        
        return errors;
    }

    static fromFormData(formData) {
        return new Lease({
            startingMileage: parseInt(formData.startingMileage),
            milesPerYear: parseInt(formData.milesPerYear),
            leaseDuration: parseInt(formData.leaseDuration),
            costPerMile: parseFloat(formData.costPerMile),
            budgetedOverMiles: formData.budgetedOverMiles ? parseInt(formData.budgetedOverMiles) : 0,
            startDate: new Date(formData.startDate)
        });
    }

    toStorageData() {
        return {
            startingMileage: this.startingMileage,
            milesPerYear: this.milesPerYear,
            leaseDuration: this.leaseDuration,
            costPerMile: this.costPerMile,
            budgetedOverMiles: this.budgetedOverMiles,
            startDate: this.startDate.toISOString(),
            totalAllowedMiles: this.totalAllowedMiles,
            totalTargetMiles: this.totalTargetMiles
        };
    }

    static fromStorageData(data) {
        if (!data || typeof data !== 'object') return null;
        
        try {
            const lease = new Lease({
                startingMileage: data.startingMileage,
                milesPerYear: data.milesPerYear,
                leaseDuration: data.leaseDuration,
                costPerMile: data.costPerMile,
                budgetedOverMiles: data.budgetedOverMiles,
                startDate: new Date(data.startDate)
            });
            
            if (isNaN(lease.startDate.getTime())) {
                throw new Error('Invalid lease start date');
            }
            
            return lease;
        } catch (error) {
            console.error('Error creating lease from storage data:', error);
            return null;
        }
    }
}

class Reading {
    constructor(data = {}) {
        this.date = data.date ? new Date(data.date) : new Date();
        this.mileage = data.mileage || 0;
        this.isInitial = data.isInitial || false;
    }

    static validateFormData(formData, existingReadings = []) {
        const errors = [];
        
        const currentMileage = parseInt(formData.currentMileage);
        if (!formData.currentMileage || isNaN(currentMileage) || currentMileage < 0) {
            errors.push('Current mileage must be a positive number');
        } else if (currentMileage > 1000000) {
            errors.push('Current mileage seems unrealistic (over 1,000,000)');
        }
        
        if (!formData.readingDate) {
            errors.push('Please select a reading date');
        }
        
        const readingDate = new Date(formData.readingDate);
        if (formData.readingDate && isNaN(readingDate.getTime())) {
            errors.push('Invalid reading date');
        } else if (formData.readingDate) {
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            if (readingDate < fiveYearsAgo || readingDate > tomorrow) {
                errors.push('Reading date must be within the last 5 years and not in the future');
            }
        }

        if (existingReadings.length > 0 && !isNaN(currentMileage)) {
            const latestReading = Reading.getLatest(existingReadings);
            if (currentMileage <= latestReading.mileage) {
                errors.push('Current mileage must be higher than the previous reading.');
            }
        }
        
        return errors;
    }

    static fromFormData(formData) {
        return new Reading({
            date: new Date(formData.readingDate),
            mileage: parseInt(formData.currentMileage),
            isInitial: false
        });
    }

    static createInitial(mileage, date) {
        return new Reading({
            date: date,
            mileage: mileage,
            isInitial: true
        });
    }

    static getLatest(readings) {
        if (!readings || readings.length === 0) return null;
        return readings[readings.length - 1];
    }

    static sortByDate(readings) {
        return [...readings].sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    static toStorageData(readings) {
        return readings.map(r => ({
            date: r.date.toISOString(),
            mileage: r.mileage,
            isInitial: r.isInitial
        }));
    }

    static fromStorageData(data) {
        if (!data || !Array.isArray(data)) return [];
        
        try {
            return data
                .filter(r => r && r.date && r.mileage !== undefined)
                .map(r => {
                    const date = new Date(r.date);
                    if (isNaN(date.getTime())) {
                        throw new Error('Invalid reading date');
                    }
                    return new Reading({
                        date: date,
                        mileage: Number(r.mileage),
                        isInitial: Boolean(r.isInitial)
                    });
                })
                .filter(r => !isNaN(r.mileage));
        } catch (error) {
            console.error('Error creating readings from storage data:', error);
            return [];
        }
    }

    static delete(readings, index) {
        if (index < 0 || index >= readings.length) {
            throw new Error('Invalid reading index');
        }

        const reading = readings[index];
        if (reading.isInitial) {
            throw new Error('Cannot delete the initial lease reading');
        }

        const newReadings = [...readings];
        newReadings.splice(index, 1);
        return newReadings;
    }
}

// Services
class Calculator {
    static calculateStatus(lease, readings) {
        if (!lease || !readings || readings.length === 0) return null;

        const now = new Date();
        const leaseStart = lease.startDate;
        const leaseEnd = new Date(leaseStart);
        leaseEnd.setMonth(leaseEnd.getMonth() + lease.leaseDuration);

        const totalLeaseDays = (leaseEnd - leaseStart) / (1000 * 60 * 60 * 24);
        const daysPassed = Math.min((now - leaseStart) / (1000 * 60 * 60 * 24), totalLeaseDays);
        const daysRemaining = Math.max(totalLeaseDays - daysPassed, 0);

        const expectedMileage = lease.startingMileage + 
            (lease.totalAllowedMiles * (daysPassed / totalLeaseDays));

        const latestReading = Reading.getLatest(readings);
        const actualMileage = latestReading.mileage;
        const milesDriven = actualMileage - lease.startingMileage;

        const targetMilesUsed = lease.totalTargetMiles * (daysPassed / totalLeaseDays);
        const milesFromExpected = milesDriven - targetMilesUsed;
        
        const remainingTargetMiles = Math.max(0, lease.totalTargetMiles - milesDriven);
        const projectedFinalMileage = lease.startingMileage + lease.totalAllowedMiles;

        const projectedOverage = 0;

        const currentOverage = Math.max(0, 
            actualMileage - (lease.startingMileage + lease.totalAllowedMiles));

        const dailyAverage = daysPassed > 0 ? milesDriven / daysPassed : 0;
        const allowedDailyAverage = lease.totalTargetMiles / totalLeaseDays;

        return {
            expectedMileage: Math.round(expectedMileage),
            actualMileage,
            milesDriven,
            targetMilesUsed: Math.round(targetMilesUsed),
            milesFromExpected: Math.round(milesFromExpected),
            projectedFinalMileage: Math.round(projectedFinalMileage),
            projectedOverage: Math.round(projectedOverage),
            currentOverage: Math.round(currentOverage),
            projectedCost: projectedOverage * lease.costPerMile,
            currentCost: currentOverage * lease.costPerMile,
            daysPassed: Math.round(daysPassed),
            daysRemaining: Math.round(daysRemaining),
            leaseEnd: leaseEnd,
            dailyAverage: dailyAverage,
            allowedDailyAverage: allowedDailyAverage,
            remainingTargetMiles: Math.round(remainingTargetMiles)
        };
    }

    static calculateProjections(status, lease, milesUsed, milesRemaining) {
        const totalDays = status.daysPassed + status.daysRemaining;
        const percentDaysComplete = ((status.daysPassed / totalDays) * 100).toFixed(1);
        const percentDaysRemaining = ((status.daysRemaining / totalDays) * 100).toFixed(1);

        const milesAllowed = lease.totalTargetMiles;
        const percentUsed = ((milesUsed / milesAllowed) * 100).toFixed(1);
        const percentRemaining = ((milesRemaining / milesAllowed) * 100).toFixed(1);
        const percentTarget = ((status.targetMilesUsed / milesAllowed) * 100).toFixed(1);
        
        const projectedTotalMiles = status.daysRemaining > 0 ? 
            milesUsed + (status.dailyAverage * status.daysRemaining) : milesUsed;
        const projectedTotalDays = totalDays;
        const projectedTotalWeeks = totalDays / 7;
        const projectedOverage = Math.max(0, projectedTotalMiles - lease.totalAllowedMiles);
        const projectedOverageCost = projectedOverage * lease.costPerMile;

        return {
            totalDays,
            percentDaysComplete,
            percentDaysRemaining,
            percentUsed,
            percentRemaining,
            percentTarget,
            projectedTotalMiles,
            projectedTotalDays,
            projectedTotalWeeks,
            projectedOverage,
            projectedOverageCost
        };
    }

    static getStatusClass(actualValue, targetValue) {
        return actualValue > targetValue ? 'over' : 'under';
    }

    static formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    static formatMileage(miles) {
        return miles.toLocaleString();
    }

    static formatDate(date) {
        return date.toLocaleDateString();
    }
}

class Storage {
    static STORAGE_KEY = 'milemeter_data';

    static saveData(lease, readings) {
        try {
            const data = {
                lease: lease ? lease.toStorageData() : null,
                readings: Reading.toStorageData(readings)
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            throw new Error('Failed to save data');
        }
    }

    static loadData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                return { lease: null, readings: [] };
            }

            const parsed = JSON.parse(data);
            
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Invalid data structure');
            }

            const lease = parsed.lease ? Lease.fromStorageData(parsed.lease) : null;
            const readings = Reading.fromStorageData(parsed.readings);

            return { lease, readings };
        } catch (error) {
            console.error('Error loading data from localStorage:', error);
            this.clearData();
            throw new Error('Stored data appears corrupted. Starting fresh.');
        }
    }

    static clearData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}

// Views
class StatusRenderer {
    static sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static renderStatusDisplay(status, lease, onDeleteReading) {
        if (!status || !lease) return '';

        const milesUsed = status.milesDriven;
        const milesRemaining = status.remainingTargetMiles;
        const projections = Calculator.calculateProjections(status, lease, milesUsed, milesRemaining);

        const sanitizedLeaseEndDate = this.sanitizeText(status.leaseEnd.toLocaleDateString());

        return `
            <div>
                <div class="current-reading">
                    <h3>Current Odometer: ${Calculator.formatMileage(status.actualMileage)} miles</h3>
                </div>
                
                ${this.renderSummaryTable(status, lease, projections)}
                
                ${this.renderLeaseDetails(lease, status, projections.totalDays, sanitizedLeaseEndDate)}
            </div>
        `;
    }

    static renderSummaryTable(status, lease, projections) {
        return `
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Used</th>
                        <th>Target</th>
                        <th>Difference</th>
                        <th>Remaining</th>
                        <th>Projected</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.renderMileageRow(status, lease, projections)}
                    ${this.renderDaysRow(status, projections)}
                    ${this.renderMilesPerDayRow(status, projections)}
                    ${this.renderWeeksRow(status, projections)}
                    ${this.renderMilesPerWeekRow(status, projections)}
                    ${this.renderCostImpactRow(status, lease, projections)}
                </tbody>
            </table>
        `;
    }

    static renderMileageRow(status, lease, projections) {
        const milesUsed = status.milesDriven;
        const milesRemaining = status.remainingTargetMiles;
        
        return `
            <tr>
                <td><strong>Mileage</strong></td>
                <td>${Calculator.formatMileage(milesUsed)} (${projections.percentUsed}%)</td>
                <td>${Calculator.formatMileage(status.targetMilesUsed)} (${projections.percentTarget}%)</td>
                <td class="${Calculator.getStatusClass(status.milesFromExpected, 0)}">
                    ${status.milesFromExpected >= 0 ? '+' : ''}${Calculator.formatMileage(status.milesFromExpected)}
                </td>
                <td>${Calculator.formatMileage(milesRemaining)} (${projections.percentRemaining}%)</td>
                <td class="${Calculator.getStatusClass(projections.projectedTotalMiles, lease.totalTargetMiles)}">
                    ${Calculator.formatMileage(projections.projectedTotalMiles)}
                </td>
            </tr>
        `;
    }

    static renderDaysRow(status, projections) {
        return `
            <tr>
                <td><strong>Days</strong></td>
                <td>${status.daysPassed} (${projections.percentDaysComplete}%)</td>
                <td>-</td>
                <td>-</td>
                <td>${status.daysRemaining} (${projections.percentDaysRemaining}%)</td>
                <td>${projections.projectedTotalDays}</td>
            </tr>
        `;
    }

    static renderMilesPerDayRow(status, projections) {
        const milesRemaining = status.remainingTargetMiles;
        
        return `
            <tr>
                <td><strong>Miles per Day</strong></td>
                <td>${status.dailyAverage.toFixed(1)}</td>
                <td>${status.allowedDailyAverage.toFixed(1)}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${status.dailyAverage > status.allowedDailyAverage ? '+' : ''}${(status.dailyAverage - status.allowedDailyAverage).toFixed(1)}
                </td>
                <td>${status.daysRemaining > 0 ? (milesRemaining / status.daysRemaining).toFixed(1) : '0.0'}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${status.dailyAverage.toFixed(1)}
                </td>
            </tr>
        `;
    }

    static renderWeeksRow(status, projections) {
        return `
            <tr>
                <td><strong>Weeks</strong></td>
                <td>${(status.daysPassed / 7).toFixed(1)}</td>
                <td>-</td>
                <td>-</td>
                <td>${(status.daysRemaining / 7).toFixed(1)}</td>
                <td>${projections.projectedTotalWeeks.toFixed(1)}</td>
            </tr>
        `;
    }

    static renderMilesPerWeekRow(status, projections) {
        const milesRemaining = status.remainingTargetMiles;
        
        return `
            <tr>
                <td><strong>Miles per Week</strong></td>
                <td>${(status.dailyAverage * 7).toFixed(0)}</td>
                <td>${(status.allowedDailyAverage * 7).toFixed(0)}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${status.dailyAverage > status.allowedDailyAverage ? '+' : ''}${((status.dailyAverage - status.allowedDailyAverage) * 7).toFixed(0)}
                </td>
                <td>${status.daysRemaining > 0 ? ((milesRemaining / status.daysRemaining) * 7).toFixed(0) : '0'}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${(status.dailyAverage * 7).toFixed(0)}
                </td>
            </tr>
        `;
    }


    static renderCostImpactRow(status, lease, projections) {
        return `
            <tr>
                <td><strong>Cost Impact</strong></td>
                <td>-</td>
                <td>-</td>
                <td class="${Calculator.getStatusClass(status.milesFromExpected, 0)}">
                    ${status.milesFromExpected > 0 ? 
                        Calculator.formatCurrency(status.milesFromExpected * lease.costPerMile) : 
                        '$0'
                    }
                </td>
                <td>-</td>
                <td class="${projections.projectedOverage > 0 ? 'over' : 'under'}">
                    ${projections.projectedOverage > 0 ? Calculator.formatCurrency(projections.projectedOverageCost) : '$0'}
                </td>
            </tr>
        `;
    }

    static renderLeaseDetails(lease, status, totalDays, sanitizedLeaseEndDate) {
        return `
            <div class="lease-details">
                <h4>Lease Details</h4>
                <div class="lease-info">
                    <span><strong>Total Miles Allowed:</strong> ${Calculator.formatMileage(lease.totalAllowedMiles)}</span>
                    <span><strong>Total Target Miles:</strong> ${Calculator.formatMileage(lease.totalTargetMiles)}</span>
                    <span><strong>Budgeted Extra Miles:</strong> ${Calculator.formatMileage(lease.budgetedOverMiles)}</span>
                    <span><strong>Budgeted Extra Cost:</strong> ${Calculator.formatCurrency(lease.budgetedOverMiles * lease.costPerMile)}</span>
                    <span><strong>Total Days:</strong> ${totalDays}</span>
                    <span><strong>Total Weeks:</strong> ${(totalDays / 7).toFixed(1)}</span>
                    <span><strong>Allowed Miles/Day:</strong> ${status.allowedDailyAverage.toFixed(1)}</span>
                    <span><strong>Allowed Miles/Week:</strong> ${(status.allowedDailyAverage * 7).toFixed(0)}</span>
                    <span><strong>Cost Per Mile Over:</strong> ${Calculator.formatCurrency(lease.costPerMile)}</span>
                    <span><strong>Lease End:</strong> ${sanitizedLeaseEndDate}</span>
                </div>
            </div>
        `;
    }

    static renderHistoryDisplay(readings, onDeleteReading) {
        const historyDisplay = document.getElementById('historyDisplay');
        if (!historyDisplay) return;

        historyDisplay.innerHTML = '';
        
        readings
            .slice()
            .reverse()
            .forEach((reading, reverseIndex) => {
                const actualIndex = readings.length - 1 - reverseIndex;
                const historyItem = this.createHistoryItem(reading, actualIndex, onDeleteReading);
                historyDisplay.appendChild(historyItem);
            });
    }

    static createHistoryItem(reading, index, onDeleteReading) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'history-item-date';
        dateDiv.textContent = Calculator.formatDate(reading.date);
        
        const mileageDiv = document.createElement('div');
        mileageDiv.className = 'history-item-mileage';
        mileageDiv.textContent = `${Calculator.formatMileage(reading.mileage)} miles`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-item-content';
        contentDiv.appendChild(dateDiv);
        contentDiv.appendChild(mileageDiv);
        
        if (reading.isInitial) {
            const initialTag = document.createElement('small');
            initialTag.textContent = 'Initial reading';
            contentDiv.appendChild(initialTag);
        }
        
        historyItem.appendChild(contentDiv);
        
        if (!reading.isInitial && onDeleteReading) {
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-btn';
            deleteButton.textContent = '×';
            deleteButton.title = 'Delete this reading';
            deleteButton.onclick = () => onDeleteReading(index);
            historyItem.appendChild(deleteButton);
        }
        
        return historyItem;
    }
}

// Controller
class MileMeter {
    constructor() {
        this.lease = null;
        this.readings = [];
        this.init();
    }

    init() {
        this.loadData();
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        const leaseForm = document.getElementById('leaseForm');
        if (leaseForm) {
            leaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted, calling setupLease');
                this.setupLease();
            });
        }

        const readingForm = document.getElementById('readingForm');
        if (readingForm) {
            readingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addReading();
            });
        }

        const editLeaseButton = document.getElementById('editLeaseButton');
        if (editLeaseButton) {
            editLeaseButton.addEventListener('click', () => {
                this.editLease();
            });
        }

        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetData();
            });
        }

        const readingDateInput = document.getElementById('readingDate');
        if (readingDateInput) {
            readingDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    setupLease() {
        console.log('setupLease called');
        const formData = this.extractLeaseFormData();
        console.log('Form data extracted:', formData);
        
        const errors = Lease.validateFormData(formData);
        
        if (errors.length > 0) {
            alert('Please correct the following errors:\n\n• ' + errors.join('\n• '));
            return;
        }

        console.log('Creating lease from form data');
        this.lease = Lease.fromFormData(formData);
        console.log('Lease created:', this.lease);

        // Create or update initial reading
        if (this.readings.length === 0) {
            this.readings = [Reading.createInitial(this.lease.startingMileage, this.lease.startDate)];
        } else {
            this.readings[0] = Reading.createInitial(this.lease.startingMileage, this.lease.startDate);
            this.readings = Reading.sortByDate(this.readings);
        }

        console.log('Readings after setup:', this.readings);
        
        this.saveData();
        console.log('About to call updateDisplay');
        this.updateDisplay();
    }

    addReading() {
        const formData = this.extractReadingFormData();
        const errors = Reading.validateFormData(formData, this.readings);
        
        if (errors.length > 0) {
            alert('Please correct the following errors:\n\n• ' + errors.join('\n• '));
            return;
        }

        if (this.readings.length === 0) {
            alert('No initial reading found. Please reset and set up your lease again.');
            return;
        }

        const newReading = Reading.fromFormData(formData);
        this.readings.push(newReading);
        this.readings = Reading.sortByDate(this.readings);
        
        this.saveData();
        this.updateDisplay();
        
        document.getElementById('currentMileage').value = '';
    }

    deleteReading(index) {
        try {
            const reading = this.readings[index];
            
            if (confirm(`Are you sure you want to delete the reading from ${Calculator.formatDate(reading.date)} (${Calculator.formatMileage(reading.mileage)} miles)?`)) {
                this.readings = Reading.delete(this.readings, index);
                this.saveData();
                this.updateDisplay();
            }
        } catch (error) {
            alert(error.message);
        }
    }

    updateDisplay() {
        console.log('updateDisplay called');
        console.log('this.lease:', this.lease);
        console.log('this.readings:', this.readings);
        
        if (!this.lease) {
            console.log('No lease found, showing setup');
            this.showSetupSection();
            return;
        }

        this.showTrackingSection();
        this.renderStatus();
        this.renderHistory();
    }

    showSetupSection() {
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('trackingSection').style.display = 'none';
    }

    showTrackingSection() {
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('trackingSection').style.display = 'block';
    }

    renderStatus() {
        const status = Calculator.calculateStatus(this.lease, this.readings);
        if (!status) return;

        const statusDisplay = document.getElementById('statusDisplay');
        if (statusDisplay) {
            statusDisplay.innerHTML = StatusRenderer.renderStatusDisplay(
                status, 
                this.lease, 
                (index) => this.deleteReading(index)
            );
        }
    }

    renderHistory() {
        StatusRenderer.renderHistoryDisplay(
            this.readings, 
            (index) => this.deleteReading(index)
        );
    }

    editLease() {
        if (!this.lease) return;
        
        document.getElementById('startingMileage').value = this.lease.startingMileage;
        document.getElementById('milesPerYear').value = this.lease.milesPerYear;
        document.getElementById('leaseDuration').value = this.lease.leaseDuration;
        document.getElementById('costPerMile').value = this.lease.costPerMile;
        document.getElementById('budgetedOverMiles').value = this.lease.budgetedOverMiles || 0;
        document.getElementById('startDate').value = this.lease.startDate.toISOString().split('T')[0];
        
        this.showSetupSection();
    }

    resetData() {
        if (confirm('Are you sure you want to reset all lease data? This cannot be undone.')) {
            this.lease = null;
            this.readings = [];
            Storage.clearData();
            this.updateDisplay();
        }
    }

    saveData() {
        try {
            Storage.saveData(this.lease, this.readings);
        } catch (error) {
            alert('Failed to save data: ' + error.message);
        }
    }

    loadData() {
        try {
            const data = Storage.loadData();
            this.lease = data.lease;
            this.readings = data.readings;
        } catch (error) {
            alert(error.message);
            this.lease = null;
            this.readings = [];
        }
    }

    extractLeaseFormData() {
        return {
            startingMileage: document.getElementById('startingMileage').value.trim(),
            milesPerYear: document.getElementById('milesPerYear').value.trim(),
            leaseDuration: document.getElementById('leaseDuration').value.trim(),
            costPerMile: document.getElementById('costPerMile').value.trim(),
            budgetedOverMiles: document.getElementById('budgetedOverMiles').value.trim(),
            startDate: document.getElementById('startDate').value
        };
    }

    extractReadingFormData() {
        return {
            currentMileage: document.getElementById('currentMileage').value.trim(),
            readingDate: document.getElementById('readingDate').value
        };
    }
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating MileMeter');
    window.mileMeter = new MileMeter();
    console.log('MileMeter created:', window.mileMeter);
});