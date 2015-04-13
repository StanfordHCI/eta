//
// Base Primitives Object
//
var PT = {
  order: [],
  practice_ids: [],
  order_start_fns: [],
  order_end_fns: [],
  order_index: 0,
  next_timings: [],
  next_timer: new LapTimer(),
  interaction_timers: {},
  question_timers: {},
  is_completed: false,
  is_showing_modal: false,
  completion_fns: [],
  initialization_fns: {},
  initialization_bools: {},
  general_timers: {},
  window_focus: [],
  window_focuses: [],
  window_blur_time: new Date(),
  window_load_time: new Date(),
  completion_arrays: {},
  is_prepared: false,
  exp_name: "Untitled"
};

PT.resetVariables = function(exp_name) {
  this.order = [];
  this.practice_ids = [];
  this.order_start_fns = [];
  this.order_end_fns = [];
  this.order_index = 0;
  this.next_timings = [];
  this.next_timer = new LapTimer();
  this.interaction_timers = {};
  this.question_timers = {};
  this.is_completed = false;
  this.is_showing_modal = false;
  this.completion_fns = [];
  this.initialization_fns = {};
  this.initialization_bools = {};
  this.general_timers = {};
  this.window_focus = [];
  this.window_focuses = [];
  this.window_blur_time = new Date();
  this.window_load_time = new Date();
  this.completion_arrays = {};
  this.is_prepared = false;
  this.exp_name = exp_name;
};

PT.addPage = function(page_id, start_fn, end_fn) {
  page_id = typeof page_id == "object" ? page_id.attr("id") : page_id;
  start_fn = typeof start_fn !== 'undefined' ? start_fn : function() {};
  end_fn = typeof end_fn !== 'undefined' ? end_fn : function() { return true; };
  var html = $("#" + page_id).html();
  assert(this.order.indexOf(page_id) < 0, "Page Id For " + page_id + " Exists!");
  this.order.push(page_id);
  this.order_start_fns.push(start_fn);
  this.order_end_fns.push(end_fn);
};

PT.addPracticeId = function(page_id) {
  this.practice_ids.push(page_id);
};

PT.remoteSave = function() {
  var _this = this;
  $(":input").removeAttr("disabled");
  _this.completeTaskFinally();
};

PT.completeTaskFinally = function() {
  this.is_completed = true;
  $("#submitButton").val("Submit").removeAttr("disabled");
  $("#submitButton").click(function() {
    $(this).attr("disabled", "disabled").val("Submitting...");
    $("form").submit();
  });
};

PT.completeTask = function() {
  var _this = this;

  var valid_input_identifier = /^[a-zA-Z0-9-_]+$/;
  $("input, textarea").each(function() {
    if (typeof $(this).attr("name") != "undefined" && $(this).attr("name").search(valid_input_identifier) == -1) {
      assert(false, "Invalid Input: " + $(this).attr("name"));
    }
    if (typeof $(this).attr("id") != "undefined" && $(this).attr("id").search(valid_input_identifier) == -1) {
      assert(false, "Invalid Input: " + $(this).attr("id"));
    }
  });

  for (var input_id in _this.interaction_timers) {
    var h = "<input type=\"hidden\" id=\"" + input_id + "_timer\" name=\"" + input_id + "_timer\" value=\"" + _this.interaction_timers[input_id].start_time() + "|" + _this.interaction_timers[input_id].elapsed() + "\">";
    $("#hidden_questions").append($(h));
  }
  for (var input_id in _this.general_timers) {
    var h = "<input type=\"hidden\" id=\"" + input_id + "_gtimer\" name=\"" + input_id + "_gtimer\" value=\"" + _this.general_timers[input_id].dump().join("|") + "\">";
    $("#hidden_questions").append($(h));
  }
  for (var array_id in _this.completion_arrays) {
    var h = "<input type=\"hidden\" id=\"" + array_id + "\" name=\"" + array_id + "\" value=\"" + _this.completion_arrays[array_id].join("|") + "\">";
    $("#hidden_questions").append($(h));
  }

  $("#order").val(_this.order.join("|"));
  $("#start_timing").val(_this.next_timer.start_ms());
  $("#next_timings").val(_this.next_timings.join("|"));
  $("#window_focuses").val(_this.window_focuses.join("|"));
  $("#practice_ids").val(_this.practice_ids.join("|"));
  var tlimits = [];
  var inrupts = [];
  for(var i = 0; i < _this.order.length; i++) {
    q_id = _this.order[i];
    if (typeof _this.question_timers[q_id] != "undefined") {
      tlimits.push(_this.question_timers[q_id].num_ms);
    } else {
      tlimits.push(-1);
    }
  }
  $("#time_limits").val(tlimits.join("|"));
  $("#browser_info").val(navigator.userAgent);

  for (var i = 0; i < _this.completion_fns.length; i++) {
    _this.completion_fns[i]();
  }

  $("#btn-next").hide();
  $("#submitButton").show().val("Please wait...").attr("disabled", "disabled");

  this.remoteSave(); // Save results and enable submit button
};

