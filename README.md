# my-WEBSITE
Utsav Forecasts

Development and Deployment of a Web Application — Final Project Report

Live application: https://[utsavkhaitu-username].github.io/[my-WEBSITE]/

1. Introduction

This report documents the design, development and deployment of Utsav Forecasts, a multi-page web application that combines a monthly calendar with live weather reports. The project was built for the Final Project Work assignment, whose objective is to design, develop and deploy a complete web application that demonstrates structured navigation, modular coding practices and appropriate styling techniques.

Utsav Forecasts is written entirely in HTML, CSS and JavaScript, with no frameworks or build tools. The home page shows the current weather for a chosen city and a calendar in which every day carries a weather icon with its expected high and low temperature. Selecting a day opens a detailed panel with rain chance, wind, UV index, sunrise and sunset, an hourly forecast strip and a place for personal notes. Two further pages, About Us and Contact, complete the site. Weather data comes from the free Open-Meteo service, which needs no API key.

The report is organised around the three items requested in the assignment: the design decisions made (layout, styling and navigation), the deployment process that was followed, and the hosting service that was selected together with the reasons for choosing it. A short section on testing and a conclusion are also included.

1.1 Requirements and how they are met
Requirement	How the project meets it
At least three pages: Home, About Us, Contact	index.html, about.html and contact.html
Navigation bar linking all pages	The same navigation bar appears on every page; the current page is highlighted.
CSS layout techniques (Flexbox, Grid)	Flexbox for the page shell, navigation bar and footer; Grid for the calendar, the card sections and the contact layout.
Icons in the navigation bar	A Font Awesome icon beside each link: house, circle-info and envelope.
Properly aligned and justified content	Body paragraphs use justified text; content is aligned inside a centred container of fixed maximum width.
Reusability and modular code	Content (HTML), styling (CSS) and behaviour (JavaScript) are separated; shared code lives in common files used by every page.
External CSS and JavaScript files	All styles and scripts are linked from the css/ and js/ folders; there is no inline or embedded code.
Deployment on a free host	Published with GitHub Pages (see Sections 4 and 5).
2. Project Structure

The project is divided into three layers: pages, styles and scripts. Keeping each layer in its own folder makes the code easy to find, easy to change and easy to reuse across pages.

utsav-forecasts/
├── index.html        Home page (weather + calendar)
├── about.html        About Us page
├── contact.html      Contact page
├── css/
│   ├── main.css      Shared styles: tokens, navigation, buttons, cards, footer, About and Contact layouts
│   └── calendar.css  Styles used only by the Home page
└── js/
    ├── common.js     Shared behaviour: active link, mobile menu, dark mode
    ├── home.js       Weather requests, calendar rendering, notes, city search
    └── contact.js    Contact form validation

Every page loads main.css and common.js. The Home page additionally loads calendar.css and home.js, and the Contact page additionally loads contact.js. A page therefore downloads only the code it needs, and a change to the shared files, for example a new colour or a new menu item, is made once and appears everywhere.

3. Design Decisions
3.1 Layout

Layout is built with two complementary CSS techniques. Flexbox is used for one-dimensional arrangements: the whole page is a vertical flex column so that the footer always sits at the bottom even on short pages, the navigation bar places the logo, links and buttons in a row, and the footer, tags and search bar wrap naturally when space runs out. CSS Grid is used where content has both rows and columns: the calendar is a seven-column grid of day cells, the feature cards on the About page use an auto-fitting grid, and the Contact page uses a two-column grid for the form and the contact details.

css
body { display: flex; flex-direction: column; min-height: 100vh; }
main { flex: 1; }

.grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
.grid-3 { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }

All content sits inside a centred container with a maximum width of 1280 pixels and a side gutter that grows and shrinks with the screen, using clamp(16px, 4vw, 40px). This keeps lines of text at a comfortable length on large monitors and keeps the content aligned with the navigation bar and footer on every page. Descriptive paragraphs use text-align: justify with automatic hyphenation so that the left and right edges are straight without large gaps between words.

3.2 Styling

The visual style is warm and light, chosen to suit a weather and calendar theme. A palette of CSS custom properties (design tokens) is declared once at the top of main.css, and every component refers to those tokens instead of fixed colour values. A dark theme is created simply by redefining the same tokens, which is why the light/dark switch needs only a single attribute change on the page.

