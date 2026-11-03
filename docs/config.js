// 1) Firebase console → Project settings → Your apps → Web app → copy the config here.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCvGC3jf9hED_NAvpqCVMJDhy_dDAHCedg",
  authDomain: "cs-tracker-e4bea.firebaseapp.com",
  projectId: "cs-tracker-e4bea",
  storageBucket: "cs-tracker-e4bea.firebasestorage.app",
  messagingSenderId: "677444921966",
  appId: "1:677444921966:web:698712bb5853203bac947f"
};
// 2) Leave as is unless you change the region in functions/index.js
const FUNCTIONS_REGION = "asia-south1";
// 3) Every user gets a private tracker under users/<uid>.
//    Accounts listed here keep using an existing shared tracker instead (keeps old progress).
const SHARED_TRACKERS = { "muhammedshareefclt@gmail.com": "shareef-cs-2027" };
// 4) Free (Spark) plan: keep both false. Set true after upgrading to Blaze and deploying functions / storage.
const USE_SERVER_AI = false;
const USE_STORAGE = false;
// 5) Leave empty [] so anyone can create an account. Put emails here to restrict sign-in to a list.
const ALLOWED_EMAILS = [];
// 6) Admins see the "All students" dashboard and can open any student's tracker (read only)
const ADMIN_EMAILS = ["muhammedshareefclt@gmail.com"];
// 7) Gemini model used with each user's own free key
const GEMINI_MODEL = "gemini-flash-latest";
// 8) OpenAI model used when a user connects their own OpenAI key
const OPENAI_MODEL = "gpt-4.1-mini";
