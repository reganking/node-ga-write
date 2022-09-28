*Demonstrate writing UA and GA4 events.*

This repo will demonstrate different methods for using the Google Analytics measurement protocol and for testing measurement models.

*Installation*

1. Clone or download the repo.
2. Update your Node.js installation for version 18+ for experimental core fetch functionality.
3. Update package.json and loaded modules as needed. For example, you don't need geoip-lite.
4. Update the Google Analytics property ID (at least replace UA-XXXXXX-X) to .env and app.yaml. You should also add those files to your .gitignore so you don't leak your ID.
5. Run `npm install`
6. Run `node --experimental-fetch app.js`
7. Point browser to http://localhost:8080/
8. Check terminal debug messages