Token	Light value	Used for
--bg	#fdf6ee	Page background
--card	#ffffff	Cards, navigation bar, form panels
--text / --muted	#2a2320 / #7b6f68	Main text / secondary text
--accent	#d9482b	Buttons, active link, highlights
--today	#1f7a8c	Marking today in the calendar, focus outlines
--line	#efe3d6	Borders and dividers

Typography uses the system font stack (system-ui, Segoe UI, Roboto), so text renders quickly in the reader's native font and no font files need to be downloaded. Cards have rounded corners and soft shadows to group related information, and weather conditions are shown with emoji so that every day is recognisable at a glance without extra image files. Buttons, links and calendar cells react to hovering with small colour or movement changes, and a visible outline is shown on keyboard focus. Animation is switched off for visitors who have asked their system to reduce motion.

3.3 Navigation

The navigation bar is the main way for visitors to move through the site. It is fixed to the top of the screen (position: sticky) so it remains available while scrolling, and it contains the brand name on the left, the three page links in the centre and right, and a dark-mode button at the far right. Each link combines a Font Awesome icon with a text label: a house for Home, an information circle for About Us and an envelope for Contact. Icons make the links quicker to recognise, while the text labels keep them clear for every visitor.

html
<ul class="nav-links" id="nav-links">
  <li><a href="index.html"><i class="fa-solid fa-house"></i> Home</a></li>
  <li><a href="about.html"><i class="fa-solid fa-circle-info"></i> About Us</a></li>
  <li><a href="contact.html"><i class="fa-solid fa-envelope"></i> Contact</a></li>
</ul>

Links are ordinary relative anchors, so navigation between pages is immediate and works without JavaScript. A small script in common.js compares the current file name with each link and adds an "active" class and aria-current="page" to the matching link, so the visitor always knows where they are. The same links are repeated in the footer as a secondary way to move around. On screens narrower than 760 pixels the links collapse into a menu opened by a button, which keeps the bar uncluttered on phones.

3.4 Reusability and modular code

The assignment stresses reusability, so the project separates content, styling and behaviour. HTML holds only structure and text. All styling is in external stylesheets, and all behaviour is in external scripts; no style attributes, embedded style blocks, inline event handlers or embedded script blocks are used.

Shared and page-specific code. Code needed by every page (tokens, navigation, buttons, cards, footer, theme switch) is kept in main.css and common.js. Code needed by one page only is kept in its own file.
Reusable components. Classes such as .card, .btn, .grid-3, .split and .tag are used on several pages, so a new section can be assembled from existing building blocks.
Small, focused functions. home.js is organised into clear functions for fetching data, drawing the current conditions, drawing the calendar, drawing the day detail, handling notes and handling city search. Scripts are wrapped in an immediately invoked function so that their variables do not clash with each other.
Data-driven rendering. The calendar is generated from the date and the downloaded forecast, not typed by hand, so it works for any month and any city.
3.5 Responsiveness and accessibility

The site is designed to work from large desktop monitors down to small phones. Grid and Flexbox layouts reflow automatically, and media queries at 900 pixels and 560 pixels simplify the home page, shrink the calendar cells and stack the Contact page into one column. Accessibility measures include semantic elements (header, nav, main, section, aside, footer), labels connected to every form field, descriptive aria-labels on icon-only buttons, a language attribute on the page, sufficient colour contrast in both themes, and keyboard-visible focus outlines.

3.6 Additional features
Search for any city worldwide, or use the visitor's current location.
Switch between Celsius and Fahrenheit, with wind and rainfall units adjusted to match.
Hourly forecast strip and detailed daily statistics for any selected date.
Personal notes attached to dates, saved in the browser's localStorage.
Light and dark themes, remembered between visits.
Contact form with client-side validation of name, email, subject and message.
4. Deployment Process

The site is a static website: it consists only of HTML, CSS and JavaScript files that the browser runs directly. It needs no server-side code or database, which means any static hosting service can publish it. The weather data is requested by the visitor's browser straight from the Open-Meteo API, so no private keys have to be stored in the project.

