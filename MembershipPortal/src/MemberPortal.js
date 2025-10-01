// Main application logic for the member portal dashboard
import { showSpinner, hideSpinner } from './common.js';
import { Portal } from './Portal.js';
import { Member } from './model/Member.js';

/**
 * MemberPortal class for managing member-specific functionality.
 */
export class MemberPortal extends Portal {
  constructor(session = {}) {
    super(session, 'memberPortal', 'Member');
    this.currentMember = new Member({ login: { status: 'UNVERIFIED' } });
    this.event = { id: null };
  }

  initialize() {
    if (this.initialized) return this;
    super.initialize();
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

  async requestToken(emailAddress) {
    if (!emailAddress) {
      throw new Error('Email address is required to request a token.');
    }

    showSpinner();
    try {
      const response = await new Promise((resolve, reject) => {
        google.script.run
          .withFailureHandler((e) => reject(new Error(e.message)))
          .withSuccessHandler((res) => resolve(JSON.parse(res)))
          .login(emailAddress);
      });

      if (response && response.success) {
        const member = new Member(response.data);
        this.session.member = member;
        return member; // Return the updated member
      } else {
        throw new Error('Email not found in member registry.');
      }
    } finally {
      hideSpinner();
    }
  }

  async verifyCode(emailAddress, token) {
    if (!token) {
      throw new Error('Verification token is required.');
    }

    showSpinner();
    try {
      const response = await new Promise((resolve, reject) => {
        google.script.run
          .withFailureHandler((e) => reject(new Error(e.message)))
          .withSuccessHandler((res) => resolve(JSON.parse(res)))
          .verifyToken(emailAddress, token);
      });

      if (response && response.success) {
        if (response.redirectToForm) {
          const map = response.entryMap;
          const url = response.formUrl + `?${map.email}=${encodeURIComponent(this.currentMember.emailAddress)}`;
          window.open(url, '_blank');
        } else {
          const member = new Member(response.data);
          this.session.member = member;
          this.currentMember = member;
          return member; // Return the updated member
        }
      } else {
        throw new Error('Invalid verification code.');
      }
    } finally {
      hideSpinner();
    }
  }

  async resendToken(emailAddress) {
    
    showSpinner();
    try {
      const response = await new Promise((resolve, reject) => {
        google.script.run
          .withFailureHandler((e) => reject(new Error(e.message)))
          .withSuccessHandler((res) => resolve(JSON.parse(res)))
          .login(emailAddress);
      });

      if (response && response.success) {
        const member = new Member(response.data);
        this.session.member = member;
        this.currentMember = member;
        return member; // Return the updated member
      } else {
        throw new Error('Unable to resend verification code.');
      }
    } finally {
      hideSpinner();
    }
  }

  logout(emailAddress) {
    showSpinner();
    google.script.run.withSuccessHandler(() => {
      hideSpinner();
    }).logout(emailAddress);
  }
}