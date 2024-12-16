// Define helper functions first
function getCurrencySymbol(currency) {
    const match = currency.match(/\((.*?)\)/);
    return match ? match[1] : '$';
}

function formatMoney(amount, symbol) {
    return `${symbol}${amount.toFixed(2)}`;
}

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

function updateDisplay() {
    chrome.storage.local.get(['isRunning', 'currentAmount', 'currency', 'hourlyRate', 'startTime', 'scheduleStart', 'scheduleStop'], (data) => {
        if (data.isRunning && data.hourlyRate && data.startTime) {
            if (shouldBeRunning(data.scheduleStart, data.scheduleStop)) {
                const elapsedSeconds = (new Date().getTime() - data.startTime) / 1000;
                const currentAmount = (data.hourlyRate / 3600) * elapsedSeconds;
                const currencySymbol = getCurrencySymbol(data.currency);
                totalCounter.textContent = formatMoney(currentAmount, currencySymbol);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const rateForm = document.getElementById('rateForm');
    const totalCounter = document.getElementById('totalCounter');

    // Check if counter is running and update UI
    chrome.storage.local.get(['isRunning'], (data) => {
        if (data.isRunning) {
            const submitButton = rateForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Stop';
            updateDisplay();
        }
    });

    // Update counter display every second when popup is open
    const displayInterval = setInterval(updateDisplay, 1000);

    // Clean up interval when popup closes
    window.addEventListener('unload', () => {
        clearInterval(displayInterval);
    });

    rateForm.addEventListener('submit', function(event) {
        event.preventDefault();

        chrome.storage.local.get(['isRunning'], (data) => {
            if (data.isRunning) {
                // Stop tracking
                chrome.storage.local.set({
                    isRunning: false,
                    currentAmount: 0
                });
                const submitButton = rateForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Start';
                totalCounter.textContent = '0.00';
            } else {
                // Start tracking
                const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
                const currency = document.getElementById('currency').value;
                const scheduleStart = document.getElementById('startTime').value;
                const scheduleStop = document.getElementById('stopTime').value;

                // Only use scheduled time if both start and stop times are provided
                let startTimestamp = new Date().getTime();
                if (scheduleStart && scheduleStop) {
                    const now = new Date();
                    const [startHour, startMinute] = scheduleStart.split(':').map(Number);
                    const scheduleStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute);
                    startTimestamp = scheduleStartDate.getTime();
                }

                chrome.storage.local.set({
                    hourlyRate: hourlyRate,
                    currency: currency,
                    isRunning: true,
                    startTime: startTimestamp,
                    currentAmount: 0,
                    scheduleStart: scheduleStart,
                    scheduleStop: scheduleStop
                });

                const submitButton = rateForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Stop';
            }
        });
    });
});
