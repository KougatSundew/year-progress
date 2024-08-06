// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"consts.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.backendUrl = void 0;
var backendUrl = exports.backendUrl = 'http://localhost:5173/';
},{}],"main.ts":[function(require,module,exports) {
"use strict";

var _consts = require("./consts");
function updateProgress() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 1);
  var end = new Date(now.getFullYear() + 1, 0, 1);
  var progress = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
  var percentage = parseFloat((progress * 100).toFixed(2));
  document.getElementById('progress').style.width = "".concat(percentage, "%");
  document.getElementById('progress-glow').style.width = "".concat(percentage, "%");
  document.getElementById('percentage').textContent = "".concat(percentage, "% of the year has passed");
  var timeLeft = end.getTime() - now.getTime();
  var daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  document.getElementById('days-left').textContent = "".concat(daysLeft, " days left in the year");
  document.getElementById('months').textContent = Math.floor(daysLeft / 30).toString();
  document.getElementById('weeks').textContent = Math.floor(daysLeft / 7).toString();
  document.getElementById('days').textContent = daysLeft.toString();
  updateMood(percentage);
  updateBackground(percentage);
}
function updateMood(percentage) {
  var mood;
  if (percentage < 25) {
    mood = "The year is young, full of possibilities!";
  } else if (percentage < 50) {
    mood = "Time's flying, but there's still so much to do!";
  } else if (percentage < 75) {
    mood = "More than halfway there, keep pushing!";
  } else {
    mood = "The year's almost over, finish strong!";
  }
  document.getElementById('mood').textContent = mood;
}
function updateBackground(percentage) {
  var hue = Math.floor(percentage * 3.6); // 0-360
  document.body.style.backgroundColor = "hsl(".concat(hue, ", 30%, 15%)");
}
var isDarkTheme = true;
function toggleTheme() {
  isDarkTheme = !isDarkTheme;
  if (isDarkTheme) {
    document.body.style.color = 'white';
    document.querySelector('.container').style.background = 'rgba(255, 255, 255, 0.1)';
    document.querySelector('path').setAttribute('fill', 'white');
  } else {
    document.body.style.color = 'black';
    document.querySelector('.container').style.background = 'rgba(0, 0, 0, 0.1)';
    document.querySelector('path').setAttribute('fill', 'black');
  }
  var button = document.getElementById('theme-toggle');
  button.classList.add('rotate');
  setTimeout(function () {
    return button.classList.remove('rotate');
  }, 500);
}
function getStockData() {
  var url = _consts.backendUrl;
  var stockData = document.getElementById('stock-data');
  var template = document.getElementById('template-spinner');
  var spinnerTemplate = template.content.cloneNode(true);
  var stockPrice = document.getElementById('stock-price');
  var stockChange = document.getElementById('stock-change');
  var stockError = document.getElementById('stock-error');
  stockError.innerText = '';
  stockPrice.innerHTML = '';
  stockChange.innerHTML = '';
  stockData.appendChild(spinnerTemplate);
  fetch(url).then(function (response) {
    return response.json();
  }).then(function (data) {
    stockData.getElementsByTagName('sl-spinner')[0].remove();
    console.log(data);
    var price = data['price'];
    var change = data['change'];
    var changePercent = data['changePercent'];
    stockPrice.textContent = "".concat(price, " \u20AC");
    stockChange.textContent = "".concat(change, " (").concat(changePercent, ")");
    stockChange.className = 'stock-change ' + (change >= 0 ? 'positive' : 'negative');
  }).catch(function (error) {
    stockData.getElementsByTagName('sl-spinner')[0].remove();
    console.error('Error fetching stock data:', error);
    stockError.innerText = 'Failed to load stock data';
  });
}
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
updateProgress();
setInterval(updateProgress, 60000); // Update every minute
getStockData(); // Get stock data on page load
setInterval(getStockData, 300000); // Update stock data every 5 minutes
},{"./consts":"consts.ts"}],"../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "44495" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.c39d6dcf.js.map