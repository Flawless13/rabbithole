var watch, clocktimer;
window.onload = function() {
    watch = new Stopwatch("mywatch");
};

function startWatch() {
    clocktimer = setInterval("watch.update(false)", 100);
    watch.start();
}

function pauseWatch() {
    watch.stop();
    clearInterval(clocktimer);
}

function resetWatch() {
    watch.reset();
}
