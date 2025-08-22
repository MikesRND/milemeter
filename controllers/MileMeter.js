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
        const formData = this.extractLeaseFormData();
        const errors = Lease.validateFormData(formData);
        
        if (errors.length > 0) {
            alert('Please correct the following errors:\n\n• ' + errors.join('\n• '));
            return;
        }

        this.lease = Lease.fromFormData(formData);

        // Create or update initial reading
        if (this.readings.length === 0) {
            this.readings = [Reading.createInitial(this.lease.startingMileage, this.lease.startDate)];
        } else {
            this.readings[0] = Reading.createInitial(this.lease.startingMileage, this.lease.startDate);
            this.readings = Reading.sortByDate(this.readings);
        }

        this.saveData();
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
        
        // Clear form
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
        if (!this.lease) {
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
        
        // Pre-populate form with current lease data
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