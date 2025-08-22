# MileMeter - Design Document

## Architecture Overview
MileMeter is a client-side web application built with vanilla HTML, CSS, and JavaScript. It uses the browser's localStorage for data persistence.

### Tech Stack
- **Frontend**: HTML5, CSS3, ES6 JavaScript
- **Storage**: Browser localStorage
- **Architecture**: Single Page Application (SPA)
- **Styling**: CSS Grid/Flexbox with responsive design

## Core Components

### 1. Application Structure
```
/milemeter
├── index.html          # Main application page
├── styles.css          # All styling
├── script.js           # Application logic
├── USER_GUIDE.md       # User documentation
└── DESIGN_DOC.md       # This document
```

### 2. Main Classes

#### MileMeter Class
Main application controller managing:
- Lease configuration
- Mileage readings
- Data persistence
- UI updates

**Key Methods:**
- `init()`: Initialize application and load saved data
- `setupLease()`: Create/update lease configuration
- `addReading()`: Add new mileage reading
- `calculateStatus()`: Compute current status and projections
- `updateDisplay()`: Refresh UI with current data

## Data Models

### Lease Object
```javascript
{
  startingMileage: Number,       // Initial odometer reading
  milesPerYear: Number,          // Annual mileage allowance
  leaseDuration: Number,         // Months
  costPerMile: Number,           // Penalty rate for overages
  budgetedOverMiles: Number,     // Optional extra miles budget
  startDate: Date,               // Lease start date
  totalAllowedMiles: Number,     // Calculated total allowance
  totalTargetMiles: Number       // Allowance + budgeted extra
}
```

### Reading Object
```javascript
{
  date: Date,           // When reading was taken
  mileage: Number,      // Odometer reading
  isInitial: Boolean    // True for starting reading
}
```

### Status Object (Calculated)
```javascript
{
  expectedMileage: Number,        // Expected odometer reading today
  actualMileage: Number,          // Current odometer reading
  milesDriven: Number,            // Total miles driven
  targetMilesUsed: Number,        // Target miles for today
  milesFromExpected: Number,      // Difference from target
  projectedFinalMileage: Number,  // Projected end-of-lease total
  dailyAverage: Number,           // Current daily driving rate
  allowedDailyAverage: Number,    // Target daily rate
  remainingTargetMiles: Number,   // Target miles remaining
  // ... additional calculated fields
}
```

## Key Algorithms

### Linear Target Calculation
```javascript
// Calculate where user should be today
const daysPassed = (today - leaseStart) / millisecondsPerDay;
const totalLeaseDays = (leaseEnd - leaseStart) / millisecondsPerDay;
const targetMilesUsed = totalTargetMiles * (daysPassed / totalLeaseDays);
```

### Projection Algorithm
```javascript
// Project end-of-lease mileage based on current rate
const dailyAverage = milesDriven / daysPassed;
const projectedTotal = currentMiles + (dailyAverage * daysRemaining);
```

### Overage Cost Calculation
```javascript
// Cost is based on official allowance, not budgeted target
const overage = Math.max(0, projectedTotal - totalAllowedMiles);
const cost = overage * costPerMile;
```

## UI Components

### 1. Lease Setup Form
- Form validation for required fields
- Optional budgeted extra miles
- Date picker for lease start
- Responsive design for mobile

### 2. Current Status Display
- Prominent current odometer reading
- Six-column summary table
- Color-coded status indicators
- Lease details reference section

### 3. Reading Entry Form
- Odometer input with validation
- Date picker (defaults to today)
- Prevents readings lower than previous

### 4. Reading History
- Chronological list of all readings
- Distinguishes initial vs. regular readings
- Most recent readings first

## Data Persistence

### Storage Strategy
Uses `localStorage` with key `milemeter_data`:

```javascript
{
  lease: {
    // Lease object with dates as ISO strings
  },
  readings: [
    // Array of reading objects with dates as ISO strings
  ]
}
```

### Data Serialization
- Dates converted to ISO strings for storage
- Parsed back to Date objects on load
- Graceful handling of missing/corrupted data

## Responsive Design

### Breakpoints
- **Mobile**: < 600px
- **Tablet/Desktop**: ≥ 600px

### Mobile Optimizations
- Smaller padding and margins
- Grid layout adapts to single column
- Touch-friendly form inputs
- Larger tap targets for buttons

## Color Scheme & Styling

### Brand Colors
- **Primary Gradient**: #667eea → #764ba2
- **Success/Under**: #6c757d (neutral gray)
- **Warning/Over**: #dc3545 (red)
- **Backgrounds**: #f5f7fa, #f8f9fa

### Typography
- **Primary**: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Sizes**: Responsive scaling from 0.875rem to 2.5rem
- **Weights**: 400 (normal), 600 (semi-bold), 700 (bold)

## Error Handling

### Input Validation
- Required field checking
- Numeric validation
- Date validation
- Logical validation (new readings must be higher)

### Data Integrity
- localStorage availability checking
- JSON parsing error handling
- Date object validation
- Fallback to empty state on data corruption

## Browser Compatibility

### Requirements
- ES6 support (classes, arrow functions, template literals)
- localStorage API
- CSS Grid and Flexbox
- Date object support

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 10.1+
- Edge 16+

## Performance Considerations

### Optimizations
- Single file architecture (no HTTP requests)
- Minimal DOM manipulation
- Efficient calculation caching
- Lightweight CSS (no frameworks)

### Scalability
- Linear performance with number of readings
- Suitable for typical lease duration data volumes
- No server-side dependencies

## Security Considerations

### Client-Side Only
- No data transmission to servers
- No authentication required
- No external API dependencies

### Data Privacy
- All data remains on user's device
- No tracking or analytics
- No external resource loading

## Future Enhancement Ideas

### Features
- Data export/import functionality
- Multiple vehicle tracking
- Goal setting for specific periods
- Email/SMS alerts for overages
- Charts and visualizations

### Technical
- Service Worker for offline functionality
- Progressive Web App (PWA) capabilities
- Cloud sync options
- Mobile app versions

## Development Setup

### Local Development
1. Clone repository
2. Open `index.html` in browser
3. Use browser dev tools for debugging
4. Consider local HTTP server for full functionality

### Testing
- Manual testing across browsers
- Form validation testing
- LocalStorage edge case testing
- Responsive design testing

### Deployment
- Static file hosting (GitHub Pages, Netlify, etc.)
- No build process required
- Direct file serving sufficient