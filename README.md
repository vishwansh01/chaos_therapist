# 🧠 Chaos Therapy — Anonymous Confession Chat

> Where your problems become someone else's entertainment.

A funny-themed anonymous 1-on-1 web app where users (Anonymous Creatures 🕵️) chat with the admin (Chaos Therapist 🧠), send confessions, and receive (eventually) thoughtful-ish responses.

---

## 🚀 Quick Setup (Windows)

### Prerequisites

- [Node.js LTS](https://nodejs.org/) (v18 or v20 recommended)
- npm (comes with Node.js)

---

### Step 1 — Clone / download the project

```
cd C:\your\projects\folder
```

If you have git:
```
git clone <repo-url>
cd chaos-therapy
```

Or just extract the ZIP into a folder called `chaos-therapy`.

---

### Step 2 — Install dependencies

```
npm install
```

This installs Next.js, Prisma, Tailwind, and everything else. Also auto-generates the Prisma client.

---

### Step 3 — Set up your environment file

Copy the example env file:

```
copy .env.example .env
```

Open `.env` and set your admin password:

```
DATABASE_URL="file:./dev.db"
ADMIN_SECRET="your-secret-password-here"
```

> ⚠️ Remember this password — you'll need it to access the admin dashboard.

---

### Step 4 — Set up the database

```
npx prisma migrate dev --name init
```

This creates a local SQLite file (`prisma/dev.db`) with all the tables.

If prompted for a migration name, just press Enter or type `init`.

---

### Step 5 — Run the app

```
npm run dev
```

Open your browser and go to:

```
http://localhost:3000
```

---

## 🎭 Using the App

### As a User (Anonymous Creature 🕵️)

1. Go to `http://localhost:3000`
2. Click **"Enter the Chaos"**
3. You get a random funny nickname (e.g. "Confused Potato")
4. Start chatting! You can:
   - Send normal messages
   - Enable **Confession Mode** 🤫 for spicy thoughts
5. Come back later to see the therapist's responses

### As Admin (Chaos Therapist 🧠)

1. Go to `http://localhost:3000/admin`
2. Enter your `ADMIN_SECRET` password
3. You'll see a list of all anonymous users
4. Click any user to open their chat
5. You can:
   - Reply instantly
   - Schedule a reply for later (pick a date/time)
   - React to confessions with 😂 😐 😳

---

## 📁 Project Structure

```
chaos-therapy/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── user/
│   │   │   │   └── route.ts   # Create/get anonymous user
│   │   │   ├── messages/
│   │   │   │   ├── route.ts   # Send/get messages
│   │   │   │   └── react/
│   │   │   │       └── route.ts  # Add reaction to confession
│   │   │   └── admin/
│   │   │       ├── threads/
│   │   │       │   └── route.ts  # Admin: list all users
│   │   │       └── messages/
│   │   │           └── route.ts  # Admin: all messages incl. scheduled
│   │   ├── chat/
│   │   │   └── page.tsx       # User chat page
│   │   ├── admin/
│   │   │   └── page.tsx       # Admin dashboard
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   └── lib/
│       ├── db.ts              # Prisma singleton
│       └── nicknames.ts       # Random nickname generator
├── .env                       # Your environment variables
├── .env.example               # Template
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | React framework |
| Prisma ORM | Database layer |
| SQLite | Local file-based database |
| Tailwind CSS | Styling |
| TypeScript | Type safety |

---

## 🔧 Common Issues

### `prisma generate` error
Run manually:
```
npx prisma generate
```

### Port already in use
```
npm run dev -- -p 3001
```

### Database not found
```
npx prisma migrate dev --name init
```

### Reset the database (delete all data)
```
npx prisma migrate reset
```

---

## 🌐 Sharing with Friends (Local Network)

To let friends on your WiFi connect:

```
npm run dev -- -H 0.0.0.0
```

Then share your local IP (e.g. `http://192.168.1.x:3000`).

Find your IP with: `ipconfig` on Windows.

---

## 📝 Changing the Admin Password

Edit `.env`:
```
ADMIN_SECRET="new-password"
```

Restart the dev server. Done.

---

## 🎨 Customizing Nicknames

Edit `src/lib/nicknames.ts` — add/remove adjectives and nouns to the arrays.

---

Built with 🧠 chaos and ☕ caffeine.
