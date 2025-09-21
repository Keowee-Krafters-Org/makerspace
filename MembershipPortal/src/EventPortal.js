import { Portal } from './Portal.js';
import { showSpinner, hideSpinner } from './common.js';
import { Logger } from './Logger.js';
import { PortalManager } from './PortalManager.js';
/**
 * EventPortal class for managing event-related functionality.
 */
export class EventPortal extends Portal {
    constructor(session = {}) {
        super(session, 'eventSection', 'Events');
        this.viewMode = session.viewMode; // Default view mode
    }

    initialize() {
        if (this.initialized) return this; // Prevent re-initialization
        this.div = document.getElementById(this.divId);
        Logger.log(`Initializing Event Portal in ${this.viewMode} mode with member:`, this.session.member);
        // Load events when the page is ready
        showSpinner();


        // Render based on viewMode
        if (this.viewMode === 'table') {
            document.getElementById('classes').style.display = 'none'; // Hide card layout
            document.getElementById('eventTableContainer').style.display = 'block'; // Show table layout

            loadEventsTable();
        } else {
            document.getElementById('eventTableContainer').style.display = 'none'; // Hide table layout
            document.getElementById('classes').style.display = 'grid'; // Show card layout
            this.loadEvents();
        }
        return this;
    }


    /**
     * Renders a list of classes in the UI by reusing the renderClass method.
     * @param {Array} classes - The list of class objects to render.
     */
    renderClasses(classes) {
        const container = document.getElementById('classes');
        container.innerHTML = ''; // Clear any existing content

        if (!classes || !classes.length) {
            container.innerHTML = '<p>No classes available at this time.</p>';
            return;
        }

        // Render each class using the renderClass method
        classes.forEach(cls => {
            const classContainer = document.createElement('div');
            classContainer.className = 'class-card-wrapper'; // Optional wrapper for styling
            container.appendChild(classContainer); // Append the wrapper to the main container

            // Pass the wrapper to renderClass to render the class inside it
            this.renderClass(cls, classContainer);
        });
    }

    /**
     * Renders the details of a specific class into the provided container.
     * @param {Object} cls - The class object to render.
     * @param {HTMLElement} container - The container to render the class into.
     */
    renderClass(cls, container) {
        if (!container) {
            container = document.getElementById('classDetailsContainer');
        }
        const currentMember = this.session.member;
        container.innerHTML = ''; // Clear any existing content
        container.style.display = 'block'; // Ensure the container is visible

        const card = document.createElement('div');
        card.className = 'class-card';

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = this.generateClassDiv(cls);
        card.appendChild(infoDiv);

        const eventDate = new Date(cls.date);
        const now = new Date();

        if (eventDate < now) {
            // Event is in the past
            const msg = document.createElement('div');
            msg.style.color = 'gray';
            msg.style.textAlign = 'center';
            msg.style.margin = '16px 0';
            msg.textContent = 'Event is in the past.';
            card.appendChild(msg);
        } else if (this.session.member && this.session.member.canSignUp()) {
            // Event is in the future and signup is allowed
            const isRegistered = cls.attendees && cls.attendees.some(attendee => attendee.emailAddress === currentMember.emailAddress);

            if (isRegistered) {
                const unregisterBtn = document.createElement('button');
                unregisterBtn.className = 'signup-btn';
                unregisterBtn.textContent = 'Cancel my Class Signup';
                unregisterBtn.onclick = () => this.unregister(cls.id, currentMember.id);
                card.appendChild(unregisterBtn);
            } else {
                const signupBtn = document.createElement('button');
                signupBtn.className = 'signup-btn';
                signupBtn.textContent = 'Sign Me Up';
                signupBtn.onclick = () => this.signup(cls.id, currentMember.id);
                card.appendChild(signupBtn);
            }
        } else {
            const signinBtn = document.createElement('button');
            signinBtn.className = 'signup-btn';
            signinBtn.textContent = 'Sign Me Up';
            signinBtn.onclick = () => this.signin(cls.id);
            card.appendChild(signinBtn);
        }

        if (this.config.levels[currentMember.registration?.level].value >= this.config.levels.Administrator.value) {
            const editBtn = document.createElement('button');
            editBtn.className = 'signup-btn';
            editBtn.textContent = 'Edit Event';
            editBtn.onclick = () => this.editEvent(cls);
            card.appendChild(editBtn);
        }

        const confirmation = document.createElement('div');
        confirmation.id = 'confirmation-message';
        confirmation.style.textAlign = 'center';
        confirmation.style.color = 'green';
        confirmation.style.marginTop = '20px';
        card.appendChild(confirmation);

        // Add "Back to Event List" button only if viewMode is 'table'
        if (this.viewMode === 'table') {
            const backButton = document.createElement('button');
            backButton.className = 'signup-btn';
            backButton.textContent = 'Back to Event List';
            backButton.onclick = () => {
                container.style.display = 'none'; // Hide the class details container
            };
            card.appendChild(backButton);
        }

        container.appendChild(card);
    }

