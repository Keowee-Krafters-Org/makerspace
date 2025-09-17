

function showSpinner() {
    Logger.log("Showing spinner");
    document.getElementById('spinner').classList.remove('hidden');
    document.getElementById('spinner').classList.add('show');
}

function hideSpinner() {
    Logger.log("Hiding spinner");
    document.getElementById('spinner').classList.remove('show');
    document.getElementById('spinner').classList.add('hidden');
}



function isAdministrator(user) {
    return user && user.registration && sharedConfig.levels[user.registration.level].value >= sharedConfig.levels.Administrator.value;
}
