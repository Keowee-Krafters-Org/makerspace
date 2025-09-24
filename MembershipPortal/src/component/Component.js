export class Component {
    constructor(id, type = 'div', className, onClick)  {
        this.type = type;
        this.className = className;
        this.onClick = onClick;
        this.id = id;
        this.component = document.createElement(type || this.type);
    }

       render() {
        const component = this.component;
        if (this.id) component.id = this.id;
        component.className = this.className;
        if (this.onClick) {
          component.addEventListener("click", this.onClick);
        }
        return component;
    }

    appendChild(child) {
        this.component.appendChild(child.render());
        return this;
    }
}