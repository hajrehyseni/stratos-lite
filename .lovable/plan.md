Good plan. Keep all 12 steps, but add these critical missing items before you start:

ADD TO STEP 2 (hero):

- Change step numbering from "1.0 / 2.0 / 3.0" to "01 / 02 / 03" in system sections

ADD TO STEP 5 (mid-page CTA):  

- The "Start free audit →" button must smooth-scroll to hero input and auto-focus it — NOT navigate to a new page. It brings users BACK to the one input.

ADD TO STEP 8 (scorecard):

- Enforce ONE coral primary CTA per screen rule. Coral is only for the single most important action. Everything else is outlined/ghost.

ADD TO STEP 9 (auth + nav):

- NavBar: explicitly remove the duplicate "Try Free Audit" button. Only ONE CTA in nav. When logged out: "Sign in" text link + "Get Started" ghost outlined button. When logged in: "New Audit" outlined button + user initial dropdown.

- Login page: REMOVE the fake "Your recent audits" section entirely (it shows mock data to logged-out users — erodes trust)

- Login page: ADD "Forgot password?" text link below password field

- Signup page: REMOVE "100% private — data never leaves your device" — replace with "Your data is encrypted and private"

- Signup page: REMOVE the decorative scorecard mockup (72/100 Conditional Proceed visual)

ADD NEW STEP 13: Fix pricing page properly

- Remove Annual/Monthly toggle entirely (it's non-functional)

- Fix comparison table: Pro column must show "25" for monthly audits. Use ✓ and — characters.

- Change headline: "One satisficing decision" → "One satisficing call" 

- Pro card: coral CTA "Start Pro trial". Free card: ghost "Start Free". Executive: ghost "Go Executive".

ADD NEW STEP 14: Fix orphan pages

- 404 page: add standard navbar + footer, remove broken mini-audit input, add coral "Go home" button + "Or start an audit" text link

- /privacy and /terms: add standard navbar + footer (keep placeholder text for now)

- Footer: hide Journal and Dashboard links for logged-out users. Show "Features" link instead (scrolls to how-it-works on homepage).

- Auth redirects: when /journal or /dashboard redirect to /login, add ?redirect=journal (or dashboard) so user lands back after login.