# SKYLENT

Learning platform for SKYLENT AI-agent workshops.

- **Public site** at `/`: anyone can see it.
- **Admin panel** at `/admin`: workshops, students, payments, AI projects, 4-day plan.
- **Student dashboard** at `/dashboard`: each student sees only their own workshop, project and interview stack.

## Run on a new laptop

1. Install **Node.js 20 or newer** (https://nodejs.org).
2. Open a terminal in this folder and run:
   ```
   npm install
   ```
3. Copy `.env.example` to a new file named `.env.local` and fill in the values (see below).
4. Start it:
   ```
   npm run dev
   ```
5. Open http://localhost:3000

## Local test mode (your laptop only)

Add this line to `.env.local` to open `/admin` without signing in while you test:

```
DEV_ADMIN_BYPASS=true
```

It only works with `npm run dev`. It is ignored on Vercel and with `npm start`. Never add it in Vercel.

## Environment variables

| Name | Needed? | What it is |
|---|---|---|
| `MONGODB_URI` | Yes | Your MongoDB Atlas connection string |
| `SESSION_SECRET` | Yes | Long random text that protects logins. Create one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAILS` | Yes | Emails that get the admin panel, comma separated |
| `NEXT_PUBLIC_APP_URL` | Yes | `https://skylent.vercel.app` (or `http://localhost:3000` locally) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google sign-in | From Google Cloud Console |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional | Emails only reach everyone after you verify a domain in Resend |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Optional | Your Instagram link. It appears on the site automatically |

On Vercel, add the same names in **Project → Settings → Environment Variables**, then redeploy.
Use the **same** `SESSION_SECRET` everywhere you want logins to stay valid.

## How a workshop works

1. **Admin → AI projects:** add projects (zip link, setup steps, interview Q&A) and set them to *Published*.
2. **Admin → Workshops → New workshop:** one per college visit.
3. In the workshop, **Add students**: paste `Full name, email` lines. Copy the temporary passwords shown (only shown once) and share them.
4. Click **Mark paid** for each student who has paid.
5. Click **Auto-assign projects**: every student gets a different project.
6. During the workshop, click **Open Day 1 … Open Day 4**, then **Complete**.
   - Day 3 opens each student's own project and download.
   - Day 4 opens their interview stack.
   - After that, students keep access forever.
7. After posting seminar Shorts, open the student (**Edit**) and paste their YouTube / Instagram links.

Students sign in at `/login` and must choose their own password the first time.

## Project zips and interview PDFs

**Admin → AI projects** is your project library. Each row has two uploads:

- **Project zip:** the code students download (opens on Day 3).
- **Interview PDF:** interview questions to prepare (opens on Day 4).

Then on **Admin → Students**, pick a project for each student from the **AI project** dropdown.
Each student sees and downloads **only the project assigned to them**.

Files up to 50 MB are stored in MongoDB. Uploading again replaces the old file. Deleting a project also deletes its files.
