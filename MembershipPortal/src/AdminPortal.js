/**
 * Admin UI JavaScript
 * 
 */
import { showSpinner, hideSpinner } from './common.js';
import { Portal } from './Portal.js';
export class AdminPortal extends Portal {
  constructor(config = {}) {
    super(config, 'adminPortal', 'Admin');
    this.selectedMember = null;
    this.pageSize = 10;
    this.currentPage = 1;
    this.filteredMembers = [];
  }

  /**
* Initializes the AdminPortal and loads the members.
*/
  initialize() {
    if (this.initialized) return this;
    super.initialize();
    this.loadMembers();
    this.initialized = true;
    return this;
  }
  /**
   * Populates the level dropdown with options from the shared configuration.
   */
  populateLevelDropdown() {
    const select = document.getElementById('editLevel');
    select.innerHTML = '';
    Object.entries(sharedConfig.levels || {}).forEach(([label, level]) => {
      const option = document.createElement('option');
      option.value = level.value;
      option.textContent = label;
      select.appendChild(option);
    });
  }

  /**
   * Loads members with optional pagination and filtering.
   * @param {Object} page - Pagination object with currentPage and pageSize.
   */
  loadMembers(page = { currentPage: this.currentPage, pageSize: this.pageSize }) {
    const search = document.getElementById('search').value.toLowerCase();
    const filter = document.getElementById('filter').value;
    showSpinner();
    google.script.run.withSuccessHandler(res => {
      document.getElementById('memberEditor').classList.add('hidden');
      document.getElementById('memberListContainer').classList.remove('hidden');
      const response = JSON.parse(res);

      this.renderCurrentPage(response);
      hideSpinner();
    }).getAllMembers({ ...page });
  }

  /**
   * Cancels the member edit and returns to the member list.
   */
  cancelEdit() {
    this.loadMembers();
  }

  /**
   * Renders the current page of members in the table.
   * @param {Object} response - Response object containing member data and pagination info.
   */
  renderCurrentPage(response) {
    const tbody = document.getElementById('memberRows');
    tbody.innerHTML = '';

    const pageMembers = response.data || [];
    const page = response.page || { currentPage: 1, hasMore: false };
    pageMembers.forEach(member => {
      const levelName = member.registration.level;
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${member.emailAddress || ''}</td>
                <td>${member.firstName || ''} ${member.lastName || ''}</td>
                <td>${member.registration?.status || ''}</td>
                <td>${levelName}</td>
                <td><button class="edit-member-btn" data-email="${member.emailAddress}">Edit</button></td>
            `;
      tbody.appendChild(row);
    });

    this.renderPaginationControls(page);

    // Bind event listeners for edit buttons
    tbody.querySelectorAll('.edit-member-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const email = event.target.dataset.email;
        this.editMember(email);
      });
    });
  }

  /**
   * Renders pagination controls based on the current page and whether there are more pages.
   * @param {Object} page - Pagination object with currentPage and hasMore properties.
   */
  renderPaginationControls(page) {
    const controls = document.getElementById('paginationControls');
    const hasMore = page.hasMore || false;
    controls.innerHTML = `
            <button class="pagination-btn" data-page="${page.currentPage - 1}" ${page.currentPage === 1 ? 'disabled' : ''}>Previous</button>
            Page ${page.currentPage}
            <button class="pagination-btn" data-page="${page.currentPage + 1}" ${!hasMore ? 'disabled' : ''}>Next</button>
        `;

    // Bind event listeners for pagination buttons
    controls.querySelectorAll('.pagination-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const page = parseInt(event.target.dataset.page, 10);
        this.goToPage({ currentPage: page });
      });
    });
  }

  /**
   * Navigates to a specific page of members.
   * @param {Object} page - Page object with the desired page number.
   */
  goToPage(page) {
    this.loadMembers(page);
  }

  /**
   * Opens the member editor for a specific member by email.
   * @param {string} email - The email address of the member to edit.
   */
  editMember(email) {
    showSpinner();
    google.script.run.withSuccessHandler(res => {
      const response = JSON.parse(res);
      const member = response.data;
      this.selectedMember = member;
      document.getElementById('editEmail').value = member.emailAddress;
      document.getElementById('editFirstName').value = member.firstName;
      document.getElementById('editLastName').value = member.lastName;
      document.getElementById('editLevel').value = member.registration?.level;
      document.getElementById('editStatus').value = member.registration?.status || '';
      const waiverSigned = member.registration?.waiverSigned || false;
      document.getElementById('editWaiverSigned').value = String(waiverSigned);
      const waiverLink = member.registration?.waiverPdfLink || '#';
      const linkElement = document.getElementById('editWaiverLink');
      if (waiverSigned && waiverLink !== '#') {
        linkElement.href = waiverLink;
        linkElement.textContent = 'View Waiver';
        linkElement.hidden = false;
      } else {
        linkElement.href = '#';
        linkElement.hidden = true;
      }

      document.getElementById('memberEditor').classList.remove('hidden');
      document.getElementById('memberListContainer').classList.add('hidden');
      hideSpinner();
    }).getMemberByEmail(email);
  }

  /**
   * Saves the edited member details.
   */
  saveMember() {
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    let name = this.selectedMember.name;
    if (firstName !== this.selectedMember.firstName || lastName !== this.selectedMember.lastName) {
      name = `${firstName} ${lastName}`;
    }
    const updateMemberRequest = {
      id: this.selectedMember.id,
      name: name,
      emailAddress: document.getElementById('editEmail').value,
      firstName: document.getElementById('editFirstName').value,
      lastName: document.getElementById('editLastName').value,
      registration: {
        level: document.getElementById('editLevel').value,
        status: document.getElementById('editStatus').value,
        waiverSigned: document.getElementById('editWaiverSigned').value === 'true',
        waiverPdfLink: this.selectedMember.registration?.waiverPdfLink || ''
      }
    };
    showSpinner();
    google.script.run
      .withSuccessHandler(() => {
        document.getElementById('memberEditor').classList.add('hidden');
        this.loadMembers();
      })
      .updateMember(JSON.stringify(updateMemberRequest));
  }


}
