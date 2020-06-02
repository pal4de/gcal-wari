//直接操作するの気持ち悪いのでいずれクラスに閉じ込める

const Event_newEvent = (eventName: string, length: number = 1): void => {
    if (!eventName) throw Error('Event name is required');
    const database = new Database();
    const sheet = database.getSheet('Events');

    //重複チェック！
    
    sheet.appendRow([eventName, length]);
};
const Event_deleteEvent = (eventName: string): void => {
    if (!eventName) throw Error('Event name is required');
    const database = new Database();
    const sheet = database.getSheet('Events');

    const lastRowNumber = sheet.getLastRow();
    const eventNameList = sheet.getRange(2, 1, lastRowNumber-1, 1).getValues().flat();
    const index = eventNameList.indexOf(eventName);
    if (index === -1) throw Error(`Event "${eventName}" has not found`);
    sheet.deleteRow(2+index);
};
const Event_changeEventName = (oldName: string, newName: string): void => {
    if (!oldName) throw Error('Event name is required');
    const database = new Database();
    const sheet = database.getSheet('Events');
    
    const lastRowNumber = sheet.getLastRow();
    const eventNameList = sheet.getRange(2, 1, lastRowNumber-1, 1).getValues().flat();
    const index = eventNameList.indexOf(oldName);
    if (index === -1) throw Error(`Event "${oldName}" has not found`);

    sheet.getRange(2+index, 1).setValue(newName);
};
const Event_changeEventLength = (eventName: string, newLength: number): void => {
    if (!eventName) throw Error('Event name is required');
    const database = new Database();
    const sheet = database.getSheet('Events');
    
    const lastRowNumber = sheet.getLastRow();
    const eventNameList = sheet.getRange(2, 1, lastRowNumber-1, 1).getValues().flat();
    const index = eventNameList.indexOf(eventName);
    if (index === -1) throw Error(`Event "${eventName}" has not found`);

    sheet.getRange(2+index, 2).setValue(newLength);
};
const Event_moveEvent = (eventName: string, newPosition: number): void => {
    if (!eventName) throw Error('Event name is required');
    const database = new Database();
    const sheet = database.getSheet('Events');
    
    const lastRowNumber = sheet.getLastRow();
    const eventNameList = sheet.getRange(2, 1, lastRowNumber-1, 1).getValues().flat();
    const index = eventNameList.indexOf(eventName);
    if (index === -1) throw Error(`Event "${eventName}" has not found`);

    const targetRow = sheet.getRange(2+index, 1, 1, 2);
    sheet.moveRows(targetRow, 1+newPosition);
};

const Timetable_addEvent = (row: number, column: number, eventName: string): void => {
    const database = new Database();
    const sheet = database.getSheet('Timetable');
    sheet.getRange(1+row, 2+column).setValue(eventName); //範囲外ならthrowしてほしい
};
const Timetable_removeEvent = (row: number, column: number): void => {
    const database = new Database();
    const sheet = database.getSheet('Timetable');
    sheet.getRange(1+row, 2+column).clear(); //範囲外ならthrowしてほしい
};
const Timetable_moveEvent = (oldRow: number, oldColumn: number, newRow: number, newColumn: number): void => {
    const database = new Database();
    const sheet = database.getSheet('Timetable');
    const target = sheet.getRange(1+newRow, 2+newColumn); //範囲外ならthrowしてほしい
    if (!target.getValue) throw Error(`Already an event exsists in (${newRow}, ${newColumn})`);
    sheet.getRange(1+oldRow, 2+oldColumn).moveTo(target);
};

const Option_update = (name: string, value: any): void => {
    const database = new Database();
    const sheet = database.getSheet('Options');
    
    const lastRowNumber = sheet.getLastRow();
    const optionNameList = sheet.getRange(1, 1, lastRowNumber, 1).getValues().flat();
    const index = optionNameList.indexOf(name);
    if (index === -1) throw Error(`Option "${name}" has not found`);

    sheet.getRange(1+index, 2).setValue(value);
}
