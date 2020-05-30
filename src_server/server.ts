// Handler of HTTP GET request
const doGet = (e: GoogleAppsScript.Events.DoGet) => {
    // Get contents of a file
    const getContent = (name: string): string => {
        return HtmlService.createHtmlOutputFromFile(name).getContent();
    };
    
    const template = HtmlService.createTemplateFromFile('index');
    template.style = getContent('style.css');
    template.script = getContent('script.js');

    const database = new Database();
    const eventListRaw = database.getTable('Events');
    const eventList = Database.tableToList<EventData>(eventListRaw);

    template.eventGallery = new EventGalleryModule(database, eventList);
    template.timetable = new TimetableModule(database, eventList);

    const response = template.evaluate();
    response.setTitle('Gcal-wari: Timetable on Google Calendar');
    return response;
};

// Wrap content with HTML tag
const wrap = (
    tag: string,
    content: string,
    attr?: {[key: string]: string | number | boolean},
): string => {
    let attrStr = '';
    if (attr) {
        for (const a in attr) {
            attrStr += ` ${a.replace('_', '-')}="${attr[a]}"`;
        }
    }
    return `<${tag}${attrStr}>${content}</${tag}>`;
};
const test = () => {
}

type Table = any[][];
type SheetName = 'Timetable' | 'Events' | 'Options';
class Database {
    constructor() {
        // バージョン情報を残しておきたい...
        const property = PropertiesService.getScriptProperties();
        let databaseId = property.getProperty('db_events');
        if (databaseId == null) {
            // // initialize database
            // const spreadsheet = SpreadsheetApp.create('Events');
            // Logger.log('Event Database has created: %s', spreadsheet.getUrl());
            // databaseId = spreadsheet.getId();
            databaseId = '1DHYYdiGVl7wh0OsbCi4DhItkIeyYs1xZNzNQglYFFMM';
            property.setProperty('db_events', databaseId);
        }
        this.database = SpreadsheetApp.openById(databaseId);
    }
    database: GoogleAppsScript.Spreadsheet.Spreadsheet;

    getSheet(name: SheetName): GoogleAppsScript.Spreadsheet.Sheet {
        const sheet = this.database.getSheetByName(name);
        if (!sheet) throw Error(`Sheet "${name}" doesn't exist.`);
        return sheet;
    }
    getTable(name: SheetName): Table {
        const sheet = this.getSheet(name);
        const table = sheet.getDataRange().getValues();
        return table;
    };
    
    static tableToList<T>(table: ((keyof T)[] | (T[keyof T])[])[]): T[] {
        const result: T[] = [];
        const keyList = table.shift() as (keyof T)[];
        const tableData = table as (T[keyof T])[][];
        tableData.forEach((row) => {
            const obj = {} as T;
            row.forEach((value, index) => {
                obj[keyList[index]] = value;
            });
            result.push(obj);
        });
        return result;
    };
}

interface Options {
    termStart: Date;
    termEnd: Date;
    calendarName: string;
}
class OptionsHolder {
    constructor(database: Database) {
        this.options = {} as Options;
        const optionsRaw = database.getTable('Options');
        for (const row of optionsRaw) {
            const key = row[0];
            const value = row[1];
            switch (key) {
                case 'Term Start':
                    this.options.termStart = value;
                    break;
                case 'Term End':
                    this.options.termEnd = value;
                    break;
                case 'Calendar Name':
                    this.options.calendarName = value;
                    break;
                default:
                    console.error(`Unknown Option  "${key}": ${value}`);
                    break;
            }
        }
    }
    options: Options;
}

interface EventData {
    name: string;
    length: number;
}
class EventGalleryModule {
    constructor(database: Database, eventList: EventData[]) {
        this.database = database;
        this.eventList = eventList;
    }
    database: Database;
    eventList: EventData[];

    toString(): string {
        let list = '';
        this.eventList.forEach((event) => {
            list += wrap('div', event.name, {
                class: 'card',
                draggable: true,
                data_name: event.name,
                data_len: 2
            });
        });
        return wrap('div', list, {class: 'eventList'});
    }
}

interface TimetableData {
    start: Date[],
    end: Date[],
    sun: string[],
    mon: string[],
    tue: string[],
    wed: string[],
    thu: string[],
    fri: string[],
    sat: string[],
}
class TimetableModule {
    constructor(database: Database, eventList: EventData[]) {
        this.database = database;
        this.eventList = eventList;
    }
    database: Database;
    eventList: EventData[];

    toString(): string {
        let timetableHtml = '';
    
        const parseRawData = (raw: any[][]): TimetableData => {
            const data: TimetableData = {
                start: [],
                end: [],
                sun: [],
                mon: [],
                tue: [],
                wed: [],
                thu: [],
                fri: [],
                sat: [],
            };
            const keyList: (keyof TimetableData)[] = raw.shift()!;
            for (const row of raw) {
                keyList.forEach((key, index) => {
                    data[key].push(row[index]);
                });
            }
            return data;
        };
        const dataRaw = this.database.getTable('Timetable');
        const data = parseRawData(dataRaw);
    
        // Day
        const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayList.forEach((day, index) => {
            timetableHtml += wrap('div', day, {
                class: 'timetable_day',
                style: `grid-area: 1/${index + 2};`
            });
        });
    
        // Time
        data.start.forEach((_, index) => {
            const zeroPad = (n: number) => String(n).padStart(2, '0');
            const timeFormat = (date: Date) => `${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}`;
    
            let html = '';
            const start = data.start[index];
            const end = data.end[index];
            html += wrap('input', '', {type: 'time', class: 'timetable_time_start', value: timeFormat(start)});
            html += wrap('input', '', {type: 'time', class: 'timetable_time_end', value: timeFormat(end)});
            html = wrap('div', html, {class: 'timetable_time', style: `grid-area: ${Number(index) + 2}/1;`});
            timetableHtml += html;
        });
    
        // Placeholder
        [...Array(data.start.length)].forEach((_, col) => {
            [...Array(7)].forEach((_, row) => {
                timetableHtml += wrap('div', '', {class: 'timetable_placeholder', style: `grid-area: ${col + 2}/${row + 2};`});
            });
        });
    
        // Event
    
    
        return wrap('div', timetableHtml, {id: 'timetable', class: 'timetable'});
    }
}
