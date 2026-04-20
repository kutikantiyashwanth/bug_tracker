# 📚 Student Bug Tracker - Complete User Guide

## 🎯 What is Student Bug Tracker?

Student Bug Tracker is a lightweight project management and bug tracking platform designed for student teams and hackathons. It helps you organize tasks, track bugs, collaborate with team members, and monitor project progress.

---

## 🚀 Getting Started

### Step 1: Create an Account

1. **Open the website** at `http://localhost:3000`
2. **Click "Sign up"** or navigate to the Register page
3. **Fill in your details:**
   - Full Name (e.g., "John Doe")
   - Email (e.g., "john@team.dev")
   - Password (minimum 6 characters)
   - Role: Choose from Developer, Tester, or Admin/Team Lead
4. **Click "Create Account"**
5. You'll be automatically logged in and redirected to the dashboard

### Step 2: Login (For Existing Users)

1. Navigate to the Login page
2. Enter your email and password
3. Click "Sign in"

**Demo Account:** Use `alex@team.dev` with any password to explore the app with sample data.

---

## 📁 Project Management

### Creating Your First Project

1. **After registration**, you'll see an empty dashboard
2. **Click "Projects"** in the left sidebar
3. You'll see a welcome screen: "No Projects Yet"
4. **Click "Create Your First Project"** or the **"+ New Project"** button
5. **Fill in the project details:**
   - **Project Name:** e.g., "Campus Connect App"
   - **Description:** e.g., "A social networking platform for university students"
6. **Click "Create Project"**
7. Your project is now created and automatically set as the active project!

### Understanding Your Project

Each project shows:
- **Project Icon:** First 2 letters of the project name
- **Active Badge:** Shows which project you're currently working on
- **Stats:**
  - Number of Tasks
  - Number of Bugs
  - Number of Team Members
- **Progress Bar:** Shows task completion percentage
- **Invite Code:** Unique code to invite team members (e.g., "CA-2026-XK9")

### Inviting Team Members

1. **Find your project's invite code** (shown on the project card)
2. **Click the invite code** to copy it to clipboard
3. **Share the code** with your team members via email, chat, or messaging
4. Team members can use this code to join your project
5. You can also find the invite code in the **sidebar** under the project name

### Switching Between Projects

1. **Click the project dropdown** in the left sidebar
2. **Select a different project** from the list
3. The dashboard will update to show that project's data
4. **Or click "+ New Project"** to create another project

---

## ✅ Task Management (Kanban Board)

### Understanding the Kanban Board

The Kanban board has **5 columns** representing task stages:
1. **Backlog** - Ideas and future tasks
2. **To Do** - Ready to start
3. **In Progress** - Currently being worked on
4. **Testing** - Ready for testing/review
5. **Done** - Completed tasks

### Creating a New Task

1. **Click "Kanban Board"** in the sidebar
2. **Click the "+ Add Task" button** in any column
3. **Fill in the task details:**
   - **Title:** e.g., "Design user authentication flow"
   - **Description:** Detailed explanation of what needs to be done
   - **Assignee:** Select a team member (or leave unassigned)
   - **Priority:** Choose from Low, Medium, High, or Critical
   - **Due Date:** Set a deadline
   - **Tags:** Add labels like "frontend", "backend", "urgent"
4. **Click "Create Task"**
5. The task card appears in the selected column

### Task Card Information

Each task card shows:
- **Title** and **Description**
- **Priority Badge:** Color-coded (Low=Gray, Medium=Blue, High=Orange, Critical=Red)
- **Assignee Avatar:** Who's responsible for the task
- **Due Date:** Deadline with calendar icon
- **Tags:** Category labels

### Moving Tasks Between Columns

**Method 1: Drag and Drop**
1. **Click and hold** a task card
2. **Drag it** to another column
3. **Release** to drop it
4. The task status updates automatically

**Method 2: Click to Move**
1. **Click on a task card** to open details
2. **Change the status** dropdown
3. **Save changes**

### Editing a Task

1. **Click on any task card**
2. **Edit the details** you want to change
3. **Click "Save"** or "Update Task"
4. Changes are saved immediately

### Deleting a Task

1. **Click on a task card** to open it
2. **Click the "Delete" button** (usually a trash icon)
3. **Confirm deletion**
4. The task is permanently removed

---

## 🐛 Bug Tracking System

### Reporting a New Bug

1. **Click "Bug Reports"** in the sidebar
2. **Click "+ Report Bug"** button
3. **Fill in the bug details:**
   - **Title:** e.g., "Login button unresponsive on Safari"
   - **Description:** What's wrong and what should happen
   - **Steps to Reproduce:**
     ```
     1. Open Safari browser
     2. Navigate to login page
     3. Enter valid credentials
     4. Click Login button
     5. Nothing happens
     ```
   - **Severity:** Choose from Minor, Major, or Critical
   - **Assign to Developer:** Select who should fix it
   - **Screenshot:** (Optional) Upload a screenshot showing the bug
4. **Click "Report Bug"**
5. The bug is added to the bug list

### Understanding Bug Severity

