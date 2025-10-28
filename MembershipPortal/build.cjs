const fs = require('fs');
const path = require('path');

// Paths to the portal directories
const portals = [
    { name: 'Admin', path: './AdminPortal' },
    { name: 'Event', path: './EventPortal' },
    { name: 'Member', path: './MemberPortal' },
];

// Paths to the common files
const commonHtmlPath = path.resolve(__dirname, './app.html');
// Output path for the combined index.html
const outputHtmlPath = path.resolve(__dirname, './index.html');


// Read the common HTML template
let combinedHtml = fs.readFileSync(commonHtmlPath, 'utf8');

// Placeholder for portal sections
let portalSections = '';

// Process each portal
portals.forEach(portal => {
    const htmlPath = path.resolve(__dirname, portal.path, `${portal.name.toLowerCase()}.html`);
 
    // Inline CSS and JS into the portal's HTML
    const inlinedHtml = fs.readFileSync(htmlPath, 'utf8'); 

    // Wrap each portal's content in a section
    portalSections += `
        <div id="${portal.name.toLowerCase()}Section" style="display: none;">
            ${inlinedHtml}
        </div>
    `;

});

// Inject the portal sections into the common HTML template
combinedHtml = combinedHtml.replace('<!-- PORTAL_SECTIONS -->', portalSections);


// Write the combined HTML to the dist folder
fs.writeFileSync(outputHtmlPath, combinedHtml);

console.log('index.html generated successfully with portal sections.');