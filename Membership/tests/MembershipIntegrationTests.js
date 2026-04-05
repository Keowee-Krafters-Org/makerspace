import { ModelFactory } from '../services/ModelFactory.js';
import { Member } from '../models/Member.js';
import { ZohoMember } from '../storage/zoho/ZohoMember.js';
import { SheetStorageManager } from '../storage/sheet/SheetStorageManager.js';
import { EventManager } from '../services/EventManager.js';
import { getConfig } from '../config.js';

export class MembershipIntegrationTests {
    constructor() {
        this.modelFactory = new ModelFactory();
        this.membershipManager = this.modelFactory.membershipManager();
        this.testEmailAddress = 'testuser@keoweekrafters.org';
        this.existingEmailAddress = 'christopher.smith@oopscope.com';

        this.testMemberMinimum = {
            emailAddress: this.testEmailAddress,
            firstName: 'Testy',
            lastName: 'User',
            phoneNumber: '123-456-7890',
            address: '123 Mock St, Salem, SC, 29676',
            interests: ['Woodworking', 'Fabric Arts']
        };

        this.testMember = {
            ...this.testMemberMinimum,
            login: { status: 'UNVERIFIED' },
            registration: { status: 'NEW', level: 'Active' }
        };
    }

    run(testName, runAll = false) {
        if (runAll) {
            return this.runAll();
        }
        if (typeof this[testName] === 'function') {
            Logger.log(`Running test: ${testName}`);
            try {
                this[testName]();
                Logger.log(`Test '${testName}' passed.`);
            } catch (e) {
                Logger.log(`Test '${testName}' failed: ${e.message}`);
            }
        } else {
            Logger.log(`Test '${testName}' not found in suite.`);
        }
    }

    runAll() {
        Logger.log('Starting Membership integration tests...');
        const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => prop.startsWith('test_') && typeof this[prop] === 'function');

        tests.forEach(testName => this.run(testName));