- **Minor:** Small issues that don't affect core functionality (e.g., typos, minor UI glitches)
- **Major:** Significant issues affecting user experience (e.g., broken features, validation errors)
- **Critical:** Severe issues preventing core functionality (e.g., login broken, data loss, crashes)

### Bug Status

Bugs have 3 statuses:
- **Open:** Newly reported, needs attention
- **In Progress:** Developer is working on it
- **Resolved:** Bug has been fixed

### Filtering Bugs

1. **Use the filter dropdowns** at the top of the Bug Reports page
2. **Filter by Status:** Show only Open, In Progress, or Resolved bugs
3. **Filter by Severity:** Show only Minor, Major, or Critical bugs
4. **Search:** Type keywords to find specific bugs

### Updating a Bug

1. **Click on a bug** to open details
2. **Update information:**
   - Change status (Open → In Progress → Resolved)
   - Reassign to another developer
   - Add comments or notes
   - Update severity if needed
3. **Save changes**

### Closing a Bug

1. **Open the bug details**
2. **Change status to "Resolved"**
3. **Add a comment** explaining the fix (optional)
4. **Save**
5. The bug moves to the Resolved section

---

## 📊 Dashboard & Analytics

### Dashboard Overview

The main dashboard shows:

**1. Quick Stats Cards:**
- **Total Tasks:** Count of all tasks
- **Completed Tasks:** Tasks marked as Done
- **Open Bugs:** Bugs needing attention
- **Team Members:** Number of people in the project

**2. Task Distribution Chart:**
- Visual breakdown of tasks by status
- Shows how many tasks are in each column (Backlog, To Do, In Progress, Testing, Done)

**3. Bug Status Chart:**
- Shows Open vs Resolved bugs
- Helps track bug fixing progress

**4. Upcoming Deadlines:**
- Lists tasks due soon
- Sorted by due date
- Shows priority and assignee

**5. Recent Activity Feed:**
- Timeline of recent actions
- Shows who did what and when
- Includes task creation, bug reports, status changes

### Understanding Progress

- **Completion Rate:** Percentage of tasks marked as Done
- **Bug Resolution Rate:** Percentage of bugs resolved
- **Team Activity:** How active your team has been recently

---

## 📝 Activity Log

### What is the Activity Log?

The Activity Log tracks **everything** that happens in your project:
- Task creation and updates
- Task movement between columns
- Bug reports and fixes
- Team member actions
- Project changes

### Viewing Activity

1. **Click "Activity Log"** in the sidebar
2. **See a timeline** of all activities
3. **Activities are grouped by date**
4. Each entry shows:
   - **Who** performed the action
   - **What** they did
   - **When** it happened
   - **Which task/bug** was affected

### Activity Types

- **Created:** Someone created a new task or bug
- **Moved:** A task was moved to a different column
- **Assigned:** A task/bug was assigned to someone
- **Resolved:** A bug was fixed
- **Joined:** A new member joined the project
- **Updated:** Task or bug details were changed

---

## 🔔 Notifications

### Notification Types

You'll receive notifications for:
- **Task Assignment:** When you're assigned to a task
- **Bug Assignment:** When a bug is assigned to you
- **Deadline Reminders:** When a task deadline is approaching
- **Task Updates:** When someone moves or updates a task you're involved in
- **Project Invites:** When you're invited to join a project
- **Bug Resolution:** When a bug you reported is fixed

### Viewing Notifications

1. **Click the Bell icon** in the top-right corner
2. **See the notification count** (red badge shows unread count)
3. **Click "Notifications"** in the sidebar to see all notifications
4. **Click a notification** to view details or navigate to the related item

### Managing Notifications

- **Mark as Read:** Click on a notification to mark it as read
- **Mark All as Read:** Click the "Mark all as read" button
- **Unread Badge:** Shows how many unread notifications you have

---

## 👥 Team Management

### Viewing Team Members

1. **Check the sidebar** - Shows up to 5 team members with avatars
2. **Green dot** indicates online/active status
3. **Click "Team"** (if available) to see all members

### Team Member Roles

- **Admin/Team Lead:** Can manage project settings, invite members, delete tasks/bugs
- **Developer:** Can create tasks, fix bugs, update status
- **Tester:** Can report bugs, test features, update task status

### Adding Team Members

1. **Copy your project's invite code** (shown in sidebar or project page)
2. **Share the code** with new members
3. **They register/login** and enter the invite code
4. **They're added to the project** automatically

### Assigning Work

1. **When creating a task or bug**, select an assignee from the dropdown
2. **Choose a team member** based on their role and skills
3. **They'll receive a notification** about the assignment
4. **Track their progress** on the Kanban board or Bug Reports page

---

## ⚙️ Settings

### User Profile Settings

1. **Click "Settings"** in the sidebar
2. **Update your profile:**
   - Name
   - Email
   - Role
   - Skills (e.g., "React", "Python", "Testing")
   - Profile picture (if available)
3. **Change password** (if needed)
4. **Save changes**

### Project Settings

1. **Go to Projects page**
2. **Click on a project** to view details
3. **Update project information:**
   - Project name
   - Description
   - Team members
