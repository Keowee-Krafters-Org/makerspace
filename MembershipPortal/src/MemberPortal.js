// Main application logic for the member portal dashboard
import { showSpinner, hideSpinner } from './common.js';
import { Portal } from './Portal.js';
import { PortalSession } from './PortalSession.js';
import { Logger } from './Logger.js';
import { Member} from './model/Member.js';
export class MemberPortal extends Portal {
  constructor(session = {}) {
    super(session, 'memberSection', 'Member');
    this.currentMember = { login: { status: 'UNVERIFIED' } };
    this.event = { id: null };
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
    console.log(`Generating content with ${JSON.stringify(member)} + ${JSON.stringify(this.config)}`);
    let content = '<div class="dashboard">';

    if (member.firstName && member.lastName) {
      content += `<h2>Welcome, ${member.firstName} ${member.lastName}</h2>`;
    }

    switch (member.login.status) {
      case 'UNVERIFIED':
        content += `<h2>Member Login</h2>
                <label for="email">Email Address:</label>
                <input type="email" id="email" required />
                <div id="step1">
                    <button onclick="memberPortal.requestToken()">Verify Email</button>
                </div>
                <p id="error" class="error">${member.error || ''}</p>`;
        break;

      case 'TOKEN_EXPIRED':
      case 'VERIFYING':
        content += `<p>A verification code has been sent to:</p>
                <input type="email" id="email" value="${member.emailAddress}" />
                <p><label for="token">Enter the code:</label></p>
                <input type="text" id="token" maxlength="6" />
                <p>
                    <button onclick="memberPortal.verifyCode()">Verify Code</button>
                    <button onclick="this.resendToken()">Resend Code</button>
                </p>
                <p id="error" class="error">${member.error || ''}</p>`;
        break;

      case 'VERIFIED':
        if (member.registration.status === 'NEW') {
          const registrationUrl = this.buildPrefilledFormUrl(this.config.forms.registration, member);
          content += `<p>You're almost done! Please complete your registration below.</p>
                    <p><button onclick="window.open('${registrationUrl}', '_blank')">Complete Registration Form</button></p>
                    <p><button onclick="memberPortal.requestToken('${member.emailAddress}')">Continue</button></p>`;
        } else if (member.registration.status === 'REGISTERED') {
          if (this.event && this.event.id !== 'null') {
            console.log(`Event ID provided: ${this.event.id}`);
            content += `<p>Thank you for logging in! You can now sign up for your event.</p>`;
            content += `<p><button onclick="window.open('${this.config.baseUrl}?view=event&memberId=${member.id}&eventId=${this.event.id}', '_blank')">Sign Up For Event</button></p>`;
          } else {
            content += '<p>Thanks for verifying your email!</p>';
            const levelNumber = this.config.levels[member.registration.level].value;
            console.log(`Member level: ${member.registration.level} (${levelNumber})`);
            content += `<ul>
                        <li><button onclick="window.open('${this.config.baseUrl}?view=event&memberId=${member.id}', '_blank')">View Upcoming Classes</button></li>`;

            if (levelNumber >= this.config.levels.Active.value) {
              if (this.config?.forms?.volunteer?.url && this.config?.forms?.volunteer?.entryMap) {
                const volunteerUrl = this.buildPrefilledFormUrl(this.config.forms.volunteer, member);
                content += `<li><button onclick="window.open('${volunteerUrl}', '_blank')">Volunteer Hours Form</button></li>`;
              }
            }

            if (levelNumber >= this.config.levels.Board.value) {
              content += `<li><button onclick="window.open('${this.config.baseUrl}?view=event&viewMode=table&memberId=${member.id}', '_blank')">Manage Events</button></li>`;
            }

            if (levelNumber >= this.config.levels.Administrator.value) {
              content += `<li><button onclick="window.open('${this.config.baseUrl}?view=admin&adminMode=members&memberId=${member.id}', '_blank')">Manage Members</button></li>`;
            }

            content += '</ul>';
          }
        } else if (member.registration.status === 'APPLIED') {
          const waiverUrl = this.buildPrefilledFormUrl(this.config.forms.waiver, member);
          content += `<p>One last step! Please sign the required liability waiver to activate your membership.</p>
                    <p><button onclick="window.open('${waiverUrl}', '_blank')">Sign Waiver Form</button></p>
                    <p><button onclick="memberPortal.requestToken('${member.emailAddress}')">Continue</button></p>`;
        } else if (member.registration.status === 'PENDING') {
          content += `<p>Thank you for registering! Your membership is currently <strong>pending</strong> until payment and waiver are verified by an administrator.</p>
                    <p>Once verified, you will receive an email with further instructions.</p>
                    <p><button onclick="memberPortal.requestToken('${member.emailAddress}')">Continue</button></p>`;
        } else {
          content += `<p>Your membership status is ${member.registration.status.toLowerCase()}.</p>`;
        }
        break;

      default:
        content += `<p>Unknown status.</p>`;
    }

    content += '</div>';
    return content;
  }

  renderDashboard(user) {
    this.div.innerHTML = this.getDashboardContent(user, this.config);
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

  initialize() {
    if (this.initialized) return this;
    super.initialize();

    this.initialized = true;
    return this;
  }

  open() {
    super.open();
    this.renderDashboard(this.currentMember);
  }
}