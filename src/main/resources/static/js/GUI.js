// Basic JavaScript HTML5 GUI Helper Functions
//
// Author: David Churchill, Memorial University
//         dave.churchill@gmail.com

class GUI {

    constructor(container) {
        this.container = container;
    }

    create(type, id, left, top, width, height) {
        let elem = document.createElement(type);
        elem.id = id;
        elem.style.position = 'absolute';
        if (left != 0) { elem.style.left = left; }
        if (top != 0) { elem.style.top = top; }
        if (height != 0) {
            if (type === 'canvas') {
                elem.height = height;
            } else {
                elem.style.height = height;
            }
        }
        if (width != 0) {
            if (type === 'canvas') {
                elem.width = width;
            } else {
                elem.style.width = width;
            }
        }
        this.container.appendChild(elem);
        return elem;
    }

    createCanvas(width, height) {
        this.bg = this.create('canvas', 'bg', 0, 0, width, height);
        this.fg = this.create('canvas', 'fg', 0, 0, width, height);
        this.bg_ctx = this.bg.getContext("2d");
        this.fg_ctx = this.fg.getContext("2d");
        this.fg_ctx.font = '14px Arial';
    }

    getMousePos(canvas, evt) {
        let rect = canvas.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    addButton(container, id, left, top, width, height, label, onclick) {
        let button = document.createElement("button");
        button.id = id;
        button.gui = this;
        button.onclick = onclick;
        button.style.position = 'absolute';
        button.style.left = left;
        button.style.width = width;
        button.style.height = height;
        button.style.top = top;
        button.innerHTML = label;
        container.appendChild(button);
    }

    addText(container, id, left, top, width, height, label) {
        let div = document.createElement("div");
        div.id = id;
        div.gui = this;
        div.style.position = 'absolute';
        div.style.left = left;
        div.style.width = width;
        div.style.height = height;
        div.style.top = top;
        div.innerHTML = label;
        container.appendChild(div);
    }

    // adds a Select box to the given container
    // values: [[val1, desc1], [val2, desc2]]
    addSelectBox(container, id, left, top, width, height, onchange, values) {
        let select = document.createElement("select");
        select.id = id;
        select.gui = this;
        select.onchange = onchange;
        select.style.position = 'absolute';
        select.style.left = left;
        select.style.width = width;
        select.style.height = height;
        select.style.top = top;
        for (let i = 0; i < values.length; i++) {
            let option = document.createElement("option");
            option.value = values[i][0];
            option.text = values[i][1];
            select.appendChild(option);
        }
        container.appendChild(select);
    }

    showElements(ids) {
        for (let i = 0; i < ids.length; i++) {
            document.getElementById(ids[i]).style.display = 'inline';
        }
    }

    hideElements(ids) {
        for (let i = 0; i < ids.length; i++) {
            document.getElementById(ids[i]).style.display = 'none';
        }
    }
}
