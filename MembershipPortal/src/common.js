export function processURLParams() {
    const currentMember = JSON.parse(document.getElementById('member-data').textContent);
    window.currentMember = currentMember;
    const sharedConfig = JSON.parse(document.getElementById('shared-config').textContent);
    window.sharedConfig = sharedConfig;
}

export function showSpinner() {
    console.log("Showing spinner");
    document.getElementById('spinner').classList.remove('hidden');
    document.getElementById('spinner').classList.add('show');
}

export function hideSpinner() {
    console.log("Hiding spinner");
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('spinner').classList.add('hidden');
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

