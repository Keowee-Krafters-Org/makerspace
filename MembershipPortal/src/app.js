import './style/style.css';
import './style/member.css';
import './style/admin.css';
import './style/event.css';
import { PortalManager } from './PortalManager.js';

/**
 * Initialize the Portal Manager once the window renders.
 */

document.addEventListener('DOMContentLoaded', () => {
    window.onload = PortalManager.start();
});
