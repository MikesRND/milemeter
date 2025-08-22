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
                    ${this.renderYearsRow(status, projections)}
                    ${this.renderMilesPerYearRow(status, projections)}
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

    static renderYearsRow(status, projections) {
        return `
            <tr>
                <td><strong>Years</strong></td>
                <td>${(status.daysPassed / 365.25).toFixed(2)}</td>
                <td>-</td>
                <td>-</td>
                <td>${(status.daysRemaining / 365.25).toFixed(2)}</td>
                <td>${(projections.projectedTotalDays / 365.25).toFixed(2)}</td>
            </tr>
        `;
    }

    static renderMilesPerYearRow(status, projections) {
        const milesRemaining = status.remainingTargetMiles;
        
        return `
            <tr>
                <td><strong>Miles per Year</strong></td>
                <td>${(status.dailyAverage * 365.25).toFixed(0)}</td>
                <td>${(status.allowedDailyAverage * 365.25).toFixed(0)}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${status.dailyAverage > status.allowedDailyAverage ? '+' : ''}${((status.dailyAverage - status.allowedDailyAverage) * 365.25).toFixed(0)}
                </td>
                <td>${status.daysRemaining > 0 ? ((milesRemaining / status.daysRemaining) * 365.25).toFixed(0) : '0'}</td>
                <td class="${Calculator.getStatusClass(status.dailyAverage, status.allowedDailyAverage)}">
                    ${(status.dailyAverage * 365.25).toFixed(0)}
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