PT.check_and_start = function(name) {
  this.initialization_bools[name] = true;
  for (var f in this.initialization_bools) {
    if (!this.initialization_bools[f]) {
      return;
    }
  }
  // Start
  $("#btn-next").removeAttr('disabled');
  $("#errors").html("");
  this.next_timer.start();
};

PT.add_initialization_fn = function(name, fn) {
  this.initialization_fns[name] = fn;
  this.initialization_bools[name] = false;
};

PT.set_ip_address = function(ip_address) {
  $("#ip_address").val(ip_address);
};

PT.prepare = function(exp_name) {
  PT.resetVariables(exp_name);

  // Make sure all required elements exist
  var required_elts = ["#container", "form", ".instructions_start", ".instructions", ".base_q", ".end_comments"];
  for (var i = 0; i < required_elts.length; i++) {
    assert($(required_elts[i]).length == 1, "Missing Element / Multiple Elements: " + required_elts[i]);
  }

  // Verify reserved ids don't exist
  var reserved_elts = ["#questions", "#hidden_questions", "#bot-bar", "#seconds_left", "#errors", "#btn-next"];
  for (var i = 0; i < reserved_elts.length; i++) {
    assert($(reserved_elts[i]).length == 0, "You can't use the reserved element with selector: " + reserved_elts[i]);
  }

  // Add HTML elements
  var top_bar = "<div class=\"row\"><div class=\"col-md-12 top-bar\"></div></div>";
  $("#container").prepend($(top_bar));
  var bottom_bar = "<div id=\"questions\"></div>";
  bottom_bar += "<div class=\"row\" id=\"bot-bar\">";
  bottom_bar += "<div class=\"col-md-12 bottom-bar\" id=\"bar_bottom\">";
  bottom_bar += "<div class=\"pull-left\" style=\"padding: 8px;\"><span id=\"seconds_left\">&nbsp;</span></div>";
  bottom_bar += "<span id=\"errors\">Loading...</span>&nbsp;";
  bottom_bar += "<input type=\"button\" class=\"btn btn-lg btn-primary\" id=\"btn-next\" disabled=\"disabled\" value=\"Next\">";
  bottom_bar += "<input type=\"button\" id=\"submitButton\" value=\"Submit\" class=\"btn btn-lg btn-success\" />";
  bottom_bar += "</div></div>";
  bottom_bar += "<div id=\"hidden_questions\"></div>";
  $("#container").append($(bottom_bar));

  // Add hidden form elements
  var hidden_elts = ['order', 'start_timing', 'next_timings', 'time_limits', 'window_focuses', 'practice_ids', 'ip_address', 'browser_info'];
  for (var i = 0; i < hidden_elts.length; i++) {
    $r = $("<input type=\"hidden\" name=\"" + hidden_elts[i] + "\" id=\"" + hidden_elts[i] + "\" value=\"\">");
    $("#hidden_questions").append($r);
  }

  // Beginning Instructions
  var $start = $(".instructions_start").addClass("row question").attr("id", "instructions_start").detach();
  $("#questions").append($start);
  PT.addPage($start.attr("id"));

  // Store Instructions and Question Templates
  this.$instructions = $(".instructions").addClass("row question").detach();
  this.$instructions_practice = $(".instructions_practice").addClass("row question").detach();
  this.$base_q = $(".base_q").addClass("row question").detach();
  this.$end = $(".end_comments").addClass("row question").attr("id", "end_comments").detach();

  this.is_prepared = true;
}

