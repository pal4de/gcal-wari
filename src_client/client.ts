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
    const toast = sel('.toast')!;
    toast.classList.remove('success');
    toast.classList.remove('error');

    toast.innerHTML = message;
    toast.classList.add(type);
    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
    toast.classList.add('active');
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
            sel('.timetable')!.appendChild(ghost);
        });
        
        card.addEventListener('dragend', (e) => {
            Card.getGhost().remove();
        });

        card.addEventListener('drop', (e) => { // Cancel drag
            e.preventDefault();
            e.stopPropagation();

            const dragged = Card.getDragged();
            dragged.id = '';
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
            card.classList.add('placeholder');
        }, 1);
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
        const dragged = Card.getDragged();
        const newRow = Number(ghost.style.gridRowStart);
        const newColmun = Number(ghost.style.gridColumnStart);

        dragged.id = '';
        if (dragged.matches('.timetable .card')) { // move
            const oldRow = Number(dragged.style.gridRowStart);
            const oldColmun = Number(dragged.style.gridColumnStart);
    
            dragged.style.gridRowStart = String(newRow);
            dragged.style.gridColumnStart = String(newColmun);
            gas.Timetable_moveEvent(-1+oldRow, -1+oldColmun, -1+newRow, -1+newColmun);
        } else if (dragged.matches('.eventList .card')) { // new
            const clone = cloneNode(dragged) as HTMLElement;
            clone.classList.remove('placeholder'); // キモい
            Card.setEvent(clone);

            clone.style.gridRowStart = String(newRow);
            clone.style.gridColumnStart = String(newColmun);
            sel('.timetable')!.appendChild(clone);
            gas.Timetable_addEvent(-1+newRow, -1+newColmun, clone.dataset.name);
        } else {
            throw Error();
        }
    });
});

selAll('.option input').forEach((input) => {
    if (!(input instanceof HTMLInputElement)) throw Error();
    const eventName = input.type !== 'date' ? 'change' : 'blur';
    input.addEventListener(eventName, (e) => {
        gas.withSuccessHandler((ret) => {
            console.log('Option updated:', `"${input.name}": ${input.value}`);
        }).Option_update(input.name, input.value);
    });
});

sel('.option button')!.addEventListener('click', (e) => {
    gas.withSuccessHandler((ret) => {
        const date = (sel('[name=periodStart]') as HTMLInputElement).value.replace(/-/g, '/');
        toast(`Successfully applied to <a href="https://calendar.google.com/calendar/r/week/${date}" target="_blank">the calendar</a>. `, 'success');
    }).withFailureHandler((err) => {
        toast(err.message, 'error');
    }).apply();
});

sel('.toast')!.addEventListener('click', (e) => {
    sel('.toast')!.classList.remove('active');
});

const body = sel('body')!;
body.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!e.dataTransfer) throw Error();
    e.dataTransfer.dropEffect = 'move';
});
body.addEventListener('drop', (e) => { // remove from timetable
    e.preventDefault();
    
    const dragged = Card.getDragged();
    if (!dragged.matches('.timetable #dragged')) return;

    const row = Number(dragged.style.gridRowStart);
    const column = Number(dragged.style.gridColumnStart);
    dragged.remove();
    gas.Timetable_removeEvent(row-1, column-1);
});
