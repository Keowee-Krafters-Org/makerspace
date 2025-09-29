import { Portal } from './Portal.js';
import { showSpinner, hideSpinner } from './common.js';
import { Logger } from './Logger.js';
import { PortalManager } from './PortalManager.js';
import { Button } from './components/Button.js';
import { TextInput } from './components/TextInput.js';
import { Card } from './components/Card.js';
import { Container } from './components/Container.js';
import { List } from './components/List.js';
import { EventTable } from './EventTable.js';
import { ImageViewer } from './components/ImageViewer.js'; // Import the ImageViewer component
import { DropDown } from './components/DropDown.js';
import { MoneyInput } from './components/MoneyInput.js';
import { EventEditor } from './EventEditor.js';

/**
 * EventPortal class for managing event-related functionality.
 */
export class EventPortal extends Portal {
    constructor(session = {}) {
        super(session, 'eventPortal', 'Events');
        this.viewMode = session.viewMode; // Default view mode
    }

    initialize() {
        if (this.initialized) return this; // Prevent re-initialization
        Logger.log(`Initializing Event Portal in ${this.viewMode} mode with member:`, this.session.member);
        showSpinner();


        // Render based on viewMode
        if (this.viewMode === 'table') {
            document.getElementById('classes').style.display = 'none'; // Hide card layout
            document.getElementById('eventTableContainer').style.display = 'block'; // Show table layout

            this.eventTable = new EventTable();
            this.eventTable.newEventMethod = () => this.newEvent();
            this.eventTable.initialize();
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
        const container = new Container('classes');
        container.clear();

        if (!classes || !classes.length) {
            container.setHtml('<p>No classes available at this time.</p>');
            return;
        }

        // Render each class using the renderClass method
        classes.forEach(event => {
            const classContainer = new Container();
            classContainer.className = 'class-card-wrapper'; // Optional wrapper for styling
            container.appendChild(classContainer); // Append the wrapper to the main container

            // Pass the wrapper to renderClass to render the class inside it
            this.renderClass(event, classContainer);
        });
    }
    /**
     * Renders the details of a specific class into the provided container.
     * @param {Object} event - The class object to render.
     * @param {HTMLElement} container - The container to render the class into.
     */
    renderClass(event, container) {
        if (!container) {
            container = document.getElementById('classDetailsContainer');
        }
        const currentMember = this.session.member;
        container.clear(); // Clear any existing content
        container.open(); // Ensure the container is visible

        const card = new Card('login-card');
        Logger.debug("Rendering class:", event);

        // Add the ImageViewer for event images
        const imageUrls = event.eventItem.images?.map(image => image.url) || []; // Use an array of image URLs
        if (imageUrls.length > 0) {
            const imageViewer = new ImageViewer(`${event.id}-image-viewer`, imageUrls);
            imageViewer.initialize();
            card.appendChild(imageViewer);
        }

        const infoDiv = new Container();
        infoDiv.setHtml(this.generateClassDiv(event));
        card.appendChild(infoDiv);

        const eventDate = new Date(event.date);
        const now = new Date();

        if (eventDate < now) {
            // Event is in the past
            const msg = new Message('event-past-message', 'Event is in the past.', 'event-past-message');
            card.appendChild(msg);
        } else if (this.session.member && this.session.member.canSignUp()) {
            // Event is in the future and signup is allowed
            const isRegistered = event.attendees && event.attendees.some(attendee => attendee.emailAddress === currentMember.emailAddress);

            if (isRegistered) {
                const unregisterBtn = new Button('unregister-btn', 'Cancel my Class Signup', () => this.unregister(event.id, currentMember.id));
                card.appendChild(unregisterBtn);
            } else {
                const signupBtn = new Button('signup-btn', 'Sign Me Up', () => this.signup(event.id, currentMember.id));
                card.appendChild(signupBtn);
            }
        } else {
            card.appendChild(new Button('sign-up-btn', 'Sign Me Up',
                () => this.signin(event.id))),
                'signup-btn'
        }

        if (this.config.levels[currentMember.registration?.level].value >= this.config.levels.Administrator.value) {
            card.appendChild(new Button('edit-event-btn', 'Edit Event', () => this.editEvent(event)));
        }

        const confirmation = new Message('confirmation-message', '', 'confirmation-message');
        card.appendChild(confirmation);

        // Add "Back to Event List" button only if viewMode is 'table'
        if (this.viewMode === 'table') {
            const backButton = new Button('back-to-event-list-btn', 'Back to Event List', () => {
                container.style.display = 'none'; // Hide the class details container
            });
            card.appendChild(backButton);
        }

        container.appendChild(card);
    }

    signin(classId) {
        PortalManager.instance.routeTo('member', { viewMode: 'event', eventId: classId });
    }

    generateClassDiv(event) {
        const dateObj = new Date(event.date);
        const formattedDate = `${dateObj.toLocaleString('en-US', { month: 'long' })} ${dateObj.getDate()} ${dateObj.getFullYear()} at: ${dateObj.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        const spotsAvailable = event.eventItem.sizeLimit - (Array.isArray(event.attendees) ? event.attendees.length : 0);
        const imageHtml = event.eventItem.image && event.eventItem.image.url ? `<div class="class-image"><img src="${event.eventItem.image.url}" alt="Class Image" /></div>` : '';
        return `
                ${imageHtml}
                <div class="class-title">${event.eventItem.title}</div>
                <div class="class-desc truncate" onclick="this.classList.toggle('expanded')">${event.eventItem.description}</div>
                <div class="class-info"><strong>Price:</strong> $${Number(event.eventItem.price).toFixed(2)}</div>
                <div class="class-info"><strong>Date:</strong> ${formattedDate}</div>
                <div class="class-info"><strong>Duration:</strong> ${event.eventItem.duration || 0} hours</div>
                <div class="class-info"><strong>Location:</strong> ${event.location.description}</div>
                <div class="class-info"><strong>Instructor:</strong> ${event.eventItem.host?.name || event.eventItem.host || ''}</div>
                <div class="class-info"><strong>Max Attendees:</strong> ${event.eventItem.sizeLimit}</div>
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
                const confirmation = new Container('confirmation-message');
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

                confirmation.setHtml(msg);
                confirmation.setStyle('color', isSuccess ? 'green' : 'red');

                // Reload the events
                if (isSuccess) {
                    this.loadEvents();
                }
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = new Container('confirmation-message');
                confirmation.setHtml(`Failed to sign up. ${err}`);
                confirmation.setStyle('color', 'red');
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


    /**
     * Edits an event by rendering a form with event details.
     * @param {Object} event - The class object containing event details.
     */
    editEvent(event) {
        showSpinner();
        Logger.log("Editing event:", event);

        const container = new Container('classes', 'div', 'event-editor-container');
        container.clear().open;

        const eventEditor = new EventEditor(
            event || { eventItem: {} },
            (eventId) => this.saveEvent(eventId), // Save callback
            () => {
                container.style.display = 'none'; // Cancel callback
                this.loadEvents();
            }
        );

        container.appendChild(eventEditor);
        hideSpinner();
    }

    saveEvent(eventId) {
        const eventObject = this.eventEditor.createEventObject(eventId); // Get the event object from EventEditor
        Logger.log(JSON.stringify(eventObject, null, 2));
        showSpinner();
        google.script.run
            .withSuccessHandler(() => {
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = "Event updated successfully.";
                confirmation.style.color = 'green';

                // Return to the event table display
                document.getElementById('classes').style.display = 'none'; // Hide the card layout
                document.getElementById('eventTableContainer').style.display = 'block'; // Show the table layout
                this.eventTable.loadEventsTable(); // Refresh the table
                hideSpinner();
            })
            .withFailureHandler(err => {
                hideSpinner();
                const confirmation = document.getElementById('confirmation-message');
                confirmation.textContent = `Failed to update event. ${err}`;
                confirmation.style.color = 'red';
            })
            .updateEvent(JSON.stringify(eventObject));
    }

    addEvent() {
        const eventObject = this.eventEditor.createEventObject(); // Get the event object from EventEditor
        Logger.log("Creating event object:", eventObject);
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
                    this.eventTable.loadEventsTable(); // Refresh the table
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
            .createEvent(JSON.stringify(eventObject));
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

