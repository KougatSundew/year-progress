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
})({"ZCfc":[function(require,module,exports) {
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
  var url = "http://192.168.0.78:5173/";
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
    var symbol = data['symbol'];
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
},{}]},{},["ZCfc"], null)
//# sourceMappingURL=main.9db5401f.js.map