        Logger.log('Membership integration tests completed.');
    }

    test_if_member_registers__then_member_data_is_complete() {
        try {
            const tm = { ...this.testMemberMinimum, registration: { level: 'Active' }, login: { status: 'VERIFIED' } };
            const existingMember = this.membershipManager.memberLookup(tm.emailAddress);
            tm.id = existingMember ? existingMember.id : '';
            tm.login = existingMember ? existingMember.login : tm.login;

            const memberResponse = this.membershipManager.addMemberRegistration(tm);
            const member = memberResponse.data;

            this.assert('Email', tm.emailAddress, member.emailAddress);
            this.assert('First Name', tm.firstName, member.firstName);
            this.assert('Last Name', tm.lastName, member.lastName);
            this.assert('Phone Number', tm.phoneNumber, member.contacts?.[0]?.phoneNumber);
            this.assert('Interests', false, tm.interests === undefined);
            this.assert('Crafts/Interests', tm.interests[0], member.interests?.[0]);
            this.assert('Membership Level', tm.registration.level, member.registration.level);
            Logger.log('All fields verified successfully');
        } catch (err) {
            Logger.log('addMemberRegistration failed: ' + err);
        }
    }

    test_if_system_sends_email_then_user_receives_email() {
        this.membershipManager.sendEmail(this.testEmailAddress, 'Test', 'Just Testing');
    }

    test_if_member_is_added_member_is_found() {
        let member;
        try {
            this.membershipManager.addMember(this.testMemberMinimum);
            member = this.membershipManager.memberLookup(this.testMemberMinimum.emailAddress);
            this.assert("Record", true, !!member);
            this.assert('Email', this.testMemberMinimum.emailAddress, member.emailAddress);
            Logger.log('All fields verified successfully');
        } catch (err) {
            Logger.log('addMember failed: ' + err);
        } finally {
            if (member) {
                this.membershipManager.delete(member);
            }
        }
    }

    test_if_duplicate_member_is_not_added() {
        this.membershipManager.addMember(this.testMemberMinimum); // First insert
        const firstMember = this.membershipManager.memberLookup(this.testMemberMinimum.emailAddress);
        const originalId = firstMember.id;

        this.membershipManager.addMember(this.testMemberMinimum); // Try again
        const secondMember = this.membershipManager.memberLookup(this.testMemberMinimum.emailAddress);
        this.assert('Duplicate id check', originalId, secondMember.id);
    }

    test_if_registration_form_ignores_missing_fields() {
        const partial = new Member({
            emailAddress: 'partial@example.com',
            firstName: 'Partial'
        });

        try {
            this.membershipManager.addMemberRegistration(partial);
            const member = this.membershipManager.memberLookup(partial.emailAddress);
            this.assert('First Name', 'Partial', member.firstName);
            Logger.log('Missing fields handled gracefully');
        } catch (err) {
            Logger.log('Partial form test failed: ' + err);
        }
    }

    test_when_user_logs_in__then_user_status_is_VERIFYING() {
        const emailAddress = this.testMember.emailAddress;
        this.membershipManager.memberLogout(emailAddress);
        const result = this.membershipManager.loginMember(emailAddress);
        this.assert("Success", true, result.success);
        this.assert("Status", "VERIFYING", result.data.login.status);
    }

    test_when_existing_user_logs_in__then_user_status_is_VERIFYING() {
        const emailAddress = this.existingEmailAddress;
        this.membershipManager.memberLogout(emailAddress);
        const result = this.membershipManager.loginMember(emailAddress);
        this.assert("Success", true, result.success);
        this.assert("Status", "VERIFYING", result.data.login.status);
    }

    test_verifyToken_transitions_user_to_VERIFIED() {
        const emailAddress = this.testMember.emailAddress;
        let member = this.membershipManager.memberLookup(emailAddress);
        member.login.status = 'VERIFYING';
        let response = this.membershipManager.updateMember(member);
        member = response.data;
        this.assert("Status", "VERIFYING", member.login.status);

        member = this.membershipManager.memberLookup(emailAddress);
        const authentication = member.login.authentication;
        const token = authentication.token;
        const result = this.membershipManager.verifyMemberToken(emailAddress, token);

        this.assert('Verification success', true, result.success);
        const savedMember = result.data;
        const newAuthentication = savedMember.login.authentication;
        this.assert('Status updated to VERIFIED', 'VERIFIED', result.data.login.status);
        this.assertNotEqual('Expiration Changed', authentication.expirationTime, newAuthentication.expirationTime);
    }

    test_getAllMembers_returns_members() {
        const allResponse = this.membershipManager.getAllMembers({ page: { pageSize: 5 } }); // normalized param
        const all = allResponse.data;
        this.assert("Found Members", true, all.length > 0);

        const page = allResponse.page;
        this.assert("Page Object", true, !!page);

        // Common markers
        this.assert("Has currentPageMarker", true, page.currentPageMarker != null);
        this.assert("Has pageSize", true, Number(page.pageSize) > 0);

        // Back-compat token provided when more pages
        if (page.hasMore === true) {
            this.assert("Next Page Marker", true, page.nextPageMarker != null);
        }
    }

    test_getAllMembers_by_page_returns_members() {
        const resp1 = this.membershipManager.getAllMembers({ page: { currentPageMarker: 1, pageSize: 5 } });
        const page1Members = resp1.data;
        const member1 = page1Members[0];

        const resp2 = this.membershipManager.getAllMembers({ page: { currentPageMarker: 2, pageSize: 5 } });
        const page2Members = resp2.data;
        const member2 = page2Members[0];

        this.assert('Found different members', true, member1.emailAddress != member2.emailAddress);

        // Verify markers increment
        this.assert('Page 1 marker = 1', 1, Number(resp1.page.currentPageMarker));
        this.assert('Page 2 marker = 2', 2, Number(resp2.page.currentPageMarker));
    }

    test_when_a_page_is_requested__then_page_token_is_returned_legacy() {
        const response = this.membershipManager.getAllMembers({ page: { pageSize: 2 } });
        const nextPageMarker = response.page.nextPageMarker;
        this.assert("Page token is returned", true, nextPageMarker != null);

        const nextResponse = this.membershipManager.getAllMembers({ page: { pageSize: 2, currentPageMarker: nextPageMarker } });
        this.assert("Next page token is returned when hasMore", response.page.hasMore === true, nextResponse.page.nextPageMarker != null);

        const firstPageFirstMember = response.data[0];
        const secondPageFirstMember = nextResponse.data[0];
        this.assert("Different members on different pages", true, firstPageFirstMember.id !== secondPageFirstMember.id);
    }

    test_whenAuthenticationIsRequested_thenAuthenticationIsVerified() {
        this.membershipManager.addMemberRegistration(Member.fromObject(this.testMember));
        const member = this.membershipManager.memberLookup(this.testMember.emailAddress);
        const authenticationIn = this.membershipManager.generateAuthentication();
        member.authentication = JSON.stringify(authenticationIn);
        this.membershipManager.updateMember(member);
        const authenticationOut = this.membershipManager.getAuthentication(this.testMember.emailAddress);

        this.assert('Authentication Null', false, !authenticationOut);
        this.assert('Token', authenticationIn.token, authenticationOut.token);
    }

    test_whenFilterIsApplied_thenFilteredDataReturns() {
        // Get a list of members
        const membersResponse = this.membershipManager.getAllMembers({ page: { pageSize: 5 } }); // normalized param to get filters initialized
        const member = membersResponse.data[0];
        const name = member.name;
        const filter = { field: 'name', comparator: 'CONTAINS', value: name };
        const filteredResponse = this.membershipManager.getAllMembers({ page: { pageSize: 5 }, filters: [filter] });
        const filteredMembers = filteredResponse.data;
        this.assert('Found Members', true, filteredMembers.length > 0);
        this.assert('Name matches filter', name, filteredMembers[0].name);
    }

    test_whenMemberIsUpdated_thenMemberData_is_changed() {
        const originalMember = this.membershipManager.memberLookup(this.testMember.emailAddress);
        const memberChanges = new ZohoMember({ id: originalMember.id, name: originalMember.name, registration: originalMember.registration });

        memberChanges.registration.waiverSigned = originalMember.registration.waiverSigned === true ? false : true;
        memberChanges.phoneNumber = originalMember.phoneNumber.split('').reverse().join('');
        memberChanges.registration.status = originalMember.registration.status === 'NEW' ? 'REGISTERED' : 'NEW';
        memberChanges.registration.level = originalMember.registration.level === 'Interested Party' ? 'Active' : 'Interested Party';

        const updatedMember = this.membershipManager.updateMember(memberChanges);

        this.assert('Phone number changed', memberChanges.phoneNumber, updatedMember.phoneNumber);
        this.assert("Waiver Changed", memberChanges.registration.waiverSigned, updatedMember.registration.waiverSigned);
        this.assert("Registration Status Changed", memberChanges.registration.status, updatedMember.registration.status);
        this.assert("Registration level", memberChanges.registration.level, updatedMember.registration.level);
    }

    test_whenMemberIsCreatedFromData_thenAllFieldsAreThere() {
        const newMember = Member.fromObject({
            ...this.testMember,
            registration: { status: this.testMember.memberStatus },
            login: { status: 'UNVERIFIED' }
        });

        this.assert('First Name', this.testMember.firstName, newMember.firstName);
        this.assert('Registration Status', this.testMember.memberStatus, newMember.registration.status);
        this.assert('Login Status', this.testMember.status, newMember.login.status);
    }

    test_getHosts_returns_hosts() {
        const hostsResponse = this.membershipManager.getHosts({ page: { pageSize: 5 } });
        const hosts = hostsResponse.data;
        Logger.log('Hosts:', hosts);
        this.assert('Hosts is array', true, Array.isArray(hosts));
        this.assert('At least one host found', true, hosts.length > 0);
        hosts.forEach((inst, idx) => {
            this.assert(`Host ${idx} has level`, true, typeof inst.registration.level !== 'undefined');
            this.assert(`Host ${idx} has emailAddress`, true, typeof inst.emailAddress !== 'undefined');
        });
    }

    test_StorageManager_add() {
        const storageManager = new SheetStorageManager('tests');
        const testData = { id: '1', title: 'Test Title', timestamp: new Date(), complete: true };

        storageManager.add(testData);
        const loadedData = storageManager.getRecordById(Object, testData.id);

        this.assert('Record added and loaded correctly', JSON.stringify(testData), JSON.stringify(loadedData));
    }

    test_StorageManager_getAll() {
        const storageManager = new SheetStorageManager('tests');

        storageManager.clear();
        const testData1 = { id: '1', title: 'Test Title 1', timestamp: new Date(), complete: true };
        const testData2 = { id: '2', title: 'Test Title 2', timestamp: new Date(), complete: false };

        storageManager.add(testData1);
        storageManager.add(testData2);

        const allRecords = storageManager.getAll(Object);

        this.assert('Correct number of records', 2, allRecords.length);
        this.assert('First record matches', JSON.stringify(testData1), JSON.stringify(allRecords[0]));
        this.assert('Second record matches', JSON.stringify(testData2), JSON.stringify(allRecords[1]));
    }

    test_EventManagerGetsAllEvents() {
        const eventManager = new EventManager();
        const events = eventManager.getEventList();
        this.assert('Events are there', events.length > 0, true);
    }

    test_EventManagerGetsFilteredEvents() {
        const eventManager = new EventManager();
        const events = eventManager.getUpcomingEvents();
        this.assert('Events are there', events.length > 1, true);
    }

    test_when_get_config__then_key_parameters_are_set() {
        const configMerged = getConfig();
        this.assert("Config contains base URL: ", true, configMerged.baseUrl != undefined);
        this.assert("Config point to correct URL", configMerged.mode === 'dev' ? getConfig().dev.baseUrl : getConfig().prod.baseUrl, configMerged.baseUrl);
    }

    test_whenStatusFilterIsApplied_thenOnlyMembersWithThatStatusAreReturned() {
        const filter = { field: 'registration.status', comparator: 'EQUALS', value: 'PENDING' };
        const response = this.membershipManager.getAllMembers({ page: { pageSize: 5 }, filters: [filter] });
        const members = response.data;
        this.assert('Found Members', true, members.length > 0);
        members.forEach((member, idx) => {
            this.assert(`Member ${idx} has Pending status`, 'PENDING', member.registration.status);
        });
    }
}

function runMembershipIntegrationTests() {
    new MembershipIntegrationTests().runAll();
}