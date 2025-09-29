export class Component {
    constructor(id, type = 'div', className, onClick)  {
        this.type = type;
        this.className = className;
        this.onClick = onClick;
        this.id = id;
        this.element = document.createElement(type || this.type);
        if (id) {
            this.element.id = id;
        } else {
            this.element.id = `component-${Math.random().toString(36).substr(2, 9)}`;
        }
    }

       render() {
        const component = this.element;
        if (this.id) component.id = this.id;
        component.className = this.className;
        if (this.onClick) {
          component.addEventListener("click", this.onClick);
        }
        return component;
    }

    appendChild(child) {
        this.element.appendChild(child.render());
        return this;
    }
}