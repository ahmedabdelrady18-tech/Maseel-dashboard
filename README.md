# Project Dashboard Website

Dynamic project dashboard connected to Excel.

## Step 1 - Install
```bash
npm install
```

## Step 2 - Set password
Create `.env.local` in the project root:
```bash
DASHBOARD_PASSWORD=your_password_here
```
Default password is `123456` if `.env.local` is missing.

## Step 3 - Run locally
```bash
npm run dev
```
Open:
```text
http://localhost:3000
```

## Excel source
Current file location:
```text
data/project-dashboard.xlsx
```
Replace this file with the updated Excel file using the same name to refresh the website data.

## Pages
- /login
- /dashboard
- /dashboard/progress
- /dashboard/activities
- /dashboard/delays
- /dashboard/risks
- /dashboard/photos

## Next development step
Connect Excel from OneDrive/SharePoint through Microsoft Graph instead of local file replacement.
