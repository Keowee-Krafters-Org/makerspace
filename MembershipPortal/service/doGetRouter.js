function doGet(e) {
  const p = (e && e.parameter) || {};
  const view = (p.view || 'member').toString().toLowerCase();      // 'member' | 'event'
  const viewMode = (p.viewMode || p.mode || 'list').toString();     // 'list' | 'table' etc.

  // Load your built SPA HTML (no GAS templating tags inside)
  const base = HtmlService.createHtmlOutputFromFile('ui/index');
  let html = base.getContent();

  // Inject runtime context as JSON script tags (safe for client parsing)
  const inject = [
    `<script type="application/json" id="view">${JSON.stringify(view)}</script>`,
    `<script type="application/json" id="view-mode">${JSON.stringify(viewMode)}</script>`,
    `<script>window.__RUNTIME__=${JSON.stringify({ isGas: true })};</script>`
  ].join('\n');

  // Insert before </body> to keep valid HTML
  html = html.replace('</body>', `${inject}\n</body>`);

  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Membership Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
