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

    static hasData() {
        try {
            return !!localStorage.getItem(this.STORAGE_KEY);
        } catch (error) {
            return false;
        }
    }

    static isAvailable() {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}