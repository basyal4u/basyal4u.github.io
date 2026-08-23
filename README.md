# Ganga Prasad Basyal — Academic Website

World-class static academic website and interactive AI teaching lab, designed for **GitHub Pages** and future use with **gangabasyal.com**.

## Recommended GitHub repository
Create a public repository named:

`basyal4u.github.io`

Then upload the contents of this folder to the repository root and enable GitHub Pages from the `main` branch. The site will be available at `https://basyal4u.github.io/`.

## Custom domain later
When `gangabasyal.com` is purchased:
1. Add the domain in GitHub repository **Settings → Pages → Custom domain**.
2. Follow GitHub's DNS instructions at the registrar.
3. GitHub will create/use a `CNAME` file.
4. Enable **Enforce HTTPS** after DNS resolves.

Do not add a live `CNAME` file before purchasing/configuring the domain.

## Site structure
- Home
- About
- Research — current + future projects with join-research links
- Publications — searchable/filterable JSON-powered research list
- Teaching — BADM-201 hub
- AI Lab — eight browser-based interactive experiments
- Advanced AI Lab Studio — eight additional future-course modules, already built
- Students & Projects — mentoring + approved showcase workflow
- Professional — awards, membership, service, skills, industry
- News — JSON-powered updates
- Contact — privacy-friendly mailto form
- Academic CV — printable web CV
- Content Studio — no-code form editor for `data/news.json`

## Easy content editing
### News (no HTML editing)
1. Open `/admin/` on the website.
2. Click **Load news.json** and select `data/news.json`.
3. Add/edit/delete items in the form.
4. Click **Export news.json**.
5. In GitHub, replace `data/news.json` with the exported file.

### Publications
Edit `data/publications.json`. The Publications page updates automatically.

### Research projects
Edit `data/projects.json`. Research cards update automatically.

## Important verification notes
- The old CV had obsolete ABD language and a BHSU email. The website uses the completed 2025 PhD and DSU role.
- Google Scholar snapshot on the site: **279 citations, h-index 9, i10-index 8 (August 2026)**. Keep the date whenever metrics are updated.
- The two BHSU undergraduate research mentee records were not reliably discoverable during build. The Student page includes a clearly labeled verification-pending placeholder instead of inventing names or titles.
- The 2026 publication listed by Google Scholar is marked for bibliographic verification before formal CV use.

## Technical notes
- Pure HTML/CSS/JavaScript; no build step.
- Responsive and accessibility-aware.
- No API keys or backend required for the foundational AI labs.
- Contact form opens the visitor's email client; no visitor data is stored by the website.

## AI Lab v3 coursework system
The AI Lab now includes eight multi-variable interactive experiments. Each lab has Learn, Experiment, Assignment, Rubric, and Example tabs; a browser-based experiment notebook; unique session/run IDs; CSV evidence export; a personalized checkpoint prompt; and a student-authorship policy designed around process evidence rather than automated AI-writing detectors.

Instructor reference: `BADM201_AI_LAB_ASSIGNMENT_GUIDE.md`.