PT.build_questions = function(question_metadata, question_data) {
  var image_index = 0; var question_id = 1;
  var seen_ids = {};
  var time_limits = question_metadata.time_limits;    
  shuffle(time_limits);
  var num_reps = question_metadata.num_reps;

  // Add practice questions
  time_limits.unshift(question_metadata.practice_time_limit);
  num_reps.unshift(question_metadata.practice_num_reps);

  // Sanity checks
  assert(time_limits.length == num_reps.length,
    "# of provided time_limits must match # of provided num_reps.");
  assert(num_reps.reduce(function(a, b) { return a + b; }) <= question_data.length,
    "Insufficient # of questions provided for the # of repetitions desired.");
  
  for (var j = 0; j < time_limits.length; j++) {
    var n_seconds = time_limits[j];
    
    var is_practice = (j == 0);

    // Instructions
    var $i = this.$instructions.clone();
    var i_html = $i.html();
    if (is_practice) {
      i_html = i_html.replace(new RegExp("#PRACTICE_STRING#", 'g'), "(Practice)");
    } else {
      i_html = i_html.replace(new RegExp("#PRACTICE_STRING#", 'g'), "");
    }
    i_html = i_html.replace(new RegExp("#TIME_LIMIT#", 'g'), n_seconds);
    if (n_seconds == -1) {
      i_html = i_html.replace(new RegExp("#TIME_LIMIT_STRING#", 'g'), "no time limit");      
    } else {
      i_html = i_html.replace(new RegExp("#TIME_LIMIT_STRING#", 'g'), "up to " + n_seconds + " seconds");
    }
    i_html = i_html.replace(new RegExp("#NUM_REPS#", 'g'), num_reps[j]);
    $i.html(i_html);
    $i.attr("id", "q" + question_id + "_ins");
    $("#questions").append($i);
    $i.hide();
    PT.addPage($i.attr("id"));

    for (var i = 0; i < num_reps[j]; i++) {
      var qdata = question_data[image_index++];

      // Sanity checks
      assert('ID' in qdata, "Every question must have a field called \"ID\".");
      assert(qdata['ID'].toString().length > 0, "Every question ID must be non-empty.");
      assert(!(qdata['ID'] in seen_ids), "Every question ID must be unique.");
      seen_ids[qdata['ID']] = true;

      // Question
      var $r = this.$base_q.clone();
      var r_html = $r.html();
      for (var key in qdata) {
        r_html = r_html.replace(new RegExp("#" + key + "#", 'g'), qdata[key])
      }
      $r.html(r_html);
      $r.find("input").each(function() {
        assert($(this).attr("name") != "eta_id", "You can't name a form element \"eid\".");
        $(this).attr("name", "q" + question_id + "_" + $(this).attr("name"));
        $(this).data("input_id", $(this).attr("name"));
      });
      $r.attr("id", "q" + question_id + "_box");
      $id_field = $("<input type=\"hidden\" name=\"q" + question_id + "_eid\" value=\"" + qdata['ID'] + "\">")
      $r.append($id_field);
      $("#questions").append($r);
      $r.hide();

      var page_id = $r.attr("id");
      if (is_practice) { PT.addPracticeId(page_id); }
      
      PT.addPage(page_id, function(page_id) {
        return function() {
          PT.question_timers[page_id].start();
        }
      } (page_id), function(j, question_id, is_practice) { 
        return function() {
          var failed = false;
          var input_radios = {};
          $("#" + j + " :input").each(function() {
            if ($(this).attr("type") == "radio") {
              input_radios[$(this).attr("name")] = true;
            } else if ($(this).val().length == 0) {
              $(this).addClass("text-error");
              $("#errors").html("Did you fill out everything?");
              failed = true;
            } else {
              $(this).removeClass("text-error");
            }
          });
          for (input_radio in input_radios) {
            if ($("input[name=" + input_radio + "]:checked").length == 0) {
              $("#errors").html("Did you select an answer?");
              failed = true;
            }
          }
          if (failed && !PT.question_timers[j].expired()) {
            return false;
          }
          PT.question_timers[j].stop();
          $("#errors").html("");
          return true;
        }
      } (page_id, question_id, is_practice));
      PT.question_timers[page_id] = new GeneralTimer(n_seconds,
        function() {},
        function(j) { 
          return function() {
            $("#" + j + " :input").attr("disabled", "disabled");
            $("#" + j + " .radio").addClass("disabled");
          }
        } (page_id)
      );
      question_id++;
    } // ENDFOR Repetitions
  } // ENDFOR Time Limit

  //
  // End Comments
  //
  $("#questions").append(this.$end);
  this.$end.hide();
  PT.addPage(this.$end.attr("id"));
}

