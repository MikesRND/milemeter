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