/**
 * Module handling sheet modifications
 * 
 */
const RESPONSE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I/edit';

const SheetModule = {
  getNamedRange: function(name) {
    const namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(name);
    if (!namedRange) throw new Error(`Named range '${name}' not found.`);
    return namedRange.getSheet().getRange(2, namedRange.getColumn(), namedRange.getSheet().getMaxRows() - 1);
  },

  getCellValue: function(name, row) {
    const range = SheetModule.getNamedRange(name);
    return range.getCell(row - 1, 1).getValue();
  },

  setCellValue: function(name, row, value) {
    const range = SheetModule.getNamedRange(name);
    range.getCell(row - 1, 1).setValue(value);
  },

  clearCellValue: function(name, row) {
    const range = SheetModule.getNamedRange(name);
    range.getCell(row - 1, 1).clearContent();
  }
};
