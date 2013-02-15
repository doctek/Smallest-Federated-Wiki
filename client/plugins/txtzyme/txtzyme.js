// Generated by CoffeeScript 1.4.0
(function() {
  var apply, bind, emit, parse, report;

  parse = function(text) {
    var defn, line, prev, word, words, _i, _j, _len, _len1, _ref, _ref1;
    defn = {};
    _ref = text.split(/\n+/);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      words = line.split(/\s+/);
      if (words[0]) {
        defn[words[0]] = prev = words.slice(1, 1000);
      } else {
        _ref1 = words.slice(1, 1000);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          word = _ref1[_j];
          prev.push(word);
        }
      }
    }
    return defn;
  };

  apply = function(defn, call, arg, emit) {
    var words, _ref;
    if (!(words = (_ref = defn[call]) != null ? _ref.slice(0) : void 0)) {
      return;
    }
    return (function(stack, result) {
      var next, send;
      send = function() {
        var text;
        if (!result.length) {
          return;
        }
        text = "" + (result.join(' ')) + "\n";
        result = [];
        return emit(text, stack, next);
      };
      next = function() {
        var word, _ref1, _ref2;
        if (!stack.length) {
          return;
        }
        word = (_ref1 = stack[stack.length - 1]) != null ? _ref1.words.shift() : void 0;
        if (word === void 0) {
          stack.pop();
        } else if (word === 'NL') {
          return send();
        } else if (word.match(/^[A-Z][A-Z0-9]*$/)) {
          if (stack.length < 10 && (words = (_ref2 = defn[word]) != null ? _ref2.slice(0) : void 0)) {
            stack.push({
              call: word,
              words: words
            });
          }
        } else {
          result.push(word);
        }
        if (stack.length) {
          return next();
        } else {
          return send();
        }
      };
      if (words.length) {
        return next();
      }
    })([
      {
        call: call,
        words: words
      }
    ], []);
  };

  report = function(defn) {
    var key, word, words, _i, _len;
    report = [];
    for (key in defn) {
      words = defn[key];
      report.push("<li class=\"" + key + "\"><span>" + key + "</span>");
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        report.push("<span>" + word + "</span>");
      }
    }
    return report.join(' ');
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      parse: parse,
      apply: apply
    };
  }

  emit = function($item, item) {
    return $item.append("<div style=\"width:93%; background:#eee; padding:.8em; margin-bottom:5px;\">\n  <p class=\"report\" style=\"white-space: pre; white-space: pre-wrap;\">" + item.text + "</p>\n  <p class=\"caption\">status here</p>\n</div>");
  };

  bind = function($item, item) {
    var $page, defn, host, progress, rcvd, sent, socket, tic, timer, trigger;
    defn = parse(item.text);
    wiki.log(defn);
    $page = $item.parents('.page:first');
    host = $page.data('site') || location.host;
    socket = new WebSocket("ws://" + host + "/plugin/txtzyme");
    sent = rcvd = 0;
    tic = function() {
      var now;
      now = new Date();
      trigger('SECOND');
      if (now.getSeconds()) {
        return;
      }
      trigger('MINUTE');
      if (now.getMinutes()) {
        return;
      }
      trigger('HOUR');
      if (now.getHours()) {
        return;
      }
      return trigger('DAY');
    };
    timer = setInterval(tic, 1000);
    $item.dblclick(function() {
      clearInterval(timer);
      if (socket != null) {
        socket.close();
      }
      return wiki.textEditor($item, item);
    });
    $(".main").on('thumb', function(evt, thumb) {
      return trigger('THUMB');
    });
    trigger = function(word, arg) {
      if (arg == null) {
        arg = 0;
      }
      return apply(defn, word, arg, function(message, stack, done) {
        var call, todo, words;
        todo = ((function() {
          var _i, _len, _ref, _results;
          _results = [];
          for (_i = 0, _len = stack.length; _i < _len; _i++) {
            _ref = stack[_i], call = _ref.call, words = _ref.words;
            _results.push("" + call + " " + (words.join(' ')));
          }
          return _results;
        })()).join('<br>');
        $item.find('p.report').html("" + todo + "<br>" + message);
        if (socket) {
          socket.send(message);
          progress("" + (++sent) + " sent");
        }
        return setTimeout(done, 200);
      });
    };
    progress = function(m) {
      wiki.log('txtzyme', m);
      return $item.find('p.caption').text(m);
    };
    socket.onopen = function() {
      progress("opened");
      return trigger('OPEN');
    };
    socket.onmessage = function(e) {
      return progress("rcvd " + e.data);
    };
    return socket.onclose = function() {
      progress("closed");
      return socket = null;
    };
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.txtzyme = {
      emit: emit,
      bind: bind
    };
  }

}).call(this);
