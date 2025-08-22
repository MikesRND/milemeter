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

        // Check if mileage is higher than previous reading
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

    toStorageData() {
        return {
            date: this.date.toISOString(),
            mileage: this.mileage,
            isInitial: this.isInitial
        };
    }
}