function doGet(e) {
    const view = e.parameter.view || 'member';
    const viewMode = e.parameter.viewMode || 'list';
    const html = HtmlService.createTemplateFromFile('ui/index');
    html.params = { view: view, viewMode: viewMode };
    return html.evaluate()
        .setTitle('Membership Portal')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
