import { Container } from './Container.js';
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
     * @param {Object} config - The shared configuration for the application.
     * @param {Function} saveEventCallback - Callback function to save the event.
     * @param {Function} cancelCallback - Callback function to cancel editing.
     */
    constructor(config, saveEventCallback, cancelCallback) {
        super('eventEditor');
        this.config = config;
        this.saveEventCallback = saveEventCallback;
        this.cancelCallback = cancelCallback;
    }

    /**
     * Renders the event editing form.
     * @param {Object} cls - The class object containing event details.
     */
    render(cls) {
        this.clear(); // Clear any existing content

        const form = document.createElement('form');
        form.className = 'class-card';

        const isNew = !cls.id;
        const saveBtn = new Button('save-btn', isNew ? 'Create Class' : 'Save Changes', () => this.saveEvent(cls.id));
        const cancelBtn = new Button('cancel-btn', 'Cancel', () => this.cancelCallback());

        // --- Event Item Dropdown ---
        const eventItemFieldContainer = document.createElement('div');
        eventItemFieldContainer.id = 'event-item-field-container';
        form.appendChild(eventItemFieldContainer);

        let eventItemsCache = []; // Store event items for lookup

        // Fetch event items from backend and populate the Event Item dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            const itemList = res.data || [];
            eventItemsCache = itemList; // Cache for later use

            const dropdown = new DropDown(
                'edit-event-item',
                'Event Item',
                [{ id: 'null', name: 'Select Event Item' }].concat(itemList.map(i => ({ id: i.id, name: i.title }))),
                cls.eventItem.id || '',
                'dropdown'
            );
            eventItemFieldContainer.innerHTML = '';
            eventItemFieldContainer.appendChild(dropdown.render());

            // Add change event to autofill fields
            dropdown.component.addEventListener('change', () => {
                const selectedId = dropdown.component.value;
                const selectedItem = eventItemsCache.find(i => i.id === selectedId);
                if (selectedItem) {
                    if (selectedItem.title) document.getElementById('edit-title').value = selectedItem.title;
                    if (selectedItem.description) document.getElementById('edit-desc').value = selectedItem.description;
                    if (selectedItem.price) document.getElementById('edit-price').value = selectedItem.price;
                    if (selectedItem.sizeLimit) document.getElementById('edit-size').value = selectedItem.sizeLimit;
                    if (selectedItem.duration) document.getElementById('edit-duration').value = selectedItem.duration;
                }
            });
        }).getEventItemList({ pageSize: 100 });

        // --- Rest of the fields ---
        form.appendChild(new TextInput('edit-title', 'Title', 'text', cls.eventItem.title).render());
        form.appendChild(new TextInput('edit-desc', 'Description', 'textarea', cls.eventItem.description).render());
        form.appendChild(new TextInput('edit-date', 'Date', 'datetime-local', this.formatDateForInput(cls.date)).render());
        form.appendChild(new TextInput('edit-duration', 'Duration (hours)', 'number', cls.eventItem.duration || '').render());

        const roomFieldContainer = document.createElement('div');
        roomFieldContainer.id = 'room-field-container';
        form.appendChild(roomFieldContainer);

        // Fetch available rooms and populate the dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            if (res.success) {
                const rooms = res.data || [];
                const roomDropdown = new DropDown('edit-room', 'Location', rooms, cls.location?.id || '');
                roomFieldContainer.innerHTML = ''; // Clear existing options
                roomFieldContainer.appendChild(roomDropdown.render());
            } else {
                Logger.error('Failed to load locations:', res.error);
            }
        }).getEventRooms();

        // --- Image Upload Field ---
        const imageViewer = new ImageViewer(`${cls.id}-image-viewer`, cls.eventItem.image ? [cls.eventItem.image.url] : []);
        imageViewer.addFileUpload();
        form.appendChild(imageViewer.render());

        form.appendChild(new MoneyInput('edit-price', cls.eventItem.price || 0, 'Price').render());
        form.appendChild(new TextInput('edit-size', 'Attendee Limit', 'number', cls.eventItem.sizeLimit || 0).render());
        form.appendChild(new TextInput('edit-enabled', 'Enabled', 'checkbox', cls.eventItem.enabled === true).render());

        // Append buttons to the form
        form.appendChild(saveBtn.render());
        form.appendChild(cancelBtn.render());

        this.appendChild(form);
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

    /**
     * Saves the event by calling the saveEventCallback.
     * @param {string|null} eventId - The ID of the event being saved.
     */
    saveEvent(eventId) {
        this.saveEventCallback(eventId);
    }
}