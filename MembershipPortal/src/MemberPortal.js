// Main application logic for the member portal dashboard
import { showSpinner, hideSpinner } from './common.js';
import { Portal } from './Portal.js';
import { PortalSession } from './PortalSession.js';
import { Logger } from './Logger.js';
import { Member} from './model/Member.js';
import { Button } from './components/Button.js';
import { TextInput } from './components/TextInput.js';
import { List } from './components/List.js';
import { Card } from './components/Card.js';
import { Container } from './components/Container.js';
import { PortalManager } from './PortalManager.js';
/**
 * MemberPortal class for managing member-specific functionality.
 */
export class MemberPortal extends Portal {
  constructor(session = {}) {
    super(session, 'memberPortal', 'Member');
    this.currentMember = { login: { status: 'UNVERIFIED' } };
    this.event = { id: null };
  }


    initialize() {
    if (this.initialized) return this;
    super.initialize();

//    this.renderDashboard(this.currentMember);
    this.initialized = true;
    return this;
  }


  buildPrefilledFormUrl(section, member) {
    const url = new URL(section.url);
    const entryMap = section.entryMap;
    if (entryMap.emailAddress) url.searchParams.set(entryMap.emailAddress, member.emailAddress);
    if (entryMap.firstName) url.searchParams.set(entryMap.firstName, member.firstName);
    if (entryMap.lastName) url.searchParams.set(entryMap.lastName, member.lastName);
    if (entryMap.name) url.searchParams.set(entryMap.name, `${member.firstName} ${member.lastName}`);
    return url.toString();
  }

  /**
   * Generate the document 
   */
  getDashboardContent(member) {
    logger.debug(`Generating content with ${JSON.stringify(member)} + ${JSON.stringify(this.config)}`);
    let content = new Container();
    content.appendChild(new Message('dashboard', member.message || '', 'dashboard'));

    if (member.firstName && member.lastName) {
      content.appendChild(new Message('welcome-message', `Welcome, ${member.firstName} ${member.lastName}`, 'welcome-message'));
    }

    const card = new Card('login-card');
            
    switch (member.login.status) {
      case 'UNVERIFIED':
        card.appendChild(new Message('login-title', `Member Login`, 'title'));
        card.appendChild(new TextInput("email",'Email Address:', "email", '',true));
        card.appendChild(new Button('verify-email-btn', 'Verify Email', () => this.requestToken()));
 
        break;

      case 'TOKEN_EXPIRED':
      case 'VERIFYING':
        card.appendChild(new Message('verification-message', 'A verification code has been sent to:', 'verification-message', ));
        card.appendChild(new TextInput('email', 'Email Address', 'email', member.emailAddress, true));
        card.appendChild(new Message('token-label', 'Enter the code:', 'token-label'));
        card.appendChild(new TextInput('token', 'Verification Code', 'text', '', false, 6));
        card.appendChild(new Button('verify-code-btn', 'Verify Code', () => this.verifyCode()));
        card.appendChild(new Button('resend-code-btn', 'Resend Code', () => this.resendToken()));
        card.appendChild(new Message('error', member.error || '', 'error'));
        break;

      case 'VERIFIED':
        if (member.registration.status === 'NEW') {
          const registrationUrl = this.buildPrefilledFormUrl(this.config.forms.registration, member);

          card.appendChild(new Message('registration-message', "You're almost done! Please complete your registration below.", 'registration-message'));
          card.appendChild(new Button('complete-registration-btn', 'Complete Registration Form', () => window.open(registrationUrl, '_blank')));
          card.appendChild(new Button('continue-btn', 'Continue', () => memberPortal.requestToken(member.emailAddress)));
        } else if (member.registration.status === 'REGISTERED') {
          const eventId = this.context?.params?.eventId || null;
          if (eventId) {
            Logger.info(`Event ID provided: ${eventId}`);
            card.appendChild(new Message('thank-you-message', 'Thank you for logging in! You can now sign up for your event.', 'thank-you-message'));
            card.appendChild(new Button('sign-up-event-btn', 
              'Sign Up For Event', 
              () => PortalManager.instance.routeTo('event', { eventId: eventId, memberId: member.id })));
          } else {
            card.appendChild(new Message('verification-message', 'Thanks for verifying your email!', 'verification-message'));
            const levelNumber = this.config.levels[member.registration.level].value;
            Logger.info(`Member level: ${member.registration.level} (${levelNumber})`);
            const memberMenu = new List('member-menu');
            memberMenu.addItem(new Button('event-list-btn', 
              'View Upcoming Classes', 
              () => PortalManager.instance.routeTo('event', { viewMode: 'list', memberId: member.id })));
            if (levelNumber >= this.config.levels.Active.value) {
              if (this.config?.forms?.volunteer?.url && this.config?.forms?.volunteer?.entryMap) {
                const volunteerUrl = this.buildPrefilledFormUrl(this.config.forms.volunteer, member);
                memberMenu.addItem(new Button(null, 'Volunteer Hours Form', () => window.open(volunteerUrl, '_blank')));
              }
            }

            if (levelNumber >= this.config.levels.Board.value) {
              memberMenu.addItem(new Button(null, 'Manage Events', () => window.open(`${this.config.baseUrl}?view=event&viewMode=table&memberId=${member.id}`, '_blank')));
            }

            if (levelNumber >= this.config.levels.Administrator.value) {
              memberMenu.addItem(new Button(null, 'Manage Members', () => window.open(`${this.config.baseUrl}?view=admin&adminMode=members&memberId=${member.id}`, '_blank')));
            }
            card.appendChild(memberMenu);

          }
        } else if (member.registration.status === 'APPLIED') {
          const waiverUrl = this.buildPrefilledFormUrl(this.config.forms.waiver, member);
          card.appendChild(new Message('waiver-message', 'One last step! Please sign the required liability waiver to activate your membership.', 'waiver-message'));
          card.appendChild(new Button('sign-waiver-btn', 'Sign Waiver Form', () => window.open(waiverUrl, '_blank')));
          card.appendChild(new Button('continue-btn', 'Continue', () => memberPortal.requestToken(member.emailAddress)));
        } else if (member.registration.status === 'PENDING') {
          card.appendChild(new Message('pending-message', 'Thank you for registering! Your membership is currently <strong>pending</strong> until payment and waiver are verified by an administrator.', 'pending-message'));
          card.appendChild(new Button('continue-btn', 'Continue', () => memberPortal.requestToken(member.emailAddress)));
        } else {
          card.appendChild(new Message('unknown-status-message', `Your membership status is ${member.registration.status.toLowerCase()}.`, 'unknown-status-message'));
        }
        break;

      default:
        card.appendChild(new Message('unknown-status-message', 'Unknown status.', 'unknown-status-message'))  ;
    }
    
    content.appendChild(card);
    content.appendChild(new Message('error', member.error || '', 'error'));

    return content;
  }

