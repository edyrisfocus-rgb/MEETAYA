# MEETAYA 🚀 - "Smart Meeting, Smart Action"

MEETAYA is a premium, web-based platform designed to manage meetings, minutes of meetings (MOM), decisions, action items, and task monitoring in one seamless, interactive ecosystem.

The goal of MEETAYA is to transform passive meetings into actionable outcomes by actively tracking what is decided and who is responsible. 

---

## 🌟 Core Features

- **High-End Workspace**: Beautiful dark-mode UI powered by Tailwind CSS v4, featuring glassmorphism, dynamic micro-interactions, and premium layouts.
- **Smart Meeting Management**: Schedule, categorize (using templates like *Board Meeting*, *Cooperative Meeting*, *Village Meeting*), and manage locations/participants easily.
- **Interactive Minutes (MOM)**: Dynamic tab-based workspace separating agendas, meeting notes, decisions logged, and attendance records.
- **Action Item Tracker**: Turn discussions into clear task items. Assign PICs (Person In Charge), set deadlines, and track statuses from 'Open' to 'Done' or 'Overdue'.
- **Live Notifications**: Integrated in-app notification dropdown alerting you of incoming tasks or upcoming meetings.
- **AI Action Detection (Phase 3 Mockup)**: Semantic engine built into the browser that can read through raw discussion notes and automatically extract suggested Action Items.

## 🛠 Technology Stack

- **Frontend Core**: [Next.js 15 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/) Object Modeling
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/) (Google OAuth + Custom Developer Credentials Bypass)

---

## ⚙️ Getting Started Locally

### 1. Install Dependencies
Ensure you have Node.js v20+ installed, then run:

```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of your directory with the following variables:

```env
# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://admin:admin@cluster0.mongodb.net/meetaya?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_super_secret_string_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (for Production)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

*(Note: For local testing, we have implemented a **Developer Credential Bypass** on the login page allowing you to impersonate roles like Super Admin, Moderator, or Guest without a real database or Google configuration.)*

### 3. Start the Development Server
Run the local dev server using Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 

---

## 🎨 Developer Persona Login

To experience the platform's role-based UI without configuring Google OAuth:
1. Navigate to the Login Page (`/auth/login`).
2. Select a persona from the interactive list (e.g., **Admin**, **Moderator**, or **Member**).
3. Click "Sign In" to immediately jump into the Dashboard and explore the pre-populated mock data!

---

## 🚀 Deployment

MEETAYA is fully optimized to be deployed on [Vercel](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Connect the repository in Vercel.
3. Configure the **Environment Variables** in Vercel settings.
4. Hit Deploy! 

---

*Designed and engineered for maximum productivity.*
