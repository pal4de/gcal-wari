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
  for (const i in tableData) {
    const obj = {} as T;
    for (const j in tableData[i]) {
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

const timetable = (data: TableValue[][]): string => {
  let table = '';
  for (const i in data) {
    const tag = i !== '0' ? 'td' : 'th';
    let row = '';
    for (const cell of data[i]) {
      row += wrap(tag, cell);
    }
    table += wrap('tr', row);
  }
  return wrap('table', table);
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
