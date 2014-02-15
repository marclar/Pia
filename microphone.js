(function () {
    var a, b, c, d, e;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia, window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext,
    function () {
        var a, b, c, d, e, f, g, h;
        for (e = window, h = ["ms", "moz", "webkit", "o"], f = 0, g = h.length; g > f && (d = h[f], !e.requestAnimationFrame); f++) e.requestAnimationFrame = e["" + d + "RequestAnimationFrame"], e.cancelAnimationFrame = e["" + d + "CancelAnimationFrame"] || e["" + d + "CancelRequestAnimationFrame"];
        if (e.requestAnimationFrame) {
            if (e.cancelAnimationFrame) return;
            return a = e.requestAnimationFrame, b = {}, e.requestAnimationFrame = function (c) {
                var d;
                return d = a(function (a) {
                    return d in b ? delete b[d] : c(a)
                })
            }, e.cancelAnimationFrame = function (a) {
                return b[a] = !0
            }
        }
        return c = 0, e.requestAnimationFrame = function (a) {
            var b;
            return c = Math.max(c + 16, b = +new Date), e.setTimeout(function () {
                return a(+new Date)
            }, c - b)
        }, e.cancelAnimationFrame = function (a) {
            return clearTimeout(a)
        }
    }(), 

    d = /debug/.test(window.location.search) ? function () {
        return console.log.apply(console, arguments)
    } : function () {}, c = function (a, b) {
        return this.name = "WitError", this.message = a || "", this.infos = b, this
    }, c.prototype = Error.prototype, b = "wss://api.wit.ai/speech_ws", a = function (a) {
        var b, c, d = this;
        return this.conn = null, this.ctx = new AudioContext, this.state = "disconnected", this.rec = !1, this.handleError = function (a) {
            var b, c;
            return _.isFunction(c = this.onerror) ? (b = _.isString(a) ? a : _.isString(a.message) ? a.message : "Something went wrong!", c.call(window, b, a)) : void 0
        }, this.handleResult = function (a) {
            var b, c, d, msg;
            return _.isFunction(c = this.onresult) ? (d = a.outcome.intent, b = a.outcome.entities, msg = a.msg_body, c.call(window, d, b, msg, a)) : void 0
        }, a && (this.elem = a, a.innerHTML = "<div class='mic mic-box icon-wit-mic'>\n</div>\n<svg class='mic-svg mic-box'>\n</svg>", a.className = "wit-microphone", a.addEventListener("click", function () {
            return d.fsm("toggle_record")
        }), c = this.elem.children[1], b = "http://www.w3.org/2000/svg", this.path = document.createElementNS(b, "path"), this.path.setAttribute("stroke", "#eee"), this.path.setAttribute("stroke-width", "5"), this.path.setAttribute("fill", "none"), c.appendChild(this.path)), this.rmactive = function () {
            return this.elem ? this.elem.classList.remove("active") : void 0
        }, this.mkactive = function () {
            return this.elem ? this.elem.classList.add("active") : void 0
        }, this.mkthinking = function () {
            var a, b, d, e = this;
            return this.thinking = !0, this.elem.classList.add("thinking"), a = (null != (d = window.performance) ? d.now() : void 0) || new Date, b = function (d) {
                var f, g, h, i, j, k, l, m, n, o, p, q, r;
                return e.elem ? (m = getComputedStyle(c), q = parseInt(m.width, 10), i = parseInt(m.height, 10), k = q / 2 - 5, f = 1e3, l = (d - a) % f / f * 2 * Math.PI - Math.PI / 2, g = q / 2, h = i / 2 - k, o = Math.cos(l) * k + q / 2, p = Math.sin(l) * k + i / 2, r = 0, j = +(1.5 * Math.PI > l && l > Math.PI / 2), n = 1, e.path.setAttribute("d", "M" + g + "," + h + "A" + k + "," + k + "," + r + "," + j + "," + n + "," + o + "," + p), e.thinking ? requestAnimationFrame(b) : (e.elem.classList.remove("thinking"), e.path.setAttribute("d", "M0,0"))) : void 0
            }, requestAnimationFrame(b)
        }, this.rmthinking = function () {
            return this.thinking = !1
        }, this
    }, e = {
        disconnected: {
            connect: function (a) {
                var c, d, e = this;
                return a || this.handleError("No token provided"), c = new WebSocket(b), c.onopen = function () {
                    return c.send(JSON.stringify(["auth", a]))
                }, c.onclose = function () {
                    return e.fsm("socket_closed")
                }, c.onmessage = function (a) {
                    var b, c, d;
                    return d = JSON.parse(a.data), c = d[0], b = d[1], b ? e.fsm.call(e, c, b) : e.fsm.call(e, c)
                }, this.conn = c, d = function (a) {
                    var b, c, d;
                    return b = e.ctx, d = b.createMediaStreamSource(a), c = (b.createScriptProcessor || b.createJavascriptNode).call(b, 4096, 1, 1), c.onaudioprocess = function (a) {
                        var b;
                        if (e.rec) return b = a.inputBuffer.getChannelData(0), e.conn.send(b)
                    }, d.connect(c), c.connect(b.destination), e.stream = a, e.proc = c, e.src = d, e.fsm("got_stream")
                }, navigator.getUserMedia({
                    audio: !0
                }, d, this.handleError), "connecting"
            }
        },
        connecting: {
            "auth-ok": function () {
                return "waiting_for_stream"
            },
            got_stream: function () {
                return "waiting_for_auth"
            },
            error: function (a) {
                return this.handleError(a), "connecting"
            },
            socket_closed: function () {
                return "disconnected"
            }
        },
        waiting_for_auth: {
            "auth-ok": function () {
                return "ready"
            }
        },
        waiting_for_stream: {
            got_stream: function () {
                return "ready"
            }
        },
        ready: {
            socket_closed: function () {
                return "disconnected"
            },
            timeout: function () {
                return "ready"
            },
            start: function () {
                return this.fsm("toggle_record")
            },
            toggle_record: function () {
                return this.conn.send(JSON.stringify(["start"])), this.rec = !0, this.ctx || console.error("No context"), this.stream || console.error("No stream"), this.src || console.error("No source"), this.proc || console.error("No processor"), "audiostart"
            }
        },
        audiostart: {
            error: function (a) {
                return this.rec = !1, this.handleError(new c("Error during recording", {
                    code: "RECORD",
                    data: a
                })), "ready"
            },
            socket_closed: function () {
                return this.rec = !1, "disconnected"
            },
            stop: function () {
                return this.fsm("toggle_record")
            },
            toggle_record: function () {
                var a = this;
                return this.rec = !1, this.conn.send(JSON.stringify(["stop"])), this.timer = setTimeout(function () {
                    return a.fsm("timeout")
                }, 7e3), "audioend"
            }
        },
        audioend: {
            socket_closed: function () {
                return this.timer && clearTimeout(this.timer), "disconnected"
            },
            timeout: function () {
                return this.handleError(new c("Wit timed out", {
                    code: "TIMEOUT"
                })), "ready"
            },
            error: function (a) {
                return this.timer && clearTimeout(this.timer), this.handleError(new c("Wit did not recognize intent", {
                    code: "RESULT",
                    data: a
                })), "ready"
            },
            result: function (a) {
                return this.timer && clearTimeout(this.timer), this.handleResult(a), "ready"
            }
        }
    }, a.prototype.fsm = function (a) {
        var b, c, f, g;
        if (c = null != (g = e[this.state]) ? g[a] : void 0, b = Array.prototype.slice.call(arguments, 1), _.isFunction(c)) switch (f = c.apply(this, b), d("fsm: " + this.state + " + " + a + " -> " + f, b), this.state = f, ("audiostart" === f || "audioend" === f || "ready" === f) && _.isFunction(c = this["on" + f]) && c.call(window), f) {
        case "disconnected":
            this.rmthinking(), this.rmactive();
            break;
        case "ready":
            this.rmthinking(), this.rmactive();
            break;
        case "audiostart":
            this.mkactive();
            break;
        case "audioend":
            this.mkthinking(), this.rmactive()
        } else d("fsm error: " + this.state + " + " + a, b);
        return f
    }, a.prototype.connect = function (a) {
        return this.fsm("connect", a)
    }, a.prototype.start = function () {
        return this.fsm("start")
    }, a.prototype.stop = function () {
        return this.fsm("stop")
    }, window._ || (window._ = {}), _.isFunction || (_.isFunction = function (a) {
        return "function" == typeof a
    }), _.isString || (_.isString = function (a) {
        return "[object String]" === toString.call(a)
    }), window.Wit || (window.Wit = {}), Wit.Microphone = a
}).call(this);