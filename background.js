let intervalId = null;

// Function to calculate and update earned amount
function updateEarnings() {
    chrome.storage.local.get(['hourlyRate', 'startTime', 'isRunning', 'scheduleStart', 'scheduleStop'], (data) => {
        if (data.isRunning && data.hourlyRate && data.startTime) {
            if (shouldBeRunning(data.scheduleStart, data.scheduleStop)) {
                const elapsedSeconds = (new Date().getTime() - data.startTime) / 1000;
                const newAmount = (data.hourlyRate / 3600) * elapsedSeconds;
                chrome.storage.local.set({ currentAmount: newAmount });
            }
        }
    });
}

// Set up periodic updates
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateEarnings') {
        updateEarnings();
    }
});

// Listen for when tracking starts/stops
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.isRunning) {
        if (changes.isRunning.newValue) {
            // Start the alarm when tracking starts
            chrome.alarms.create('updateEarnings', { periodInMinutes: 0.5 });
            // Run updateEarnings immediately
            updateEarnings();
        } else {
            // Clear the alarm when tracking stops
            chrome.alarms.clear('updateEarnings');
        }
    }
});

// Run updateEarnings when the service worker starts
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['isRunning'], (data) => {
        if (data.isRunning) {
            updateEarnings();
            chrome.alarms.create('updateEarnings', { periodInMinutes: 0.5 });
        }
    });
});

function shouldBeRunning(startTime, stopTime) {
    if (!startTime || !stopTime) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [stopHour, stopMinute] = stopTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const stopMinutes = stopHour * 60 + stopMinute;

    return currentTime >= startMinutes && currentTime < stopMinutes;
}