    signin(classId) {
        PortalManager.instance.routeTo('member', { viewMode: 'event', eventId: classId });
    }

    generateClassDiv(cls) {
        const dateObj = new Date(cls.date);
        const formattedDate = `${dateObj.toLocaleString('en-US', { month: 'long' })} ${dateObj.getDate()} ${dateObj.getFullYear()} at: ${dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        const spotsAvailable = cls.eventItem.sizeLimit - (Array.isArray(cls.attendees) ? cls.attendees.length : 0);
        const imageHtml = cls.eventItem.image && cls.eventItem.image.url ? `<div class="class-image"><img src="${cls.eventItem.image.url}" alt="Class Image" /></div>` : '';
        return `
                ${imageHtml}
                <div class="class-title">${cls.eventItem.title}</div>
                <div class="class-desc truncate" onclick="this.classList.toggle('expanded')">${cls.eventItem.description}</div>
                <div class="class-info"><strong>Price:</strong> $${Number(cls.eventItem.price).toFixed(2)}</div>
                <div class="class-info"><strong>Date:</strong> ${formattedDate}</div>
                <div class="class-info"><strong>Duration:</strong> ${cls.eventItem.duration || 0} hours</div>
                <div class="class-info"><strong>Location:</strong> ${cls.location.description}</div>
                <div class="class-info"><strong>Instructor:</strong> ${cls.eventItem.host?.name || cls.eventItem.host || ''}</div>
                <div class="class-info"><strong>Max Attendees:</strong> ${cls.eventItem.sizeLimit}</div>
                <div class="class-info"><strong>Spots Available:</strong> ${spotsAvailable}</div>
            `;
    }


    /**
     * Handles the signup process for a class.
     * @param {string} classId - The ID of the class to sign up for.
     * @param {string} memberId - The ID of the member signing up.
     */
    signup(classId, memberId) {
        showSpinner();
        google.script.run
            .withSuccessHandler(res => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                let msg = '';
                let isSuccess = false;

                try {
                    const response = JSON.parse(res);
                    isSuccess = response.success;
                    msg = response.success
                        ? (response.message || "Signup complete.")
                        : (response.error || "You may already be signed up for this event.");
                } catch (err) {
                    msg = "Unexpected error during signup.";
                    console.error("Parse error:", err);
                }

                confirmation.textContent = msg;
                confirmation.style.color = isSuccess ? 'green' : 'red';

                // Reload the events
                if (isSuccess) {
                    this.loadEvents();
                }
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `Failed to sign up. ${err}`;
                confirmation.style.color = 'red';
            })
            .signup(classId, memberId);
    }

    /**
     * Creates a new event object and opens the edit form.
     */
    newEvent() {
        const event = {
            id: null,
            eventItem: {
                id: null,
                title: '',
                description: '',
                price: 0,
                sizeLimit: 0,
                enabled: true,
                host: ''
            },
            date: new Date(),
            location: ''
        };
        this.editEvent(event);
    }

    /**
     * Loads the list of events from the server and renders them.
     */
    loadEvents() {
        showSpinner();
        if (typeof google !== 'undefined' && google.script && google.script.run) {
            google.script.run.withSuccessHandler(res => {
                const response = JSON.parse(res);
                if (response.success !== true) {
                    document.getElementById('classes').innerHTML = `<p>Error loading classes: ${response.error || 'Unknown error.'}</p>`;
                    hideSpinner();
                    return;
                }
                this.renderClasses(response.data);
                hideSpinner();
            }).getEventList({ pageSize: 100 });
        } else {
            document.getElementById('classes').innerHTML = '<p>Unable to load classes. Please try again later.</p>';
            hideSpinner();
        }
    }

    addLabeledField(form, labelText, inputElement) {
        const label = document.createElement('label');
        label.textContent = labelText;
        form.appendChild(label);
        form.appendChild(inputElement);
    }

    createInput(id, value = '', type = 'text') {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.value = value;
        return input;
    }

    createMoneyInput(id, value = 0) {
        const input = createInput(id, value, 'number');
        input.step = '0.01';
        return input;
    }

    createCheckbox(id, checked = false) {
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.checked = checked;
        return input;
    }

    createTextarea(id, value = '') {
        const textarea = document.createElement('textarea');
        textarea.id = id;
        textarea.textContent = value;
        return textarea;
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'signup-btn';
        button.textContent = text;
        button.onclick = onClick;
        return button;
    }

    createDropdown(id, options, selectedValue = '') {
        const select = document.createElement('select');
        select.id = id;
        options.forEach(opt => {
            const value = typeof opt === 'object' ? (opt.id || opt.name) : opt;
            const label = typeof opt === 'object' ? opt.name : opt;
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            if (value === selectedValue) option.selected = true;
            select.appendChild(option);
        });
        return select;
    }

    /**
    * Creates an image upload field with a preview.
    * @param {Object} cls - The class object containing the image data.
    * @param {HTMLFormElement} form - The form element to store the base64 image data.
    * @returns {HTMLDivElement} The container with the image upload field and preview.
    */
    createImageUploadField(cls, form) {
        const imageFieldContainer = document.createElement('div');
        // imageFieldContainer.id = 'image-field-container';

        // Image preview
        const imagePreview = document.createElement('img');
        imagePreview.id = 'edit-image-preview';
        imagePreview.style.maxWidth = '200px';
        imagePreview.style.display = cls.eventItem.image ? 'block' : 'none';
        if (cls.eventItem.image && cls.eventItem.image.url) imagePreview.src = cls.eventItem.image.url;
        imageFieldContainer.appendChild(imagePreview);

        // File input
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.id = 'edit-image';
        imageInput.accept = 'image\/\*';
        imageFieldContainer.appendChild(imageInput);

        // Show preview on file select and store base64 in a property
        imageInput.addEventListener('change', () => {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                    // Store the base64 string for later use in createEventObject
                    form._imageBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        return imageFieldContainer;
    }

    editEvent(cls) {
        showSpinner();
        Logger.log("Editing event:", cls);
        const container = document.getElementById('classes');
        container.style.display = 'block';
        container.innerHTML = '';

        const form = document.createElement('form');
        form.className = 'class-card';

        const isNew = !cls.id;
        const saveBtn = createButton(isNew ? 'Create Class' : 'Save Changes', () => isNew ? this.addEvent() : this.saveEvent(cls.id));

        // --- Event Item Dropdown at the top ---
        const eventItemFieldContainer = document.createElement('div');
        eventItemFieldContainer.id = 'event-item-field-container';
        form.appendChild(eventItemFieldContainer);

        let eventItemsCache = []; // Store event items for lookup

        // Fetch event items from backend and populate the Event Item dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            const itemList = res.data || [];
            eventItemsCache = itemList; // Cache for later use

            const dropdown = createDropdown(
                'edit-event-item',
                [{ id: 'null', name: 'Select Event Item' }].concat(itemList.map(i => ({ id: i.id, name: i.title }))),
                cls.eventItem.id || ''
            );
            eventItemFieldContainer.innerHTML = '';
            addLabeledField(eventItemFieldContainer, 'Event Item:', dropdown);

            // Add change event to autofill fields
            dropdown.addEventListener('change', () => {
                const selectedId = this.value;
                const selectedItem = eventItemsCache.find(i => i.id === selectedId);
                if (selectedItem) {
                    if (selectedItem.title) document.getElementById('edit-title').value = selectedItem.title;
                    if (selectedItem.description) document.getElementById('edit-desc').value = selectedItem.description;
                    if (selectedItem.price) document.getElementById('edit-price').value = selectedItem.price;
                    if (selectedItem.sizeLimit) document.getElementById('edit-size').value = selectedItem.sizeLimit;
                    if (selectedItem.duration) document.getElementById('edit-duration').value = selectedItem.duration;
                }
            });

            // Optionally, trigger autofill if editing an existing event with an eventItemId
            if (cls.eventItem.id) {
                const selectedItem = eventItemsCache.find(i => i.id === cls.eventItem.id);
                if (selectedItem) {
                    if (selectedItem.title) document.getElementById('edit-title').value = selectedItem.title;
                    if (selectedItem.description) document.getElementById('edit-desc').value = selectedItem.description;
                    if (selectedItem.price) document.getElementById('edit-price').value = selectedItem.price;
                    if (selectedItem.sizeLimit) document.getElementById('edit-size').value = selectedItem.sizeLimit;
                    if (selectedItem.duration) document.getElementById('edit-duration').value = selectedItem.duration;
                }
            }
        }).getEventItemList({ pageSize: 100 });

        // --- Rest of the fields ---
        addLabeledField(form, 'Title:', createInput('edit-title', cls.eventItem.title));
        addLabeledField(form, 'Description:', createTextarea('edit-desc', cls.eventItem.description));
        addLabeledField(form, 'Date:', createInput('edit-date', this.formatDateForInput(cls.date), 'datetime-local'));
        addLabeledField(form, 'Duration (hours):', createInput('edit-duration', cls.eventItem.duration || '', 'number'));

        const roomFieldContainer = document.createElement('div');
        roomFieldContainer.id = 'room-field-container';
        form.appendChild(roomFieldContainer);
        // Fetch available rooms and populate the dropdown
        google.script.run.withSuccessHandler((response) => {
            const res = JSON.parse(response);
            if (res.success) {
                const rooms = res.data || [];
                const roomDropdown = createDropdown('edit-room', rooms, cls.location?.id || '');
                roomFieldContainer.innerHTML = ''; // Clear existing options
                addLabeledField(roomFieldContainer, 'Location:', roomDropdown);
            } else {
                Logger.error('Failed to load locations:', res.error);
            }
        }).getEventRooms();
        // Placeholder for Host dropdown
        const hostFieldContainer = document.createElement('div');
        hostFieldContainer.id = 'host-field-container';
        form.appendChild(hostFieldContainer);
        addLabeledField(form, 'Price: $', createMoneyInput('edit-price', cls.eventItem.price || 0));
        addLabeledField(form, 'Max Attendees:', createInput('edit-size', cls.eventItem.sizeLimit || 0, 'number'));
        addLabeledField(form, 'Enabled:', createCheckbox('edit-enabled', cls.eventItem.enabled === true));

        // --- Image Upload Field ---
        const imageFieldContainer = createImageUploadField(cls, form);
        form.appendChild(imageFieldContainer);
        // --- Add the Cancel Button ---
        const cancelBtn = createButton('Cancel', () => {
            form.remove(); // Remove the form
            container.style.display = 'none';
            this.loadEvents(); // Reload the events (or return to the previous view)
        });

        // Append buttons to the form
        form.appendChild(saveBtn);
        form.appendChild(cancelBtn);

        container.appendChild(form);

        // Fetch instructors from backend and populate the Host dropdown
        google.script.run.withSuccessHandler((instructors) => {
            let instructorList = instructors;
            if (typeof instructors === 'string') {
                try {
                    instructorList = JSON.parse(instructors);
                } catch (e) {
                    instructorList = [];
                }
            }
            const dropdown = createDropdown('edit-host', instructorList, cls.eventItem.host?.id || '');
            hostFieldContainer.innerHTML = '';
            addLabeledField(hostFieldContainer, 'Host:', dropdown);
            hideSpinner();
        }).getInstructors();

    }

    saveEvent(eventId) {
        const requiredFields = ['edit-title', 'edit-date', 'edit-room'];
        for (const id of requiredFields) {
            const field = document.getElementById(id);
            if (!field.value.trim()) {
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `${field.previousSibling.textContent.replace(':', '')} is required.`;
                confirmation.style.color = 'red';
                return;
            }
        }
        const updated = this.createEventObject(eventId);
        Logger.log(JSON.stringify(updated, null, 2));
        showSpinner();
        google.script.run
            .withSuccessHandler(() => {
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = "Event updated successfully.";
                confirmation.style.color = 'green';

                // Return to the event table display
                document.getElementById('classes').style.display = 'none'; // Hide the card layout
                document.getElementById('eventTableContainer').style.display = 'block'; // Show the table layout
                loadEventsTable(); // Refresh the table
                hideSpinner();
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `Failed to update event. ${err}`;
                confirmation.style.color = 'red';
            })
            .updateEvent(JSON.stringify(updated));
    }

    addEvent() {
        const requiredFields = ['edit-date', 'edit-room', 'edit-event-item', 'edit-host', 'edit-title', 'edit-desc', 'edit-price', 'edit-size', 'edit-duration'];
        for (const id of requiredFields) {
            const field = document.getElementById(id);
            if (!field.value.trim()) {
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `${field.previousSibling.textContent.replace(':', '')} is required.`;
                confirmation.style.color = 'red';
                return;
            }
        }

        const newEvent = this.createEventObject();
        Logger.log("Creating event object:", newEvent);
        showSpinner();
        google.script.run
            .withSuccessHandler(res => {
                const response = JSON.parse(res);
                const confirmation = document.getElementById('confirmation-message');
                if (response.success) {
                    confirmation.textContent = "Event created successfully.";
                    confirmation.style.color = 'green';

                    // Return to the event table display
                    document.getElementById('classes').style.display = 'none'; // Hide the card layout
                    document.getElementById('eventTableContainer').style.display = 'block'; // Show the table layout
                    loadEventsTable(); // Refresh the table
                } else {
                    confirmation.textContent = `Failed to create event: ${response.error || 'Unknown error.'}`;
                    confirmation.style.color = 'red';
                }
                hideSpinner();
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `Failed to create event. ${err}`;
                confirmation.style.color = 'red';
            })
            .createEvent(JSON.stringify(newEvent));
    }

    createEventObject(eventId = null) {

        const eventItemId = document.getElementById('edit-event-item').value;
        const title = document.getElementById('edit-title').value;
        const description = document.getElementById('edit-desc').value;
        const date = document.getElementById('edit-date').value;
        const location = { id: document.getElementById('edit-room').value };
        const price = parseFloat(document.getElementById('edit-price').value) || 0;
        const sizeLimit = parseInt(document.getElementById('edit-size').value) || 0;
        const enabled = document.getElementById('edit-enabled').checked;
        const host = { id: document.getElementById('edit-host').value };
        const duration = parseInt(document.getElementById('edit-duration').value) || 0; // <-- Add this line
        const imageInput = document.getElementById('edit-image');

        let imageBase64 = '';
        // Try to get the base64 from the form property (set by the FileReader)
        const form = imageInput.closest('form');
        if (form && form._imageBase64) {
            imageBase64 = form._imageBase64;
        } else if (document.getElementById('edit-image-preview').src && document.getElementById('edit-image-preview').src.startsWith('data:image')) {
            imageBase64 = document.getElementById('edit-image-preview').src;
        } else if (window.activeEvent && window.activeEvent.eventItem && window.activeEvent.eventItem.image) {
            imageBase64 = window.activeEvent.eventItem.image;
        }

        return {
            id: eventId === 'null' ? null : eventId,
            eventItem: {
                id: eventItemId,
                type: 'event',
                title: title,
                description: description,
                price: price,
                sizeLimit: sizeLimit,
                enabled: enabled,
                host: host,
                duration: duration,
                image: { data: imageBase64 }
            },
            date: new Date(date),
            location: location
        };
    }

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
     * Handles the unregistration process for a class.
     * @param {string} classId - The ID of the class to unregister from.
     * @param {string} memberId - The ID of the member unregistering.
     */
    unregister(classId, memberId) {
        showSpinner();
        google.script.run
            .withSuccessHandler(res => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                let msg = '';
                let isSuccess = false;

                try {
                    const response = JSON.parse(res);
                    isSuccess = response.success;
                    msg = response.success
                        ? (response.message || "You have been successfully unregistered.")
                        : (response.error || "Failed to unregister from the event.");
                } catch (err) {
                    msg = "Unexpected error during unregistration.";
                    console.error("Parse error:", err);
                }

                confirmation.textContent = msg;
                confirmation.style.color = isSuccess ? 'green' : 'red';

                // Reload the specific event
                if (isSuccess) {
                    this.loadEvents();
                }
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `Failed to unregister. ${err}`;
                confirmation.style.color = 'red';
            })
            .unregister(classId, memberId);
    }

    /**
     * Fetches and renders a specific event by its ID.
     * @param {string} eventId - The ID of the event to fetch and render.
     */
    reloadEvent(eventId) {
        showSpinner();
        google.script.run
            .withSuccessHandler(res => {
                hideSpinner();
                const response = JSON.parse(res);
                if (response.success) {
                    this.renderClass(response.data); // Render the specific event
                } else {
                    Logger.error(`Failed to reload event: ${response.error || 'Unknown error.'}`);
                }
            })
            .withFailureHandler(err => {
                hideSpinner();
                Logger.error(`Failed to reload event. ${err}`);
            })
            .getEventById(eventId); // Backend method to fetch a single event
    }


}

