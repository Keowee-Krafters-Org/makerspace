import { Component } from "./Component.js";

export class Label extends Component {
    constructor(id, label, htmlFor, className = "label") {
        super(id, 'label', className, null);
        this.htmlFor = htmlFor;
        this.text = label;
    }

    render() {
        const label = super.render();
        label.textContent = this.text;
        label.htmlFor = this.htmlFor;
        return label;
    }
}
