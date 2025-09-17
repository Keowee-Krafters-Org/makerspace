/**
 * Admin UI JavaScript
 * 
 */
    let selectedMember = null;
    let sharedConfig = {};

    function showSpinner() {
      document.getElementById('spinner').style.display = 'block';
    }

    function hideSpinner() {
      document.getElementById('spinner').style.display = 'none';
    }

    function populateLevelDropdown() {
      const select = document.getElementById('editLevel');
      select.innerHTML = '';
      Object.entries(sharedConfig.levels || {}).forEach(([label, level]) => {
        const option = document.createElement('option');
        option.value = level.value;
        option.textContent = label;
        select.appendChild(option);
      });
    }

    const pageSize = 10;
    let filteredMembers = [];

    /**
     * Loads members with optional pagination and filtering.
     * @param {Object} page - Pagination object with currentPage and pageSize.
     */
    function loadMembers(page = { currentPage: 1, pageSize: pageSize }) {
      const search = document.getElementById('search').value.toLowerCase();
      const filter = document.getElementById('filter').value;
      showSpinner();
      google.script.run.withSuccessHandler(res => {
        
      document.getElementById('memberEditor').classList.add('hidden');
      document.getElementById('memberListContainer').classList.remove('hidden');
        const response = JSON.parse(res);

        renderCurrentPage(response);
        hideSpinner();
      }).getAllMembers({ ...page });
    }

    /**
     * Cancels the member edit and returns to the member list.
     */
    function cancelEdit() {
      loadMembers();
    }
    /**
     * Renders the current page of members in the table.
     * @param {Object} response - Response object containing member data and pagination info.
     */
    function renderCurrentPage(response) {
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
      <td><button onclick="editMember('${member.emailAddress}')">Edit</button></td>
    `;
        tbody.appendChild(row);
      });

      renderPaginationControls(page);
    }

    /**
     * Renders pagination controls based on the current page and whether there are more pages.
     * @param {Object} page - Pagination object with currentPage and hasMore properties.
     */
    function renderPaginationControls(page) {
      let controls = document.getElementById('paginationControls');

      const hasMore = page.hasMore || false;
      controls.innerHTML = `
    <button onclick="goToPage({page:${page.currentPage - 1}})" ${page.currentPage === 1 ? 'disabled' : ''}>Previous</button>
    Page ${page.currentPage}
    <button onclick="goToPage({page:${page.currentPage + 1}})" ${page.hasMore ? 'disabled' : ''}>Next</button>
  `;
    }

    /**
     * Navigates to a specific page of members.
     * @param {Object} page - Page object with the desired page number.
     */
    function goToPage(page) {

      loadMembers(page);
    }

    /**
     * Opens the member editor for a specific member by email.
     * @param {string} email - The email address of the member to edit.
     */
    function editMember(email) {
      showSpinner();
      google.script.run.withSuccessHandler(res => {
        const response = JSON.parse(res);
        const member = response.data;
        selectedMember = member;
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

    function saveMember() {
      const firstName = document.getElementById('editFirstName').value.trim();
      const lastName = document.getElementById('editLastName').value.trim();
      let name = selectedMember.name;
      if (firstName != selectedMember.firstName || lastName != selectedMember.lastName) {
        // Update name and first and last name fields
        name = `${firstName} ${lastName}`;
      }
      const updateMemberRequest = {
        id: selectedMember.id,
        name: name,
        emailAddress: document.getElementById('editEmail').value,
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        registration: {
          level: document.getElementById('editLevel').value,
          status: document.getElementById('editStatus').value,
          waiverSigned: document.getElementById('editWaiverSigned').value === 'true',
          waiverPdfLink: selectedMember.registration?.waiverPdfLink || ''
        }
      };
      showSpinner();
      google.script.run
        .withSuccessHandler(() => {
          document.getElementById('memberEditor').classList.add('hidden');
          loadMembers();
        })
        .updateMember(JSON.stringify(updateMemberRequest));
    }
    google.script.run.withSuccessHandler(config => {
      sharedConfig = config;
      document.getElementById('version').textContent = `Version: ${config.version}\nService Version: ${config.membershipVersion}`;
      populateLevelDropdown();
      hideSpinner();
    }).getConfig();

    loadMembers();
