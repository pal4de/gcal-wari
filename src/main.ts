const wrap = (
  tag: string,
  content: string,
  attr?: {[key: string]: string | number | boolean},
): string => {
  let attrStr = '';
  if (attr) {
    for (const a in attr) {
      attrStr += ` ${a}="${attr[a]}"`;
    }
  }
  return `<${tag}${attrStr}>${content}</${tag}>`;
};

const getContent = (name: string): string => {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
};

type TableValue = any;
const getTable = (name: string): TableValue[][] => {
  // バージョン情報を残しておきたい
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
  const database = SpreadsheetApp.openById(databaseId);
  const databaseSheet = database.getSheetByName(name); // todo: 複数枚に対応する
  if (!databaseSheet) throw Error(`Sheet "${name}" doesn't exist.`);
  const eventList = databaseSheet.getDataRange().getValues();
  return eventList;
};

const tableToObject = <T>(table: ((keyof T)[] | (T[keyof T])[])[]): T[] => {
  const result: T[] = [];
  const keyList = table.shift() as (keyof T)[];
  const tableData = table as (T[keyof T])[][];
  for (let i = 0; i < tableData.length; i++) {
    const obj = {} as T;
    for (let j = 0; j < tableData[i].length; j++) {
      obj[keyList[j]] = tableData[i][j];
    }
    result.push(obj);
  }
  return result;
};

type Event = {
  name: string;
  length: number;
}
const eventGallery = (eventTable: TableValue[][]): string => {
  let list = '';
  const eventTableObj = tableToObject<Event>(eventTable);
  for (const event of eventTableObj) {
    list += wrap('option', event.name, { value: event.name });
  }
  return wrap('select', list);
};

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
const timetable = (data: TableValue[][]): string => {
  const timetableData: TimetableData = {
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
  const keyList: (keyof TimetableData)[] = ['start', 'end', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  data.shift();
  for (const row of data) {
    for (let i = 0; i < keyList.length; i++) {
      timetableData[keyList[i]].push(row[i]);
    }
  }

  let timetableHtml = '';

  const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    let day = dayList[i];
    timetableHtml += wrap('div', day, {class: 'timetable_day', style: `grid-row: 1; grid-column: ${i + 2}`});
  }
  for (let i = 0; i < timetableData.start.length; i++) {
    const timeFormat = (date: Date) => `${date.getHours()}:${('00' + date.getMinutes()).slice(-2)}`;
    const start = timetableData.start[i];
    const end = timetableData.end[i];
    let html = wrap('div', timeFormat(start), {class: 'timetable_time_start'}) + wrap('div', timeFormat(end), {class: 'timetable_time_end'})
    html = wrap('div', html, {class: 'timetable_time', style: `grid-row: ${Number(i) + 2}; grid-column: 1`});
    timetableHtml += html;
  }

  return wrap('div', timetableHtml, { class: 'timetable' });
};

const app = (): string => {
  let content = '';

  const timetableData = getTable('Timetable');
  const eventListData = getTable('Events');

  content += eventGallery(eventListData);
  content += timetable(timetableData);

  return content;
};

const doGet = (e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput => {
  const out = HtmlService.createTemplateFromFile('index').evaluate();
  out.setTitle('Gcal-wari: Timetable on Google Calendar');
  return out;
};
// const doPost = (e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.HTML.HtmlOutput => {
//   return
// }
