import { Container } from './component/Container.js';
import { Button } from './component/Button.js';
import { TextInput } from './component/TextInput.js';
import { DropDown } from './component/DropDown.js';
import { MoneyInput } from './component/MoneyInput.js';
import { ImageViewer } from './component/ImageViewer.js';
import { Logger } from './Logger.js';
import { showSpinner, hideSpinner } from './common.js';

/**
 * EventEditor class for managing the event editing form.
 */
export class EventEditor extends Container {
    /**
     *
     * @param {Function} saveEventCallback - Callback function to save the event.
     * @param {Function} cancelCallback - Callback function to cancel editing.
     */
    constructor(event = null,  saveEventCallback, cancelCallback) {
        super('eventEditor');
        this.event = event || {};
        this.saveEventCallback = saveEventCallback;
        this.cancelCallback = cancelCallback;
    }

    /**
     * Renders the event editing form.
     * @param {Object} event - The class object containing event details.
     */
    render() {
        const event = this.event || {};
        Logger.debug("Rendering Event Editor for class:", event);
        this.clear(); // Clear any existing content

        // Create the form container
        const form = new Container('event-editor-form', 'form', 'card');

        const isNew = !event.id;
        const saveBtn = new Button('save-btn', isNew ? 'Create Class' : 'Save Changes', () => this.saveEvent(event.id));
        const cancelBtn = new Button('cancel-btn', 'Cancel', () => this.cancelCallback());

        // --- Event Item Dropdown ---
        const eventItemDropdown = new DropDown(
            'edit-event-item',
            'Event Item',
            [{ id: 'null', name: 'Select Event Item' }],
            this.event.eventItem.id || '',
            'dropdown'
        ).setOnChange((selectedItem) => this.updateFieldsFromEventItem(selectedItem))
        .setItemLoader((callback) => {
            showSpinner();
        });
        form.appendChild(eventItemDropdown);

        // Fetch event items from backend and populate the dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            const itemList = res.data || [];
            eventItemDropdown.setOptions(
                [{ id: 'null', name: 'Select Event Item' }].concat(itemList.map(i => ({ id: i.id, name: i.title })))
            );

            // // Add change event to autofill fields
            // eventItemDropdown.component.addEventListener('change', () => {
            //     const selectedId = eventItemDropdown.getValue();
            //     const selectedItem = itemList.find(i => i.id === selectedId);
            //     if (selectedItem) {
            //         this.updateFieldsFromEventItem(selectedItem);
            //     }
            // });
        }).getEventItemList({ pageSize: 100 });

        // --- Rest of the fields ---
        const titleInput = new TextInput('edit-title', 'Title', 'text', this.event.eventItem.title);
        const descriptionInput = new TextInput('edit-desc', 'Description', 'textarea', event.eventItem.description);
        const dateInput = new TextInput('edit-date', 'Date', 'datetime-local', this.formatDateForInput(event.date));
        const durationInput = new TextInput('edit-duration', 'Duration (hours)', 'number', event.eventItem.duration || '');
        const priceInput = new MoneyInput('edit-price', event.eventItem.price || 0, 'Price');
        const sizeLimitInput = new TextInput('edit-size', 'Attendee Limit', 'number', event.eventItem.sizeLimit || 0);
        const enabledInput = new TextInput('edit-enabled', 'Enabled', 'checkbox', event.eventItem.enabled === true);



        form.appendChild(titleInput);
        form.appendChild(descriptionInput);
                // --- Room Dropdown ---
        const roomDropdown = new DropDown('edit-room', 'Location', [], event.location?.id || '');
        form.appendChild(roomDropdown);

        // Fetch available rooms and populate the dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            if (res.success) {
                roomDropdown.setOptions(res.data || []);
            } else {
                Logger.error('Failed to load locations:', res.error);
            }
        }).getEventRooms();


        form.appendChild(dateInput);
        form.appendChild(durationInput);
        form.appendChild(priceInput);
        form.appendChild(sizeLimitInput);
        form.appendChild(enabledInput);


        // --- Image Upload Field ---
        const imageViewer = new ImageViewer(`${event.id}-image-viewer`, event.eventItem.image ? [event.eventItem.image.url] : []);
        imageViewer.addFileUpload();
        form.appendChild(imageViewer);

        // Append buttons to the form
        form.appendChild(saveBtn);
        form.appendChild(cancelBtn);

        this.appendChild(form);
    }

    /**
     * Updates form fields based on the selected event item.
     * @param {Object} eventItem - The selected event item.
     */
    updateFieldsFromEventItem(eventItem) {
        this.components.titleInput.setValue(eventItem.title || '');
        this.components.descriptionInput.setValue(eventItem.description || '');
        this.components.priceInput.setValue(eventItem.price || 0);
        this.components.sizeLimitInput.setValue(eventItem.sizeLimit || 0);
        this.components.durationInput.setValue(eventItem.duration || 0);
    }

    /**
     * Collects data from the form and creates an event object.
     * @param {string|null} eventId - The ID of the event being edited (or null for new events).
     * @returns {Object} The event object.
     */
    createEventObject(eventId = null) {
        return {
            id: eventId === 'null' ? null : eventId,
            eventItem: {
                id: this.components.eventItemDropdown.getValue(),
                type: 'event',
                title: this.components.titleInput.getValue(),
                description: this.components.descriptionInput.getValue(),
                price: parseFloat(this.components.priceInput.getValue()) || 0,
                sizeLimit: parseInt(this.components.sizeLimitInput.getValue()) || 0,
                enabled: this.components.enabledInput.getValue(),
                duration: parseInt(this.components.durationInput.getValue()) || 0,
                image: { data: this.components.imageViewer.getBase64Image() }
            },
            date: new Date(this.components.dateInput.getValue()),
            location: { id: this.components.roomDropdown.getValue() }
        };
    }

    /**
     * Formats a date for use in an input field.
     * @param {string|Date} date - The date to format.
     * @returns {string} The formatted date string.
     */
    formatDateForInput(date) {
        if (!date) return '';
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
}