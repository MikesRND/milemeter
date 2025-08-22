console.log('Script loading...');

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
        const startingMileageValue = document.getElementById('startingMileage').value.trim();
        const milesPerYearValue = document.getElementById('milesPerYear').value.trim();
        const leaseDurationValue = document.getElementById('leaseDuration').value.trim();
        const costPerMileValue = document.getElementById('costPerMile').value.trim();
        const budgetedOverMilesValue = document.getElementById('budgetedOverMiles').value.trim();
        const startDate = document.getElementById('startDate').value;

        // Enhanced validation with specific error messages
        const errors = [];
        
        const startingMileage = parseInt(startingMileageValue);
        if (!startingMileageValue || isNaN(startingMileage) || startingMileage < 0) {
            errors.push('Starting mileage must be a positive number');
        }
        
        const milesPerYear = parseInt(milesPerYearValue);
        if (!milesPerYearValue || isNaN(milesPerYear) || milesPerYear <= 0 || milesPerYear > 100000) {
            errors.push('Miles per year must be between 1 and 100,000');
        }
        
        const leaseDuration = parseInt(leaseDurationValue);
        if (!leaseDurationValue || isNaN(leaseDuration) || leaseDuration <= 0 || leaseDuration > 120) {
            errors.push('Lease duration must be between 1 and 120 months');
        }
        
        const costPerMile = parseFloat(costPerMileValue);
        if (!costPerMileValue || isNaN(costPerMile) || costPerMile < 0 || costPerMile > 10) {
            errors.push('Cost per mile must be between $0 and $10');
        }
        
        const budgetedOverMiles = budgetedOverMilesValue ? parseInt(budgetedOverMilesValue) : 0;
        if (budgetedOverMilesValue && (isNaN(budgetedOverMiles) || budgetedOverMiles < 0 || budgetedOverMiles > 50000)) {
            errors.push('Budgeted extra miles must be between 0 and 50,000');
        }
        
        if (!startDate) {
            errors.push('Please select a lease start date');
        } else {
            const startDateObj = new Date(startDate);
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
            
            if (isNaN(startDateObj.getTime())) {
                errors.push('Invalid start date');
            } else if (startDateObj < fiveYearsAgo || startDateObj > twoYearsFromNow) {
                errors.push('Start date must be within the last 5 years or next 2 years');
            }
        }
        
        if (errors.length > 0) {
            alert('Please correct the following errors:\n\n• ' + errors.join('\n• '));
            return;
        }

        console.log('Form values:', {startingMileage, milesPerYear, leaseDuration, costPerMile, budgetedOverMiles, startDate});

        this.lease = {
            startingMileage,
            milesPerYear,
            leaseDuration,
            costPerMile,
            budgetedOverMiles,
            startDate: new Date(startDate),
            totalAllowedMiles: Math.round((milesPerYear * leaseDuration) / 12),
            totalTargetMiles: Math.round((milesPerYear * leaseDuration) / 12) + budgetedOverMiles
        };

        console.log('Created lease:', this.lease);

        // Only create initial reading if no readings exist (new lease)
        if (this.readings.length === 0) {
            this.readings = [{
                date: this.lease.startDate,
                mileage: startingMileage,
                isInitial: true
            }];
        } else {
            // Update the initial reading if editing lease
            this.readings[0] = {
                date: this.lease.startDate,
                mileage: startingMileage,
                isInitial: true
            };
            // Re-sort readings after updating initial reading
            this.readings.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        this.saveData();
        console.log('About to call updateDisplay');
        this.updateDisplay();
    }

    addReading() {
        console.log('addReading called');
        console.log('Current lease:', this.lease);
        console.log('Current readings:', this.readings);
        
        const currentMileageValue = document.getElementById('currentMileage').value.trim();
        const readingDateValue = document.getElementById('readingDate').value;

        // Enhanced validation
        const errors = [];
        
        const currentMileage = parseInt(currentMileageValue);
        if (!currentMileageValue || isNaN(currentMileage) || currentMileage < 0) {
            errors.push('Current mileage must be a positive number');
        } else if (currentMileage > 1000000) {
            errors.push('Current mileage seems unrealistic (over 1,000,000)');
        }
        
        if (!readingDateValue) {
            errors.push('Please select a reading date');
        }
        
        const readingDate = new Date(readingDateValue);
        if (readingDateValue && isNaN(readingDate.getTime())) {
            errors.push('Invalid reading date');
        } else if (readingDateValue) {
            const now = new Date();
            const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            
            if (readingDate < fiveYearsAgo || readingDate > tomorrow) {
                errors.push('Reading date must be within the last 5 years and not in the future');
            }
        }
        
        if (errors.length > 0) {
            alert('Please correct the following errors:\n\n• ' + errors.join('\n• '));
            return;
        }

        console.log('New reading values:', {currentMileage, readingDate});

        if (this.readings.length === 0) {
            alert('No initial reading found. Please reset and set up your lease again.');
            return;
        }

        if (currentMileage <= this.getLatestReading().mileage) {
            alert('Current mileage must be higher than the previous reading.');
            return;
        }

        this.readings.push({
            date: readingDate,
            mileage: currentMileage,
            isInitial: false
        });

        this.readings.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Readings after adding:', this.readings);
        
        this.saveData();
        this.updateDisplay();
        
        document.getElementById('currentMileage').value = '';
    }

    calculateStatus() {
        if (!this.lease || this.readings.length === 0) return null;

        const now = new Date();
        const leaseStart = this.lease.startDate;
        const leaseEnd = new Date(leaseStart);
        leaseEnd.setMonth(leaseEnd.getMonth() + this.lease.leaseDuration);

        const totalLeaseDays = (leaseEnd - leaseStart) / (1000 * 60 * 60 * 24);
        const daysPassed = Math.min((now - leaseStart) / (1000 * 60 * 60 * 24), totalLeaseDays);
        const daysRemaining = Math.max(totalLeaseDays - daysPassed, 0);

        const expectedMileage = this.lease.startingMileage + 
            (this.lease.totalAllowedMiles * (daysPassed / totalLeaseDays));

        const latestReading = this.getLatestReading();
        const actualMileage = latestReading.mileage;
        const milesDriven = actualMileage - this.lease.startingMileage;

        const targetMilesUsed = this.lease.totalTargetMiles * (daysPassed / totalLeaseDays);
        const milesFromExpected = milesDriven - targetMilesUsed;
        
        const remainingTargetMiles = Math.max(0, this.lease.totalTargetMiles - milesDriven);
        const projectedFinalMileage = this.lease.startingMileage + this.lease.totalAllowedMiles;

        const projectedOverage = 0;

        const currentOverage = Math.max(0, 
            actualMileage - (this.lease.startingMileage + this.lease.totalAllowedMiles));

        return {
            expectedMileage: Math.round(expectedMileage),
            actualMileage,
            milesDriven,
            targetMilesUsed: Math.round(targetMilesUsed),
            milesFromExpected: Math.round(milesFromExpected),
            projectedFinalMileage: Math.round(projectedFinalMileage),
            projectedOverage: Math.round(projectedOverage),
            currentOverage: Math.round(currentOverage),
            projectedCost: projectedOverage * this.lease.costPerMile,
            currentCost: currentOverage * this.lease.costPerMile,
            daysPassed: Math.round(daysPassed),
            daysRemaining: Math.round(daysRemaining),
            leaseEnd: leaseEnd,
            dailyAverage: milesDriven / daysPassed,
            allowedDailyAverage: this.lease.totalTargetMiles / totalLeaseDays,
            remainingTargetMiles: Math.round(remainingTargetMiles)
        };
    }

    getLatestReading() {
        return this.readings[this.readings.length - 1];
    }

    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateDisplay() {
        console.log('updateDisplay called');
        console.log('this.lease:', this.lease);
        console.log('this.readings:', this.readings);
        
        if (!this.lease) {
            console.log('No lease found, showing setup');
            alert('DEBUG: No lease found, going back to setup screen');
            document.getElementById('setupSection').style.display = 'block';
            document.getElementById('trackingSection').style.display = 'none';
            return;
        }

        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('trackingSection').style.display = 'block';

        const status = this.calculateStatus();
        if (!status) return;

        const statusDisplay = document.getElementById('statusDisplay');
        const historyDisplay = document.getElementById('historyDisplay');

        const totalDays = status.daysPassed + status.daysRemaining;
        const percentDaysComplete = ((status.daysPassed / totalDays) * 100).toFixed(1);
        const percentDaysRemaining = ((status.daysRemaining / totalDays) * 100).toFixed(1);

        const milesUsed = status.milesDriven;
        const milesAllowed = this.lease.totalTargetMiles;
        const milesRemaining = status.remainingTargetMiles;
        const projectedTotal = milesAllowed;
        const overUnder = 0;
        
        const percentUsed = ((milesUsed / milesAllowed) * 100).toFixed(1);
        const percentRemaining = ((milesRemaining / milesAllowed) * 100).toFixed(1);
        const percentTarget = ((status.targetMilesUsed / milesAllowed) * 100).toFixed(1);
        
        // Calculate projections based on current trend
        const projectedTotalMiles = status.daysRemaining > 0 ? 
            milesUsed + (status.dailyAverage * status.daysRemaining) : milesUsed;
        const projectedTotalDays = totalDays;
        const projectedTotalWeeks = totalDays / 7;
        const projectedOverage = Math.max(0, projectedTotalMiles - this.lease.totalAllowedMiles);
        const projectedOverageCost = projectedOverage * this.lease.costPerMile;
        
        // Sanitize the date string to prevent XSS
        const sanitizedLeaseEndDate = this.sanitizeText(status.leaseEnd.toLocaleDateString());

        statusDisplay.innerHTML = `
            <div>
                <div class="current-reading">
                    <h3>Current Odometer: ${status.actualMileage.toLocaleString()} miles</h3>
                </div>
                
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
                        <tr>
                            <td><strong>Mileage</strong></td>
                            <td>${milesUsed.toLocaleString()} (${percentUsed}%)</td>
                            <td>${status.targetMilesUsed.toLocaleString()} (${percentTarget}%)</td>
                            <td class="${status.milesFromExpected >= 0 ? 'over' : 'under'}">
                                ${status.milesFromExpected >= 0 ? '+' : ''}${status.milesFromExpected.toLocaleString()}
                            </td>
                            <td>${milesRemaining.toLocaleString()} (${percentRemaining}%)</td>
                            <td class="${projectedTotalMiles > this.lease.totalTargetMiles ? 'over' : 'under'}">
                                ${projectedTotalMiles.toLocaleString()}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Days</strong></td>
                            <td>${status.daysPassed} (${percentDaysComplete}%)</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${status.daysRemaining} (${percentDaysRemaining}%)</td>
                            <td>${projectedTotalDays}</td>
                        </tr>
                        <tr>
                            <td><strong>Miles per Day</strong></td>
                            <td>${status.dailyAverage.toFixed(1)}</td>
                            <td>${status.allowedDailyAverage.toFixed(1)}</td>
                            <td class="${status.dailyAverage > status.allowedDailyAverage ? 'over' : 'under'}">
                                ${status.dailyAverage > status.allowedDailyAverage ? '+' : ''}${(status.dailyAverage - status.allowedDailyAverage).toFixed(1)}
                            </td>
                            <td>${status.daysRemaining > 0 ? (milesRemaining / status.daysRemaining).toFixed(1) : '0.0'}</td>
                            <td class="${status.dailyAverage > status.allowedDailyAverage ? 'over' : 'under'}">
                                ${status.dailyAverage.toFixed(1)}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Weeks</strong></td>
                            <td>${(status.daysPassed / 7).toFixed(1)}</td>
                            <td>-</td>
                            <td>-</td>
                            <td>${(status.daysRemaining / 7).toFixed(1)}</td>
                            <td>${projectedTotalWeeks.toFixed(1)}</td>
                        </tr>
                        <tr>
                            <td><strong>Miles per Week</strong></td>
                            <td>${(status.dailyAverage * 7).toFixed(0)}</td>
                            <td>${(status.allowedDailyAverage * 7).toFixed(0)}</td>
                            <td class="${status.dailyAverage > status.allowedDailyAverage ? 'over' : 'under'}">
                                ${status.dailyAverage > status.allowedDailyAverage ? '+' : ''}${((status.dailyAverage - status.allowedDailyAverage) * 7).toFixed(0)}
                            </td>
                            <td>${status.daysRemaining > 0 ? ((milesRemaining / status.daysRemaining) * 7).toFixed(0) : '0'}</td>
                            <td class="${status.dailyAverage > status.allowedDailyAverage ? 'over' : 'under'}">
                                ${(status.dailyAverage * 7).toFixed(0)}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Cost Impact</strong></td>
                            <td>-</td>
                            <td>-</td>
                            <td class="${status.milesFromExpected >= 0 ? 'over' : 'under'}">
                                ${status.milesFromExpected > 0 ? 
                                    `$${(status.milesFromExpected * this.lease.costPerMile).toFixed(2)}` : 
                                    '$0'
                                }
                            </td>
                            <td>-</td>
                            <td class="${projectedOverage > 0 ? 'over' : 'under'}">
                                ${projectedOverage > 0 ? `$${projectedOverageCost.toFixed(2)}` : '$0'}
                            </td>
                        </tr>
                    </tbody>
                </table>
                
                <div class="lease-details">
                    <h4>Lease Details</h4>
                    <div class="lease-info">
                        <span><strong>Total Miles Allowed:</strong> ${this.lease.totalAllowedMiles.toLocaleString()}</span>
                        <span><strong>Total Target Miles:</strong> ${this.lease.totalTargetMiles.toLocaleString()}</span>
                        <span><strong>Budgeted Extra Miles:</strong> ${this.lease.budgetedOverMiles.toLocaleString()}</span>
                        <span><strong>Budgeted Extra Cost:</strong> $${(this.lease.budgetedOverMiles * this.lease.costPerMile).toFixed(2)}</span>
                        <span><strong>Total Days:</strong> ${totalDays}</span>
                        <span><strong>Total Weeks:</strong> ${(totalDays / 7).toFixed(1)}</span>
                        <span><strong>Allowed Miles/Day:</strong> ${status.allowedDailyAverage.toFixed(1)}</span>
                        <span><strong>Allowed Miles/Week:</strong> ${(status.allowedDailyAverage * 7).toFixed(0)}</span>
                        <span><strong>Cost Per Mile Over:</strong> $${this.lease.costPerMile}</span>
                        <span><strong>Lease End:</strong> ${sanitizedLeaseEndDate}</span>
                    </div>
                </div>
            </div>
        `;

        // Clear and rebuild history display safely
        historyDisplay.innerHTML = '';
        this.readings
            .slice()
            .reverse()
            .forEach(reading => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const dateDiv = document.createElement('div');
                dateDiv.className = 'history-item-date';
                dateDiv.textContent = reading.date.toLocaleDateString();
                
                const mileageDiv = document.createElement('div');
                mileageDiv.className = 'history-item-mileage';
                mileageDiv.textContent = `${reading.mileage.toLocaleString()} miles`;
                
                historyItem.appendChild(dateDiv);
                historyItem.appendChild(mileageDiv);
                
                if (reading.isInitial) {
                    const initialTag = document.createElement('small');
                    initialTag.textContent = 'Initial reading';
                    historyItem.appendChild(initialTag);
                }
                
                historyDisplay.appendChild(historyItem);
            });
    }

    saveData() {
        const data = {
            lease: this.lease ? {
                ...this.lease,
                startDate: this.lease.startDate.toISOString()
            } : null,
            readings: this.readings.map(r => ({
                ...r,
                date: r.date.toISOString()
            }))
        };
        localStorage.setItem('milemeter_data', JSON.stringify(data));
    }

    loadData() {
        const data = localStorage.getItem('milemeter_data');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                
                // Validate parsed data structure
                if (!parsed || typeof parsed !== 'object') {
                    throw new Error('Invalid data structure');
                }
                
                if (parsed.lease) {
                    // Validate lease data
                    const lease = parsed.lease;
                    if (lease.startingMileage !== undefined && lease.milesPerYear !== undefined && 
                        lease.leaseDuration !== undefined && lease.costPerMile !== undefined &&
                        lease.startDate) {
                        
                        this.lease = {
                            ...lease,
                            startDate: new Date(lease.startDate)
                        };
                        
                        // Validate date is valid
                        if (isNaN(this.lease.startDate.getTime())) {
                            throw new Error('Invalid lease start date');
                        }
                    }
                }
                
                if (parsed.readings && Array.isArray(parsed.readings)) {
                    this.readings = parsed.readings
                        .filter(r => r && r.date && r.mileage !== undefined)
                        .map(r => {
                            const date = new Date(r.date);
                            if (isNaN(date.getTime())) {
                                throw new Error('Invalid reading date');
                            }
                            return {
                                ...r,
                                date: date,
                                mileage: Number(r.mileage),
                                isInitial: Boolean(r.isInitial)
                            };
                        })
                        .filter(r => !isNaN(r.mileage));
                } else {
                    this.readings = [];
                }
                
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
                alert('Stored data appears corrupted. Starting fresh. Your data has been reset.');
                
                // Clear corrupted data and reset to defaults
                localStorage.removeItem('milemeter_data');
                this.lease = null;
                this.readings = [];
            }
        }
    }

    editLease() {
        if (!this.lease) return;
        
        // Pre-populate the form with current lease data
        document.getElementById('startingMileage').value = this.lease.startingMileage;
        document.getElementById('milesPerYear').value = this.lease.milesPerYear;
        document.getElementById('leaseDuration').value = this.lease.leaseDuration;
        document.getElementById('costPerMile').value = this.lease.costPerMile;
        document.getElementById('budgetedOverMiles').value = this.lease.budgetedOverMiles || 0;
        document.getElementById('startDate').value = this.lease.startDate.toISOString().split('T')[0];
        
        // Show setup screen
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('trackingSection').style.display = 'none';
        
        // Keep readings but allow lease modification
        // The readings will be preserved when they submit the form
    }

    resetData() {
        if (confirm('Are you sure you want to reset all lease data? This cannot be undone.')) {
            this.lease = null;
            this.readings = [];
            localStorage.removeItem('milemeter_data');
            this.updateDisplay();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating MileMeter');
    window.mileMeter = new MileMeter();
    console.log('MileMeter created:', window.mileMeter);
});