# Shareef CS Executive Tracker — Firebase hosting

Hosted version of the tracker with login, live saving, file uploads, and Claude and Gemini AI that can be switched from the header.

## What's inside

| Path | Purpose |
| --- | --- |
| `public/index.html` | The app: login, dashboard, chapter tracker, syllabus, find, AI assistant, tests |
| `public/config.js` | Your Firebase web config (edit this) |
| `firestore.rules`, `storage.rules` | Access list: only the emails you list can read or write |
| `functions/index.js` | `ai` function: calls Claude or Gemini with keys kept on the server |

## One-time setup (about 20 minutes)

1. **Create the project.** Go to console.firebase.google.com, add a project, and switch it to the **Blaze** plan. Cloud Functions need Blaze, but usage stays within the free tier at this size.
2. **Turn on the services.**
   - Authentication → Sign-in method → enable **Google** and **Email/Password**.
   - Firestore Database → Create → region **asia-south1 (Mumbai)**.
   - Storage → Get started → same region.
3. **Add a web app.** Project settings → Your apps → Web. Copy the config into `public/config.js`.
4. **Set the access list.** Replace the two example emails in **both** `firestore.rules` and `storage.rules`. Use lower case.
5. **Set the project ID** in `.firebaserc`.
6. **Install the CLI and log in.**
   ```
   npm install -g firebase-tools
   firebase login
   ```
7. **Add the AI keys.** Get a Claude key from console.anthropic.com and a Gemini key from aistudio.google.com.
   ```
   firebase functions:secrets:set ANTHROPIC_API_KEY
   firebase functions:secrets:set GEMINI_API_KEY
   ```
8. **Deploy.**
   ```
   cd functions && npm install && cd ..
   firebase deploy
   ```
   On the first deploy, the CLI asks for `ALLOWED_EMAILS`. Enter the same emails, separated by commas. It also offers the default AI models; press Enter to accept them.
9. **Open the site** at `https://<project-id>.web.app`. To use your own domain, add it under Hosting → Add custom domain, for example `cs.tabsyst.com`.

## Using it

- Sign in with Google, or create an email account and click the verification link first.
- The **AI** selector in the header switches between Claude and Gemini for notes, Malayalam, references, Find with AI and chapter tests.
- Everyone on the access list sees the same progress, materials and scores live.

## Changing things later

- **Add a person:** add the email to both rules files, run `firebase deploy --only firestore:rules,storage`, then update `ALLOWED_EMAILS` in `functions/.env.<project-id>` and run `firebase deploy --only functions`.
- **Change AI models:** edit `CLAUDE_MODEL`, `GEMINI_MODEL` and the other model settings in `functions/.env.<project-id>`, then redeploy functions. Model names change over time, so check the current names on each provider's site.
- **Cost:** AI calls are billed by Anthropic and Google per use. A study-notes request costs a few rupees at most. Set a monthly budget alert in both consoles.

## Notes

- Progress saved on the claude.ai tracker does not move here automatically; this is a fresh database.
- AI output is study help written by the model, not ICSI material. Use the ICSI study material PDFs as the main source and check case citations before quoting them.
