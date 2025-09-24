// vite.config.js
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import  clean  from 'vite-plugin-clean'; // Import the clean plugin
const fs = require('fs');
const path = require('path');

function htmlMergePlugin() {
    // Paths to the portal directories
    const portals = [
        { name: 'Admin', path: './src/admin' },
        { name: 'Event', path: './src/event' },
        { name: 'Member', path: './src/member' },
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
            <div id="${portal.name.toLowerCase()}Portal" style="display: none;">
                ${inlinedHtml}
            </div>
        `;
    
    });
    
    // Inject the portal sections into the common HTML template
    combinedHtml = combinedHtml.replace('<!-- PORTAL_SECTIONS -->', portalSections);
    
    
    // Write the combined HTML to the dist folder
    fs.writeFileSync(outputHtmlPath, combinedHtml);
    
    console.log('index.html generated successfully with portal sections.');
}

export default defineConfig({
  plugins: [
    clean(), // Add the clean plugin to clear the dist folder
    // Plugin to bundle everything into a single HTML file
    htmlMergePlugin(),
    viteSingleFile(),
    copy({
      targets: [
        { src: 'service/**/*', dest: 'dist/service' }, // Copy service files to dist/service
        { src: 'appsscript.json', dest: 'dist' }, // Copy project files to dist
      ],
      hook: 'writeBundle', // Ensures copying happens after the build
    }),
  ],
  build: {
    minify: false,
    outDir: resolve(__dirname, 'dist/ui'),
  },
});