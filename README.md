# NS Status Fuel Calculator

A professional, mobile-friendly web application designed for gas station operators in Nova Scotia to quickly calculate tax-exempt fuel amounts for status customers and instantly generate clean, printable reference cheat sheets.

## Features

* **Modern Dark UI:** Optimized dark theme featuring clean gray cards, vibrant green accents, and purple headings.
* **Responsive Layout:** Two-column desktop dashboard that collapses gracefully into a single-column layout on mobile devices.
* **Precise Calculations:** Implements exact provincial tax formulas without intermediate rounding, rounding only the final displayed pump totals.
* **Worked Example:** Real-time $5.00 example showing the step-by-step breakdown.
* **Streamlined Cheat Sheet:** Generates an automated two-column reference table (Customer Pays vs. Pump Total to Enter) spanning from $5 through $100.
* **Print & Export Tools:** Built-in options to Print directly, Save as PDF, Download as HTML, or Copy table contents directly to the clipboard.
* **Print Mode Optimization:** Hides application controls and formats cleanly onto a single white page when printed.
* **Price History:** Stores previous pump prices using browser `localStorage` for rapid future recalls.

## Getting Started & GitHub Pages Deployment

1. Create a new public repository on GitHub (e.g., `ns-status-fuel-calculator`).
2. Upload all required files (`index.html`, `style.css`, `script.js`, `README.md`) directly to the root of the repository.
3. Go to your repository **Settings** > **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` ( or `master`), and set the folder to `/ (root)`. Click **Save**.
5. Your app will be live shortly at your assigned GitHub Pages URL!
