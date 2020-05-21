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
  tableData.forEach((row) => {
    const obj = {} as T;
    row.forEach((value, index) => {
      obj[keyList[index]] = value;
    });
    result.push(obj);
  });
  return result;
};

type Event = {
  name: string;
  length: number;
}
const eventGallery = (eventTable: TableValue[][]): string => {
  let list = '';
  const eventTableObj = tableToObject<Event>(eventTable);
  eventTableObj.forEach((event, index) => {
    list += wrap('div', event.name, {
      class: 'eventCard',
      draggable: true,
      data_name: event.name,
      data_len: 2
    });
  });
  for (const event of eventTableObj) {
  }
  return wrap('div', list, {class: 'eventList'});
};

interface TimetableData {
  start: Date[],
  end: Date[],
}
const timetable = (data: TableValue[][]): string => {
  const timetableData: TimetableData = {
    start: [],
    end: [],
  };
  const keyList: (keyof TimetableData)[] = ['start', 'end'];
  data.shift();
  for (const row of data) {
    keyList.forEach((key, index) => {
      timetableData[key].push(row[index]);
    });
  }

  let timetableHtml = '';

  const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayList.forEach((day, index) => {
    timetableHtml += wrap('div', day, {
      class: 'timetable_day',
      style: `grid-area: 1/${index + 2};`
    });
  });
  timetableData.start.forEach((_, index) => {
    const zeroPad = (n: number) => String(n).padStart(2, '0');
    const timeFormat = (date: Date) => `${zeroPad(date.getHours())}:${zeroPad(date.getMinutes())}`;
    const start = timetableData.start[index];
    const end = timetableData.end[index];
    let html = wrap('input', '', {type: 'time', class: 'timetable_time_start', value: timeFormat(start)});
    html += wrap('input', '', {type: 'time', class: 'timetable_time_end', value: timeFormat(end)});
    html = wrap('div', html, {class: 'timetable_time', style: `grid-area: ${Number(index) + 2}/1;`});
    timetableHtml += html;
  });
  timetableData.start.forEach((_, col) => {
    [...Array(7)].forEach((_, row) => {
      timetableHtml += wrap('div', '', {class: 'timetable_placeholder', style: `grid-area: ${col + 2}/${row + 2};`});
    });
  });

  return wrap('div', timetableHtml, {id: 'timetable', class: 'timetable'});
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