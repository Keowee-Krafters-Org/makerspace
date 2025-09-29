import { Container } from './component/Container.js';
import { Logger } from './Logger.js';
import { showSpinner, hideSpinner } from './common.js';
import { Button } from './component/Button.js';
import { PortalManager } from './PortalManager.js';
/**
 * Component to display and manage the events table with pagination.
 */
export class EventTable extends Container {
    constructor(id = 'eventTable', className = 'event-table') {
        super(id, className);
        this.pageSize = 10;
        this.currentPage = 1;
        this.newEventMethod = null;
        this.viewEventMethod = null;
        this.editEventMethod = null;
        this.listAttendeesMethod = null;
    }

    initialize() {
        super.initialize();
        // Bind to the new class button placeholder using the PortalManager instance to bind to the EventPortal instance
        // addEvent() method to create a new event
        const newClassButton = new Button(  
            'newClassBtn'
        ).bindToElementId('newClassButtonPlaceholder', this.newEventMethod); 
        this.loadEventsTable({ currentPage: this.currentPage, pageSize: this.pageSize });
    }

    /**
     * Loads events with optional pagination.
     * @param {Object} page - Pagination object with currentPage and pageSize.
     */
    loadEventsTable(page = { currentPage: 1, pageSize: this.pageSize }) {
        showSpinner();
        Logger.log("Loading events table...");
        google.script.run.withSuccessHandler(res => {
            const response = JSON.parse(res);
            if (response.success !== true) {
                document.getElementById('classes').innerHTML = `<p>Error loading events: ${response.error || 'Unknown error.'}</p>`;
                hideSpinner();
                return;
            }
            Logger.log("Event page response:", response);
            this.renderEventPage(response); // Added `this.`
            hideSpinner();
        }).getAllEvents({ ...page });
    }

    /**
     * Renders the current page of events in the table.
     * @param {Object} response - Response object containing event data and pagination info.
     */
    renderEventPage(response) {
        const tbody = document.getElementById('eventRows');
        tbody.innerHTML = '';

        const pageEvents = response.data || [];
        const page = response.page || { currentPage: 1, hasMore: false };
        pageEvents.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${event.eventItem.title || ''}</td>
            <td>${new Date(event.date).toLocaleString()}</td>
            <td>$${Number(event.eventItem.price).toFixed(2)}</td>
            <td>${event.attendees?.length || 0}/${event.eventItem.sizeLimit || 0}</td>
            <td></td> <!-- Placeholder for buttons -->
        `;

            // Create the "View" button
            const viewBtn = new Button('viewBtn', 'View', () => this.renderClass(event), 'signup-btn');
            // Create the "Edit" button
            const editBtn = new Button('editBtn', 'Edit', () => this.editEvent(event), 'signup-btn');

            // Create the "Attendees" button
            const attendeesBtn = new Button('attendeesBtn', 'Attendees', () => this.listAttendees(event), 'signup-btn');
            

            // Append buttons to the last cell
            const actionsCell = row.querySelector('td:last-child');
            actionsCell.appendChild(viewBtn.render());
            actionsCell.appendChild(editBtn.render());
            actionsCell.appendChild(attendeesBtn.render());

            tbody.appendChild(row);
        });

        this.renderPaginationControls(page); // Added `this.`
    }

    /**
     * Renders pagination controls based on the current page and whether there are more pages.
     * @param {Object} page - Pagination object with currentPage and hasMore properties.
     */
    renderPaginationControls(page) {
        const controls = document.getElementById('paginationControls');
        controls.innerHTML = `
            <button onclick="this.goToPage(${page.currentPage - 1})" ${page.currentPage === 1 ? 'disabled' : ''}>Previous</button>
            Page ${page.currentPage}
            <button onclick="this.goToPage(${page.currentPage + 1})" ${!page.hasMore ? 'disabled' : ''}>Next</button>
        `;
    }

    /**
     * Navigates to a specific page of events.
     * @param {number} page - The page number to navigate to.
     */
    goToPage(page) {
        this.loadEventsTable({ currentPage: page, pageSize: this.pageSize }); // Added `this.`
    }

    /**
     * Opens the details of a specific event.
     * @param {string} eventId - The ID of the event to view.
     */
    viewEvent(eventId) {
        showSpinner();
        google.script.run.withSuccessHandler(res => {
            const response = JSON.parse(res);
            Logger.log(response);
            if (response.success) {
                this.renderClass(response.data); // Added `this.`
            } else {
                Logger.error(`Failed to load event: ${response.error || 'Unknown error.'}`);
            }
            hideSpinner();
        }).getEventById(eventId);
    }

    /**
     * Lists the attendees for a specific event.
     * @param {Object} event - The event object containing attendee information.
     */
    listAttendees(event) {
        // Call backend service getMembersFromContacts if attendees are just contact references
        if (event.attendees && event.attendees.length > 0 && !event.attendees[0].id && event.attendees[0].emailAddress) {
            showSpinner();
            google.script.run.withSuccessHandler(res => {
                const response = JSON.parse(res);
                if (response.success) {
                    event.attendees = response.data; // Replace with full member details
                    this.renderAttendees(event); // Added `this.`
                } else {
                    Logger.error(`Failed to load attendees: ${response.error || 'Unknown error.'}`);
                }
                hideSpinner();
            }).getMembersFromContacts(event.attendees);
        } else {
            this.renderAttendees(event); // Added `this.`
        }
    }

    renderAttendees(event) {
        const container = document.getElementById('attendeesContainer');
        const tbody = document.getElementById('attendeesRows');

        // Clear existing attendees
        tbody.innerHTML = '';

        if (!event.attendees || event.attendees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2">No attendees for this event.</td></tr>';
        } else {
            event.attendees.forEach(attendee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                        <td>${attendee.firstName || ''} ${attendee.lastName || ''}</td>
                        <td>${attendee.emailAddress || 'N/A'}</td>
                        <td>${attendee.phoneNumber || 'N/A'}</td>
                        <td>${attendee.outstandingBalance ? `$${Number(attendee.outstandingBalance).toFixed(2)}` : '$0.00'}</td>
                    `;
                tbody.appendChild(row);
            });
        }
        // Add the hide attendees button functionality
        document.getElementById('hideAttendeesBtn').onclick = () => this.hideAttendees();
        // Show the attendees container
        container.style.display = 'block';
    }

    hideAttendees() {
        const container = document.getElementById('attendeesContainer');
        container.style.display = 'none';
    }
}