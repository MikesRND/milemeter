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