PT.initialize = function(question_metadata, question_data) {
  assert(this.is_prepared, "Call PT.prepare before calling PT.initialize.");

  var _this = this;

  //
  // Sanity Checks
  //
  // Ensure that orders are the same
  assert(_this.order.length == _this.order_start_fns.length && _this.order.length == _this.order_end_fns.length, "Orders don't match");
  // Ensure that all required elements exist
  var required_elts = ["btn-next", "submitButton", "errors", "order", "start_timing", "next_timings", "time_limits", "seconds_left", "window_focuses", "practice_ids", "browser_info"];
  for (var i = 0; i < required_elts.length; i++) {
    assert($("#" + required_elts[i]).length == 1, "Missing form element: " + required_elts[i]);
  }
  var required_metadata_fields = ['time_limits', 'num_reps', 'practice_time_limit', 'practice_num_reps'];
  for (var i = 0; i < required_metadata_fields.length; i++) {
    assert(required_metadata_fields[i] in question_metadata, "Missing key in question metadata: " + required_metadata_fields[i]);
  }

  // Build list of questions
  this.build_questions(question_metadata, question_data);

  // Replace RNDs at the end, but only for inputs
  randomTextReplacer();

  //
  // Track Browser Focus
  //
  this.window_load_time = new Date();
  this.window_focuses.push(this.window_load_time.getTime() / 1000);
  $(window).on({
    'focus.visibility': function() {
      var t = new Date();
      _this.window_focus.push((_this.window_blur_time - _this.window_load_time) + "," + (t - _this.window_blur_time));
    },
    'blur.visibility': function() {
      _this.window_blur_time = new Date();
    }
  });

  //
  // Log Input Element Interactions
  //
  $(":input:not([type=hidden])").each(function() {
    var input_id = $(this).data("input_id");
    if (typeof input_id != "undefined") {
      _this.interaction_timers[input_id] = new InteractionTimer();
      $(this).focus(function() {
        _this.interaction_timers[input_id].touch();
      }).keydown(function() {
        _this.interaction_timers[input_id].touch();
      });
    }
  });

  //
  // Preload and Prepare
  //

  // Make sure all images are loaded
  if ($("img").length > 0) {
    this.add_initialization_fn("images", function() {
      $('#container').imagesLoaded(function() {
        _this.check_and_start("images");
      });
    });
  } else {
    this.check_and_start("images");
  }
  
  // Call all initialization functions (including above)
  for (var f in this.initialization_fns) {
    this.initialization_fns[f]();
  }

  //
  // "Next"
  //
  $("#btn-next").click(function() {
    if (_this.order_index == _this.order.length - 1) {
      return;
    }

    // Advance task
    if (!_this.order_end_fns[_this.order_index]()) {
      return;
    }
    $("#" + _this.order[_this.order_index]).hide();
    _this.order_index++;
    $("#" + _this.order[_this.order_index]).show();
    _this.order_start_fns[_this.order_index]();
    _this.next_timings.push(_this.next_timer.lap());
    _this.window_focuses.push(_this.window_focus.join(";"));
    _this.window_focus = [];

    $("#btn-next").blur();

    // Complete the task
    if (_this.order_index == _this.order.length - 1) {
      _this.completeTask();
    }
  });

  // Shift + N advances question
  $(document).bind('keydown', 'shift+n', function() {
    $("#btn-next").click();
  });

  // Placeholder text for IE
  $('input, textarea').placeholder();

  // Show Test Popup if Preview
  if (getURIParam('assignmentId') == "ASSIGNMENT_ID_NOT_AVAILABLE") {
    var hit_preview = "<div class=\"hit_preview\"><div class=\"hit_preview_inner\">";
    hit_preview += "Your work will not be saved until you accept this HIT.</div></div>";
    $("#container").append($(hit_preview));
  }

};
