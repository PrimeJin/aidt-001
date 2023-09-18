class KhsContent extends Content {
    #title;
    #renderer;
    #accordion;

    #listViewId= 'khs-list';
    #tasks= new Set;
    constructor(id, title, renderer) {
        super();
        this.#title= title;
        this.#renderer= renderer.setKhsContent(this);
        this.#accordion= this.#getAccordion(id);
    }

    // public
    build() {
        this.#setTitle(), this.#initForm(), this.#initListView();
    }
    getTasks() {
        return [...this.#tasks];
    }
    getListView() {
        const [,body]= this.#accordion;
        return body.querySelector(`#${this.#listViewId}`);
    }

    // private
    #initListView() {
        const [,body]= this.#accordion;
        body.appendChild(el('div', {id: this.#listViewId}))
            .setAttribute('class', 'mt-3');
    }
    #initForm() {
        const [,body]= this.#accordion;
        body.innerHTML= '';

        const form= _makeForm(body);
        _bindEvent.call(this, form);

        // ==== 내부기능 ====
        function _bindEvent(form) {
            const {frmTitle, frmSubmit, frmRand}= form;
            frmRand.addEventListener('change', _=> {
                switch(frmRand.value) {
                case 'd':
                    this.#renderer= new DOMRenderer(this);
                    break;
                case 'c':
                    this.#renderer= new CanvasRenderer(this);
                    break;
                default: throw '지원하지 않는 타입';
                }
                this.#renderer.render();
            });
            frmSubmit.addEventListener('click', _=> {
                const title= frmTitle.value.trim();
                if(!title) return alert('제목을 입력하세요.'), frmTitle.focus();

                this.#tasks.add(new Task(title));
                this.#renderer.render();
            });
        }
        function _makeForm(body) {
            const form= body.appendChild(el('div', {
                innerHTML: `
                    <div class="col-3">
                        <select data-ctrl="frmRand" class="form-select">
                            <option value="d">DOM</option>
                            <option value="c">Canvas</option>
                        </select>
                    </div>
                    <div class="col">
                        <input data-ctrl="frmTitle" type="text" class="form-control w-100">
                    </div>
                    <div class="col-3">
                        <button data-ctrl="frmSubmit" class="btn btn-primary w-100">확인</button>
                    </div>
                `
            }));
            form.setAttribute('class', 'row');
            return [...form.querySelectorAll('[data-ctrl]')].reduce((result, ctrl)=> {
                const {dataset:{ctrl:name}}= ctrl;
                return Object.assign(result, {[name]:ctrl});
            }, {});
        }
    }
    #setTitle() {
        const [tab]= this.#accordion;
        tab.textContent= this.#title;
    }
    #getAccordion(id) {
        const div= document.getElementById(id);
        return [div.querySelector('.accordion-button'), div.querySelector('.accordion-body')];
    }
}
class Renderer {
    khs;
    constructor(khs) {
        this.setKhsContent(khs);
    }
    setKhsContent(khs) {
        return Object.assign(this, {khs});
    }
    render() { throw 'Renderer::render override' }
}
class DOMRenderer extends Renderer {
    render() {
        const {khs}= this;
        const list= this.#getList(khs.getListView());

        khs.getTasks().forEach(task=> {
            list.appendChild(this.#makeListItem(task))
        });
    }

    #getList(view) {
        view.innerHTML= '';
        const list= view.appendChild(el('div'));
        list.setAttribute('class', 'list-group');
        return list;
    }
    #makeListItem({title: innerHTML}) {
        const item= el('a', {innerHTML, href: '#'});
        item.setAttribute('class', 'list-group-item list-group-item-action');
        return item;
    }
}
class CanvasRenderer extends Renderer {
    render() {
        const {khs}= this;
        const ctx= this.#getContext(khs.getListView());
        khs.getTasks().forEach((task, i)=> ctx.fillText(task.title, 20, i*20 + 20));
    }

    #getContext(view) {
        view.innerHTML= '';
        const canvas= view.appendChild(el('canvas'));
        const {width, height}= canvas;
        
        const list= canvas.getContext('2d');
        list.fillStyle= 'black';
        list.fillRect(0, 0, width, height)

        list.fillStyle= 'white';
        return list;
    }
}
class Task {
    #title;
    constructor(title) {
        this.#title= title;
    }
    get title() {
        return this.#title;
    }
}

app.addContent(new KhsContent('khs', '강환성', new DOMRenderer()));
