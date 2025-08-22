# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a vanilla HTML/CSS/JavaScript application with no build system. To develop and test:

```bash
# Serve locally (optional but recommended for testing)
python3 -m http.server 8000
# or
npx serve .

# Open in browser
open index.html
# or navigate to http://localhost:8000
```

There are no lint, test, or build commands - the application runs directly in the browser.

## Architecture Overview

MileMeter is a client-side Single Page Application (SPA) for tracking vehicle lease mileage. Key architectural principles:

### Core Structure
- **Pure vanilla stack**: HTML5, CSS3, ES6 JavaScript - no frameworks or dependencies
- **Single-page application**: All functionality in one HTML file with linked CSS/JS
- **Client-side only**: No server required, uses localStorage for persistence
- **Progressive enhancement**: Works offline after initial load

### Main Application Class
The entire application centers around the `MileMeter` class (`script.js:3-421`):
- **State management**: Manages `lease` and `readings` data structures
- **Event handling**: Binds all form submissions and button clicks
- **Calculations**: Complex mileage tracking algorithms with projections
- **UI updates**: Dynamically renders status displays and tables
- **Data persistence**: Handles localStorage serialization/deserialization

### Key Data Models
```javascript
// Lease configuration
lease: {
  startingMileage, milesPerYear, leaseDuration, 
  costPerMile, budgetedOverMiles, startDate,
  totalAllowedMiles, totalTargetMiles  // calculated fields
}

// Mileage readings
readings: [{
  date: Date, mileage: Number, isInitial: Boolean
}]
```

### Critical Algorithms
- **Linear target calculation**: Determines expected mileage based on time elapsed
- **Projection algorithm**: Forecasts end-of-lease mileage based on current usage rate  
- **Status computation**: Complex calculations in `calculateStatus()` method providing comprehensive tracking metrics

## UI Flow and State Management

### Application States
- **Setup state**: Shows lease configuration form (new users)
- **Tracking state**: Main dashboard with status display and reading entry
- **Edit state**: Returns to setup form but preserves existing readings

### Form Handling
- Forms use `preventDefault()` and custom validation
- Date inputs default to current date
- Numeric validation ensures readings increase monotonically
- localStorage persistence happens after every data change

### Display Updates
The `updateDisplay()` method rebuilds the entire status section with:
- Current odometer reading (prominent display)
- Six-column summary table (Used/Target/Difference/Remaining/Projected)  
- Lease details reference section
- Color-coded status indicators (red=over target, gray=under target)

## Key Implementation Patterns

### Data Persistence Strategy
- All data stored in localStorage under key `milemeter_data`
- Dates serialized as ISO strings, deserialized back to Date objects
- Graceful handling of missing or corrupted localStorage data
- Atomic updates - data saved after every user action

### Error Handling Approach
- Form validation prevents invalid data entry
- Defensive programming for localStorage availability
- User-friendly alerts for validation errors
- Fallback to empty state for data corruption

### Responsive Design
- CSS Grid/Flexbox layout adapts to mobile (< 600px breakpoint)
- Touch-friendly form inputs and button sizing
- Progressive disclosure of information density

## Working with This Codebase

### Adding Features
- Extend the `MileMeter` class with new methods
- Add corresponding HTML elements and CSS styling
- Update `calculateStatus()` for new metrics
- Modify `updateDisplay()` to render new data

### Data Model Changes
- Update both `saveData()` and `loadData()` methods
- Consider backward compatibility with existing localStorage data
- Test with various edge cases (missing fields, corrupted data)

### Styling Changes
- All styles in `styles.css` using CSS custom properties for colors
- Maintain responsive breakpoints and accessibility
- Follow existing naming conventions for CSS classes

### Debugging
- Extensive console logging throughout application flow
- Browser DevTools localStorage inspector for data examination
- Form validation provides immediate user feedback