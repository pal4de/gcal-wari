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
    const eventGallery = new EventGallery(database);
    const option = new Option(database);
    const timetable = new Timetable(database, eventGallery);

    template.option = option;
    template.eventGallery = eventGallery;
    template.timetable = timetable;

    const response = template.evaluate();
    response.setTitle('Gcal-wari: Timetable on Google Calendar');
    return response;
};

// Wrap content with HTML tag
type HtmlAttr = {[key: string]: string | number | boolean};
const zeroPad = (n: number, length: number = 2): string => String(n).padStart(length, '0');
const wrap = (
    tag: string,
    content: string,
    attr: HtmlAttr = {},
    isVoid: boolean = false,
): string => {
    let result = '';
    let attrStr = '';
    for (const a in attr) {
        attrStr += ` ${a.replace('_', '-')}="${attr[a]}"`;
    }

    if (isVoid) {
        result = `<${tag}${attrStr} />`;
    } else {
        result = `<${tag}${attrStr}>${content}</${tag}>`;
    }
    return result;
};

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
}

class Event {
    constructor(name: string, length: number) {
        this.name = name;
        this.length = length;
    }
    readonly name: string;
    readonly length: number;

    html(attr: HtmlAttr = {}): string {
        attr = {
            class: 'card',
            draggable: true,
            data_name: this.name,
            data_len: this.length,
            ...attr,
        };
        return wrap('div', this.name, attr);
    }
    toString(): string {
        return this.html();
    }

    static find(list: Event[], name: string): Event {
        const event = list.find(event => event.name === name);
        if (!event) throw Error();
        return event;
    }
}
class EventGallery {
    constructor(database: Database) {
        const tableToList = (table: any[][]): Event[] => {
            table.shift();
            const tableData = table as [string, number][];
            const result = tableData.map((value) => new Event(...value));
            return result;
        };

        this.sheet = database.getSheet('Events');

        const eventDataListRaw = database.getTable('Events');
        this.data = tableToList(eventDataListRaw);
    }
    readonly sheet: GoogleAppsScript.Spreadsheet.Sheet;
    readonly data: Event[];

    toString(): string {
        let list = this.data.join('');
        return wrap('div', list, {class: 'eventList'});
    }
}

interface OptionData {
    calendarName: string;
    periodStart: Date;
    periodEnd: Date;
}
class Option {
    constructor(database: Database) {
        this.sheet = database.getSheet('Options');
        this.option = {} as OptionData;

        const optionsRaw = database.getTable('Options');
        for (const row of optionsRaw) {
            const key = row[0] as keyof OptionData;
            const value = row[1];
            console.log(key, value, this.option);
            this.option[key] = value;
        }
    }
    readonly sheet: GoogleAppsScript.Spreadsheet.Sheet;
    readonly option: OptionData;

    toString(): string {
        let result = '';
        const labelMap = new Map<keyof OptionData, string>([
            ['calendarName', 'Calendar Name'],
            ['periodStart', 'Period Starts'],
            ['periodEnd', 'Period Ends'],
        ]);
        labelMap.forEach((label, key) => {
            let input = '';
            const value = this.option[key];
            if (value instanceof Date) {
                const year = value.getFullYear();
                const month = zeroPad(value.getMonth()+1);
                const date = zeroPad(value.getDate());
                input += wrap('input', '', {
                    name: key,
                    type: 'date',
                    value: `${year}-${month}-${date}`
                }, true);
            } else {
                input += wrap('input', '', {
                    name: key,
                    value: value
                }, true);
            }
            result += wrap('label', wrap('span', label) + input);
        });
        result = wrap('div', result, {class: 'option'})
        return result;
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
class Timetable {
    constructor(database: Database, eventGallery: EventGallery) {
        this.sheet = database.getSheet('Timetable');
        this.eventGallery = eventGallery;
    
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
        const dataRaw = database.getTable('Timetable');
        this.data = parseRawData(dataRaw);
    }
    readonly sheet: GoogleAppsScript.Spreadsheet.Sheet;
    readonly eventGallery: EventGallery;
    readonly data: TimetableData;

    toString(): string {
        let timetableHtml = '';
    
        // Placeholder
        [...Array(this.data.start.length)].forEach((_, col) => {
            [...Array(7)].forEach((_, row) => {
                timetableHtml += wrap('div', '', {class: 'timetable_placeholder', style: `grid-area: ${col+2}/${row+2};`});
            });
        });
    
        // Time
        this.data.start.forEach((_, index) => {
            const timeFormat = (date: Date) => `${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}`;
    
            let html = '';
            const start = this.data.start[index];
            const end = this.data.end[index];
            html += wrap('input', '', {type: 'time', class: 'timetable_time_start', value: timeFormat(start)});
            html += wrap('input', '', {type: 'time', class: 'timetable_time_end', value: timeFormat(end)});
            html = wrap('div', html, {class: 'timetable_time', style: `grid-area: ${Number(index) + 2}/1;`});
            timetableHtml += html;
        });
    
        // Day
        const dayList: (keyof Omit<TimetableData, 'start' | 'end'>)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        dayList.forEach((day, index) => {
            timetableHtml += wrap('div', day, {
                class: 'timetable_day',
                style: `grid-area: 1/${index + 2};`
            });
        });
    
        // Event
        dayList.forEach((key, column) => {
            this.data[key].forEach((eventName, row) => {
                if (!eventName) return;
                const event = Event.find(this.eventGallery.data, eventName);
                timetableHtml += event.html({
                    style: `grid-row-start: ${row+2}; grid-column-start: ${column+2};`
                });
            });
        });

        return wrap('div', timetableHtml, {id: 'timetable', class: 'timetable'});
    }
}
