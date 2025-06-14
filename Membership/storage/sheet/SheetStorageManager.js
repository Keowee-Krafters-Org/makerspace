class SheetStorageManager extends StorageManager {
    constructor(storageName, clazz) {
        super();
        const sheetId = SharedConfig[storageName].sheet.id;
        const sheetName = SharedConfig[storageName].sheet.name;
        if (!sheetId) {
            throw new Error('Sheet ID is required to initialize SheetStorageManager.');
        }
        this.sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName || 'Sheet1');
        if (!this.sheet) {
            throw new Error(`Sheet with name "${sheetName}" not found in the spreadsheet with ID "${sheetId}".`);
        }
        this.colMap = this.getNamedColumnIndexMap();
        this.clazz = clazz;
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
                map[r.getName()] = range.getColumn() - 1; // zero-based
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
        this.sheet.appendRow(row);
        const lastRow = this.sheet.getLastRow();
        record.id = this.sheet.getRange(lastRow, this.colMap.id + 1).getValue();
        if (!record.id) {
            throw new Error('Record ID could not be set. Ensure the ID column is correctly defined.');
        }
        record.id = record.id.toString();
        return record;
    }

    getById(id) {
        const data = this.sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const rowObj = this.objectFromRow(data[i]);
            if (rowObj.id === id) {
                return this.clazz.fromRecord(rowObj);
            }
        }
        return null;
    }

    update(id, updatedEntity) {
        const data = this.sheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
            const rowObj = this.objectFromRow(data[i]);
            if (rowObj.id === id) {
                const row = this.clazz.toRecord(updatedEntity, this.colMap);
                this.sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
                return updatedEntity;
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
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

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

    getAll() {
        const data = this.sheet.getDataRange().getValues();
        return data.slice(1).map(row => this.clazz.fromRecord(this.objectFromRow(row)));
    }

    clear() {
        const lastRow = this.sheet.getLastRow();
        if (lastRow > 1) {
            this.sheet.deleteRows(2, lastRow - 1);
        }
    }

    getFiltered(predicate) {
        const data = this.getAll();
        return data.filter(predicate);
    }

    getByKeyValue(key, value) {
        return this.getAll().filter(entity => entity[key] === value);
    }

    // --- Refactored methods using row and column name ---

    /**
     * Sets the value of a specific cell in the sheet by row and column name.
     * @param {number} row - The 1-based row index.
     * @param {string} column - The column name.
     * @param {*} value - The value to set.
     */
    setSheetValue(row, column, value) {
        const colIdx = this.colMap[column];
        if (colIdx === undefined) {
            console.warn(`Unknown column name: ${column}`);
            return;
        }
        this.sheet.getRange(row, colIdx + 1).setValue(value);
    }

    /**
     * Gets the value of a specific cell in the sheet by row and column name.
     * @param {number} row - The 1-based row index.
     * @param {string} column - The column name.
     * @returns {*} The value in the cell.
     */
    getRecordValue(row, column) {
        const colIdx = this.colMap[column];
        if (colIdx === undefined) {
            console.warn(`Unknown column name: ${column}`);
            return undefined;
        }
        return this.sheet.getRange(row, colIdx + 1).getValue();
    }

    /**
     * Updates a record in the sheet at the given row with the provided data.
     * @param {number} row - The 1-based row index.
     * @param {Object|Member} memberOrData - The member object or data to update.
     */
    updateMemberRecord(row, memberOrData) {
        const data = memberOrData.toRecord ? memberOrData.toRecord() : Member.fromObject(memberOrData);
        for (const [key, value] of Object.entries(data)) {
            if (this.colMap[key] !== undefined && value !== undefined) {
                this.setSheetValue(row, key, value);
            }
        }
        SpreadsheetApp.flush();
    }

    /**
     * Appends a new member record to the sheet.
     * @param {Object} data - The member data to append.
     * @returns {number} The row index of the new member.
     */
    appendNewMemberRecord(data) {
        this.add(data);
        return this.sheet.getLastRow();
    }

    /**
     * Adds a new member row with the given email address.
     * @param {string} emailAddress - The email address for the new member.
     * @returns {number} The row index of the new member.
     */
    addMemberWithEmail(emailAddress) {
        const data = { emailAddress, timestamp: new Date() };
        this.add(data);
        return this.sheet.getLastRow();
    }
}
