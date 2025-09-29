import { reactive } from 'vue';

export const spinnerState = reactive({
  visible: false,
});

export function processURLParams() {
    const currentMember = JSON.parse(document.getElementById('member-data').textContent);
    window.currentMember = currentMember;
    const sharedConfig = JSON.parse(document.getElementById('shared-config').textContent);
    window.sharedConfig = sharedConfig;
}

export function showSpinner() {
  console.log('Showing spinner');
  spinnerState.visible = true;
}

export function hideSpinner() {
  console.log('Hiding spinner');
  spinnerState.visible = false;
}

export function isAdministrator(user) {
    return user && user.registration && sharedConfig.levels[user.registration.level].value >= sharedConfig.levels.Administrator.value;
}

export function hideContainers() {


    document.getElementById('eventTab').addEventListener('click', () => {
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('eventSection').style.display = 'block';
        document.getElementById('memberSection').style.display = 'none';
    });

    document.getElementById('memberTab').addEventListener('click', () => {
        document.getElementById('adminSection').style.display = 'none';
        document.getElementById('eventSection').style.display = 'none';
        document.getElementById('memberSection').style.display = 'block';
    });

}
export function initialize() {
    processURLParams();
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'member';

    hideContainers();
    if (view === 'admin') {
        document.getElementById('adminTab').click();
    } else if (view === 'event') {
        document.getElementById('eventTab').click();
    } else {
        document.getElementById('memberTab').click();
    }

    const isEmbedded = window.self !== window.top;
    if (isEmbedded) {
        console.log("Running inside Google Sites iframe");
    }
}

