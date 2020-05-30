interface Response {
    succeeded: boolean,
    message: string | null,
}
type json = string;

const Event_newEvent = (eventName: string, length: number = 1): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        if (!eventName) throw Error('Event name is required');
        const database = new Database();
        const sheet = database.getSheet('Events');

        sheet.appendRow([eventName, length]);
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Event_deleteEvent = (eventName: string): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        if (!eventName) throw Error('Event name is required');
        const database = new Database();
        const sheet = database.getSheet('Events');

        const lastRowNumber = sheet.getLastRow();
        const eventNameList = sheet.getRange(2, 1, lastRowNumber, 1).getValues().flat();
        const index = eventNameList.indexOf(eventName);
        if (index === -1) throw Error(`Event "${eventName}" has not found`);
        sheet.deleteRow(2+index);
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Event_changeEventName = (oldName: string, newName: string): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        if (!oldName) throw Error('Event name is required');
        const database = new Database();
        const sheet = database.getSheet('Events');
        
        const lastRowNumber = sheet.getLastRow();
        const eventNameList = sheet.getRange(2, 1, lastRowNumber, 1).getValues().flat();
        const index = eventNameList.indexOf(oldName);
        if (index === -1) throw Error(`Event "${oldName}" has not found`);

        sheet.getRange(index+2, 1).setValue(newName);
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Event_changeEventLength = (eventName: string, newLength: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        if (!eventName) throw Error('Event name is required');
        const database = new Database();
        const sheet = database.getSheet('Events');
        
        const lastRowNumber = sheet.getLastRow();
        const eventNameList = sheet.getRange(2, 1, lastRowNumber, 1).getValues().flat();
        const index = eventNameList.indexOf(eventName);
        if (index === -1) throw Error(`Event "${eventName}" has not found`);

        sheet.getRange(index+2, 2).setValue(newLength);
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Event_moveEvent = (eventName: string, newPosition: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        if (!eventName) throw Error('Event name is required');
        const database = new Database();
        const sheet = database.getSheet('Events');
        
        const lastRowNumber = sheet.getLastRow();
        const eventNameList = sheet.getRange(2, 1, lastRowNumber, 1).getValues().flat();
        const index = eventNameList.indexOf(eventName);
        if (index === -1) throw Error(`Event "${eventName}" has not found`);

        const targetRow = sheet.getRange(2+index, 1, 1, 2);
        sheet.moveRows(targetRow, 1+newPosition);
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};

const Timetable_addEvent = (row: number, column: number, eventName: string): json => { // まだ
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        const database = new Database();
        const sheet = database.getSheet('Timetable');
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Timetable_removeEvent = (row: number, column: number): json => { // まだ
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        const database = new Database();
        const sheet = database.getSheet('Timetable');
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
const Timetable_moveEvent = (oldRow: number, oldColumn: number, newRow: number, newColumn: number): json => { // まだ
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    try {
        const database = new Database();
        const sheet = database.getSheet('Timetable');
        
        responce.succeeded = true;
    } catch (e) {
        responce.message = String(e);
    } finally {
        return JSON.stringify(responce);
    }
};
