const pageSize = 10;
let currentPage = 1;

/**
 * Loads events with optional pagination.
 * @param {Object} page - Pagination object with currentPage and pageSize.
 */
function loadEventsTable(page = { currentPage: 1, pageSize: pageSize }) {
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
        renderEventPage(response);
        hideSpinner();
    }).getAllEvents({ ...page });
}

/**
 * Renders the current page of events in the table.
 * @param {Object} response - Response object containing event data and pagination info.
 */
function renderEventPage(response) {
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
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.className = 'signup-btn';
        viewBtn.onclick = () => renderClass(event);

        // Create the "Edit" button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'signup-btn';
        editBtn.onclick = () => editEvent(event);

        // Create the "Attendees" button
        const attendeesBtn = document.createElement('button');
        attendeesBtn.textContent = 'Attendees';
        attendeesBtn.className = 'signup-btn';
        attendeesBtn.onclick = () => listAttendees(event);

        // Append buttons to the last cell
        const actionsCell = row.querySelector('td:last-child');
        actionsCell.appendChild(viewBtn);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(attendeesBtn);

        tbody.appendChild(row);
    });

    renderPaginationControls(page);
}

/**
 * Renders pagination controls based on the current page and whether there are more pages.
 * @param {Object} page - Pagination object with currentPage and hasMore properties.
 */
function renderPaginationControls(page) {
    const controls = document.getElementById('paginationControls');
    controls.innerHTML = `
            <button onclick="goToPage(${page.currentPage - 1})" ${page.currentPage === 1 ? 'disabled' : ''}>Previous</button>
            Page ${page.currentPage}
            <button onclick="goToPage(${page.currentPage + 1})" ${!page.hasMore ? 'disabled' : ''}>Next</button>
        `;
}

/**
 * Navigates to a specific page of events.
 * @param {number} page - The page number to navigate to.
 */
function goToPage(page) {
    loadEventsTable({ currentPage: page, pageSize: pageSize });
}

/**
 * Opens the details of a specific event.
 * @param {string} eventId - The ID of the event to view.
 */
function viewEvent(eventId) {
    showSpinner();
    google.script.run.withSuccessHandler(res => {
        const response = JSON.parse(res);
        Logger.log(response);
        if (response.success) {
            renderClass(response.data); // Render the specific event
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
function listAttendees(event) {
    // Call backend service getMembersFromContacts if attendees are just contact references
    if (event.attendees && event.attendees.length > 0 && !event.attendees[0].id && event.attendees[0].emailAddress) {
        showSpinner();
        google.script.run.withSuccessHandler(res => {
            const response = JSON.parse(res);
            if (response.success) {
                event.attendees = response.data; // Replace with full member details
                renderAttendees(event);
            } else {
                Logger.error(`Failed to load attendees: ${response.error || 'Unknown error.'}`);
            }
            hideSpinner();
        }).getMembersFromContacts(event.attendees);
    } else {
        renderAttendees(event);
    }
}
function renderAttendees(event) {
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

    // Show the attendees container
    container.style.display = 'block';
}

function hideAttendees() {
    const container = document.getElementById('attendeesContainer');
    container.style.display = 'none';
}