class SheetStorageManager {
    constructor(storageName) {
      const sheetId = SharedConfig[storageName].sheet.id; 
      const sheetName =  SharedConfig[storageName].sheet.name; 
        if (!sheetId) {
            throw new Error('Sheet ID is required to initialize SheetStorageManager.');
        }
        this.sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName || 'Sheet1');
        if (!this.sheet) {
            throw new Error(`Sheet with name "${sheetName}" not found in the spreadsheet with ID "${sheetId}".`);
        }
        this.colMap = this.getNamedColumnIndexMap();
    }

    getSheet() {
        return this.sheet;
    }
    getNamedColumnIndexMap() {
        const ranges = this.sheet.getNamedRanges();
        const map = {};
        const sheetId = this.sheet.getSheetId();

        ranges.forEach(r => {
            const range = r.getRange();
            if (range.getSheet().getSheetId() === sheetId && range.getNumColumns() === 1) {
                map[r.getName()] = range.getColumn() - 1; // Store as zero-based index
            }
        });

        return map;
    }

  add(record) {
    if (!record.id) {
      record.id = this.generateId(); 
    }
    const row = Array(this.sheet.getLastColumn()).fill('');
    for (const key in record) {
        if (record.hasOwnProperty(key) && this.colMap.hasOwnProperty(key)) {
            row[this.colMap[key]] = record[key];
        }
    }
    this.sheet.appendRow(row); // Append the actual data row
    const lastRow = this.sheet.getLastRow();
    record.id = this.sheet.getRange(lastRow, this.colMap.id+1).getValue(); // Assuming 'id' is a named column
    if (!record.id) {
        throw new Error('Record ID could not be set. Ensure the ID column is correctly defined.');
    }
    record.id = record.id.toString(); // Ensure ID is a string
    return record;
  }

    getById(clazz, id) {
        const data = this.sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const rowObj = this.objectFromRow(data[i]);
            if (rowObj.id === id) {
                return clazz.fromRow(rowObj);
            }
        }
        return null;
    }

    update(clazz, id, updatedRecord) {
        const data = this.sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const rowObj = this.objectFromRow(data[i]);
            if (rowObj.id === id) {
                const row = clazz.toRow(updatedRecord, this.colMap);
                this.sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
                return updatedRecord;
            }
        }
        throw new Error(`Record with ID ${id} not found`);
    }

    delete(id) {
        const data = this.sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const rowObj = this.objectFromRow(data[i]);
            if (rowObj.id === id) {
                this.sheet.deleteRow(i + 1);
                return true;
            }
        }
        return false;
    }

    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
    }


    /**
     * Converts a row array to an object using the column map.
     * @param {Array} row - The row data as an array.
     * @returns {Object} - The row data as an object.
     */
    objectFromRow(row) {
        const obj = {};
        for (const key in this.colMap) {
            if (this.colMap.hasOwnProperty(key)) {
                const index = this.colMap[key];
                obj[key] = row[index];
            }
        }
        return obj;
    }

    getAll(clazz) {
        const data = this.sheet.getDataRange().getValues();
        return data.slice(1).map(row => clazz.fromRow(this.objectFromRow(row)));
    }

    clear() {
        const lastRow = this.sheet.getLastRow();
        if (lastRow > 1) {
            this.sheet.deleteRows(2, lastRow - 1);
        }
    }

    /**
     * Retrieves all records that match the given criteria.
     * @param {Function} clazz - The class with a fromRow method to map rows to objects.
     * @param {Function} filterFunction - A function that takes a record and returns true if it matches the criteria. 
     * This function should accept two parameters: the record and an optional matchCriteria object.
     * @param {Object} matchCriteria - An optional object containing criteria to match records.
     * @returns {Array} - An array of matching records.
     */
    getFiltered(clazz, filterFunction, matchCriteria) {
        const data = this.getAll(clazz);
        return data.filter(record => filterFunction(record, matchCriteria));
    }
}