4.1 Steps followed
Prepare the project. Confirm that all three pages open correctly from the local folder, that every link and file path is relative (for example css/main.css), and that the home page is named index.html so that the host serves it as the default page.
Create a GitHub account and repository. Sign in to github.com and create a new public repository, for example utsav-forecasts. GitHub Pages is free for public repositories.
Upload the files. Upload index.html, about.html, contact.html and the css and js folders to the repository (using "Add file → Upload files" in the browser, or git add, git commit and git push from the command line), keeping the same folder structure.
Turn on GitHub Pages. Open the repository, choose Settings → Pages, set the source to "Deploy from a branch", select the main branch and the / (root) folder, and press Save.
Wait for the build. GitHub publishes the site within a minute or two. The Pages settings screen then displays the live address.
Verify the live site. Open the address, click through all three pages, check that the stylesheets, scripts and icons load, search for a city, and test the site on a phone.
Update when needed. Any later change pushed to the main branch is published automatically.
4.2 Command-line version
bash
git init
git add .
git commit -m "Utsav Forecasts: calendar with weather"
git branch -M main
git remote add origin https://github.com/[your-username]/[repository-name].git
git push -u origin main
4.3 Live address

The deployed application is available at:

https://[your-username].github.io/[repository-name]/

5. Hosting Service Selected and Justification

The assignment asks for a free web hosting service. Several suitable options were considered, including GitHub Pages, Netlify and Vercel. All of them can publish a static site at no cost. GitHub Pages was selected.

Feature	GitHub Pages	Netlify	Vercel
Cost for a static site	Free	Free plan	Free plan
Setup effort	Very low: a repository and one setting	Low: connect repository or drag and drop	Low: connect repository
HTTPS	Yes, automatic	Yes, automatic	Yes, automatic
Address format	username.github.io/repository	name.netlify.app	name.vercel.app
Link to version history	Built in: the site is the repository	Through a connected repository	Through a connected repository
Extra account needed	No, only GitHub	Yes	Yes

The reasons for choosing GitHub Pages are as follows.

Free and suitable for this project. A static site of this size falls well within the free usage limits.
Simplicity. Publishing requires only a repository and one setting, with no separate build configuration or second account.
Version control. The live site is generated directly from the repository, so every change is recorded in the history, can be reviewed and can be reverted if something breaks. This also keeps the source code available for submission.
Security and reliability. Pages are served over HTTPS from GitHub's infrastructure, and the platform is widely used for student, documentation and portfolio sites.
Automatic updates. Pushing a change to the main branch republishes the site without any further steps.
Professional presentation. A GitHub repository and a github.io address can be shown to teachers and employers as part of a portfolio.

GitHub Pages has limits worth knowing: it only serves static files, so it cannot run server code, and its free use is intended for sites of modest size and traffic. Neither limit affects Utsav Forecasts, which is static and fetches its weather directly from Open-Meteo in the visitor's browser. If server-side features such as a working email form were added in future, a form service or a different host could be used.

6. Testing

The site was checked before deployment in the following ways.

Each page was opened at desktop width (1280 pixels) and phone width (390 pixels), and the pages were checked for horizontal scrolling and for errors in the browser console.
The navigation bar was checked on every page to confirm that each link opens the correct page and that the current page is highlighted.
The JavaScript files were checked for syntax errors.
The contact form was tried with empty and invalid values to confirm that error messages appear, and with valid values to confirm that the confirmation message is shown.
After deployment, the live address should be opened to check that all file paths still work and that the weather loads. A network connection is required because the weather and icons are loaded from external services.

Known limitations: the weather forecast depends on the Open-Meteo service being available, and the contact form validates input and shows a confirmation, but does not send the message to a server.

7. Conclusion

Utsav Forecasts meets the assignment's requirements: it provides three linked pages, a navigation bar with icons, Flexbox and Grid layouts, justified and aligned content, and a modular structure that keeps HTML, CSS and JavaScript in separate external files. The project also demonstrates real functionality by loading live weather data and presenting it inside an interactive calendar. Publishing the site through GitHub Pages was a quick, free and well-documented way to put it online, and keeping the code in a repository means it can easily be improved later. Possible future work includes a working contact form, weather alerts, regional festival dates on the calendar, and a saved list of favourite cities.

References
Open-Meteo. Free weather forecast API. https://open-meteo.com/
GitHub Docs. Getting started with GitHub Pages. https://docs.github.com/pages
Font Awesome. Icon library. https://fontawesome.com/
MDN Web Docs. CSS Flexbox and CSS Grid Layout. https://developer.mozilla.org/
