# How to Test the Website

## Live Website
https://bug-tracker-ui-evqv.onrender.com

## Quick Test with Demo Account

1. Open the website
2. Click **Try Demo Account** on the login page
3. You will be logged in as Admin automatically
4. Explore the dashboard

## Test Each Role

### Admin Test
- Email: admin@test.com
- Password: password123
- Can: Create projects, manage team, full access

### Developer Test
- Email: dev@test.com
- Password: password123
- Can: Join projects, use Kanban, report bugs

### Tester Test
- Email: tester@test.com
- Password: password123
- Can: Join projects, report and view bugs

## Test Scenarios

### Test Bug Reporting
1. Login as any role
2. Go to Bug Reports
3. Click Report Bug
4. Fill in title, description, steps
5. Click AI Analyze Severity
6. Submit

### Test Kanban
1. Login as Admin or Developer
2. Go to Kanban Board
3. Drag a task from one column to another
4. Check that it updates in real-time

### Test Join Project
1. Register a new Developer account
2. Get invite code from Admin
3. Go to Projects page
4. Click Join Project
5. Enter the invite code

## Backend Health Check
https://bug-tracker-api-d117.onrender.com/api/v1/health