4. **Manage invite code** (regenerate if needed)

---

## 🎨 Tips & Best Practices

### For Project Management

✅ **Create clear task titles** - Make them descriptive and actionable
✅ **Set realistic deadlines** - Give team members enough time
✅ **Use priority levels wisely** - Not everything can be Critical
✅ **Add detailed descriptions** - Help team members understand what's needed
✅ **Use tags** - Organize tasks by category (frontend, backend, urgent, etc.)
✅ **Update task status regularly** - Keep the board current
✅ **Break large tasks into smaller ones** - Easier to manage and track

### For Bug Tracking

✅ **Write clear bug titles** - Describe the problem concisely
✅ **Provide steps to reproduce** - Help developers recreate the issue
✅ **Set appropriate severity** - Critical for blocking issues, Minor for cosmetic
✅ **Include screenshots** - Visual proof helps a lot
✅ **Test before closing** - Verify the bug is actually fixed
✅ **Add comments** - Document the fix or workaround

### For Team Collaboration

✅ **Check notifications daily** - Stay updated on assignments
✅ **Communicate with your team** - Use comments and activity log
✅ **Update your progress** - Move tasks as you work on them
✅ **Report bugs promptly** - Don't let issues pile up
✅ **Review the dashboard** - Monitor project health regularly
✅ **Meet deadlines** - Or communicate if you need more time

---

## 🔍 Common Workflows

### Workflow 1: Starting a New Feature

1. Create a task in **Backlog** column
2. Add description, assignee, priority, and deadline
3. Move to **To Do** when ready to start
4. Assignee moves to **In Progress** when they begin work
5. Move to **Testing** when code is ready for review
6. Tester verifies the feature
7. Move to **Done** when approved

### Workflow 2: Handling a Bug Report

1. Tester finds a bug and clicks **"+ Report Bug"**
2. Fills in details with steps to reproduce
3. Sets severity and assigns to a developer
4. Developer receives notification
5. Developer changes status to **"In Progress"**
6. Developer fixes the bug and updates status to **"Resolved"**
7. Tester verifies the fix
8. Bug is closed

### Workflow 3: Daily Standup

1. Open **Dashboard** to see overview
2. Check **Upcoming Deadlines** for today's priorities
3. Review **Recent Activity** to see team progress
4. Open **Kanban Board** to update your task status
5. Check **Notifications** for new assignments
6. Review **Bug Reports** for critical issues

### Workflow 4: Sprint Planning

1. Go to **Kanban Board**
2. Review **Backlog** column for upcoming work
3. Discuss priorities with team
4. Move selected tasks to **To Do** column
5. Assign tasks to team members
6. Set deadlines for the sprint
7. Monitor progress on **Dashboard**

---

## 📱 Keyboard Shortcuts (If Available)

- **Ctrl/Cmd + K** - Quick search
- **Ctrl/Cmd + N** - New task
- **Ctrl/Cmd + B** - New bug report
- **Esc** - Close dialog/modal

---

## ❓ Troubleshooting

### I can't see my project
- Make sure you've created a project first
- Check if you've selected the correct project in the sidebar dropdown

### Tasks aren't showing up
- Verify you're viewing the correct project
- Check if tasks were created in a different project
- Refresh the page

### Can't invite team members
- Copy the exact invite code (including dashes)
- Make sure team members are registered
- Check if the invite code is still valid

### Notifications not appearing
- Check if you have notifications enabled
- Refresh the page
- Make sure you're logged in

### Data not saving
- Check your internet connection
- Make sure you clicked "Save" or "Create"
- Try refreshing the page

---

## 🎓 Use Cases

### For Hackathons
- Quickly set up a project for your team
- Track features and bugs during the event
- Monitor progress in real-time
- Coordinate with team members efficiently

### For Class Projects
- Organize group assignments
- Divide work among team members
- Track progress toward deadlines
- Document bugs and issues

### For Student Startups
- Manage product development
- Track feature requests
- Monitor bug fixes
- Collaborate with co-founders

### For Learning Projects
- Practice project management skills
- Learn bug tracking workflows
- Experience team collaboration
- Build portfolio projects

---

## 🌟 Advanced Features

### Real-time Updates (If Enabled)
- Changes appear instantly for all team members
- No need to refresh the page
- See who's working on what in real-time

### Data Persistence
- All data is saved automatically
- Works offline (with localStorage)
- Data syncs when you reconnect

### Responsive Design
- Works on desktop, tablet, and mobile
- Touch-friendly interface
- Optimized for all screen sizes

---

## 📞 Need Help?

If you encounter issues or have questions:
1. Check this guide first
2. Review the README.md file
3. Check the Activity Log for recent changes
4. Ask your team members
5. Contact the project administrator

---

## 🎉 You're Ready!

You now know how to:
- ✅ Create and manage projects
- ✅ Use the Kanban board for task management
- ✅ Report and track bugs
- ✅ Collaborate with team members
- ✅ Monitor project progress
- ✅ Stay updated with notifications

**Start by creating your first project and invite your team!**

Happy tracking! 🚀
