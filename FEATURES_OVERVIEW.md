# Features Overview

## Core Features

### Authentication
- JWT-based login and registration
- Role selection: Admin, Developer, Tester
- Secure password hashing (bcrypt)
- Auto-seeded demo accounts

### Bug Tracking
- Report bugs with title, description, steps to reproduce
- Severity: Minor / Major / Critical
- Status: Open / In Progress / Resolved / Closed
- Screenshot upload support
- AI-powered severity analysis
- Comment threads per bug
- Email notifications on assignment/resolution

### Kanban Board
- 5 columns: Backlog, To Do, In Progress, Testing, Done
- Drag and drop tasks between columns
- Priority levels: Low / Medium / High / Critical
- Due date tracking with overdue indicators
- Real-time sync across all connected users

### Project Management
- Create projects with auto-generated invite codes
- Join projects via invite code
- Role-based member management
- Project switcher in sidebar

### Analytics
- Task completion rate
- Bug fix rate
- 7-day productivity chart
- Bug severity breakdown (pie chart)
- Upcoming deadlines widget
- Weekly success metrics

### Real-time Collaboration
- Socket.io WebSocket connections
- Live task moves visible to all team members
- Instant notifications pushed to users
- No page refresh needed

### Notifications
- In-app notification center
- Unread count badge
- Mark as read / mark all as read
- Types: Task Assigned, Bug Assigned, Bug Resolved, Deadline Reminder

### Sprint Planning
- Create sprints with goals and dates
- Assign tasks to sprints
- Status: Planned / Active / Completed

### Time Tracking
- Start/stop timer per task or bug
- Manual time entry logging
- View time by task, bug, user, project

### Activity Log
- Full audit trail of all project actions
- Who did what and when
- Filterable by project
