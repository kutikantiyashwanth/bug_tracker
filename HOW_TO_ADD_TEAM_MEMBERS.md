# How to Add Team Members

## Step 1 — Admin Creates a Project

1. Login as Admin at https://bug-tracker-ui-evqv.onrender.com
2. Go to **Projects** page
3. Click **New Project**
4. Enter project name and description
5. Click **Create Project**

## Step 2 — Share the Invite Code

1. On the Projects page, find your project card
2. Click the **Copy Invite Code** button (visible to admins only)
3. The invite code is a UUID like: `539c5256-5439-4834-b53a-c90f00d53920`
4. Share this code with your team members

## Step 3 — Team Member Joins

1. Team member registers at `/register` or logs in at `/login`
2. Goes to **Projects** page
3. Clicks **Join Project**
4. Pastes the invite code
5. Clicks **Join Project**
6. They are now a member and can see the project

## Roles When Joining
- Developers join as **Developer** role
- Testers join as **Tester** role
- Role is set during registration

## What Each Role Can Do
| Feature | Admin | Developer | Tester |
|---|---|---|---|
| Create project | Yes | No | No |
| Kanban board | Yes | Yes | No |
| Report bugs | Yes | Yes | Yes |
| View analytics | Yes | Yes | Yes |
