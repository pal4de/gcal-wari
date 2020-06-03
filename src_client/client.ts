console.clear();

const triggerEvent = (element: Node, event: string): boolean => {
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent(event, true, true);
    return element.dispatchEvent(evt);
}
const cloneNode = <T extends Node>(node: T, deep: boolean = true): T => {
    return node.cloneNode(deep) as T;
}
const sel = document.querySelector.bind(document);
const selAll = document.querySelectorAll.bind(document);
const gas = google.script.run;
const gast = google.script.run
    .withSuccessHandler(x => console.log(x))
    .withFailureHandler(x => console.log(x));

const toast = (message: string, type: string) => {

};

class Card {
    static getGhost(): HTMLElement {
        const card = sel('#ghost');
        if (!(card instanceof HTMLElement)) throw Error();
        return card;
    }
    static getDragged(): HTMLElement {
        const card = sel('#dragged');
        if (!(card instanceof HTMLElement)) throw Error();
        return card;
    }
    static setEvent(card: HTMLElement): void {
        card.addEventListener('dragstart', (e) => {
            if (!e.dataTransfer) throw Error();
            e.dataTransfer.effectAllowed = 'copyMove';
            card.id = 'dragged';
    
            const ghost = cloneNode(card);
            ghost.id = 'ghost';
            sel('#timetable')!.appendChild(ghost);
        });
        
        card.addEventListener('dragend', (e) => {
            Card.getGhost().remove();
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            Card.getDragged().id = '';
        });
    };
}

selAll('.card').forEach((card) => {
    if (!(card instanceof HTMLElement)) throw Error();

    const len = Number(card.dataset.len);
    card.style.gridRowEnd = `span ${len}`;
    
    Card.setEvent(card);
});
selAll('.eventList .card').forEach((card) => {
    if (!(card instanceof HTMLElement)) throw Error();

    card.addEventListener('dragstart', (e) => {
        setTimeout(() => {
            card.classList.add('placeholder')
            card.id = '';
        }, 1);

        const clone = cloneNode(card);
        Card.setEvent(clone);
        clone.id = 'dragged';
        sel('#timetable')!.appendChild(clone);
    });
    card.addEventListener('dragend', (e) => {
        card.classList.remove('placeholder');
    });
});

selAll('.timetable_placeholder').forEach((placeholder) => {
    if (!(placeholder instanceof HTMLElement)) throw Error();
    placeholder.addEventListener('dragover', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!e.dataTransfer) throw Error();
        e.dataTransfer.dropEffect = 'copy';
    });
    placeholder.addEventListener('dragenter', (e) => {
        const ghost = Card.getGhost();
        ghost.style.gridRowStart = placeholder.style.gridRowStart;
        ghost.style.gridColumnStart = placeholder.style.gridColumnStart;
    });
    placeholder.addEventListener('drop', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const ghost = Card.getGhost();
        const card = Card.getDragged();
        const oldRow = Number(card.style.gridRowStart);
        const oldColmun = Number(card.style.gridColumnStart);
        const newRow = Number(ghost.style.gridRowStart);
        const newColmun = Number(ghost.style.gridColumnStart);

        card.style.gridRowStart = String(newRow);
        card.style.gridColumnStart = String(newColmun);
        gas.Timetable_moveEvent(-1+oldRow, -1+oldColmun, -1+newRow, -1+newColmun);

        card.id = '';
    });
});

selAll('.option input').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) throw Error();
    const eventName = input.type !== 'date' ? 'change' : 'blur';
    input.addEventListener(eventName, (e) => {
        gas.withSuccessHandler((ret) => {
            console.log('Option updated:', `"${input.name}": ${input.value}`);
            // トースト
        }).Option_update(input.name, input.value);
    });
});

const body = sel('body')!;
body.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!e.dataTransfer) throw Error();
    e.dataTransfer.dropEffect = 'move';
});
body.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const card = Card.getDragged();
    const row = Number(card.style.gridRowStart);
    const column = Number(card.style.gridColumnStart);
    card.remove();
    gas.Timetable_removeEvent(row-1, column-1);
});

type TimetableData = {
    name: string,
    column: number,
    row: number,
};
type EventData = {
    name: string,
    length: number,
};
type TimeData = {
    start: Date,
    End: Date,
};

const getTimetableData = (): TimetableData[] => {
    const result: TimetableData[] = [];
    selAll('#timetable .card').forEach((card) => {
        if (!(card instanceof HTMLElement)) throw Error();
        const timetableData = {
            name: '',
            column: 1,
            row: 1,
        };
        timetableData.name = card.dataset.name!;
        timetableData.column = Number(card.style.gridColumnStart);
        timetableData.row = Number(card.style.gridRowStart);
        result.push(timetableData);
    });
    return result;
};
const sendTimetableData = () => {
    const data = getTimetableData();
    google.script.run.req();
};
