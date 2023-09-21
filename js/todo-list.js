const el= (tag, opt={})=> Object.assign(document.createElement(tag), opt);

class App {
    #tabs;
    /**@type {Set<Content>} */
    #contents= new Set;

    constructor(tabs) {
        this.#tabs= tabs;
    }

    addScripts() {
        const tm= new Date().getTime();
        const _script= name=> new Promise(resolve=> {
            const js= document.body.appendChild(el('script', {src:`js/${name}.js?${tm}`}));
            js.onload= _=> resolve();
            js.onerror= _=> resolve()
        });
        return Promise.all(this.#tabs.map(v=> _script(v)));
    }
    addContent(v) {
        this.#contents.add(v);
    }
    build() {
        this.#bindTabEvent(), [...this.#contents].forEach(each=> each.build());
    }
    #bindTabEvent() {
        const accordion= this.#tabs.map(v=> document.getElementById(v).children);
        accordion.forEach(([{children:[button]}, body])=> {
            button.addEventListener('click', _=> {
                accordion.forEach(([,body])=> Object.assign(body.style, {display:'none'}));
                body.style.display= 'block';
            });
        });
    }
}

class Content {
    build() { throw 'Content::build is override' }
}
