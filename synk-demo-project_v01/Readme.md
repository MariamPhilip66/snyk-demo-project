Here's a complete, step-by-step guide to record a workflow-focused Snyk Code demo:

---

## Demo Recording Plan: Snyk Code in a Real Developer Workflow

**Target length:** 2–3 minutes  
**Tool needed to record:** OBS Studio (free) or Windows Game Bar (Win+G)  
**Resolution:** 1920×1080, record your full screen

---

### SETUP (Before Recording)

**Step 1 — Install Snyk VS Code Extension**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search **"Snyk Security"**
4. Click **Install**
5. Click **"Connect VS Code with Snyk"** in the Snyk sidebar — it opens a browser to authenticate (free account at snyk.io)
6. Wait for the extension to activate

**Step 2 — Create a Vulnerable Demo Project**

Create a small Node.js (or Python) project with an intentional vulnerability. Here's a ready-to-use example: 

Created [](file:///c%3A/Users/MagdyIsaac/Desktop/lab_00/presentation/demo-project/app.js)

Created [](file:///c%3A/Users/MagdyIsaac/Desktop/lab_00/presentation/demo-project/package.json)

Now here's your full recording script:

---

### RECORDING SCRIPT (What to Do On Screen)

#### Scene 1 — Open the Project (~15 sec)
1. Open VS Code with the demo-project folder
2. Open `app.js`
3. **Pause** for a moment so the viewer sees it's a normal Express.js app
4. Let Snyk scan automatically (takes a few seconds)

#### Scene 2 — Show Snyk Detecting Vulnerabilities (~30 sec)
1. Look at the **yellow/red squiggly underlines** that appear in the code
2. Open the **Problems panel** (Ctrl+Shift+M) — Snyk issues appear here
3. Click the **Snyk sidebar icon** (shield) on the left — shows a tree of all vulnerabilities found
4. **Hover over the SQL injection line** (line 14) — the tooltip shows the vulnerability summary

#### Scene 3 — Explore One Vulnerability in Detail (~45 sec)
1. Click on the **SQL Injection** finding in the Snyk panel
2. The **Snyk issue detail view** opens — it shows:
   - **Vulnerability name** (SQL Injection)
   - **Severity** (Critical/High)
   - **CWE identifier** (CWE-89)
   - **Data flow path** — from `req.query.id` (source) → string concatenation → `db.query()` (sink)
3. **Scroll through the data flow** — each step is clickable and highlights the corresponding code
4. Point out: "Snyk shows exactly HOW untrusted user input reaches the database query"

#### Scene 4 — View the Fix Suggestion (~30 sec)
1. In the issue detail view, scroll to the **Fix** / **Remediation** section
2. Snyk suggests using **parameterized queries** instead of string concatenation
3. If available, click **"Fix this issue"** or show the suggested code change
4. Show the fixed version:
```js
// FIXED: Parameterized query
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId], (err, results) => { ... });
```
5. Apply the fix (type it or accept the suggestion)

#### Scene 5 — Show Multiple Vulnerability Types (~20 sec)
1. Quickly scroll through the Snyk panel showing:
   - **Hardcoded secret** (password on line 8)
   - **XSS** (line 25)
   - **Path Traversal** (line 31)
2. This shows breadth of coverage — not just one type

#### Scene 6 — Show PR Check Integration (~30 sec)
**Option A (Live):** If you have a GitHub repo:
1. Push the vulnerable code to a branch
2. Create a Pull Request
3. Show the **Snyk check failing** on the PR page
4. Show the **inline comments** Snyk adds to the PR

**Option B (Screenshots):** If no repo:
1. Show an annotated screenshot of a Snyk PR check on GitHub
2. Point out: status check failed, inline annotation, severity badge
3. *(You can find examples at: Snyk docs → PR Checks)*

#### Scene 7 — Show CI/CD Gate (~20 sec)
**Option A (Live):** If you have GitHub Actions:
1. Show a `.github/workflows/snyk.yml` that runs `snyk code test`
2. Show a failed pipeline run with Snyk output

**Option B (Screenshot):**
1. Show a screenshot of a CI/CD pipeline with Snyk as a step
2. Show it blocking deployment when critical issues exist

---

### ALTERNATIVE: RECORD A SIMPLER VERSION

If you don't want to set up GitHub/CI/CD, focus on **Scenes 1–5** only (IDE workflow). This is still strong for the rubric. Add 2–3 annotated screenshots for PR/CI/CD at the end of the demo slide instead of live footage.

---

### RECORDING TIPS

| Aspect | Recommendation |
|--------|---------------|
| **Screen resolution** | 1920×1080, 100% zoom |
| **VS Code zoom** | Ctrl+= to increase to 150% (readable in slides) |
| **Theme** | Dark theme (matches your slides) |
| **Font size** | Terminal/editor at 16pt minimum |
| **Mouse movements** | Slow, deliberate — circle around items you're highlighting |
| **Recording tool** | OBS Studio (free) or Win+G (Game Bar) |
| **No audio** | Record silently — you'll narrate live during the presentation |
| **Trim** | Cut any loading/waiting time in post-editing |
| **Format** | Export as MP4, embed directly in PowerPoint (Insert → Video → This Device) |

---

### QUICK-START CHECKLIST

```
□ Install Snyk VS Code extension + authenticate
□ Open demo-project/app.js in VS Code
□ Wait for Snyk to scan (yellow underlines appear)
□ Start screen recording
□ Scene 1: Show the code (15 sec)
□ Scene 2: Show detections in Problems panel + Snyk sidebar (30 sec)
□ Scene 3: Click SQL Injection → data flow → explanation (45 sec)
□ Scene 4: Show fix suggestion + apply it (30 sec)
□ Scene 5: Quick scroll of other vulnerabilities (20 sec)
□ Scene 6: PR check (live or screenshot) (30 sec)
□ Scene 7: CI/CD gate (live or screenshot) (20 sec)
□ Stop recording → trim → embed in Slide 8
```

The demo project files are ready in app.js. Open that folder in VS Code with Snyk installed, and the vulnerabilities will appear automatically within seconds.

Made changes.