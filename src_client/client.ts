type Dict = {[key: string]: any};

function triggerEvent(element: Node, event: string) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const app: Dict = {};

interface MyElement extends Element {
    dataset: {[key: string]: string},
    style: {[key: string]: string},
}
selAll('.eventCard').forEach((item) => {
    if (!(item instanceof HTMLElement)) throw Error();
    const len = Number(item.dataset.len);
    const body = sel('body');
    if (body === null) throw Error();
    const cellSizeRaw = getComputedStyle(body).getPropertyValue('--cell-size');
    const cellSize = Number((cellSizeRaw.match(/\d+/) ?? '1')[0]);
    item.style.height = `${cellSize * len}px`;

    item.addEventListener('dragstart', (e) => {
        setTimeout(() => item.classList.add('dragged'), 1);

        if (!e.dataTransfer) throw Error();
        e.dataTransfer.effectAllowed = 'copy';
        const clone = item.cloneNode(true) as HTMLElement;
        clone.style.height = `auto`; // 気持ちわるい
        clone.style.width = `auto`; // 気持ちわるい
        clone.style.gridRowStart = '2';
        clone.style.gridColumnStart = '2';
        clone.style.pointerEvents = 'none';

        const timetable = sel('#timetable');
        if (!timetable) throw Error();
        app.clone = timetable.appendChild(clone);
    });
    item.addEventListener('dragend', (e) => {
        item.classList.remove('dragged');
    });
});

selAll('.timetable_placeholder').forEach((item) => {
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const eAsDrag = e as DragEvent;
        if (!eAsDrag.dataTransfer) throw Error();
        eAsDrag.dataTransfer.dropEffect = 'copy';
    });
    item.addEventListener('dragenter', (e) => {
        if (!(item instanceof HTMLElement)) throw Error();
        app.clone.style.gridRowStart = item.style.gridRowStart;
        app.clone.style.gridColumnStart = item.style.gridColumnStart;
    });
    item.addEventListener('drop', (e) => {
        e.preventDefault();
        app.clone.style.pointerEvents = 'auto';
    });
});
