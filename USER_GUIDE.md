# MileMeter - User Guide

## Overview
MileMeter is a web-based application for tracking your vehicle lease mileage and staying within your limits. It helps you monitor your usage against a linear target and provides projections to avoid costly overage fees.

## Getting Started

### 1. Initial Setup
When you first open MileMeter, you'll see the lease setup form. Enter:

- **Starting Mileage**: Your odometer reading when the lease began
- **Miles Allowed Per Year**: Annual mileage limit from your lease contract (e.g., 12,000)
- **Lease Duration**: Length of lease in months (e.g., 36 for 3 years)
- **Cost Per Mile Over Limit**: Penalty rate for exceeding your allowance (e.g., $0.25)
- **Budgeted Extra Miles** (optional): Additional miles you're willing to pay for
- **Lease Start Date**: When your lease began

Click "Start Tracking" to save your lease details.

### 2. Adding Mileage Readings
Regularly add your current odometer readings:

1. Enter your current odometer reading
2. Select the date (defaults to today)
3. Click "Add Reading"

**Tip**: Add readings weekly or monthly for best tracking accuracy.

## Understanding the Dashboard

### Current Odometer
Prominently displayed at the top - your most recent mileage reading.

### Summary Table
The main tracking table shows:

| Column | Description |
|--------|-------------|
| **Used** | What you've consumed so far |
| **Target** | Where you should be today (linear pace) |
| **Difference** | How far over/under your target pace |
| **Remaining** | What you have left |
| **Projected** | Where you'll end up if current trend continues |

### Row Categories

- **Mileage**: Total miles driven vs. allowance
- **Days**: Time elapsed vs. remaining
- **Miles per Day**: Daily driving rates
- **Weeks**: Time in weeks
- **Miles per Week**: Weekly driving rates  
- **Cost Impact**: Financial implications of being over/under pace

### Color Coding
- **Red**: Over target/allowance (warning)
- **Gray**: Under target (good)

### Lease Details
Static information about your lease parameters including:
- Total miles allowed and target miles
- Budgeted extra miles and cost
- Daily/weekly allowances
- Lease end date

## Key Features

### Budgeted Extra Miles
If you expect to exceed your allowance, set a budget for extra miles. This adjusts your targets to be more realistic while still tracking the financial impact.

**Example**: 
- Lease allows 36,000 miles
- Budget 2,000 extra miles
- Your target becomes 38,000 miles
- You won't show "over" until exceeding 38,000
- But overage costs still apply after 36,000

### Projections
The "Projected" column shows where you'll end up if you continue your current driving pace. This helps you:
- Identify potential overages early
- See the financial impact of current habits
- Make informed decisions about future driving

### Editing Lease Data
Use "Edit Lease Data" to modify your lease parameters while preserving your mileage history. This is useful for:
- Correcting setup mistakes
- Adjusting for lease modifications
- Updating budgeted extra miles

## Tips for Success

1. **Regular Updates**: Add readings consistently for accurate tracking
2. **Monitor Projections**: Check if your current pace leads to overages
3. **Plan Ahead**: Use remaining miles/day to guide future driving
4. **Budget Wisely**: Set realistic extra mile budgets if needed
5. **Early Action**: Adjust driving habits when projections show problems

## Data Storage
Your data is stored locally in your browser and persists between sessions. It's not synced across devices, so:
- Use the same browser/device for consistency
- Consider backing up data (see developer guide)
- Clearing browser data will delete your readings

## Troubleshooting

**App goes back to setup screen**: Usually a JavaScript error. Check browser console for errors and refresh the page.

**Readings not saving**: Ensure you're using a modern browser with localStorage support.

**Calculations seem wrong**: Verify your lease parameters are entered correctly using "Edit Lease Data".

## Privacy
MileMeter runs entirely in your browser. No data is sent to external servers, ensuring your driving patterns remain private.