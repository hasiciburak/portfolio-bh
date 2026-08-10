// The CV lives in `public/`, so Vercel serves it straight from the edge — no
// route handler, no rebuild needed beyond replacing the file. Keep the path
// stable: it is what gets pasted into applications and DMs.
export const RESUME_PATH = "/burak-hasici-cv.pdf";

// Name the browser saves it under, instead of the URL's basename.
export const RESUME_FILENAME = "Burak-Hasici-CV.pdf";
