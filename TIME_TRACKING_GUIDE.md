# ⏱️ Time Tracking Guide

## 🎯 Overview

Time Tracking allows you to log and monitor time spent on tasks and bugs. Perfect for tracking productivity, billing clients, or understanding project effort.

---

## 🚀 Quick Start

### Access Time Tracking

1. Click **"Time Tracking"** in the sidebar
2. View your time statistics and entries

---

## ⏱️ Features

### 1. Start/Stop Timer

**Quick Timer:**
```
1. Click "Start Timer" button
2. Timer starts counting
3. Work on your task
4. Click "Stop Timer" when done
5. Time is automatically logged
```

**What it tracks:**
- ✅ Real-time timer display (HH:MM:SS)
- ✅ Automatic time calculation
- ✅ Saves to time entries when stopped

### 2. Manual Time Entry

**Log Time Manually:**
```
1. Click "+ Log Time" button
2. Enter hours and minutes
3. Add description (what you worked on)
4. Select task or bug (optional)
5. Mark as billable (optional)
6. Click "Log Time"
```

**Fields:**
- **Hours:** Number of hours (0-999)
- **Minutes:** Number of minutes (0-59)
- **Description:** What you worked on
- **Type:** Task or Bug
- **Entity:** Specific task/bug (optional)
- **Billable:** Mark for client billing

---

## 📊 Statistics

### Dashboard Stats

**4 Key Metrics:**

1. **Total Time** - All time logged in project
2. **Your Time** - Time you personally logged
3. **Billable** - Time marked as billable
4. **Entries** - Number of time entries

**Example:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Time  │ Your Time   │ Billable    │ Entries     │
│   24h 30m   │   8h 15m    │   6h 0m     │     12      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📝 Time Entries List

### What You See

Each entry shows:
- **User avatar** - Who logged the time
- **User name** - Team member name
- **Description** - What they worked on
- **Task/Bug** - Related item (if any)
- **Time** - Hours and minutes (e.g., "2h 30m")
- **When** - Relative time (e.g., "2 hours ago")
- **Billable badge** - If marked as billable

