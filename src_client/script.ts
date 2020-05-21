type Dict = {[key: string]: any};

function triggerEvent(element: Node, event: string) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true ); // event type, bubbling, cancelable
    return element.dispatchEvent(evt);
}
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const app: Dict = {};

selAll('.eventCard').forEach((item) => {
    const len = Number(item.dataset.len);
    const cellSizeRaw = getComputedStyle(sel('body')).getPropertyValue('--cell-size');
    const cellSize = Number(cellSizeRaw.match(/\d+/)[0]);
    item.style.height = `${cellSize * len}px`;

    item.addEventListener('dragstart', (e) => {
        setTimeout(() => e.target.classList.add('dragged'), 1);
        e.dataTransfer.effectAllowed = 'copy';
        const clone = item.cloneNode(true);
        clone.style.height = `auto`; // 気持ちわるい
        clone.style.width = `auto`; // 気持ちわるい
        clone.style.gridRowStart = '2';
        clone.style.gridColumnStart = '2';
        clone.style.pointerEvents = 'none';
        app.clone = sel('#timetable').appendChild(clone);
    });
    item.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragged');
    });
});

selAll('.timetable_placeholder').forEach((item) => {
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });
    item.addEventListener('dragenter', (e) => {
        app.clone.style.gridRowStart = item.style.gridRowStart;
        app.clone.style.gridColumnStart = item.style.gridColumnStart;
    });
    item.addEventListener('drop', (e) => {
        e.preventDefault();
        app.clone.style.pointerEvents = 'auto';
    });
});