  renderDashboard(user) {
    this.clear();
    this.appendChild(this.getDashboardContent(user, this.config));
  }

  requestToken(emailAddress) {
    let email = emailAddress;
    if (!email) {
      // If emailAddress is not provided, get it from the input field
      const emailInput = document.getElementById('email');
      email = emailInput.value.trim();
      emailInput.blur();
    }
    this.currentEmail = email;

    if (!email) {
      this.renderDashboard({ login: { status: 'VERIFYING', error: 'Please enter a valid email address.' } });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      this.renderDashboard({ login: { status: 'VERIFYING', error: 'Please enter a valid email address.' } });
      return;
    }

    showSpinner();
    google.script.run
      .withFailureHandler(e => {
        this.renderDashboard({ login: { status: 'VERIFYING', error: e.message } });
        hideSpinner();
      })
      .withSuccessHandler(res => {
        const response = JSON.parse(res);
        if (response && response.success) {
          const member = response.data;
          this.session.member = new Member(member);
          this.renderDashboard(member);
        } else {
          this.renderDashboard({ login: { status: 'VERIFYING', error: 'Email not found in member registry.' } });
        }
        hideSpinner();
      })
      .login(email);
  }

  verifyCode() {
    const token = document.getElementById('token').value.trim();
    showSpinner();
    google.script.run.withSuccessHandler(res => {
      const response = JSON.parse(res);
      if (!response.success) {
        document.getElementById('error').textContent = response.message;
        return;
      }

      if (response.redirectToForm) {
        const map = response.entryMap;
        const url = response.formUrl + `?${map.email}=${encodeURIComponent(this.currentEmail)}`;
        window.open(url, '_blank');
      } else {
        const member = response.data;
        this.renderDashboard(member);
      }
      hideSpinner();
    }).verifyToken(this.currentEmail, token);
  }

  resendToken() {
    const emailInput = document.getElementById('email');
    const email = emailInput?.value?.trim();
    if (!email) return;

    this.currentEmail = email;

    const resendBtn = Array.from(document.querySelectorAll("button"))
      .find(btn => btn.textContent.includes("Resend"));
    if (resendBtn) {
      resendBtn.disabled = true;
      setTimeout(() => resendBtn.disabled = false, 30000);
    }
    showSpinner();
    google.script.run
      .withFailureHandler(e => {
        this.renderDashboard({ login: { status: 'VERIFYING', error: e.message } });
      })
      .withSuccessHandler(res => {
        hideSpinner();
        const response = JSON.parse(res);
        if (response && response.success) {
          const member = response.data;
          document.getElementById('error').textContent = `Verification code resent to ${member.emailAddress}`;
          this.renderDashboard(member);
        } else {
          this.renderDashboard({ login: { status: 'VERIFYING', error: 'Unable to resend code.' } });
        }
        hideSpinner();
      })
      .login(email);
  }

  logout() {
    showSpinner();
    google.script.run.withSuccessHandler(() => {
      this.renderDashboard({ login: { status: 'UNVERIFIED' } });
      hideSpinner();
    }).logout(this.email);
  }


  open() {
    super.open();
    return this;
  }
}