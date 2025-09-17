const fs = require('fs');
const path = require('path');

// Paths to the portal directories
const portals = [
    { name: 'Admin', path: './AdminPortal' },
    { name: 'Event', path: './EventPortal' },
    { name: 'Member', path: './MemberPortal' },
];

// Paths to the common files
const commonHtmlPath = path.resolve(__dirname, './common/ui/common.html');
const commonCssPath = path.resolve(__dirname, './common/ui/common.css');
const commonJsDir = path.resolve(__dirname, './common/ui'); // Directory containing common .js files
const commonServiceDir = path.resolve(__dirname, './common/service'); // Directory containing common service files
const appsscriptJsonPath = path.resolve(__dirname, './common/appsscript.json');

// Output path for the combined index.html
const outputHtmlPath = path.resolve(__dirname, './dist/index.html');

// Ensure the dist folder exists
const distFolder = path.resolve(__dirname, './dist');
if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder, { recursive: true });
}

// Helper function to inline CSS and JS into HTML
function inlineAssets(htmlPath, cssPath, jsPaths) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');
    const js = jsPaths.map(jsPath => fs.readFileSync(jsPath, 'utf8')).join('\n');

    // Inject CSS into <style> tag
    html = html.replace('</head>', `<style>${css}</style>\n</head>`);

    // Inject JS into <script> tag
    html = html.replace('</body>', `<script>${js}</script>\n</body>`);

    return html;
}

// Read the common HTML template
let combinedHtml = fs.readFileSync(commonHtmlPath, 'utf8');

// Placeholder for portal sections
let portalSections = '';

// Placeholder for merged CSS
let mergedCss = fs.readFileSync(commonCssPath, 'utf8'); // Start with common.css

// Placeholder for merged common JavaScript
let mergedCommonJs = '';

// Read and merge all common JavaScript files from the `ui` folder
const commonJsFiles = fs.readdirSync(commonJsDir).filter(file => file.endsWith('.js'));
commonJsFiles.forEach(file => {
    const filePath = path.resolve(commonJsDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    mergedCommonJs += `\n/* ${file} */\n${fileContent}`;
});

// Process each portal
portals.forEach(portal => {
    const htmlPath = path.resolve(__dirname, portal.path, `${portal.name.toLowerCase()}.html`);
    const cssPath = path.resolve(__dirname, portal.path, 'style.css');
    const jsPaths = [
        path.resolve(__dirname, portal.path, `${portal.name.toLowerCase()}Ui.js`),
        path.resolve(__dirname, portal.path, `${portal.name.toLowerCase()}Service.js`),
    ];

    // Inline CSS and JS into the portal's HTML
    const inlinedHtml = inlineAssets(htmlPath, cssPath, jsPaths);

    // Wrap each portal's content in a section
    portalSections += `
        <div id="${portal.name.toLowerCase()}Section" style="display: none;">
            ${inlinedHtml}
        </div>
    `;

    // Append the portal's CSS to the merged CSS
    const portalCss = fs.readFileSync(cssPath, 'utf8');
    mergedCss += `\n/* ${portal.name} styles */\n${portalCss}`;

    // Copy the service file to the dist folder as a .gs file
    const serviceFilePath = path.resolve(__dirname, portal.path, `${portal.name.toLowerCase()}Service.js`);
    const serviceFileDest = path.resolve(distFolder, `${portal.name.toLowerCase()}Service.gs`);
    fs.copyFileSync(serviceFilePath, serviceFileDest);
});

// Inject the portal sections into the common HTML template
combinedHtml = combinedHtml.replace('<!-- PORTAL_SECTIONS -->', portalSections);

// Inline the merged CSS into the <style> tag in the <head> of the common HTML
combinedHtml = combinedHtml.replace('</head>', `<style>${mergedCss}</style>\n</head>`);

// Inline the merged common JavaScript into the <script> tag in the <body> of the common HTML
combinedHtml = combinedHtml.replace('</body>', `<script>${mergedCommonJs}</script>\n</body>`);

// Write the combined HTML to the dist folder
fs.writeFileSync(outputHtmlPath, combinedHtml);

// Copy the appsscript.json file to the dist folder
const appsscriptJsonDest = path.resolve(distFolder, 'appsscript.json');
fs.copyFileSync(appsscriptJsonPath, appsscriptJsonDest);

// Copy all service files from `common/service` to the dist folder
const commonServiceFiles = fs.readdirSync(commonServiceDir).filter(file => file.endsWith('.js'));
commonServiceFiles.forEach(file => {
    const srcPath = path.resolve(commonServiceDir, file);
    const destPath = path.resolve(distFolder, file.replace('.js', '.gs')); // Rename .js to .gs
    fs.copyFileSync(srcPath, destPath);
});

console.log('index.html generated successfully with inlined CSS and JS!');
console.log('Service files and appsscript.json copied to the dist folder.');