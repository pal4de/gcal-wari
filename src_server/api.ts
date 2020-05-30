interface Response {
    succeeded: boolean,
    message: string | null,
}
type json = string;

const Event_newEvent = (eventName: string, length: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
const Event_deleteEvent = (eventName: string): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
const Event_changeEventName = (oldName: string, newName: string): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
const Event_changeEventLength = (eventName: string, newLength: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
    
const Timetable_addEvent = (row: number, column: number, eventName: string): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
const Timetable_removeEvent = (row: number, column: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
const Timetable_moveEvent = (oldRow: number, oldColumn: number, newRow: number, newColumn: number): json => {
    const responce: Response = {
        succeeded: false,
        message: null,
    };
    
    responce.succeeded = true;
    return JSON.stringify(responce);
};
