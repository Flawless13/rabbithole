// helper functions
function pad(val) {
    return val > 9 ? val : "0" + val;
}

function timeToString(value) {
    var sec = pad(parseInt(value / 1) % 60);
    var min = pad(parseInt(value / 60) % 60);
    var hr = pad(parseInt(value / 3600) % 24);
    var day = pad(parseInt(value / 86400));
    return day + hr + min + sec;
}

// to make a cool clock out of a span
var clockify = function(start_time) {
    var Clock = (function(){
        var exports = function(element) {
            this._element = element;
            var html = '<div>';
            for (var i=0;i<8;i++) {
                html += '<span>&nbsp;</span>';
                if(i % 2 == 1 && i < 7)
                    html += ":";
            }
            html += "<p style=\"font-size:12px;\">"
            for(var i = 0; i < 9; i++)
                html += "&nbsp"
            html += "Days"
            for(var i = 0; i < 30; i++)
                html += "&nbsp"
            html += "Hours"
            for(var i = 0; i < 28; i++)
                html += "&nbsp"
            html += "Minutes"
            for(var i = 0; i < 27; i++)
                html += "&nbsp"
            html += "Seconds"
            html += "</p>"
            this._element.innerHTML = html;
            this._slots = this._element.getElementsByTagName('span');
            this._tick(start_time);
        };

        exports.prototype = {
            _tick:function(start_time) {
                var diff_time = ((new Date()) - start_time) / 1000;
                this._update(timeToString(diff_time));
                var self = this;
                setTimeout(function(){
                    self._tick(start_time);
                },1000);
            },
            _update:function(timeString) {
                var i=0,l=this._slots.length,value,slot,now;
                for (;i<l;i++) {
                    value = timeString.charAt(i);
                    slot = this._slots[i];
                    now = slot.dataset.now;
                    if (!now) {
                        slot.dataset.now = value;
                        slot.dataset.old = value;
                        continue;
                    }
                    if (now !== value) {
                        this._flip(slot,value);
                    }
                }
            },

            _flip:function(slot,value) {
                slot.classList.remove('flip');
                slot.dataset.old = slot.dataset.now;
                slot.dataset.now = value;
                slot.offsetLeft;
                slot.classList.add('flip');
            }
        };
        return exports;
    }());
    new Clock(document.querySelector('.clock'))
}
