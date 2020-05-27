type Dict = {[key: string]: any};

function triggerEvent(element: Node, event: string) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const app: Dict = {};

selAll('.eventCard').forEach((item) => {
    if (!(item instanceof HTMLElement)) throw Error();
    const len = Number(item.dataset.len);
    item.style.gridRowEnd = `span ${len}`;

    item.addEventListener('dragstart', (e) => {
        setTimeout(() => item.classList.add('placeholder'), 1);

        if (!e.dataTransfer) throw Error();
        e.dataTransfer.effectAllowed = 'copy';
        const clone = item.cloneNode(true) as HTMLElement;
        clone.classList.add('ghost');

        const timetable = sel('#timetable')!;
        app.clone = timetable.appendChild(clone);
    });
    item.addEventListener('dragend', (e) => {
        item.classList.remove('placeholder');
    });
});

selAll('.timetable_placeholder').forEach((item) => {
    if (!(item instanceof HTMLElement)) throw Error();
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!e.dataTransfer) throw Error();
        e.dataTransfer.dropEffect = 'copy';
    });
    item.addEventListener('dragenter', (e) => {
        app.clone.style.gridRowStart = item.style.gridRowStart;
        app.clone.style.gridColumnStart = item.style.gridColumnStart;
    });
    item.addEventListener('drop', (e) => {
        e.preventDefault();
        app.clone.classList.remove('ghost');
    });
});
