function doGet() {
  return HtmlService.createHtmlOutputFromFile('ui/index.html')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}
