type AppData = {
    clone: HTMLElement | null,
};

function triggerEvent(element: Node, event: string) {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const app: AppData = {
    clone: null
};

const registerCardEvents = (item: HTMLElement): void => {
    item.addEventListener('dragstart', (e) => {
        setTimeout(() => item.classList.add('placeholder'), 1);

        if (!e.dataTransfer) throw Error();
        e.dataTransfer.effectAllowed = 'copy';

        const clone = item.cloneNode(true) as HTMLElement;
        clone.classList.add('ghost');
        registerCardEvents(clone);

        const timetable = sel('#timetable')!;
        app.clone = timetable.appendChild(clone);
    });
    item.addEventListener('dragend', (e) => {
        item.classList.remove('placeholder');
    });
};
selAll('.card').forEach((item) => {
    if (!(item instanceof HTMLElement)) throw Error();
    const len = Number(item.dataset.len);
    item.style.gridRowEnd = `span ${len}`;

    registerCardEvents(item);
});

selAll('.timetable_placeholder').forEach((item) => {
    if (!(item instanceof HTMLElement)) throw Error();
    item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!e.dataTransfer) throw Error();
        e.dataTransfer.dropEffect = 'copy';
    });
    item.addEventListener('dragenter', (e) => {
        if (!app.clone) throw Error();
        app.clone.style.gridRowStart = item.style.gridRowStart;
        app.clone.style.gridColumnStart = item.style.gridColumnStart;
    });
    item.addEventListener('drop', (e) => {
        if (!app.clone) throw Error();
        e.preventDefault();
        app.clone.classList.remove('ghost');
    });
});