**Example Entry:**
```
┌────────────────────────────────────────────────┐
│ 👤 Alex Johnson          [Billable]           │
│ Fixed login bug • Bug: Login button broken    │
│                                    2h 30m      │
│                                    2 hours ago │
└────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases

### 1. Track Task Time

**Scenario:** Working on a specific task

```
1. Go to Time Tracking
2. Click "+ Log Time"
3. Enter: 3 hours, 30 minutes
4. Description: "Implemented user authentication"
5. Type: Task
6. Select: "Design user authentication flow"
7. Log Time
```

### 2. Track Bug Fix Time

**Scenario:** Fixed a critical bug

```
1. Click "+ Log Time"
2. Enter: 1 hour, 45 minutes
3. Description: "Fixed Safari login issue"
4. Type: Bug
5. Select: "Login button unresponsive on Safari"
6. Mark as billable: ✓
7. Log Time
```

### 3. Use Timer for Active Work

**Scenario:** Starting work session

```
1. Click "Start Timer"
2. Work on your task
3. Timer shows: 01:23:45 (1h 23m 45s)
4. Click "Stop & Save"
5. Time automatically logged
```

### 4. Track Billable Hours

**Scenario:** Client project work

```
1. Log all time entries
2. Mark client work as "Billable"
3. View "Billable" stat in dashboard
4. Total billable time: 15h 30m
5. Use for invoicing
```

---

## 💡 Best Practices

### For Developers:

✅ **Log time daily** - Don't wait until end of week
✅ **Be specific** - Write clear descriptions
✅ **Link to tasks** - Associate time with tasks/bugs
✅ **Use timer** - For active work sessions
✅ **Mark billable** - If working for clients

### For Team Leads:

✅ **Review team time** - Check who's working on what
✅ **Monitor project time** - Track total effort
✅ **Identify bottlenecks** - See where time is spent
✅ **Plan better** - Use data for estimates
✅ **Track billable hours** - For client invoicing

### For Students:

✅ **Track study time** - See how long tasks take
✅ **Learn estimation** - Compare estimated vs actual
✅ **Show effort** - Demonstrate work to professors
✅ **Improve productivity** - Identify time wasters
✅ **Build habits** - Practice professional time tracking

---

## 📊 Time Calculations

### How Time is Calculated:

**Timer:**
- Starts when you click "Start Timer"
- Counts seconds in real-time
- Stops when you click "Stop Timer"
- Converts to hours and minutes
- Saves as time entry

**Manual Entry:**
- You enter hours and minutes
- System stores exact values
- Displays in format: "Xh Ym"

**Totals:**
- Sum of all hours × 60 + minutes
- Displayed as: "24h 30m"
- Accurate to the minute

---

## 🎨 UI Elements

### Active Timer Display

```
┌────────────────────────────────────────────────┐
│ ⏱️  Timer Running                              │
│     01:23:45                                   │
│                          [Stop & Save]         │
└────────────────────────────────────────────────┘
```

### Log Time Dialog

```
┌────────────────────────────────────────────────┐
│ ⏱️ Log Time                              [X]   │
├────────────────────────────────────────────────┤
│ Hours: [3]    Minutes: [30]                   │
│                                                │
│ Description:                                   │
│ [Implemented user authentication_________]     │
│                                                │
│ Type: [Task ▼]  Task: [Select... ▼]          │
│                                                │
│ ☑ Mark as billable                            │
│                                                │
│ [Cancel]  [Log Time]                          │
└────────────────────────────────────────────────┘
```

---

## 🔍 Finding Time Data

### View Time by Task

1. Go to Kanban Board
2. Click on a task
3. See time logged (future feature)

### View Time by User

1. Go to Time Tracking
2. Filter by user (future feature)
3. See individual time entries

### View Project Total

1. Go to Time Tracking
2. Check "Total Time" stat
3. See all project time

---

## 📈 Reports (Future)

### Coming Soon:

- 📊 Time by task chart
- 📊 Time by user chart
- 📊 Daily/weekly/monthly reports
- 📊 Billable vs non-billable breakdown
- 📊 Export to CSV/Excel
- 📊 Time estimates vs actual

---

## ⚙️ Settings (Future)

### Customization Options:

- ⚙️ Default billable rate
- ⚙️ Time rounding (15min, 30min, 1hr)
- ⚙️ Auto-start timer on task assignment
- ⚙️ Reminder to log time
- ⚙️ Weekly time summary emails

---

## 🎓 Learning Resources

### Why Track Time?

**For Students:**
- Learn professional practices
- Understand project effort
- Improve time estimation
- Build portfolio evidence
- Develop discipline

**For Teams:**
- Measure productivity
- Identify inefficiencies
- Plan future projects
- Justify resource needs
- Track project health

**For Freelancers:**
- Bill clients accurately
- Prove work completed
- Analyze profitability
- Improve estimates
- Professional invoicing

---

## 🚀 Quick Tips

### Keyboard Shortcuts (Future)

- `T` - Start/stop timer
- `L` - Log time
- `Esc` - Close dialog

### Mobile Usage

- ✅ Works on mobile devices
- ✅ Responsive design
- ✅ Touch-friendly buttons
- ✅ Easy time entry

### Integration

- ✅ Links to tasks
- ✅ Links to bugs
- ✅ Shows in activity log
- ✅ Syncs with dashboard

---

## 📝 Example Workflow

### Daily Time Tracking Routine:

**Morning:**
```
1. Open Time Tracking
2. Review yesterday's entries
3. Plan today's work
```

**During Work:**
```
1. Start timer when beginning task
2. Stop timer when taking break
3. Add description before stopping
4. Link to task/bug
```

**End of Day:**
```
1. Review all entries
2. Add any missing time
3. Mark billable entries
4. Check total time
```

**Weekly:**
```
1. Review total time
2. Compare to estimates
3. Identify patterns
4. Adjust future estimates
```

---

## ✅ Checklist

### Getting Started:

- [ ] Navigate to Time Tracking page
- [ ] View statistics dashboard
- [ ] Try starting timer
- [ ] Stop timer and save
- [ ] Log manual time entry
- [ ] Add description
- [ ] Link to task or bug
- [ ] Mark as billable
- [ ] View time entries list

### Daily Use:

- [ ] Log time for all work
- [ ] Use timer for active sessions
- [ ] Write clear descriptions
- [ ] Link to tasks/bugs
- [ ] Mark billable work
- [ ] Review daily total

---

## 🎉 You're Ready!

Time tracking is now available in your Student Bug Tracker!

**Start tracking time to:**
- ✅ Measure productivity
- ✅ Improve estimates
- ✅ Bill clients accurately
- ✅ Learn professional practices
- ✅ Build better habits

**Happy tracking! ⏱️**
