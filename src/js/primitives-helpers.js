//
// Helpers
//
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

jQuery.fn.shuffle = function () {
  var j;
  for (var i = 0; i < this.length; i++) {
    j = Math.floor(Math.random() * this.length);
    $(this[i]).before($(this[j]));
  }
  return this;
};

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

function randomSubset(original, including, total_num) {
  var new_arr = [];
  for (var i = 0; i < original.length; i++) {
    if (including.indexOf(original[i]) < 0) {
      new_arr.push(original[i]);
    }
  }
  shuffle(new_arr);
  var num_to_add = total_num - including.length;
  var return_arr = [];
  if (num_to_add > 0) {
    return_arr = new_arr.slice(0, num_to_add);
  }
  return_arr = return_arr.concat(including);
  shuffle(return_arr);
  return return_arr;
}

function randomElement(items) {
  return items[Math.floor(Math.random()*items.length)];
}

function randomElementExcept(items, excepts) {
  var new_arr = [];
  for (var i = 0; i < items.length; i++) {
    if (excepts.indexOf(items[i]) < 0) {
      new_arr.push(items[i]);
    }
  }
  return randomElement(new_arr);
}

function LapTimer() {
  this.start_time = new Date();
  this.curr_time = this.start_time;
  this.start = function() {
    this.start_time = new Date();
    this.curr_time = this.start_time;
  };
  this.lap = function() {
    var nd = new Date();
    var elapsed = nd - this.curr_time;
    this.curr_time = nd;
    return elapsed;
  };
  this.lap_extra = function() {
    var lap_start = this.curr_time - this.start_time;
    var elapsed = new Date() - this.curr_time;
    this.curr_time = new Date();
    return lap_start + ";" + elapsed;
  };
  this.start_ms = function() {
    return this.start_time.getTime() / 1000;
  };
}

function InteractionTimer() {
  this.s_time = new Date();
  this.curr_time = this.s_time;
  this.started = false;
  this.num_touches = 0;
  this.touch = function() {
    var curr_time = new Date();
    if (!this.started) {
      this.s_time = curr_time;
      this.started = true;
    }
    this.curr_time = curr_time;
    this.num_touches++;
  };
  this.start_time = function() {
    if (this.started) {
      return this.s_time.getTime() / 1000;
    } else {
      return -1;
    }
  };
  this.activated = function() {
    return this.started;
  };
  this.elapsed = function() {
    return this.curr_time - this.s_time;
  };
  this.touches = function() {
    return this.num_touches;
  };
  this.dump = function() {
    return [this.start_time() + ";" + this.elapsed()];
  };
}

function GeneralTimer(num_seconds, start_function, expire_function) {
  this.start_time = new Date();
  this.num_ms = num_seconds * 1000;
  this.active = false;
  this.last_remaining_time = 0;
  this.expired = function() {
    return this.active && (new Date() - this.start_time) > this.num_ms;
  };
  this.start = function() {
    this.start_time = new Date();
    if (this.num_ms >= 0) {
      this.active = true;
      start_function();
      this.loop();
    } else {
      $("#seconds_left").html("No time limit.");
    }
  };
  this.stop = function() {
    this.active = false;
    $("#seconds_left").html("");
  };
  this.loop = function() {
    if (this.active) {
      var remaining_time = this.num_ms - (new Date() - this.start_time);
      if (remaining_time > 0) {
        var lr = 0;
        if (this.num_ms < 1000) {
          lr = (Math.round(remaining_time / 1000.0 * 10) / 10).toFixed(1);
        } else {
          lr = (Math.round(remaining_time / 1000.0 * 2) / 2).toFixed(1);
        }
        if (lr != this.last_remaining_time) {
          this.last_remaining_time = lr;
          $("#seconds_left").html("<b>" + lr + "</b> seconds left");
        }
        var _this = this;
        setTimeout(function() { _this.loop(); }, 20);
      } else {
        $("#seconds_left").html("<b>Time's up!</b>");
        $("#errors").html("");
        expire_function();
      }
    }
  };
}

function randomIntFromInterval(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}

function objectBoolean() { this.value = false; }
function objectInteger() { this.value = 0; }

function randomTextReplacer() {
  $("input[name]").each(function() {
    $(this).attr("name", $(this).attr("name").replace(new RegExp("#RND[0-9]*#", 'g'), ""));
  });
  $("input[id]").each(function() {
    $(this).attr("id", $(this).attr("id").replace(new RegExp("#RND[0-9]*#", 'g'), ""));
  });
  $("textarea[name]").each(function() {
    $(this).attr("name", $(this).attr("name").replace(new RegExp("#RND[0-9]*#", 'g'), ""));
  });
  $("textarea[id]").each(function() {
    $(this).attr("id", $(this).attr("id").replace(new RegExp("#RND[0-9]*#", 'g'), ""));
  });
}

//
// Specific Helpers
//

jQuery.fn.getSelectionStart = function(){
    if(this.lengh == 0) return -1;
    input = this[0];
 
    var pos = input.value.length;
 
    if (input.createTextRange) {
        var r = document.selection.createRange().duplicate();
        r.moveEnd('character', input.value.length);
        if (r.text == '') 
        pos = input.value.length;
        pos = input.value.lastIndexOf(r.text);
    } else if(typeof(input.selectionStart)!="undefined")
    pos = input.selectionStart;
 
    return pos;
};

jQuery.fn.setSelection = function(selectionStart, selectionEnd) {
    if(this.lengh == 0) return this;
    input = this[0];
 
    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
 
    return this;
};

jQuery.fn.setCursorPosition = function(position){
    if(this.lengh == 0) return this;
    return $(this).setSelection(position, position);
};

jQuery.fn.getCursorPosition = function(){
    if(this.lengh == 0) return -1;
    return $(this).getSelectionStart();
};

function getURIParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var r = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var res = r.exec(location.search);
    return res === null ? "" : decodeURIComponent(res[1].replace(/\+/g, " "));
}

//
// IE AJAX Enable
//
jQuery.support.cors = true;
