define("mixins/token_iterator", ["require", "exports", "module"], function(a, p, l) {
    var g = a("ace/token_iterator").TokenIterator,
        m = a("ace/range").Range;
    (function() {
        function a(b, a) {
            return 1 === b.length && ("{" === b || "(" === b || "[" === b || !!a && "<" === b)
        }

        function k(b, a) {
            return 1 === b.length && ("}" === b || ")" === b || "]" === b || !!a && ">" === b)
        }

        function e(b, a, d, e, c) {
            for (var n = 1, q, h = b.clone(); q = d.call(h);)
                if (q = a(q), q === c) {
                    if (n--, 0 === n) return b.moveToTokenIterator(h), !0
                } else q === e && n++;
            return !1
        }
        var b = {
            "(": ")",
            "{": "}",
            "[": "]",
            "<": ">",
            ")": "(",
            "}": "{",
            "]": "[",
            ">": "<"
        };
        this.moveToPreviousToken = function() {
            var b = this.$rowTokens,
                a = this.$tokenIndex - 1;
            if (0 <= a) return this.$tokenIndex--, b[a];
            a = this.$session;
            var d = this.$row;
            if (0 > d) return null;
            for (;;) {
                d--;
                if (0 > d) return null;
                if ((b = a.getTokens(d)) && b.length) return this.$row = d, this.$tokenIndex = b.length - 1, this.$rowTokens = b, b[b.length - 1]
            }
        };
        this.moveToNextToken = function() {
            var b = this.$rowTokens,
                a = this.$tokenIndex + 1;
            if (a < b.length) return this.$tokenIndex++, b[a];
            a = this.$session;
            var d = a.getLength(),
                e = this.$row;
            if (e >= d) return null;
            for (;;) {
                e++;
                if (e >= d) return null;
                if ((b = a.getTokens(e)) && b.length) return this.$row = e, this.$tokenIndex = 0, this.$rowTokens = b, b[0]
            }
        };
        this.moveToNextSignificantToken = function() {
            if (!this.moveToNextToken()) return !1;
            for (var b = this.getCurrentToken();
                /^\s+$/.test(b.value) || /\bcomment\b/.test(b.type);) {
                if (!this.moveToNextToken()) return !1;
                b = this.getCurrentToken()
            }
            return !0
        };
        this.moveToPreviousSignificantToken = function() {
            if (!this.moveToPreviousToken()) return !1;
            for (var b = this.getCurrentToken();
                /^\s+$/.test(b.value) ||
                /\bcomment\b/.test(b.type);) {
                if (!this.moveToPreviousToken()) return !1;
                b = this.getCurrentToken()
            }
            return !0
        };
        this.moveToStartOfRow = function() {
            this.$tokenIndex = 0;
            return this.getCurrentToken()
        };
        this.moveToEndOfRow = function() {
            this.$tokenIndex = this.$rowTokens.length - 1;
            return this.getCurrentToken()
        };
        this.moveToStartOfNextRowWithTokens = function() {
            for (var b = this.$row, a = this.$session, d = a.getLength();;) {
                b++;
                if (b >= d) return null;
                var e = a.getTokens(b);
                if (e && e.length) return this.$row = b, this.$tokenIndex = 0, this.$rowTokens =
                    e, this.getCurrentToken()
            }
        };
        var c, d = 0,
            r = 0;
        this.tokenizeUpToRow = function(b) {
            var a = this.$session.bgTokenizer;
            d = Math.min(d, a.currentLine);
            r = Math.max(r, b);
            for (var e = a.currentLine; e <= b; e++) a.$tokenizeRow(e);
            clearTimeout(c);
            c = setTimeout(function() {
                a.fireUpdateEvent(d, r);
                d = r;
                r = 0
            }, 700)
        };
        this.moveToPosition = function(b, a) {
            this.tokenizeUpToRow(b.row);
            var d = this.$session.getTokenAt(b.row, b.column);
            d && a && d.column < b.column && (d = this.$session.getTokenAt(b.row, b.column + 1));
            if (null == d) {
                if (a) return this.$row = b.row, this.$rowTokens =
                    this.$session.getTokens(this.$row), this.$tokenIndex = this.$rowTokens.length - 1, this.moveToNextToken();
                this.$row = b.row + 1;
                this.$tokenIndex = 0;
                this.$rowTokens = this.$session.getTokens(this.$row);
                return this.moveToPreviousToken()
            }
            this.$row = b.row;
            this.$rowTokens = this.$session.getTokens(this.$row);
            this.$tokenIndex = d.index;
            return this.getCurrentToken()
        };
        this.clone = function() {
            var b = new g(this.$session, 0, 0);
            b.moveToTokenIterator(this);
            return b
        };
        this.moveToTokenIterator = function(b) {
            for (var a in b) b.hasOwnProperty(a) &&
                (this[a] = b[a])
        };
        this.peekFwd = function(b) {
            for (var a = this.clone(), d = null, e = 0; e < b; e++) d = a.moveToNextToken();
            return d
        };
        this.peekBwd = function(b) {
            for (var a = this.clone(), d = null, e = 0; e < b; e++) d = a.moveToPreviousToken();
            return d
        };
        this.getCurrentToken = function() {
            var b = this.$rowTokens[this.$tokenIndex];
            b && (b.row = this.$row);
            return b
        };
        this.getCurrentTokenValue = function() {
            return this.getCurrentToken().value
        };
        this.getCurrentTokenPosition = function() {
            return {
                row: this.getCurrentTokenRow(),
                column: this.getCurrentTokenColumn()
            }
        };
        this.getCurrentTokenRange = function() {
            var b = this.getCurrentTokenPosition(),
                a = {
                    row: b.row,
                    column: b.column + this.getCurrentToken().value.length
                };
            return m.fromPoints(b, a)
        };
        this.fwdToMatchingToken = function() {
            var d = this.getCurrentToken();
            return a(d.value, !0) ? e(this, function(b) {
                return b.value
            }, this.moveToNextToken, d.value, b[d.value]) : "support.function.codebegin" === d.type ? e(this, function(b) {
                return b.type
            }, this.moveToNextToken, "support.function.codebegin", "support.function.codeend") : !1
        };
        this.bwdToMatchingToken =
            function() {
                var a = this.getCurrentToken();
                return k(a.value, !0) ? e(this, function(b) {
                    return b.value
                }, this.moveToPreviousToken, a.value, b[a.value]) : "support.function.codeend" === a.type ? e(this, function(b) {
                    return b.type
                }, this.moveToPreviousToken, "support.function.codeend", "support.function.codebegin") : !1
            };
        this.findTokenValueBwd = function(b, a) {
            a = !!a;
            do
                if (!(a && this.bwdToMatchingToken() || this.getCurrentToken().value !== b)) return !0; while (this.moveToPreviousToken());
            return !1
        };
        this.findTokenValueFwd = function(b, a) {
            a = !!a;
            do
                if (!(a && this.fwdToMatchingToken() || this.getCurrentToken().value !== b)) return !0; while (this.moveToNextToken());
            return !1
        };
        this.findTokenTypeBwd = function(b, a) {
            a = !!a;
            do
                if (!(a && this.bwdToMatchingToken() || this.getCurrentToken().type !== b)) return !0; while (this.moveToPreviousToken());
            return !1
        };
        this.findTokenTypeFwd = function(b, a) {
            a = !!a;
            do
                if (!(a && this.fwdToMatchingToken() || this.getCurrentToken().type !== b)) return !0; while (this.moveToNextToken());
            return !1
        }
    }).call(g.prototype)
});
define("ace/token_tooltip", ["require", "exports", "module"], function(a, p, l) {
    function g(a) {
        a.tokenTooltip || (k.call(this, a.container), a.tokenTooltip = this, this.editor = a, this.update = this.update.bind(this), this.onMouseMove = this.onMouseMove.bind(this), this.onMouseOut = this.onMouseOut.bind(this), m.addListener(a.renderer.scroller, "mousemove", this.onMouseMove), m.addListener(a.renderer.content, "mouseout", this.onMouseOut))
    }
    a("ace/lib/dom");
    l = a("ace/lib/oop");
    var m = a("ace/lib/event"),
        f = a("ace/range").Range,
        k = a("ace/tooltip").Tooltip;
    l.inherits(g, k);
    (function() {
        this.token = {};
        this.range = new f;
        this.update = function() {
            this.$timer = null;
            var a = this.editor.renderer;
            1E3 < this.lastT - (a.timeStamp || 0) && (a.rect = null, a.timeStamp = this.lastT, this.maxHeight = window.innerHeight, this.maxWidth = window.innerWidth);
            var b = a.rect || (a.rect = a.scroller.getBoundingClientRect()),
                c = this.editor.session;
            a = c.screenToDocumentPosition(Math.floor((this.y + a.scrollTop - b.top) / a.lineHeight), Math.round((this.x + a.scrollLeft - b.left - a.$padding) / a.characterWidth));
            (b = c.getTokenAt(a.row,
                a.column)) || c.getLine(a.row) || (b = {
                type: "",
                value: "",
                state: c.bgTokenizer.getState(0)
            });
            if (b) {
                var d = b.type;
                b.state && (d += "|" + b.state);
                b.merge && (d += "\n  merge");
                b.stateTransitions && (d += "\n  " + b.stateTransitions.join("\n  "));
                this.tokenText != d && (this.setText(d), this.width = this.getWidth(), this.height = this.getHeight(), this.tokenText = d);
                this.show(null, this.x, this.y);
                this.token = b;
                c.removeMarker(this.marker);
                this.range = new f(a.row, b.start, a.row, b.start + b.value.length);
                this.marker = c.addMarker(this.range, "ace_bracket",
                    "text")
            } else c.removeMarker(this.marker), this.hide()
        };
        this.onMouseMove = function(a) {
            this.x = a.clientX;
            this.y = a.clientY;
            this.isOpen && (this.lastT = a.timeStamp, this.setPosition(this.x, this.y));
            this.$timer || (this.$timer = setTimeout(this.update, 100))
        };
        this.onMouseOut = function(a) {
            a && a.currentTarget.contains(a.relatedTarget) || (this.hide(), this.editor.session.removeMarker(this.marker), this.$timer = clearTimeout(this.$timer))
        };
        this.setPosition = function(a, b) {
            a + 10 + this.width > this.maxWidth && (a = window.innerWidth - this.width -
                10);
            if (b > .75 * window.innerHeight || b + 20 + this.height > this.maxHeight) b = b - this.height - 30;
            k.prototype.setPosition.call(this, a + 10, b + 20)
        };
        this.destroy = function() {
            this.onMouseOut();
            m.removeListener(this.editor.renderer.scroller, "mousemove", this.onMouseMove);
            m.removeListener(this.editor.renderer.content, "mouseout", this.onMouseOut);
            delete this.editor.tokenTooltip
        }
    }).call(g.prototype);
    p.TokenTooltip = g
});
define("mode/auto_brace_insert", ["require", "exports", "module"], function(a, p, l) {
    var g = a("ace/range").Range,
        m = a("ace/mode/text").Mode;
    (function() {
        this.$complements = {
            "(": ")",
            "[": "]",
            '"': '"',
            "{": "}"
        };
        this.$reOpen = /^[(["{]$/;
        this.$reClose = /^[)\]"}]$/;
        this.$reStop = /^[;,\s)\]}]$/;
        this.wrapInsert = function(a, k, e, b) {
            if (!this.insertMatching) return k.call(a, e, b);
            var c = a.selection.getCursor();
            if (c = a.selection.isEmpty() && e.row == c.row && e.column == c.column) {
                var d = g.fromPoints(e, {
                        row: e.row,
                        column: e.column + 1
                    }),
                    f = a.doc.getTextRange(d);
                if (this.$reClose.test(f) && f == b) {
                    a.selection.moveCursorTo(d.end.row, d.end.column, !1);
                    return
                }
            }
            d = null;
            c && (d = this.$moveLeft(a.doc, e), d = a.doc.getTextRange(g.fromPoints(d, e)));
            k = k.call(a, e, b);
            c && this.$reOpen.test(b) ? (e = g.fromPoints(k, {
                row: k.row,
                column: k.column + 1
            }), e = a.doc.getTextRange(e), (this.$reStop.test(e) || 0 == e.length) && this.allowAutoInsert(a, k, this.$complements[b]) && (a.doc.insert(k, this.$complements[b]), a.selection.moveCursorTo(k.row, k.column, !1))) : c && "\n" === b && (b = this.$moveRight(a.doc, k), b = a.doc.getTextRange(g.fromPoints(k,
                b)), "{" === d && "}" === b || "(" === d && ")" === b || "[" === d && "]" === b) && (e = this.getIndentForOpenBrace ? this.getIndentForOpenBrace(this.$moveLeft(a.doc, e)) : this.$getIndent(a.doc.getLine(k.row - 1)), a.doc.insert(k, "\n" + e), a.selection.moveCursorTo(k.row, k.column, !1));
            return k
        };
        this.allowAutoInsert = function(a, k, e) {
            return !0
        };
        this.smartAllowAutoInsert = function(a, k, e) {
            return "'" !== e && '"' !== e && "`" !== e ? !0 : "`" === e ? (k = a.doc.getTextRange({
                    start: {
                        row: k.row,
                        column: 0
                    },
                    end: k
                }), k = k.replace(/\\./g, ""), 0 != k.match(/`/g).length % 2) : 0 ==
                k.column ? !0 : (a = this.codeModel.getTokenForPos(k, !1, !0)) && "string" === a.type && a.column === k.column - 1
        };
        this.wrapRemove = function(a, k, e) {
            var b = a.selection.getCursor(),
                c = a.session.getDocument();
            if (!this.insertMatching || "left" != e || !a.selection.isEmpty() || a.$readOnly || 0 == b.column || c.getLine(b.row).length <= b.column) return k.call(a, e);
            var d = g.fromPoints(this.$moveLeft(c, b), b);
            b = g.fromPoints(b, this.$moveRight(c, b));
            d = c.getTextRange(d);
            c = this.$reOpen.test(d) && this.$complements[d] == c.getTextRange(b);
            k.call(a, e);
            c && k.call(a, "right")
        };
        this.$moveLeft = function(a, k) {
            if (0 == k.row && 0 == k.column) return k;
            var e = k.row,
                b = k.column;
            b ? b-- : (e--, b = a.getLine(e).length);
            return {
                row: e,
                column: b
            }
        };
        this.$moveRight = function(a, k) {
            var e = k.row,
                b = k.column;
            a.getLine(e).length != b ? b++ : (e++, b = 0);
            return e >= a.getLength() ? k : {
                row: e,
                column: b
            }
        }
    }).call(m.prototype);
    p.setInsertMatching = function(a) {
        m.prototype.insertMatching = a
    }
});
define("mode/c_cpp", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/range").Range;
    a("mode/r_highlight_rules");
    var k = a("mode/c_cpp_highlight_rules").c_cppHighlightRules,
        e = a("mode/c_cpp_matching_brace_outdent").CppMatchingBraceOutdent,
        b = a("mode/behaviour/cstyle").CStyleBehaviour,
        c = null;
    window.NodeWebkit || (c = a("mode/c_cpp_fold_mode").FoldMode);
    var d = a("mode/r_code_model").RCodeModel,
        r = a("mode/r_matching_brace_outdent").RMatchingBraceOutdent,
        q = a("mode/cpp_code_model").CppCodeModel;
    a("mode/token_cursor");
    var h = a("mode/utils");
    a = function(a, h) {
        this.$session = h;
        this.$doc = h.getDocument();
        this.$tokenizer = new m((new k).getRules());
        this.r_codeModel = new d(h, this.$tokenizer, /^r-/, /^\s*\/\*{3,}\s*([Rr])\s*$/, /^\s*\*+\//);
        this.$r_outdent = new r(this.r_codeModel);
        this.codeModel = new q(h, this.$tokenizer);
        this.$behaviour = new b(this.codeModel);
        this.$cpp_outdent = new e(this.codeModel);
        window.NodeWebkit || (this.foldingRules = new c);
        this.$tokens = this.codeModel.$tokens;
        this.getLineSansComments = this.codeModel.getLineSansComments
    };
    l.inherits(a, g);
    (function() {
        this.wrapInsert = function(a, b, d, e) {
            return this.cursorInRLanguageMode() ? g.prototype.wrapInsert(a, b, d, e) : b.call(a, d, e)
        };
        this.wrapRemove = function(a, b, d) {
            return this.cursorInRLanguageMode() ? g.prototype.wrapRemove(a, b, d) : b.call(a, d)
        };
        this.insertChunkInfo = {
            value: "/*** R\n\n*/\n",
            position: {
                row: 1,
                column: 0
            },
            content_position: {
                row: 1,
                column: 0
            }
        };
        this.toggleCommentLines = function(a, b, d, e) {
            var c = !0;
            a = /^(\s*)\/\//;
            for (var n = d; n <=
                e; n++)
                if (!a.test(b.getLine(n))) {
                    c = !1;
                    break
                } if (c)
                for (c = new f(0, 0, 0, 0), n = d; n <= e; n++) d = b.getLine(n).match(a), c.start.row = n, c.end.row = n, c.end.column = d[0].length, b.replace(c, d[1]);
            else b.indentRows(d, e, "//")
        };
        this.getLanguageMode = function(a) {
            return h.getPrimaryState(this.$session, a.row).match(/^r-/) ? "R" : "C_CPP"
        };
        this.cursorInRLanguageMode = function() {
            return "R" === this.getLanguageMode(this.$session.getSelection().getCursor())
        };
        this.inRLanguageMode = function(a) {
            if (!a) return null;
            "object" === typeof a && a.hasOwnProperty("length") &&
                0 < a.length && (a = a[0]);
            return a.match(/^r-/)
        };
        this.getNextLineIndent = function(a, b, d, e, c) {
            a = h.primaryState(a);
            return this.inRLanguageMode(a) ? this.r_codeModel.getNextLineIndent(a, b, d, e) : this.codeModel.getNextLineIndent(a, b, d, e, c)
        };
        this.checkOutdent = function(a, b, d) {
            return this.inRLanguageMode(a) ? this.$r_outdent.checkOutdent(a, b, d) : this.$cpp_outdent.checkOutdent(a, b, d)
        };
        this.autoOutdent = function(a, b, d) {
            return this.inRLanguageMode(a) ? this.$r_outdent.autoOutdent(a, b, d, this.r_codeModel) : this.$cpp_outdent.autoOutdent(a,
                b, d)
        };
        this.$transformAction = this.transformAction;
        this.transformAction = function(a, b, d, e, c) {
            a = h.primaryState(a);
            if (!this.inRLanguageMode(a)) return this.$transformAction(a, b, d, e, c)
        };
        this.$id = "mode/c_cpp"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/c_cpp_fold_mode", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/range").Range;
    a = a("ace/mode/folding/fold_mode").FoldMode;
    p = p.FoldMode = function() {};
    l.inherits(p, a);
    (function() {
        function a(a, e, d, k) {
            a = a.doc.$lines;
            for (var b = e + k, c = a[b], n = 0 < k ? "*/" : "/*", f; null != c;) {
                var r = c.indexOf(n);
                if (-1 !== r) {
                    f = 0 < k ? new g(e, d, b, r) : new g(b, c.length, e, d);
                    break
                }
                b += k;
                c = a[b]
            }
            return f
        }

        function f(a, e, d, k, q) {
            for (var b = e + q, c = a.doc.$lines; 0 <= b && b < a.getLength();) {
                for (var f = a.getTokens(b),
                        r = c[b], m = 0; m < f.length; m++)
                    if (f[m].type === k) return 0 < q ? new g(e, d, b, 0) : new g(b, r.length, e, d);
                b += q
            }
        }
        var k = /(\{|\[)[^\}\]]*$/,
            e = /^[^\[\{]*(\}|\])/;
        this.getFoldWidget = function(a, c, d) {
            c = "markbeginend" === c ? "end" : "";
            d = a.getLine(d);
            if (k.test(d)) return "start";
            if (e.test(d)) return c;
            a = d.indexOf("/*");
            d = d.indexOf("*/");
            return -1 !== a && (-1 === d || a > d) ? "start" : -1 !== d && (-1 === a || d < a) ? c : ""
        };
        this.getFoldWidgetRange = function(b, c, d) {
            var g = b.getLine(d),
                q;
            if (q = g.match(k)) return this.openingBracketBlock(b, q[1], d, q.index);
            if (q =
                "markbeginend" === c && g.match(e)) return this.closingBracketBlock(b, q[1], d, q.index + q[0].length);
            c = b.getTokens(d);
            for (q = 0; q < c.length; q++) {
                var h = c[q];
                if ("support.function.codebegin" === h.type) return f(b, d, g.length, "support.function.codeend", 1);
                if ("support.function.codeend" === h.type) return f(b, d, 0, "support.function.codebegin", -1)
            }
            c = g.indexOf("/*");
            if (-1 !== c) return a(b, d, g.length, 1);
            c = g.indexOf("*/");
            if (-1 !== c) return a(b, d, c, -1)
        }
    }).call(p.prototype)
});
define("mode/c_cpp_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/lib/lang"),
        m = a("mode/doc_comment_highlight_rules").DocCommentHighlightRules,
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/tex_highlight_rules").TexHighlightRules,
        e = a("mode/r_highlight_rules").RHighlightRules,
        b = a("mode/rainbow_paren_highlight_rules").RainbowParenHighlightRules;
    a = function() {
        function a(a) {
            return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        }
        var d = g.arrayToMap("alignas alignof and and_eq asm auto bitand bitor bool break case catch char char16_t char32_t class compl const constexpr const_cast continue decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int in long mutable namespace new noexcept not not_eq nullptr or or_eq private protected public register reinterpret_cast return short signed sizeof sizeof... static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typeof typename union unsigned using virtual void volatile wchar_t while xor xor_eq".split(" ")),
            f = g.arrayToMap(["NULL"]),
            q = "new delete >>= <<= ->* ... << >> && || == != <= >= :: *= += -= /= ++ -- &= ^= %= -> .* ! $ & | + - * / ^ ~ = %".split(" "),
            h = q.map(function(b) {
                return a(b)
            }).join("|");
        q = ["->*"].concat(q).concat("< > , () [] ->".split(" ")).map(function(b) {
            return a(b)
        });
        q = ["new\\s*\\[\\]", "delete\\s*\\[\\]"].concat(q);
        q = "operator\\s*(?:" + q.join("|") + ")|operator\\s+[\\w_]+(?:&&|&|\\*)?";
        this.$rules = {
            start: [{
                    token: "comment.doc.tag",
                    regex: "\\/\\/\\s*\\[\\[.*\\]\\].*$"
                }, {
                    token: "comment",
                    regex: "\\/\\/'",
                    next: "rd-start"
                }, {
                    token: "comment",
                    regex: "\\/\\/.*$"
                }, m.getStartRule("doc-start"), {
                    token: "comment",
                    merge: !0,
                    regex: "\\/\\*",
                    next: "comment"
                }, {
                    token: "string",
                    regex: '(?:R|L|u8|u|U)?["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                }, {
                    token: "string",
                    merge: !0,
                    regex: '(?:R|L|u8|u|U)?["].*\\\\$',
                    next: "qqstring"
                }, {
                    token: "string",
                    regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                }, {
                    token: "string",
                    merge: !0,
                    regex: "['].*\\\\$",
                    next: "qstring"
                }, {
                    token: "constant.numeric",
                    regex: "0[xX][0-9a-fA-F]+\\b"
                }, {
                    token: "constant.numeric",
                    regex: "0[bB][01']+\\b"
                },
                {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(?:(?:[fF])|(?:(?:[uU]?(?:(?:l?l?)|(?:L?L?))?)|(?:(?:(?:l?l?)|(?:L?L?))[uU]?))|(?:_\\w+))?\\b"
                }, {
                    token: "keyword.preproc",
                    regex: "#\\s*include\\b",
                    next: "include"
                }, {
                    token: "keyword.preproc",
                    regex: "(?:" + "include pragma line define defined undef ifdef ifndef if else elif endif warning error".split(" ").map(function(a) {
                        return "#\\s*" + a + "\\b"
                    }).join("|") + ")"
                }, {
                    token: "variable.language",
                    regex: "\\b__\\S+__\\b"
                }, {
                    token: "keyword",
                    regex: q
                },
                {
                    token: function(a) {
                        return "this" == a ? "variable.language" : d.hasOwnProperty(a) ? "keyword" : f.hasOwnProperty(a) ? "constant.language" : "identifier"
                    },
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    merge: !1,
                    regex: h
                }, {
                    token: "keyword.punctuation.operator",
                    merge: !1,
                    regex: "\\?|\\:|\\,|\\;|\\.|\\\\"
                },
                b.getParenRule(), {
                    token: "paren.keyword.operator",
                    merge: !1,
                    regex: "[<>]"
                }, {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            comment: [{
                token: "comment",
                regex: ".*?\\*\\/",
                next: "start"
            }, {
                token: "comment",
                merge: !0,
                regex: ".+"
            }],
            qqstring: [{
                token: "string",
                regex: '(?:(?:\\\\.)|(?:[^"\\\\]))*?"',
                next: "start"
            }, {
                token: "string",
                merge: !0,
                regex: ".+"
            }],
            qstring: [{
                token: "string",
                regex: "(?:(?:\\\\.)|(?:[^'\\\\]))*?'",
                next: "start"
            }, {
                token: "string",
                merge: !0,
                regex: ".+"
            }],
            include: [{
                token: "string",
                regex: /<.+>/,
                next: "start"
            }, {
                token: "string",
                regex: /".+"/,
                next: "start"
            }]
        };
        h = (new k("comment")).getRules();
        for (q = 0; q < h.start.length; q++) h.start[q].token += ".virtual-comment";
        this.addRules(h, "rd-");
        this.$rules["rd-start"].unshift({
            token: "text",
            regex: "^",
            next: "start"
        });
        this.$rules["rd-start"].unshift({
            token: "keyword",
            regex: "@(?!@)[^ ]*"
        });
        this.$rules["rd-start"].unshift({
            token: "comment",
            regex: "@@"
        });
        this.$rules["rd-start"].push({
            token: "comment",
            regex: "[^%\\\\[({\\])}]+"
        });
        this.embedRules(m, "doc-", [m.getEndRule("start")]);
        this.$rules.start.unshift({
            token: "support.function.codebegin",
            regex: "^\\s*\\/\\*{3,}\\s*[Rr]\\s*$",
            next: "r-start"
        });
        h = (new e).getRules();
        this.addRules(h, "r-");
        this.$rules["r-start"].unshift({
            token: "support.function.codeend",
            regex: "\\*\\/",
            next: "start"
        })
    };
    l.inherits(a, f);
    p.c_cppHighlightRules =
        a
});
define("mode/c_cpp_matching_brace_outdent", ["require", "exports", "module"], function(a, p, l) {
    var g = a("ace/range").Range,
        m = a("mode/token_cursor").CppTokenCursor;
    l = function(a) {
        this.codeModel = a
    };
    var f = a("mode/utils"),
        k = !0,
        e = !0,
        b = !0,
        c = !0,
        d = !0,
        r = !0,
        q = !0,
        h = !0,
        n = !0,
        v = !0,
        z = !0,
        w = !0;
    (function() {
        this.setIndent = function(a, b, d, e, c) {
            a = a.getDocument();
            e = "string" === typeof e ? e : "";
            var n = a.$lines[d];
            d = this.$getIndent(a.$lines[b]);
            n = this.$getIndent(n);
            ("function" !== typeof c || c(d, n)) && a.replace(new g(b, 0, b, d.length), n + e)
        };
        this.checkOutdent = function(a, b, d) {
            return f.endsWith(a, "start") && (":" === d || /^\s*[#\{\}>\]\)<.:]/.test(d) || "=" === d) || f.endsWith(a, "comment") && "/" == d ? !0 : !1
        };
        this.escapeRegExp = function(a) {
            return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        };
        this.alignStartToken = function(a, b, d, e, c) {
            return null === c || null === e ? !1 : (new RegExp("^\\s*" + this.escapeRegExp(a))).test(e) && (a = c.indexOf(a), 0 <= a) ? (b = b.getDocument(), e = this.$getIndent(e), a = Array(a + 1).join(" "), b.replace(new g(d, 0, d, e.length), a), !0) : !1
        };
        this.alignEquals =
            function(a, b, d, e) {
                if (null === e || null === d) return !1;
                var c = d.indexOf("=");
                if (c !== d.lastIndexOf("=")) return !1;
                var n = e.indexOf("=");
                if (-1 !== c && -1 !== n && /,\s*$/.test(e)) {
                    a = a.getDocument();
                    d = this.$getIndent(d);
                    if (d.length >= n) return !1;
                    c = n - c;
                    if (0 >= c) return !1;
                    c = Array(d.length + c + 1).join(" ");
                    a.replace(new g(b, 0, b, d.length), c);
                    return !0
                }
                return !1
            };
        this.autoOutdent = function(a, h, f) {
            a = h.doc;
            var y = a.getLine(f),
                B = null;
            0 < f && (B = a.getLine(f - 1));
            if (!v || !this.alignStartToken("<<", h, f, y, B))
                if (!n || !this.alignStartToken(">>",
                        h, f, y, B))
                    if (!q || !this.alignStartToken(".", h, f, y, B)) {
                        if (k && /^\s*:/.test(a.getLine(f)) && !/^\s*::/.test(a.getLine(f)) && this.codeModel.$tokenUtils.$tokenizeUpToRow(f)) {
                            var p = new m(this.codeModel.$tokens, f, 0),
                                x = -1,
                                t = p.cloneCursor();
                            if (")" === t.peekBwd().currentValue() || "keyword" === t.peekBwd().currentType()) {
                                do {
                                    p = t.currentType();
                                    var A = t.currentValue();
                                    if ("identifier" === p || ";" === A) {
                                        x = t.$row;
                                        break
                                    }
                                    "keyword" !== p && t.bwdToMatchingToken()
                                } while (t.moveToPreviousToken())
                            } else p.moveToPreviousToken(), p.bwdOverClassySpecifiers() &&
                                (x = p.$row);
                            0 <= x && this.setIndent(h, f, x, h.getTabString(), function(a, b) {
                                return a === b
                            })
                        }
                        if (r && /^\s*>/.test(y) && !/^\s*>>/.test(y) && (x = this.codeModel.getRowForMatchingEOLArrows(h, a, f), 0 <= x)) {
                            this.setIndent(h, f, x);
                            return
                        }
                        if (c && /^\s*\}/.test(y) && (x = h.findMatchingBracket({
                                row: f,
                                column: y.indexOf("}") + 1
                            }), null !== x)) {
                            if (/^\s*\{/.test(a.$lines[x.row])) {
                                this.setIndent(h, f, x.row);
                                return
                            }
                            x = this.codeModel.getRowForOpenBraceIndent(h, x.row);
                            if (0 <= x) {
                                this.setIndent(h, f, x);
                                return
                            }
                        }
                        if (e && /^\s*\)/.exec(y) && (x = h.findMatchingBracket({
                                row: f,
                                column: y.indexOf(")") + 1
                            }))) {
                            this.setIndent(h, f, x.row);
                            return
                        }
                        if (d && /^\s*\]/.exec(y) && (x = h.findMatchingBracket({
                                row: f,
                                column: y.indexOf("]") + 1
                            }))) {
                            this.setIndent(h, f, x.row);
                            return
                        }
                        if (z && /^\s*public\s*:\s*$|^\s*private\s*:\s*$|^\s*protected\s*:\s*$/.test(y) && (t = h.$findOpeningBracket("}", {
                                row: f,
                                column: y.length
                            }, /(?:^|[.])paren(?:$|[.])/))) {
                            x = this.codeModel.getRowForOpenBraceIndent(h, t.row);
                            0 <= x ? this.setIndent(h, f, x) : this.setIndent(h, f, t.row);
                            return
                        }
                        if (w && (/^\s*case.+:/.test(y) || /^\s*default\s*:/.test(y)) &&
                            (t = h.$findOpeningBracket("}", {
                                row: f,
                                column: /(\S)/.exec(y).index + 1
                            }))) {
                            x = this.codeModel.getRowForOpenBraceIndent(h, t.row);
                            0 <= x ? this.setIndent(h, f, x) : this.setIndent(h, f, t.row);
                            return
                        }
                        if (b && /^\s*\{/.test(y) && !/;\s*$/.test(B)) {
                            if (this.codeModel.$tokenUtils.$tokenizeUpToRow(f) && (p = new m(this.codeModel.$tokens), p.$row = f, p.$offset = 0, p.moveToPreviousToken() && "=" === p.currentValue())) return;
                            B = this.codeModel.getRowForOpenBraceIndent(h, f);
                            if (0 <= B) {
                                this.setIndent(h, f, B);
                                return
                            }
                        }
                        /^\s*#/.test(y) && (h = this.$getIndent(y),
                            a.replace(new g(f, 0, f, h.length), ""))
                    }
        };
        this.$getIndent = function(a) {
            return (a = a.match(/^(\s+)/)) ? a[1] : ""
        }
    }).call(l.prototype);
    p.CppMatchingBraceOutdent = l;
    p.getOutdentColon = function() {
        return k
    };
    p.setOutdentColon = function(a) {
        k = a
    };
    p.getOutdentRightParen = function() {
        return e
    };
    p.setOutdentRightParen = function(a) {
        e = a
    };
    p.getOutdentLeftBrace = function() {
        return b
    };
    p.setOutdentLeftBrace = function(a) {
        b = a
    };
    p.getOutdentRightBrace = function() {
        return c
    };
    p.setOutdentRightBrace = function(a) {
        c = a
    };
    p.getOutdentRightBracket =
        function() {
            return d
        };
    p.setOutdentRightBracket = function(a) {
        d = a
    };
    p.getOutdentRightArrow = function() {
        return r
    };
    p.setOutdentRightArrow = function(a) {
        r = a
    };
    p.getAlignDots = function() {
        return q
    };
    p.setAlignDots = function(a) {
        q = a
    };
    p.getAlignEquals = function() {
        return h
    };
    p.setAlignEquals = function(a) {
        h = a
    };
    p.getAlignStreamIn = function() {
        return n
    };
    p.setAlignStreamIn = function(a) {
        n = a
    };
    p.getAlignStreamOut = function() {
        return v
    };
    p.setAlignStreamOut = function(a) {
        v = a
    };
    p.getAlignClassAccessModifiers = function() {
        return z
    };
    p.setAlignClassAccessModifiers =
        function(a) {
            z = a
        };
    p.getAlignCase = function() {
        return w
    };
    p.setAlignCase = function(a) {
        w = a
    }
});
define("mode/behaviour/cstyle", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/behaviour").Behaviour;
    a("mode/cpp_code_model");
    a("mode/token_cursor");
    a("ace/mode/text");
    var m = a("mode/utils"),
        f = !0;
    a = function(a) {
        var e = a.$complements,
            b = function(a, b, c, h) {
                var d = e[a];
                if (b == a) return b = c.getSelectionRange(), h = h.doc.getTextRange(b), "" !== h ? {
                    text: a + h + d,
                    selection: !1
                } : {
                    text: a + d,
                    selection: [1, 1]
                };
                if (b == d && (a = c.getCursorPosition(), h.doc.getLine(a.row)[a.column] == d && (">" === d || null !==
                        h.findMatchingBracket({
                            row: a.row,
                            column: a.column + 1
                        })))) return {
                    text: "",
                    selection: [1, 1]
                }
            },
            c = function(a, b, c) {
                var d = e[a],
                    n = c.doc.getTextRange(b);
                if (!b.isMultiLine() && n == a && c.doc.getLine(b.start.row).substring(b.start.column + 1, b.start.column + 2) == d) return b.end.column++, b
            };
        this.add("R", "insertion", function(a, b, e, c, n) {
            if ("R" === n || "r" === n)
                if (a = e.getCursorPosition(), c = (new String(c.doc.getLine(a.row))).match(/^(\s*)\/\*{3,}\s*/)) return {
                    text: "R\n" + c[1] + "\n" + c[1] + "*/",
                    selection: [1, c[1].length, 1, c[1].length]
                }
        });
        this.add("newline", "insertion", function(b, e, c, h, n) {
            if ("\n" === n) {
                var d = c.getCursorPosition();
                n = d.row;
                var f = d.col;
                e = h.getTabString();
                var k = h.doc.$lines;
                c = k[n];
                if (!this.codeModel.inMacro(k, n - 1)) {
                    var q = /^(\s*\/\/'\s*)/.exec(c);
                    if (q && f >= q[1].length) return {
                        text: "\n" + q[1]
                    };
                    if (/^\s*[/][*]+\s*$/.test(c) && !/^\s*[*]/.test(k[n + 1] || "")) return h = this.$getIndent(c), e = h + " * ", {
                        text: "\n" + e + "\n" + h + " */",
                        selection: [1, e.length, 1, e.length]
                    };
                    if (m.endsWith(b, "comment") || m.endsWith(b, "doc-start")) {
                        d && d.row == n && (c = c.substring(0,
                            d.column));
                        if (b = /^(\s*)(\/\*)/.exec(c)) return {
                            text: "\n" + b[1] + " * "
                        };
                        if (b = /^(\s*\*+\s*)/.exec(c)) return {
                            text: "\n" + b[1],
                            selection: [1, b[1].length, 1, b[1].length]
                        }
                    }
                    for (b = f - 1;
                        /\s/.test(c[b]);) --b;
                    b = c[b];
                    f = c[f];
                    if (q = c.match(/\s*namespace\s*\w*\s*{/)) return h = this.$getIndent(c), {
                        text: "\n" + h,
                        selection: [1, h.length, 1, h.length]
                    };
                    if ("(" == b && ")" == f || "[" == b && "]" == f) return c = this.$getIndent(c), h = c + e, {
                        text: "\n" + h + "\n" + c,
                        selection: [1, h.length, 1, h.length]
                    };
                    if ("{" == b && "}" == f) {
                        if (/^\s*{/.test(c)) return c = this.$getIndent(c),
                            h = c + h.getTabString(), {
                                text: "\n" + h + "\n" + c,
                                selection: [1, h.length, 1, h.length]
                            };
                        n = a.getRowForOpenBraceIndent(h, n);
                        if (null !== n && 0 <= n) return c = this.$getIndent(h.getDocument().getLine(n)), h = c + h.getTabString(), {
                            text: "\n" + h + "\n" + c,
                            selection: [1, h.length, 1, h.length]
                        };
                        c = this.$getIndent(c);
                        h = c + e;
                        return {
                            text: "\n" + h + "\n" + c,
                            selection: [1, h.length, 1, h.length]
                        }
                    }
                }
            }
        });
        this.add("braces", "insertion", function(a, e, c, h, n) {
            if (this.insertMatching) {
                if ("{" == n && (a = c.getSelectionRange(), "" === h.doc.getTextRange(a))) {
                    a = this.codeModel.getTokenCursor();
                    if (!a.moveToPosition(c.getCursorPosition())) return b("{", n, c, h);
                    do
                        if (!a.bwdToMatchingArrow()) {
                            e = a.currentValue();
                            if (!e || !e.length) break;
                            if ("namespace" === e) return {
                                text: "{",
                                selection: [1, 1]
                            };
                            if ("class" === e || "struct" === e || "=" === e) return {
                                text: "{};",
                                selection: [1, 1]
                            };
                            if (f && "do" === e) return {
                                text: "{} while ();",
                                selection: [1, 1]
                            };
                            if (";" === e || "[" === e || "]" === e || "(" === e || ")" === e || "{" === e || "}" === e || "if" === e || "else" === e || "#" === e[0]) return {
                                text: "{}",
                                selection: [1, 1]
                            }
                        } while (a.moveToPreviousToken())
                }
                return b("{", n, c,
                    h)
            }
        });
        this.add("braces", "deletion", function(a, b, e, c, n) {
            if (this.insertMatching && (a = c.doc.getTextRange(n), !n.isMultiLine() && "{" == a)) {
                a = c.doc.getLine(n.start.row);
                if (/^\s*do\s*\{\} while \(\);\s*$/.test(a)) return n.end.column = a.length, n;
                c = a.substring(n.end.column, n.end.column + 1);
                a = a.substring(n.end.column + 1, n.end.column + 2);
                if ("}" == c) return n.end.column++, ";" == a && n.end.column++, n
            }
        });
        this.add("parens", "insertion", function(a, e, c, h, n) {
            if (this.insertMatching) return b("(", n, c, h)
        });
        this.add("parens", "deletion",
            function(a, b, e, h, n) {
                if (this.insertMatching) return c("(", n, h)
            });
        this.add("brackets", "insertion", function(a, e, c, h, n) {
            if (this.insertMatching) return b("[", n, c, h)
        });
        this.add("brackets", "deletion", function(a, b, e, h, n) {
            if (this.insertMatching) return c("[", n, h)
        });
        this.add("arrows", "insertion", function(a, e, c, h, n) {
            if (this.insertMatching && (a = h.getLine(c.getCursorPosition().row), /^\s*#\s*include/.test(a))) return b("<", n, c, h)
        });
        this.add("arrows", "deletion", function(a, b, e, h, n) {
            if (this.insertMatching) return c("<",
                n, h)
        });
        this.add("string_dquotes", "insertion", function(a, b, e, c, n) {
            if (this.insertMatching && ('"' == n || "'" == n)) {
                a = e.getSelectionRange();
                b = c.doc.getTextRange(a);
                if ("" !== b) return {
                    text: n + b + n,
                    selection: !1
                };
                e = e.getCursorPosition();
                b = c.doc.getLine(e.row);
                if ("\\" == b.substring(e.column - 1, e.column)) return null;
                c = c.getTokens(a.start.row);
                for (var d = 0, f, h = -1, k = 0; k < c.length; k++) {
                    f = c[k];
                    "string" == f.type ? h = -1 : 0 > h && (h = f.value.indexOf(n));
                    if (f.value.length + d > a.start.column) break;
                    d += c[k].value.length
                }
                if (!f || 0 > h && "comment" !==
                    f.type && ("string" !== f.type || a.start.column !== f.value.length + d - 1 && f.value.lastIndexOf(n) === f.value.length - 1)) return {
                    text: n + n,
                    selection: [1, 1]
                };
                if (f && "string" === f.type && b.substring(e.column, e.column + 1) == n) return {
                    text: "",
                    selection: [1, 1]
                }
            }
        });
        this.add("string_dquotes", "deletion", function(a, b, e, c, n) {
            if (this.insertMatching && (a = c.doc.getTextRange(n), !n.isMultiLine() && ('"' == a || "'" == a) && (c = c.doc.getLine(n.start.row).substring(n.start.column + 1, n.start.column + 2), '"' === c || "'" === c))) return n.end.column++, n
        });
        this.add("punctuation.operator",
            "insertion",
            function(a, b, e, c, n) {
                if (this.insertMatching && ";" === n && (a = e.selection.getCursor(), ";" == c.getLine(a.row)[a.column])) return {
                    text: "",
                    selection: [1, 1]
                }
            });
        this.add("macro", "insertion", function(a, b, e, c, n) {
            b = e.getPrintMarginColumn();
            b = Math.min(62, b);
            var d = c.getDocument().$lines,
                f = e.getCursorPosition(),
                k = f.row,
                h = d[k];
            e = h.substring(0, f.column);
            if (/^\s*#\s*define[^\\]*$/.test(h) && "\\" == n) return a = b - e.length + 1, 0 <= a ? {
                text: Array(a + 1).join(" ") + "\\\n" + this.$getIndent(h) + c.getTabString(),
                selection: !1
            } : {
                text: "\\\n" + c.getTabString(),
                selection: !1
            };
            if (/^\s*#\s*define/.test(h) || this.codeModel.inMacro(d, k - 1)) {
                if ("\\" == n && /^\s*$/.test(h.substring(e.length, h.length))) return a = b - e.length + 1, 0 <= a ? {
                    text: Array(a + 1).join(" ") + "\\",
                    selection: !1
                } : {
                    text: "\\",
                    selection: !1
                };
                if ("\n" == n) {
                    if (/^\s*$/.test(h) || /^\s*#\s*define/.test(h) && !/\\\s*$/.test(h)) return {
                        text: "\n",
                        selection: !1
                    };
                    if (/\\\s*$/.test(h) && !/\\\s*$/.test(e)) return {
                        text: "",
                        selection: [1, f.column, 1, f.column]
                    };
                    c = c.getMode().getNextLineIndent(a, h + "\\", c.getTabString(),
                        k, !1);
                    a = b - e.length + 1;
                    n = /\\\s*$/.test(e) ? "" : "\\";
                    return 0 <= a ? {
                        text: Array(a + 1).join(" ") + n + "\n" + c,
                        selection: !1
                    } : {
                        text: n + "\n" + c,
                        selection: !1
                    }
                }
            }
        })
    };
    l.inherits(a, g);
    p.CStyleBehaviour = a;
    p.setFillinDoWhile = function(a) {
        f = a
    };
    p.getFillinDoWhile = function() {
        return f
    }
});
define("mode/cpp_code_model", ["require", "exports", "module"], function(a, p, l) {
    a("ace/lib/oop");
    var g = a("ace/range").Range,
        m = a("mode/token_utils").TokenUtils;
    a("ace/token_iterator");
    var f = a("mode/token_cursor").CppTokenCursor,
        k = a("mode/cpp_scope_tree").CppScopeNode,
        e = a("mode/cpp_scope_tree").CppScopeManager,
        b = a("mode/r_code_model").getVerticallyAlignFunctionArgs,
        c = a("mode/utils");
    a = function(a, b, c, f, n) {
        this.$session = a;
        this.$doc = a.getDocument();
        this.$tokenizer = b;
        this.$tokens = Array(this.$doc.getLength());
        this.$statePattern = c;
        this.$codeBeginPattern = f;
        this.$codeEndPattern = n;
        this.$tokenUtils = new m(this.$doc, this.$tokenizer, this.$tokens, this.$statePattern, this.$codeBeginPattern);
        this.$scopes = new e(k);
        var d = !0,
            h = function(a, b) {
                d ? d = !1 : (this.$doc.off("change", g), this.$session.off("changeMode", h))
            }.bind(this),
            g = function(a) {
                this.$onDocChange(a)
            }.bind(this);
        this.$session.on("changeMode", h);
        this.$doc.on("change", g)
    };
    (function() {
        var a = c.contains;
        this.getTokenCursor = function() {
            return new f(this.$tokens, 0, 0, this)
        };
        this.$tokenizeUpToRow = function(a) {
            this.$tokenUtils.$tokenizeUpToRow(a)
        };
        var e = function(b, e) {
                for (;;) {
                    var c = b.currentValue(),
                        d = e.$doc.getLine(b.$row);
                    if (a(["{", "}", ";"], c)) break;
                    if (":" === c && (c = b.peekBwd().currentValue(), a(["public", "private", "protected"], c))) break;
                    if (/^\s*#/.test(d)) break;
                    if (!b.moveToPreviousToken()) break
                }
            },
            k = "if else for do while struct class try catch switch".split(" "),
            h = function(a) {
                a = a.trim();
                return a = a.replace(/[\n\s]+/g, " ")
            },
            n = function(a, b) {
                var e = h(a),
                    c = b;
                "undefined" === typeof c &&
                    (c = 80);
                e.length > c && (e = e.substring(0, c) + "...");
                return e
            };
        this.$complements = {
            "<": ">",
            ">": "<",
            "{": "}",
            "}": "{",
            "[": "]",
            "]": "[",
            "(": ")",
            ")": "(",
            "'": "'",
            '"': '"'
        };
        this.alignContinuationSlashes = function(a, b) {
            "undefined" === typeof b && (b = {
                start: 0,
                end: a.getLength()
            });
            var e = a.$lines;
            if (!(e instanceof Array)) return !1;
            for (var c = b.start; c < b.end; c++)
                if (p.test(e[c])) {
                    var d = c;
                    for (c += 1; p.test(e[c]) && c <= b.end;) c++;
                    for (var f = c, n = e.slice(d, f).map(function(a) {
                            return a.lastIndexOf("\\")
                        }), k = Math.max.apply(null, n), h = 0; h < f -
                        d; h++) {
                        var g = {
                                row: d + h,
                                column: n[h]
                            },
                            q = Array(k - n[h] + 1).join(" ");
                        a.insert(g, q)
                    }
                } return !0
        };
        this.allIndicesOf = function(a, b) {
            for (var e = [], c = 0; c < a.length; c++) a[c] == b && e.push(c);
            return e
        };
        this.getRowForMatchingEOLArrows = function(a, b, e) {
            a = 0;
            for (var c, d = 1; 100 > d; d++) {
                c = this.getLineSansComments(b, e - d);
                if (/;\s*$/.test(c)) break;
                if (/<\s*$/.test(c) && !/<<\s*$/.test(c)) {
                    if (0 === a) return e - d;
                    a--
                } else /^\s*>/.test(c) && !/^\s*>>/.test(c) && a++
            }
            return -1
        };
        var m = /^\s*#\s*define/,
            p = /\\\s*$/,
            w = /^\s*[+\-/&^%$!<>.?|=~]|^\s*\*[^/]|^\s*\/[^\*]/,
            l = /[+\-*&^%$!<>.?|=~]\s*$|\*[^/]\s*$|\/[^\*]\s*$/,
            I = function(a) {
                return w.test(a) || l.test(a)
            };
        this.inMacro = function(a, b) {
            var e = a[b];
            return 0 > b ? !1 : p.test(e) ? m.test(e) ? !0 : this.inMacro(a, b - 1) : !1
        };
        this.$buildScopeTreeUpToRow = function(a) {
            a = Math.min(a + 30, this.$doc.getLength() - 1);
            this.$tokenUtils.$tokenizeUpToRow(a);
            var b = this.getTokenCursor();
            if (b.seekToNearestToken(this.$scopes.parsePos, a)) {
                do {
                    this.$scopes.parsePos = b.currentPosition();
                    this.$scopes.parsePos.column += b.currentValue().length;
                    var c = b.currentToken().type;
                    if (/\bsectionhead\b/.test(c)) {
                        if (c = /^\/\/'?[-=#\s]*(.*?)\s*[-=#]+\s*$/.exec(b.currentValue())) c = "" + c[1], 0 == c.length && (c = "(Untitled)"), 50 < c.length && (c = c.substring(0, 50) + "..."), this.$scopes.onSectionStart(c, b.currentPosition())
                    } else if (/\bcodebegin\b/.test(c)) {
                        c = b.currentPosition();
                        var d = {
                            row: c.row + 1,
                            column: 0
                        };
                        this.$scopes.getTopLevelScopeCount();
                        this.$scopes.onChunkStart("(R Code Chunk)", "(R Code Chunk)", c, d)
                    } else if (/\bcodeend\b/.test(c)) {
                        for (c = b.currentPosition(); this.$scopes.onScopeEnd(c););
                        c.column +=
                            b.currentValue().length;
                        this.$scopes.onChunkEnd(c)
                    } else if ("{" === b.currentValue())
                        if (c = b.cloneCursor(), d = c.currentPosition(), c.isFirstSignificantTokenOnLine() && (d.column = 0), "namespace" === c.peekBwd(2).currentValue()) c.moveToPreviousToken(), d = c.currentValue(), this.$scopes.onNamespaceScopeStart("namespace " + d, c.currentPosition(), b.currentPosition(), d);
                        else if ("namespace" === c.peekBwd().currentValue()) this.$scopes.onNamespaceScopeStart("anonymous namespace", d, b.currentPosition(), "<anonymous>");
                    else if ("class" ===
                        c.peekBwd(2).currentValue() || "struct" === c.peekBwd(2).currentValue() || c.bwdOverClassInheritance()) {
                        c.moveToPreviousToken();
                        var f = c.cloneCursor();
                        e(f, this);
                        f = f.peekFwd().currentPosition();
                        d = this.$session.getTextRange(new g(f.row, f.column, d.row, d.column));
                        d = h(d);
                        this.$scopes.onClassScopeStart(d, c.currentPosition(), b.currentPosition(), d)
                    } else if (c.bwdOverConstNoexceptDecltype() && c.bwdOverInitializationList() && c.moveBackwardOverMatchingParens() || c.moveBackwardOverMatchingParens())
                        if ("identifier" === c.peekBwd().currentType() ||
                            "]" === c.peekBwd().currentValue() || /^operator/.test(c.peekBwd().currentValue()))
                            if ("]" === c.peekBwd().currentValue()) c = c.currentPosition(), c = this.$session.getTextRange(new g(c.row, c.column, d.row, d.column - 1)), c = h("lambda " + c), this.$scopes.onLambdaScopeStart(c, d, b.currentPosition());
                            else {
                                if (c.moveToPreviousToken()) {
                                    var k = "";
                                    d = c.currentValue();
                                    f = "";
                                    var A = this.$scopes.getActiveScopes(c.currentPosition());
                                    null != A && (A = A[A.length - 1], A.isClass() && A.label === "class " + d ? "~" === c.peekBwd().currentValue() && (d = "~" +
                                        d) : (k = c.cloneCursor(), e(k, this), k.moveToNextToken(), k = k.currentPosition(), A = c.currentPosition(), k = this.$session.getTextRange(new g(k.row, k.column, A.row, A.column))));
                                    var q = c.peekFwd();
                                    A = q.currentPosition();
                                    q.fwdToMatchingToken() && ("const" === q.peekFwd().currentValue() && q.moveToNextToken(), "noexcept" === q.peekFwd().currentValue() && q.moveToNextToken(), "noexcept" === q.currentValue() && "(" === q.peekFwd().currentValue() && (q.moveToNextToken(), q.fwdToMatchingToken()), (q = q.peekFwd().currentPosition()) && (f = this.$session.getTextRange(new g(A.row,
                                        A.column, q.row, q.column))));
                                    k = 0 < k.length ? n(d.trim() + f.trim() + ": " + k.trim()) : n(d.trim() + f.trim());
                                    this.$scopes.onFunctionScopeStart(k, c.currentPosition(), b.currentPosition(), d.trim(), f.split(","))
                                }
                            }
                    else this.$scopes.onScopeStart(d);
                    else this.$scopes.onScopeStart(d);
                    else "}" === b.currentValue() && (c = b.currentPosition(), b.isLastSignificantTokenOnLine() ? c.column = this.$doc.getLine(c.row).length + 1 : c.column++, this.$scopes.onScopeEnd(c))
                } while (b.moveToNextToken(a))
            }
        };
        this.getCurrentScope = function(a, b) {
            b || (b =
                function(a) {
                    return !0
                });
            if (!a) return "";
            this.$buildScopeTreeUpToRow(a.row);
            var c = this.$scopes.getActiveScopes(a);
            if (c)
                for (var e = c.length - 1; 0 <= e; e--)
                    if (b(c[e])) return c[e];
            return null
        };
        this.getScopeTree = function() {
            this.$buildScopeTreeUpToRow(this.$doc.getLength() - 1);
            return this.$scopes.getScopeList()
        };
        this.getRowForOpenBraceIndent = function(b, c, e) {
            if (1 >= b.getDocument().$lines.length) return -1;
            if (this.$tokenUtils.$tokenizeUpToRow(c)) try {
                for (var d = Array(this.$tokens.length), f = 0; f < this.$tokens.length; f++)
                    if (null !=
                        this.$tokens[f] && 0 < this.$tokens[f].length) {
                        var n = this.$tokens[f];
                        "\\" === n[n.length - 1].value && (d[f] = this.$tokens[f].splice(n.length - 1, 1)[0])
                    } var h = this.getTokenCursor();
                if (e) {
                    var g = b.getSelection().getCursor();
                    if (!h.moveToPosition(g)) return 0
                } else
                    for (h.$row = c, f = h.$tokens[c].length - 1, f = h.$tokens[c].length - 1; 0 <= f && (h.$offset = f, "{" !== h.currentValue()); f--);
                if ("{" === h.peekBwd().currentValue() || ";" === h.currentValue()) return -1;
                h.bwdOverInitializationList();
                h.bwdOverClassInheritance();
                if ("{" === h.currentValue() &&
                    !h.moveToPreviousToken() || "{" === h.currentValue()) return -1;
                for (;
                    "keyword" === h.currentType();) {
                    var q = h.currentValue();
                    if (a(k, q) || 0 === h.$row && 0 === h.$offset) return h.$row;
                    if (!h.moveToPreviousToken()) return -1
                }
                if (":" === h.currentValue()) {
                    var m = h.peekBwd().currentValue();
                    if (a(["public", "private", "protected"], m)) return h.moveToNextToken(), h.$row
                }
                if (":" === h.currentValue())
                    for (; h.moveToPreviousToken();) {
                        if (h.bwdToMatchingToken())
                            if ("keyword" === h.peekBwd().currentType()) continue;
                            else break;
                        if ("identifier" ===
                            h.currentType()) break
                    }
                if (")" === h.currentValue() && !h.bwdToMatchingToken() || "(" === h.currentValue() && !h.moveToPreviousToken()) return -1;
                "=" === h.currentValue() && h.moveToPreviousToken();
                return h.$row
            } finally {
                for (f = 0; f < d.length; f++) "undefined" !== typeof d[f] && this.$tokens[f].push(d[f])
            }
            return -1
        };
        this.getLineSansComments = function(a, b, c) {
            if (0 > b) return "";
            a = a.getLine(b);
            var e = /(?!\\)"/g,
                d = a,
                f;
            for (b = []; f = e.exec(d);) b.push(f.index);
            if (0 < b.length && 0 === b.length % 2)
                for (e = 0; e < b.length / 2; e += 2) d = b[e + 1], a = a.substring(0,
                    b[e] + 1) + a.substring(d, a.length);
            b = a.indexOf("//"); - 1 != b && (a = a.substring(0, b));
            p.test(a) && (a = a.substring(0, a.lastIndexOf("\\")));
            c && (a = a.replace(/\bconst\b/, "").replace(/\bnoexcept\b/, ""));
            return a
        };
        this.findStartOfCommentBlock = function(a, b, c) {
            for (var e = 0, d = /^\s*\/+\*/; 0 <= b && e < c;) {
                if (d.test(a[b])) return b;
                --b;
                ++e
            }
            return -1
        };
        this.getNextLineIndent = function(e, d, f, h, n) {
            var k = b(),
                g = this.$session,
                q = g.getTabSize(),
                v = g.getDocument();
            "number" !== typeof h && (h = g.getSelection().getCursor().row - 1);
            if (-1 === h) return d =
                v.getLine(0), 0 < d.length ? this.$getIndent(d) : "";
            if (0 === d.length || /^\s*#/.test(d)) return this.getNextLineIndent(c.getPrimaryState(g, h - 1), v.getLine(h - 1), f, h - 1, n);
            var w = this.$getIndent(d),
                r = this.$getUnindent(d, q),
                l = v.$lines;
            if (c.endsWith(e, "comment") || c.endsWith(e, "doc-start")) {
                z && z.row == h && (d = d.substring(0, z.column));
                if (/^\s*$/.test(d)) return this.$getIndent(l[h]);
                z = this.findStartOfCommentBlock(l, h, 200);
                if (null !== z) return this.$getIndent(l[z]) + " "
            }
            if (c.endsWith(e, "start")) {
                if (m.test(d)) return /\\\s*$/.test(d) ?
                    w + f : w;
                if (/^\s*#\s*\S/.test(d)) return w;
                if (this.inMacro(l, h - 1) && !p.test(d)) return r;
                d = this.getLineSansComments(v, h);
                var z = g.getSelection().getCursor();
                z && z.row == h && !n && (d = d.substring(0, z.column));
                e = this.getLineSansComments(v, h - 1);
                if ("string" !== typeof d) return "";
                if (0 === d.length || /^\s*$/.test(d)) return this.$getIndent(l[h]);
                if (/\*\/\s*$/.test(d) && (r = this.findStartOfCommentBlock(l, h, 200), 0 <= r)) return this.$getIndent(l[r]);
                if (/^\s*<</.test(d)) {
                    for (d = h - 1;
                        /^\s*<</.test(l[d]);) d--;
                    return this.$getIndent(l[d])
                }
                if (/^\s*\./.test(d)) {
                    for (d =
                        h - 1;
                        /^\s*\./.test(l[d]);) d--;
                    return this.$getIndent(l[d])
                }
                if (/\bnamespace\b.*\{\s*$/.test(d) || /\bswitch\b.*\{\s*$/.test(d)) return w;
                if (d.match(/\(\s*$/)) return -1 !== d.indexOf("=") || /^\s*(return\s+)?[a-zA-Z0-9_.->:]+\(\s*$/.test(d) ? w + f : w + f + f;
                if (/^\s*(class|struct).*\{\s*$/.test(d) || /^\s*(class|struct)\s+.+:\s*$/.test(d)) return w + f;
                if ((r = d.match(/(^\s*(?:class|struct)\s+.*\w[^:]):[^:]\s*.+/)) && !/,\s*/.test(d) || (r = d.match(/^(\s*(class|struct).*:\s*).*,\s*$/)) || (r = d.match(/^(\s*:\s*)(\w+).*,\s*$/)) || (r =
                        d.match(/^(\s*)[:,]\s*[\w\s]*$/))) return k ? Array(r[1].length + 1).join(" ") : w + f;
                if (/<\s*$/.test(d)) return w + f;
                if (/^\s*".*"\s*$/.test(d) || /^\s*template\s*<.*>\s*$/.test(d) && d.split(">").length == d.split("<").length) return w;
                if (/([\[\{\(<]).+,\s*$/.exec(d)) {
                    var B = ["(", "{", "[", "<"];
                    for (r = 0; r < B.length; r++) {
                        var x = B[r],
                            y = this.$complements[x];
                        x = this.allIndicesOf(d, x);
                        if (x.length && (y = this.allIndicesOf(d, y), y = x.length - y.length - 1, !(0 > y))) return l = x[y], k ? (d = d.substr(l + 1).match(/([^\s])/), Array(l + d.index + 2).join(" ")) :
                            w + f
                    }
                }
                for (r = h - 1; 0 <= r && /^\s*$|^\s*#/.test(e);) e = this.getLineSansComments(v, r), r--;
                if (I(d) && I(e)) return this.$getIndent(d);
                if (this.$tokenUtils.$tokenizeUpToRow(h + 2)) {
                    B = Array(this.$tokens.length);
                    try {
                        for (r = 0; r < this.$tokens.length; r++)
                            if (null != this.$tokens[r] && 0 < this.$tokens[r].length) {
                                var E = this.$tokens[r];
                                "\\" === E[E.length - 1].value && (B[r] = this.$tokens[r].splice(E.length - 1, 1)[0])
                            } var u = this.getTokenCursor();
                        n ? (u.$row = h, u.$offset = this.$tokens[h].length - 1) : u.moveToPosition(z);
                        for (; 0 > u.$offset && 0 < u.$row;) u.$row--,
                            u.$offset = u.$tokens[u.$row].length - 1;
                        for (; 0 < u.$row && /^\s*#/.test(v.getLine(u.$row));) u.$row--, u.$offset = u.$tokens[u.$row].length - 1;
                        n = "";
                        var G = u.cloneCursor(),
                            F = G.currentValue(),
                            L = G.currentType();
                        if ("constant" === L || "keyword" === L || "identifier" === L || a(["{", ")", ">", ":"], F)) n = f;
                        for (;
                            ";" === u.currentValue() && u.moveToPreviousToken(););
                        var N = u.cloneCursor();
                        if (k && u.isLastSignificantTokenOnLine() && ("keyword.operator" === u.currentType() || "punctuation.operator" === u.currentType())) {
                            var Q = u.cloneCursor();
                            Q.$offset =
                                0;
                            if ("keyword" === Q.currentType()) {
                                var O = d.split("(").length - d.split(")").length;
                                if (0 < O) {
                                    var M = d.match(/.*?\(\s*(\S)/);
                                    if (M) return Array(M[0].length).join(" ")
                                }
                            }
                        }
                        if ("," === u.currentValue()) {
                            if (k) {
                                var H = u.peekBwd();
                                if ("]" === H.currentValue() && H.bwdToMatchingToken()) return Array(H.currentPosition().column + 1).join(" ");
                                O = d.split("(").length - d.split(")").length;
                                if (0 < O && (M = d.match(/.*?\(\s*(\S)/))) return Array(M[0].length).join(" ")
                            }
                            if (/[,(]\s*$/.test(d) && /[,(]\s*$/.test(e)) return this.$getIndent(d);
                            var C =
                                u.cloneCursor();
                            return C.findOpeningBracket("{", !1) && C.bwdOverClassySpecifiers() && "enum" === C.currentValue() ? this.$getIndent(l[C.$row]) + f : -1 !== d.indexOf("=") ? this.$getIndent(d) + f : this.$getIndent(d)
                        }
                        if ("keyword.operator" === L && ":" !== F) return this.$getIndent(l[h]) + f;
                        for (;;) {
                            if ("undefined" === typeof u.currentValue()) return "undefined" !== typeof N.currentValue() ? this.$getIndent(l[N.$row]) + n : n;
                            N = u.cloneCursor();
                            if (";" === u.currentValue() && u.moveToNextToken()) {
                                for (h = u.$row; null != l[h] && /^\s*#/.test(l[h]);) ++h;
                                return this.$getIndent(l[h]) + n
                            }
                            if (a(["for", "while", "do", "try"], u.currentValue()) && ";" !== F) return this.$getIndent(l[u.$row]) + n;
                            H = u.peekBwd();
                            if (":" === u.currentValue()) {
                                if (a(["public", "private", "protected"], H.currentValue())) return this.$getIndent(l[H.$row]) + f;
                                var D = l[u.$row];
                                if (/^\s*case/.test(D)) return this.$getIndent(D) + f;
                                if (")" === H.currentValue() && (C = H.cloneCursor(), C.bwdToMatchingToken())) {
                                    var K = C.peekBwd(1),
                                        R = C.peekBwd(2);
                                    if (null !== K && "identifier" === K.currentType() && null !== R && !/\boperator\b/.test(R.currentType())) return this.$getIndent(l[C.peekBwd().$row]) +
                                        n
                                }
                            }
                            if ("]" === u.currentValue() && "(" === u.peekFwd().currentValue() && (C = u.cloneCursor(), C.bwdToMatchingToken())) return this.$getIndent(l[C.$row]) + n;
                            if ("(" === u.currentValue() && "for" === H.currentValue() && ";" === F) return u.peekFwd().cloneCursor(), k ? Array(u.peekFwd().currentPosition().column + 1).join(" ") : this.$getIndent(l[u.peekFwd().$row]) + f;
                            if (k && "(" === u.currentValue() && !u.isLastSignificantTokenOnLine()) return u.moveToNextToken(), Array(u.currentPosition().column + 1 + q).join(" ");
                            if ("if" === u.currentValue() ||
                                "else" === u.currentValue() || "template" === u.currentValue() && "<" === u.peekFwd().currentValue()) return this.$getIndent(l[u.$row]) + n;
                            if ("{" === u.currentValue()) {
                                var S = this.getRowForOpenBraceIndent(g, u.$row);
                                return 0 <= S ? (d = this.getLineSansComments(v, S), w = this.$getIndent(d), /\bnamespace\b/.test(d) ? w : w + f) : this.$getIndent(l[u.$row]) + f
                            }
                            if (0 === u.$row && 0 === u.$offset) return this.$getIndent(l[0]) + n;
                            if (">" === u.currentValue() && (C = u.cloneCursor(), C.bwdToMatchingArrow() && "template" === C.peekBwd().currentValue())) return ">" ===
                                F && (n = ""), this.$getIndent(l[C.$row]) + n;
                            u.bwdToMatchingToken();
                            if (!u.moveToPreviousToken()) break;
                            for (; 0 < u.$row && /^\s*#/.test(l[u.$row]);) u.$row--, u.$offset = this.$tokens[u.$row].length - 1
                        }
                    } finally {
                        for (r = 0; r < B.length; r++) "undefined" !== typeof B[r] && this.$tokens[r].push(B[r])
                    }
                }
            }
            return w
        };
        this.$onDocChange = function(a) {
            "insert" === a.action ? this.$tokenUtils.$insertNewRows(a.start.row, a.end.row - a.start.row) : this.$tokenUtils.$removeRows(a.start.row, a.end.row - a.start.row);
            this.$tokenUtils.$invalidateRow(a.start.row);
            this.$scopes.invalidateFrom(a.start)
        };
        this.$getIndent = function(a) {
            return (a = /^([ \t]*)/.exec(a)) ? a[1] : ""
        };
        this.$padIndent = function(a, b, c) {
            b = Array(b + 1).join(" ");
            b = a.replace("\t", b);
            return b >= c ? a : a + Array(c - b + 1).join(" ")
        };
        this.$getUnindent = function(a, b) {
            var c = this.$getIndent(a);
            if (null === c || 0 === c.length) return "";
            var d = c.indexOf("\t");
            if (-1 != d) return c.substring(0, d) + c.substring(d + 1, c.length);
            for (var e = d = 0; e < b && e < c.length; e++) " " === c[e] && d++;
            return c.substring(d, c.length)
        }
    }).call(a.prototype);
    p.CppCodeModel =
        a
});
define("mode/cpp_scope_tree", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/r_scope_tree");
    a = g.ScopeManager;
    var m = g.ScopeNode,
        f = function(a, e, b, c, d, f) {
            this.label = a;
            this.start = e;
            this.preamble = b || e;
            this.end = null;
            this.scopeType = c;
            this.scopeCategory = d;
            this.attributes = f || {};
            this.parentScope = null;
            this.$children = []
        };
    l.mixin(f.prototype, m.prototype);
    f.CATEGORY_CLASS = 1;
    f.CATEGORY_NAMESPACE = 2;
    f.CATEGORY_FUNCTION = 3;
    f.CATEGORY_LAMBDA = 4;
    f.CATEGORY_ANON = 5;
    (function() {
        this.isClass =
            function() {
                return this.scopeType == m.TYPE_BRACE && this.scopeCategory == f.CATEGORY_CLASS
            };
        this.isNamespace = function() {
            return this.scopeType == m.TYPE_BRACE && this.scopeCategory == f.CATEGORY_NAMESPACE
        };
        this.isFunction = function() {
            return this.scopeType == m.TYPE_BRACE && this.scopeCategory == f.CATEGORY_FUNCTION
        };
        this.isLambda = function() {
            return this.scopeType == m.TYPE_BRACE && this.scopeCategory == f.CATEGORY_LAMBDA
        }
    }).call(f.prototype);
    g = function(a) {
        this.$ScopeNodeFactory = a;
        this.parsePos = {
            row: 0,
            column: 0
        };
        this.$root = new a("(Top Level)",
            this.parsePos, null, m.TYPE_ROOT)
    };
    l.mixin(g.prototype, a.prototype);
    (function() {
        this.onClassScopeStart = function(a, e, b, c) {
            a = new this.$ScopeNodeFactory(a, b, e, m.TYPE_BRACE, f.CATEGORY_CLASS, {
                name: c
            });
            this.$root.addNode(a);
            this.printScopeTree()
        };
        this.onNamespaceScopeStart = function(a, e, b, c) {
            a = new this.$ScopeNodeFactory(a, b, e, m.TYPE_BRACE, f.CATEGORY_NAMESPACE, {
                name: c
            });
            this.$root.addNode(a);
            this.printScopeTree()
        };
        this.onFunctionScopeStart = function(a, e, b, c, d) {
            a = new this.$ScopeNodeFactory(a, b, e, m.TYPE_BRACE,
                f.CATEGORY_FUNCTION, {
                    name: c,
                    args: d
                });
            this.$root.addNode(a);
            this.printScopeTree()
        };
        this.onLambdaScopeStart = function(a, e, b, c) {
            a = new this.$ScopeNodeFactory(a, b, e, m.TYPE_BRACE, f.CATEGORY_LAMBDA, {
                args: c
            });
            this.$root.addNode(a);
            this.printScopeTree()
        };
        this.onScopeStart = function(a) {
            this.$root.addNode(new this.$ScopeNodeFactory(null, a, null, m.TYPE_BRACE));
            this.printScopeTree()
        };
        this.onScopeEnd = function(a) {
            a = this.$root.closeScope(a, m.TYPE_BRACE);
            this.printScopeTree();
            return a
        }
    }).call(g.prototype);
    p.CppScopeManager =
        g;
    p.CppScopeNode = f
});
define("mode/dcf", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("mode/dcf_highlight_rules").DcfHighlightRules;
    a = function() {
        this.$tokenizer = new m((new f).getRules())
    };
    l.inherits(a, g);
    (function() {
        this.getNextLineIndent = function(a, e, b) {
            return this.$getIndent(e)
        }
    }).call(a.prototype);
    p.Mode = a
});
define("mode/dcf_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.$rules = {
            start: [{
                token: ["keyword", "text"],
                regex: "^([\\w@-]+)(\\:)"
            }, {
                token: "text",
                regex: ".+"
            }]
        }
    };
    l.inherits(g, a);
    p.DcfHighlightRules = g
});
define("mode/doc_comment_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.$rules = {
            start: [{
                token: "comment.doc.tag",
                regex: "[@\\\\][\\w\\d_]+"
            }, {
                token: "comment.doc",
                merge: !0,
                regex: "\\s+"
            }, {
                token: "comment.doc",
                merge: !0,
                regex: "TODO"
            }, {
                token: "comment.doc",
                merge: !0,
                regex: "[^@\\\\\\*]+"
            }, {
                token: "comment.doc",
                merge: !0,
                regex: "."
            }]
        }
    };
    l.inherits(g, a);
    g.getStartRule = function(a) {
        return {
            token: "comment.doc",
            merge: !0,
            regex: "\\/\\*[\\*\\!]",
            next: a
        }
    };
    g.getEndRule = function(a) {
        return {
            token: "comment.doc",
            merge: !0,
            regex: "\\*\\/",
            next: a
        }
    };
    p.DocCommentHighlightRules = g
});
define("util/expand_selection", ["require", "exports", "module"], function(a, p, l) {
    p = a("ace/editor").Editor;
    var g = a("ace/range").Range;
    a("ace/keyboard/vim");
    var m = a("ace/token_iterator").TokenIterator,
        f = a("mode/utils");
    (function() {
        function a(a, b) {
            for (var c = a.session.getTokens(b), d = 0; d < c.length; d++) {
                var e = c[d];
                if (!/^\s*$/.test(e.value)) return /\bcomment\b/.test(e.type)
            }
            return !1
        }

        function e(a, b) {
            var c = a.start.row < b.start.row || a.start.row === b.start.row && a.start.column < b.start.column,
                d = a.start.row === b.start.row &&
                a.start.column === b.start.column,
                e = a.end.row > b.end.row || a.end.row === b.end.row && a.end.column > b.end.column,
                f = a.end.row === b.end.row && a.end.column === b.end.column;
            return c ? e || f : e ? c || d : !1
        }

        function b(a, b) {
            for (var c = a.getCurrentToken(), d = a.getCurrentTokenRow(); a.moveToPreviousSignificantToken();) {
                var e = a.getCurrentToken();
                if (d !== a.getCurrentTokenRow() && 0 !== e.type.indexOf("keyword.operator")) {
                    if (!a.moveToNextSignificantToken()) return !1;
                    break
                }
                if (r.test(c.value) && (r.test(e.value) || f.isOpeningBracket(e.value) ||
                        f.contains(b, e.value))) {
                    if (!a.moveToNextSignificantToken()) return !1;
                    break
                }
                a.bwdToMatchingToken();
                c = a.getCurrentToken();
                d = a.getCurrentTokenRow()
            }
            return !0
        }

        function c(a, b, c) {
            h.push({
                name: a,
                immediate: b,
                execute: c
            })
        }
        var d = this,
            r = /['"\w.]/,
            q = !1;
        this.$onClearSelectionHistory = function() {
            return d.$clearSelectionHistory()
        };
        this.$clearSelectionHistory = function() {
            this.$selectionRangeHistory = null;
            this.off("change", this.$clearSelectionHistory)
        };
        this.$acceptSelection = function(a, b, c) {
            null == this.$selectionRangeHistory &&
                (this.$selectionRangeHistory = []);
            a.setSelectionRange(b);
            a.getRange().isEqual(c) || this.$selectionRangeHistory.push(c);
            this.isRowFullyVisible(b.start.row) && this.isRowFullyVisible(b.end.row) || this.centerSelection(a);
            return b
        };
        var h = [];
        c("string", !0, function(a, b, c, d) {
            return (a = b.getTokenAt(d.start.row, d.start.column + 1)) && /\bstring\b/.test(a.type) ? new g(d.start.row, a.column + 1, d.start.row, a.column + a.value.length - 1) : null
        });
        c("token", !0, function(a, b, c, d) {
            return (a = b.getTokenAt(d.start.row, d.start.column + 1)) &&
                /[\d\w]/.test(a.value) ? new g(d.start.row, a.column, d.start.row, a.column + a.value.length) : null
        });
        c("comment", !0, function(b, c, d, e) {
            c = e.start.row;
            e = e.end.row;
            for (d = c; d <= e; d++)
                if (!a(b, d)) return null;
            for (; a(b, c);) c--;
            for (; a(b, e);) e++;
            b = b.getSession().getLine(e - 1).length;
            return new g(c + 1, 0, e - 1, b)
        });
        c("includeBoundaries", !0, function(a, b, c, d) {
            a = new m(b);
            c = a.moveToPosition(d.start);
            0 === d.start.column && (c = a.moveToPreviousToken());
            b = new m(b);
            d = b.moveToPosition(d.end, !0);
            if (c && d) {
                var e = "support.function.codebegin" ===
                    c.type && "support.function.codeend" === d.type;
                e || (e = f.isOpeningBracket(c.value) && f.getComplement(c.value) === d.value);
                if (e) return a = a.getCurrentTokenPosition(), c = b.getCurrentTokenPosition(), c.column += d.value.length, g.fromPoints(a, c)
            }
            return null
        });
        c("matching", !1, function(a, b, c, d) {
            a = new m(b);
            d = a.moveToPosition(d.start);
            if (null == d) return null;
            do {
                if (null == d) break;
                if (!a.bwdToMatchingToken() && (f.isOpeningBracket(d.value) || "support.function.codebegin" === d.type)) {
                    c = a.getCurrentTokenPosition();
                    "support.function.codebegin" ===
                    d.type ? (c.row++, c.column = 0) : c.column += d.value.length;
                    var e = a.clone();
                    if (e.fwdToMatchingToken()) return a = e.getCurrentTokenPosition(), "support.function.codebegin" === d.type && (a.row--, a.column = b.getLine(a.row).length), g.fromPoints(c, a)
                }
            } while (d = a.stepBackward());
            return null
        });
        c("statement", !1, function(a, c, d, e) {
            a = new m(c);
            if (!a.moveToPosition(e.start, !0)) return null;
            c = new m(c);
            if (!(d = !c.moveToPosition(e.end) || !b(a, [";", ",", "=", "<-", "<<-"]))) {
                a: {
                    d = [";", ","];
                    for (var h = c.getCurrentToken(), k = c.getCurrentTokenRow(); c.moveToNextSignificantToken();) {
                        var n =
                            c.getCurrentToken();
                        if (k !== c.getCurrentTokenRow() && 0 !== h.type.indexOf("keyword.operator")) {
                            if (!c.moveToPreviousSignificantToken()) {
                                d = !1;
                                break a
                            }
                            break
                        }
                        if (r.test(h.value) || f.isClosingBracket(h.value))
                            if (r.test(n.value) || f.isClosingBracket(n.value) || f.contains(d, n.value)) {
                                if (!c.moveToPreviousSignificantToken()) {
                                    d = !1;
                                    break a
                                }
                                break
                            } c.fwdToMatchingToken();
                        h = c.getCurrentToken();
                        k = c.getCurrentTokenRow()
                    }
                    d = !0
                }
                d = !d
            }
            if (d) return null;
            d = a.getCurrentTokenPosition();
            h = c.getCurrentTokenPosition();
            if (d.row === e.start.row &&
                d.column === e.start.column && h.row === e.end.row && h.column <= e.end.column && !b(a, [";", ","])) return null;
            e = a.getCurrentTokenPosition();
            a = c.getCurrentTokenPosition();
            a.column += c.getCurrentTokenValue().length;
            return g.fromPoints(e, a)
        });
        c("scope", !1, function(a, b, c, d) {
            c = b.getMode();
            if (null == c.codeModel || null == c.codeModel.getCurrentScope) return null;
            a = [];
            for (d = c.codeModel.getCurrentScope(d.start); null != d;) {
                c = d.preamble;
                var e = d.end;
                if (null == e && d.parentScope)
                    for (var f = d.parentScope.$children, h = f.length - 2; 0 <= h; h--)
                        if (f[h].equals(d)) {
                            e =
                                f[h + 1].preamble;
                            break
                        } null == e && (e = {
                    row: b.getLength(),
                    column: 0
                });
                a.push(g.fromPoints(c, e));
                d = d.parentScope
            }
            return 0 === a.length ? null : a
        });
        c("everything", !1, function(a, b, c, d) {
            a = b.getLength();
            if (0 === a) return new g(0, 0, 0, 0);
            b = b.getLine(a - 1);
            return new g(0, 0, a - 1, b.length)
        });
        this.$expandSelection = function() {
            q || (d.on("change", d.$onClearSelectionHistory), q = !0);
            for (var a = this.getSession(), b = this.getSelection(), c = b.getRange(), k = [], g = 0; g < h.length; g++) {
                var m = h[g],
                    r = m.execute(this, a, b, c);
                f.isArray(r) || (r = [r]);
                for (var l =
                        0; l < r.length; l++) {
                    var p = r[l];
                    if (p && m.immediate && e(p, c)) return this.$acceptSelection(b, p, c);
                    p && e(p, c) && k.push({
                        name: m.name,
                        range: p
                    })
                }
            }
            k.sort(function(a, b) {
                a = a.range;
                b = b.range;
                var c = a.end.row - a.start.row,
                    d = b.end.row - b.start.row;
                return c !== d ? c > d : a.end.column - a.start.column > b.end.column - b.start.column
            });
            return this.$acceptSelection(b, k[0].range, c)
        };
        this.$shrinkSelection = function() {
            var a = this.$selectionRangeHistory;
            if (a && a.length) return a = a.pop(), this.getSelection().setSelectionRange(a), this.isRowFullyVisible(a.start.row) &&
                this.isRowFullyVisible(a.end.row) || this.centerSelection(this.getSelection()), a;
            q && (d.off("change", d.$onClearSelectionHistory), q = !1);
            return this.getSelectionRange()
        }
    }).call(p.prototype)
});
define("mode/markdown", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/mode/javascript").Mode,
        f = a("ace/mode/xml").Mode,
        k = a("ace/mode/html").Mode,
        e = a("mode/markdown_highlight_rules").MarkdownHighlightRules,
        b = a("mode/markdown_folding").FoldMode;
    a = function() {
        this.HighlightRules = e;
        this.createModeDelegates({
            "js-": m,
            "xml-": f,
            "html-": k
        });
        this.foldingRules = new b
    };
    l.inherits(a, g);
    (function() {
        this.type = "text";
        this.blockComment = {
            start: "\x3c!--",
            end: "--\x3e"
        };
        this.getNextLineIndent = function(a, b, e) {
            return this.$getIndent(b)
        };
        this.$id = "mode/markdown"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/markdown_folding", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/folding/fold_mode").FoldMode,
        m = a("ace/range").Range;
    p = p.FoldMode = function() {};
    var f = a("mode/utils");
    l.inherits(p, g);
    (function() {
        this.foldingStartMarker = /^(?:[=-]+\s*$|#{1,6} |`{3})/;
        this.getFoldWidget = function(a, e, b) {
            e = "markbeginend" === e ? "end" : "";
            var c = a.getLine(b);
            return this.foldingStartMarker.test(c) ? "`" == c[0] ? "start" === f.getPrimaryState(a, b) ? e : "start" : "" : ""
        };
        this.getFoldWidgetRange =
            function(a, e, b) {
                function c(b) {
                    return (l = a.getTokens(b)[0]) && 0 === l.type.lastIndexOf(p, 0)
                }

                function d() {
                    var a = l.value[0];
                    return "=" == a ? 6 : "-" == a ? 5 : 7 - l.value.search(/[^#]/)
                }
                var k = a.getLine(b);
                e = k.length;
                var g = a.getLength(),
                    h = b,
                    n = b;
                if (k.match(this.foldingStartMarker)) {
                    if ("`" == k[0]) {
                        if ("start" !== f.getPrimaryState(a, b)) {
                            for (; ++b < g && !(k = a.getLine(b), "`" == k[0] & "```" == k.substring(0, 3)););
                            return new m(h, e, b, 0)
                        }
                        for (; 0 < b-- && !(k = a.getLine(b), "`" == k[0] & "```" == k.substring(0, 3)););
                        return new m(b, k.length, h, 0)
                    }
                    var l,
                        p = "markup.heading";
                    if (c(b)) {
                        for (n = d(); ++b < g && !(c(b) && d() >= n););
                        n = b - (l && -1 != ["=", "-"].indexOf(l.value[0]) ? 2 : 1);
                        if (n > h)
                            for (; n > h && /^\s*$/.test(a.getLine(n));) n--;
                        if (n > h) return b = a.getLine(n).length, new m(h, e, n, b)
                    }
                }
            }
    }).call(p.prototype)
});
define("mode/markdown_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    function g(a, b) {
        return {
            token: "support.function",
            regex: "^\\s*```(?:\\{" + a + "[^\\}]*\\}|" + a + ")\\s*$",
            push: b + "start"
        }
    }
    l = a("ace/lib/oop");
    var m = a("ace/lib/lang"),
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules,
        e = a("ace/mode/xml_highlight_rules").XmlHighlightRules,
        b = a("ace/mode/html_highlight_rules").HtmlHighlightRules,
        c = a("ace/mode/css_highlight_rules").CssHighlightRules,
        d = a("ace/mode/perl_highlight_rules").PerlHighlightRules,
        r = a("mode/python_highlight_rules").PythonHighlightRules,
        q = a("ace/mode/ruby_highlight_rules").RubyHighlightRules,
        h = a("ace/mode/scala_highlight_rules").ScalaHighlightRules,
        n = a("mode/sh_highlight_rules").ShHighlightRules;
    a("mode/stan_highlight_rules");
    var v = a("mode/sql_highlight_rules").SqlHighlightRules,
        z = function(a) {
            return "(?:[^" + m.escapeRegExp(a) + "\\\\]|\\\\.)*"
        };
    a = function() {
        var a = m.arrayToMap("title author date rtl depends autosize width height transition transition-speed font-family css class navigation incremental left right id audio video type at help-doc help-topic source console console-input execute pause".split(" ")),
            f = {
                token: ["text", "constant.numeric.text", "constant.numeric.text", "constant.numeric.text"],
                regex: "(^|\\s+)(_{2,3})(?![\\s_])(.*?)(?=_)(\\2)\\b"
            },
            l = {
                token: ["text", "constant.language.boolean.text"],
                regex: "(^|\\s+)(_(?=[^\\s_]).*?_)\\b"
            },
            p = {
                token: ["constant.numeric.text", "constant.numeric.text", "constant.numeric.text"],
                regex: "([*]{2,3})(?![\\s*])(.*?)(?=[*])(\\1)"
            },
            y = {
                token: ["constant.language.boolean.text"],
                regex: "([*](?=[^\\s*]).*?[*])"
            },
            E = {
                token: "text",
                regex: "\\^\\[" + z("]") + "\\]"
            },
            G = {
                token: "text constant text url string text".split(" "),
                regex: '^([ ]{0,3}\\[)([^\\]]+)(\\]:\\s*)([^ ]+)(\\s*(?:["][^"]+["])?(\\s*))$'
            },
            F = {
                token: ["text", "keyword", "text", "constant", "text"],
                regex: "(\\s*\\[)(" + z("]") + ")(\\]\\[)(" + z("]") + ")(\\])"
            },
            t = {
                token: "text keyword text markup.href string text paren.keyword.operator nospell paren.keyword.operator".split(" "),
                regex: "(\\s*\\[)(" + z("]") + ')(\\]\\()((?:[^\\)\\s\\\\]|\\\\.|\\s(?=[^"]))*)(\\s*"' + z('"') + '"\\s*)?(\\))(?:(\\s*{)((?:[^\\}]+))(\\s*}))?'
            },
            A = {
                token: ["text", "keyword", "text"],
                regex: "(<)((?:https?|ftp|dict):[^'\">\\s]+|(?:mailto:)?[-.\\w]+\\@[-a-z0-9]+(?:\\.[-a-z0-9]+)*\\.[a-z]+)(>)"
            };
        this.$rules = {
            basic: [{
                token: "constant.language.escape",
                regex: /\\[\\`*_{}[\]()#+\-.!]/
            }, {
                token: "text",
                regex: /[?]`/
            }, {
                token: "support.function.inline_r_chunk",
                regex: "`r (?:.*?[^`])`"
            }, {
                token: ["support.function", "support.function", "support.function"],
                regex: "(`+)(.*?[^`])(\\1)"
            }, E, G, F, t, A, p, f, y, l],
            start: [{
                    token: "empty_line",
                    regex: "^\\s*$",
                    next: "allowBlock"
                }, {
                    token: "text",
                    regex: /[?]`/
                }, {
                    token: "support.function.inline_r_chunk",
                    regex: "`r (?:.*?[^`])`"
                }, {
                    token: ["support.function", "support.function", "support.function"],
                    regex: "(`+)([^\\r]*?[^`])(\\1)"
                }, {
                    token: "markup.heading.1",
                    regex: "^\\={3,}\\s*$",
                    next: "fieldblock"
                }, {
                    token: "markup.heading.1",
                    regex: "^={3,}(?=\\s*$)"
                }, {
                    token: "markup.heading.2",
                    regex: "^\\-{3,}(?=\\s*$)"
                }, {
                    token: function(a) {
                        return "markup.heading." + a.length
                    },
                    regex: /^#{1,6}(?=\s*[^ #]|\s+#.)/,
                    next: "header"
                }, g("(?:javascript|js)", "jscode-"), g("xml", "xmlcode-"), g("html", "htmlcode-"), g("css", "csscode-"), g("perl", "perlcode-"), g("python", "pythoncode-"), g("ruby", "rubycode-"), g("scala", "scalacode-"), g("sh",
                    "shcode-"), g("bash", "bashcode-"), g("stan", "stancode-"), g("sql", "sqlcode-"), g("d3", "jscode-"), {
                    token: "support.function",
                    regex: "^\\s*```\\s*\\S*(?:{.*?\\})?\\s*$",
                    next: "githubblock"
                }, {
                    token: "string.blockquote",
                    regex: "^\\s*>\\s*(?=[-])"
                }, {
                    token: "string.blockquote",
                    regex: "^\\s*>\\s*",
                    next: "blockquote"
                }, E, G, F, {
                    token: "constant",
                    regex: "^\\s*[*](?:\\s*[*]){2,}\\s*$",
                    next: "allowBlock"
                }, {
                    token: "constant",
                    regex: "^\\s*[-](?:\\s*[-]){2,}\\s*$",
                    next: "allowBlock"
                }, {
                    token: "constant",
                    regex: "^\\s*[_](?:\\s*[_]){2,}\\s*$",
                    next: "allowBlock"
                }, {
                    token: "latex.markup.list.string.begin",
                    regex: "\\\\\\[",
                    next: "mathjaxnativedisplay"
                }, {
                    token: "latex.markup.list.string.begin",
                    regex: "\\\\\\(",
                    next: "mathjaxnativeinline"
                }, {
                    token: "text",
                    regex: "\\\\\\$"
                }, {
                    token: "latex.markup.list.string.begin",
                    regex: "\\${2}",
                    next: "mathjaxdisplay"
                }, {
                    token: ["latex.markup.list.string.begin", "latex.support.function", "latex.markup.list.string.end"],
                    regex: "(\\$)((?:(?:\\\\.)|(?:[^\\$\\\\]))*?)(\\$)"
                }, {
                    token: ["text", "keyword", "text"],
                    regex: "(<)((?:https?|ftp|dict):[^'\">\\s]+|(?:mailto:)?[-.\\w]+\\@[-a-z0-9]+(?:\\.[-a-z0-9]+)*\\.[a-z]+)(>)"
                },
                {
                    token: "keyword",
                    regex: "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])"
                }, {
                    token: "paren.keyword.operator",
                    regex: "[{}]"
                }, {
                    token: "markup.list",
                    regex: "-?\\@[\\w\\d-]+"
                }, {
                    token: "text",
                    regex: "[^\\*_%$`\\[#<>{}\\\\@\\s!]+"
                }, {
                    token: "text",
                    regex: "\\\\"
                }, {
                    token: "text",
                    regex: "^\\s*(?:[*+-]|\\d+\\.)\\s+",
                    next: "listblock"
                },
                p, f, y, l, {
                    token: "comment",
                    regex: "<\\!--",
                    next: "html-comment"
                }, {
                    include: "basic"
                }
            ],
            "html-comment": [{
                token: "comment",
                regex: "--\x3e",
                next: "start"
            }, {
                defaultToken: "comment.text"
            }],
            allowBlock: [{
                token: "support.function",
                regex: "^ {4}.+",
                next: "allowBlock"
            }, {
                token: "empty_line",
                regex: "^\\s*$",
                next: "allowBlock"
            }, {
                token: "empty",
                regex: "",
                next: "start"
            }],
            header: [{
                regex: "$",
                next: "start"
            }, {
                include: "basic"
            }, {
                defaultToken: "heading"
            }],
            listblock: [{
                token: "empty_line",
                regex: "^\\s*$",
                next: "start"
            }, {
                token: "text",
                regex: "^\\s{0,3}(?:[*+-]|\\d+\\.)\\s+",
                next: "listblock"
            }, {
                token: ["latex.markup.list.string.begin", "latex.support.function", "latex.markup.list.string.end"],
                regex: "(\\$)((?:(?:\\\\.)|(?:[^\\$\\\\]))*?)(\\$)"
            }, {
                include: "basic",
                noEscape: !0
            }, {
                token: "support.function",
                regex: "^\\s*```\\s*[a-zA-Z]*(?:{.*?\\})?\\s*$",
                next: "githubblock"
            }, {
                defaultToken: "text"
            }],
            blockquote: [{
                token: "empty_line",
                regex: "^\\s*$",
                next: "start"
            }, {
                token: "constant.language.escape",
                regex: /\\[\\`*_{}[\]()#+\-.!]/
            }, {
                token: "text",
                regex: /[?]`/
            }, {
                token: "support.function.inline_r_chunk",
                regex: "`r (?:.*?[^`])`"
            }, {
                token: ["support.function", "support.function", "support.function"],
                regex: "(`+)(.*?[^`])(\\1)"
            }, E, G, F, t, A, p, f, y, l, {
                defaultToken: "string.blockquote"
            }],
            githubblock: [{
                token: "support.function",
                regex: "^\\s*```",
                next: "start"
            }, {
                token: "support.function",
                regex: ".+"
            }],
            fieldblock: [{
                token: function(b) {
                    b = b.slice(0, -1);
                    return a[b] ? "comment.doc.tag" : "text"
                },
                regex: "^[\\w-]+\\:",
                next: "fieldblockvalue"
            }, {
                token: "text",
                regex: "(?=.+)",
                next: "start"
            }],
            fieldblockvalue: [{
                token: "text",
                regex: "$",
                next: "fieldblock"
            }, {
                token: "text",
                regex: "[^{}]+"
            }],
            mathjaxdisplay: [{
                token: "latex.markup.list.string.end",
                regex: "\\${2}",
                next: "start"
            }, {
                token: "latex.support.function",
                regex: "[^\\$]+"
            }],
            mathjaxnativedisplay: [{
                token: "latex.markup.list.string.end",
                regex: "\\\\\\]",
                next: "start"
            }, {
                token: "latex.support.function",
                regex: "[\\s\\S]+?"
            }],
            mathjaxnativeinline: [{
                token: "latex.markup.list.string.end",
                regex: "\\\\\\)",
                next: "start"
            }, {
                token: "latex.support.function",
                regex: "[\\s\\S]+?"
            }]
        };
        this.embedRules(k, "jscode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(b, "htmlcode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(c, "csscode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(e,
            "xmlcode-", [{
                token: "support.function",
                regex: "^\\s*```",
                next: "pop"
            }]);
        this.embedRules(d, "perlcode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(r, "pythoncode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(q, "rubycode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(h, "scalacode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(n, "shcode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(n, "bashcode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(v, "sqlcode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.embedRules(k, "jscode-", [{
            token: "support.function",
            regex: "^\\s*```",
            next: "pop"
        }]);
        this.normalizeRules()
    };
    l.inherits(a, f);
    p.MarkdownHighlightRules = a
});
define("mode/mermaid", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("mode/mermaid_highlight_rules").MermaidHighlightRules;
    a = function() {
        this.$highlightRules = new f;
        this.$tokenizer = new m(this.$highlightRules.getRules())
    };
    l.inherits(a, g);
    (function() {
        this.getNextLineIndent = function(a, e, b) {
            return this.$getIndent(e)
        }
    }).call(a.prototype);
    p.Mode = a
});
define("mode/mermaid_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.createKeywordMapper({
            keyword: "sequenceDiagram|participant|graph|subgraph|loop|alt|is|opt|else|end|style|linkStyle|classDef|class"
        }, "identifier", !1);
        this.$rules = {
            start: [{
                    token: "keyword",
                    merge: !1,
                    regex: "^\\s*graph\\s+(?:TB|BT|RL|LR|TD)\\s*$"
                }, {
                    token: "keyword",
                    merge: !1,
                    regex: "^\\s*(?:sequenceDiagram|participant|subgraph|loop|alt(?:\\s+is)?|opt|else(?:\\s+is)?|end|style|linkStyle|classDef|class)"
                },
                {
                    token: "keyword.operator",
                    merge: !1,
                    regex: ">|\\->|\\-\\->|\\-\\-\\-|\\-\\-|\\-\\.\\->|\\-\\.|\\.\\->|==>|==|\\->>|\\-\\->>|\\-x|\\-\\-x"
                }, {
                    token: "paren.keyword.operator",
                    merge: !1,
                    regex: "[[({\\|]"
                }, {
                    token: "paren.keyword.operator",
                    merge: !1,
                    regex: "[\\])}]"
                }, {
                    token: "markup.list",
                    merge: !1,
                    regex: "Note\\s+(?:left|right)\\s+of"
                }, {
                    token: "markup.list",
                    merge: !1,
                    regex: "<br/>"
                }, {
                    token: "text",
                    regex: "\\s+",
                    merge: !0
                }
            ]
        }
    };
    l.inherits(g, a);
    p.MermaidHighlightRules = g
});
define("mode/python", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("mode/python_highlight_rules").PythonHighlightRules,
        f = a("ace/mode/folding/pythonic").FoldMode,
        k = a("ace/range").Range;
    a = function() {
        this.HighlightRules = m;
        this.foldingRules = new f("\\:")
    };
    l.inherits(a, g);
    (function() {
        this.lineCommentStart = "#";
        this.getLanguageMode = function(a) {
            return "Python"
        };
        this.getNextLineIndent = function(a, b, c, d) {
            a = this.$getIndent(b);
            if (/^\s*[#]/.test(b)) return a;
            /[{([:]\s*(?:$|[#])/.test(b) &&
                (a += c);
            /^\s*(?:break|continue|pass|raise|return)\b/.test(b) && (a = a.substring(0, a.length - c.length));
            return a
        };
        this.$performOutdent = function(a, b, c) {
            var d = a.doc.$lines[c];
            c = this.$getIndent(a.doc.$lines[b]);
            d = this.$getIndent(d);
            d.length < c.length && (b = new k(b, 0, b, c.length), a.replace(b, d));
            return !0
        };
        this.$autoOutdentElse = function(a, b, c) {
            a = b.doc.$lines[c].substring(0, b.selection.cursor.column);
            if (!/^\s*(?:else|elif)(?:\s|[:])/.test(a)) return !1;
            for (a = c - 1; 0 <= a; a--)
                if (/^\s*(?:if|elif|for|try)(?:\s|[:])/.test(b.doc.$lines[a])) return this.$performOutdent(b,
                    c, a)
        };
        this.$autoOutdentExceptFinally = function(a, b, c) {
            a = b.doc.$lines[c].substring(0, b.selection.cursor.column);
            if (!/^\s*(?:except|finally)(?:\s|[:])/.test(a)) return !1;
            for (a = c - 1; 0 <= a; a--)
                if (/^\s*(?:try)(?:\s|[:])/.test(b.doc.$lines[a])) return this.$performOutdent(b, c, a)
        };
        this.checkOutdent = function(a, b, c) {
            this.$lastInput = c;
            return ":" === c || " " === c
        };
        this.$canAutoOutdent = function(a, b, c) {
            a = b.selection.cursor;
            return 0 === a.column ? !1 : ":" === this.$lastInput ? !0 : " " === this.$lastInput ? (b = b.getTokenAt(a.row, a.column -
                1) || {}, /\bkeyword\b/.test(b.type)) : !1
        };
        this.autoOutdent = function(a, b, c) {
            this.$canAutoOutdent(a, b, c) && (this.$autoOutdentElse(a, b, c) || this.$autoOutdentExceptFinally(a, b, c))
        };
        this.transformAction = function(a, b, c, d, f) {
            return !1
        };
        this.$id = "mode/python"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/python_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text_highlight_rules").TextHighlightRules,
        m = a("mode/rainbow_paren_highlight_rules").RainbowParenHighlightRules;
    a = function() {
        this.$rules = {
            start: [{
                    token: "comment",
                    regex: "#.*$"
                }, {
                    token: "constant.language",
                    regex: "@[a-zA-Z_][a-zA-Z0-9._]*\\b"
                }, {
                    token: "string",
                    regex: '(?:b|B|br|Br|bR|BR|rb|rB|Rb|RB|r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?"{3}',
                    next: "qqstring3"
                }, {
                    token: "string",
                    regex: '(?:b|B|br|Br|bR|BR|rb|rB|Rb|RB|r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?"(?=.)',
                    next: "qqstring"
                }, {
                    token: "string",
                    regex: "(?:b|B|br|Br|bR|BR|rb|rB|Rb|RB|r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?'{3}",
                    next: "qstring3"
                }, {
                    token: "string",
                    regex: "(?:b|B|br|Br|bR|BR|rb|rB|Rb|RB|r|u|R|U|f|F|fr|Fr|fR|FR|rf|rF|Rf|RF)?'(?=.)",
                    next: "qstring"
                }, {
                token: "function.support",
                regex: "(!s|!r|!a)"
            }, {
                token: "identifier",
                regex: "pdf"
            }, {
                token: "identifier",
                regex: "X."
            },{
                token: "storage",
                regex: "pd|pandas|plt|matplotlib.pyplot|np|numpy|sns|seaborn|dfply|scipy.special|bokeh.plotting|scipy.integrate|odeint|ode|solve_bvp|sklearn.linear_model|LinearRegression|LogisticRegression|sklearn.model_selection|GridSearchCV|cross_val_score|sklearn.cluster|sklearn.metrics|KMeans|sklearn|svm|classification_report|confusion_matrix|accuracy_score|train_test_split|group_by|head|tail|select|drop|row_slice|mutate|transmute|arrange|rename|gather|spread|separate|unite|summarize|summarize_each|mean|var|sd|median|IQR|show|figure|output_file|siuba"
            },{
                token: ["punctuation", "function.support"],
                regex: "(\\.)([a-zA-Z_]+)\\b"
            },{
            token: "keyword.operator.infix",
            regex: ">>=",
            },{
            token: "keyword.operator.infix",
            regex: ">>",
            },{
                    token: "constant.numeric",
                    regex: "(?:(?:(?:(?:(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.))|(?:\\d+))(?:[eE][+-]?\\d+))|(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.)))|\\d+)[jJ]\\b"
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:(?:(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.))|(?:\\d+))(?:[eE][+-]?\\d+))|(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.)))"
                },
                {
                    token: "constant.numeric",
                    regex: "(?:(?:(?:[1-9]\\d*)|(?:0))|(?:0[oO]?[0-7]+)|(?:0[xX][\\dA-Fa-f]+)|(?:0[bB][01]+))[lL]\\b"
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:(?:[1-9]\\d*)|(?:0))|(?:0[oO]?[0-7]+)|(?:0[xX][\\dA-Fa-f]+)|(?:0[bB][01]+))\\b"
                }, {
                    token: this.createKeywordMapper({
                        "invalid.deprecated": "debugger",
                        "support.function": "abs|all|any|ascii|basestring|bin|bool|breakpoint|bytearray|bytes|callable|chr|classmethod|cmp|compile|complex|delattr|dict|dir|divmod|eumerate|eval|execfile|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip|__import__",
                        "constant.language": "NotImplemented|Ellipsis|__debug__",
                        keyword: "False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield"
                    }, "identifier"),
                    regex: "[a-zA-Z_][a-zA-Z0-9_]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "//=|\\*\\*=|>>=|<<=|//|\\*\\*|==|!=|>=|<=|:=|>>|<<|\\+=|-=|\\*=|/=|&=|%=|\\|=|\\^=|\\+|-|\\*|/|%|>|<|\\^|~|\\||&|=|:|\\.|;|,",
                    merge: !1
                },
                m.getParenRule(), {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            qqstring3: [{
                token: "constant.language.escape",
                regex: "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"
            }, {
                token: "string",
                regex: '"{3}',
                next: "start"
            }, {
                defaultToken: "string"
            }],
            qstring3: [{
                token: "constant.language.escape",
                regex: "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"
            }, {
                token: "string",
                regex: "'{3}",
                next: "start"
            }, {
                defaultToken: "string"
            }],
            qqstring: [{
                    token: "constant.language.escape",
                    regex: "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"
                },
                {
                    token: "string",
                    regex: "\\\\$",
                    next: "qqstring"
                }, {
                    token: "string",
                    regex: '"|$',
                    next: "start"
                }, {
                    defaultToken: "string"
                }
            ],
            qstring: [{
                token: "constant.language.escape",
                regex: "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})"
            }, {
                token: "string",
                regex: "\\\\$",
                next: "qstring"
            }, {
                token: "string",
                regex: "'|$",
                next: "start"
            }, {
                defaultToken: "string"
            }]
        }
    };
    l.inherits(a, g);
    p.PythonHighlightRules = a
});
define("mode/r", ["require", "exports", "module"], function(a, p, l) {
    a("ace/editor");
    a("ace/edit_session");
    a("ace/range");
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/r_highlight_rules").RHighlightRules,
        e = a("mode/r_code_model").RCodeModel,
        b = a("mode/r_matching_brace_outdent").RMatchingBraceOutdent;
    a("mode/auto_brace_insert");
    var c = a("ace/unicode");
    a = function(a, c) {
        this.$tokenizer = a ? new m((new f).getRules()) :
            new m((new k).getRules());
        this.foldingRules = this.codeModel = new e(c, this.$tokenizer);
        this.$outdent = new b(this.codeModel)
    };
    l.inherits(a, g);
    (function() {
        this.getLanguageMode = function(a) {
            return "R"
        };
        this.checkOutdent = function(a, b, c) {
            return this.$outdent.checkOutdent(a, b, c)
        };
        this.autoOutdent = function(a, b, c) {
            return this.$outdent.autoOutdent(a, b, c)
        };
        this.tokenRe = new RegExp("^[" + c.wordChars + "._]+", "g");
        this.nonTokenRe = new RegExp("^(?:[^" + c.wordChars + "._]|\\s)+", "g");
        this.$complements = {
            "(": ")",
            "[": "]",
            '"': '"',
            "'": "'",
            "{": "}",
            "`": "`"
        };
        this.$reOpen = /^[{(\["'`]$/;
        this.$reClose = /^[})\]"'`]$/;
        this.getNextLineIndent = function(a, b, c, e) {
            return this.codeModel.getNextLineIndent(a, b, c, e)
        };
        this.allowAutoInsert = this.smartAllowAutoInsert;
        this.getIndentForOpenBrace = function(a) {
            return this.codeModel.getIndentForOpenBrace(a)
        };
        this.$getIndent = function(a) {
            return (a = a.match(/^(\s+)/)) ? a[1] : ""
        };
        this.transformAction = function(a, b, c, e, f) {
            return "insertion" === b && "\n" === f && (a = c.getSelectionRange().start, e = e.doc.getLine(a.row), (a =
                /^((\s*#+')\s*)/.exec(e)) && c.getSelectionRange().start.column >= a[2].length || (a = /^((\s*#+\*)\s*)/.exec(e)) && c.getSelectionRange().start.column >= a[2].length) ? {
                text: "\n" + a[1]
            } : !1
        };
        this.$id = "mode/r"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/r_code_model", ["require", "exports", "module"], function(a, p, l) {
    function g(a, b) {
        for (var c = 0; c < b.length; c++)
            if (a === b[c]) return !0;
        return !1
    }

    function m(a) {
        return "if" === a || "for" === a || "while" === a || "repeat" === a || "function" === a
    }
    var f = a("ace/range").Range,
        k = a("ace/token_iterator").TokenIterator,
        e = a("mode/token_cursor").RTokenCursor,
        b = a("mode/utils"),
        c = !1,
        d = a("mode/r_scope_tree").ScopeManager,
        r = a("mode/r_scope_tree").ScopeNode;
    a = function(a, b, c, e, f) {
        this.$session = a;
        this.$doc = a.getDocument();
        this.$tokenizer =
            b;
        this.$tokens = Array(this.$doc.getLength());
        this.$endStates = Array(this.$doc.getLength());
        this.$statePattern = c;
        this.$codeBeginPattern = e;
        this.$codeEndPattern = f;
        this.$scopes = new d(r);
        var h = !0,
            k = function(a, b) {
                h ? h = !1 : (this.$doc.off("change", g), this.$session.off("changeMode", k))
            }.bind(this),
            g = function(a) {
                this.$onDocChange(a)
            }.bind(this);
        this.$session.on("changeMode", k);
        this.$doc.on("change", g)
    };
    (function() {
        function a(a) {
            return "keyword" == a.type && "function" == a.value
        }

        function d(a) {
            return /\boperator\b/.test(a.type) &&
                /^(=|<-|<<-)$/.test(a.value)
        }

        function n(a) {
            return /\bidentifier\b/.test(a.type)
        }

        function l(b) {
            var c = b.cloneCursor();
            if ("{" !== c.currentValue() || !c.moveBackwardOverMatchingParens() || !c.moveToPreviousToken() || !a(c.currentToken())) return !1;
            b.$row = c.$row;
            b.$offset = c.$offset;
            return !0
        }

        function r(a) {
            for (; a.findOpeningBracket("(") && a.moveToPreviousToken();)
                if (g(a.currentValue(), ["if", "for", "while"])) return !0;
            return !1
        }

        function p(b) {
            var c = b.cloneCursor();
            if (!(a(c.currentToken()) && c.moveToPreviousToken() && d(c.currentToken()) &&
                    c.moveToPreviousToken())) return !1;
            b.$row = c.$row;
            b.$offset = c.$offset;
            return !0
        }

        function B(b) {
            if (a(b.currentToken()) && !b.moveToNextToken() || "(" === b.currentValue() && !b.moveToNextToken() || ")" === b.currentValue()) return [];
            var c = [];
            for (n(b.currentToken()) && c.push(b.currentValue()); b.moveToNextToken();)
                if (!b.fwdToMatchingToken()) {
                    if (")" === b.currentValue()) break;
                    if ("," === b.currentValue()) {
                        for (;
                            "," === b.currentValue() && b.moveToNextToken(););
                        n(b.currentToken()) && c.push(b.currentValue())
                    }
                } return c
        }

        function I(a) {
            for (var c =
                    0, d = Math.min(a.getLength(), 100), e = "Title"; c++ < d;) {
                var f = a.getLine(c);
                if (/^\s*[-]{3}\s*$/.test(f)) break;
                f = /^\s*title:\s+(.*?)\s*$/.exec(f);
                if (null !== f) {
                    e = f[1];
                    break
                }
            }
            return b.stripEnclosingQuotes(e.trim())
        }

        function x(a) {
            return "keyword.operator" === a || "keyword.operator.infix" === a
        }
        var y = b.contains;
        this.getTokenCursor = function() {
            return new e(this.$tokens, 0, 0, this)
        };
        this.$complements = {
            "(": ")",
            ")": "(",
            "[": "]",
            "]": "[",
            "{": "}",
            "}": "{"
        };
        var E = function(a) {
            a = a.trim();
            return a = a.replace(/[\n\s]+/g, " ")
        };
        this.getFunctionsInScope =
            function(a) {
                this.$buildScopeTreeUpToRow(a.row);
                return this.$scopes.getFunctionsInScope(a)
            };
        this.getAllFunctionScopes = function(a) {
            "undefined" === typeof a && (a = this.$doc.getLength());
            this.$buildScopeTreeUpToRow(a);
            return this.$scopes.getAllFunctionScopes()
        };
        this.getDplyrJoinContextFromInfixChain = function(a) {
            var b = a.cloneCursor();
            a = "";
            b.hasType("identifier") && (a = b.currentValue());
            var c = "left";
            "=" === b.currentValue() && (c = "right");
            if (b.hasType("identifier")) {
                if (!b.moveToPreviousToken()) return null;
                "=" ===
                b.currentValue() && (c = "right")
            }
            if (!b.findOpeningBracket("(", !0) || !b.moveToPreviousToken()) return null;
            for (; b.findOpeningBracket("(", !0) && b.moveToPreviousToken();)
                if (/_join$/.test(b.currentValue())) {
                    var d = b.currentValue();
                    if (!b.moveToNextToken()) break;
                    if (!b.moveToNextToken()) break;
                    var e = b.currentValue();
                    if (!1 === this.moveToDataObjectFromInfixChain(b)) break;
                    b = b.currentValue();
                    return {
                        token: a,
                        leftData: b,
                        rightData: e,
                        verb: d,
                        cursorPos: c
                    }
                } return null
        };
        this.getDataFromInfixChain = function(a) {
            var b = this.moveToDataObjectFromInfixChain(a),
                c = [],
                d = [],
                e = "",
                f = !1;
            !1 !== b && (b.excludeArgsFromObject && (f = b.excludeArgsFromObject), e = a.currentValue(), c = b.additionalArgs, d = b.excludeArgs);
            return {
                name: e,
                additionalArgs: c,
                excludeArgs: d,
                excludeArgsFromObject: f
            }
        };
        var G = "mutate summarise summarize rename transmute select rename_vars inner_join left_join right_join semi_join anti_join outer_join full_join".split(" "),
            F = function(a, b, c, d) {
                if (!a.moveToNextToken() || "(" !== a.currentValue() || !a.moveToNextToken() || ")" === a.currentValue()) return !1;
                a.hasType("identifier") &&
                    b.additionalArgs.push(a.currentValue());
                if ("rename" === d) {
                    if (!a.moveToNextToken()) return !1;
                    b.excludeArgs.push(a.currentValue())
                }
                "select" === d && (b.excludeArgsFromObject = !0);
                do {
                    if (")" === a.currentValue()) break;
                    if (a.$row > c.$row || a.$row === c.$row && a.$offset >= c.$offset) break;
                    if (a.fwdToMatchingToken()) {
                        if (!a.moveToNextToken()) break
                    } else if ("," === a.currentValue()) {
                        if (!a.moveToNextToken()) return !1;
                        a.hasType("identifier") && b.additionalArgs.push(a.currentValue());
                        if (!a.moveToNextToken()) return !1;
                        if ("=" === a.currentValue() &&
                            g(d, ["rename", "rename_vars"])) {
                            if (!a.moveToNextToken()) return !1;
                            a.hasType("identifier") && b.excludeArgs.push(a.currentValue())
                        }
                    }
                } while (a.moveToNextToken());
                return !0
            };
        this.moveToDataObjectFromInfixChain = function(a) {
            var b = a.cloneCursor(),
                c;
            a: {
                for (c = b.cloneCursor(); c.findOpeningBracket("(", !1) && c.moveToPreviousToken() && c.moveToPreviousToken();) {
                    if (":" === c.currentValue()) {
                        for (;
                            ":" === c.currentValue();)
                            if (!c.moveToPreviousToken()) {
                                c = !1;
                                break a
                            } if (!c.moveToPreviousToken()) break
                    }
                    if (/\binfix\b/.test(c.currentToken().type)) {
                        b.$row =
                            c.$row;
                        b.$offset = c.$offset;
                        c = !0;
                        break a
                    }
                }
                c = !1
            }
            if (!c) return !1;
            for (c = {
                    additionalArgs: [],
                    excludeArgs: []
                };;) {
                if (0 === b.$row && 0 === b.$offset) return a.$row = 0, a.$offset = 0, c;
                b.moveBackwardOverMatchingParens();
                if (!b.moveToPreviousToken()) return !1;
                var d = b.currentValue();
                y(G, d) && F(b.cloneCursor(), c, a, d);
                if (!b.moveToPreviousToken()) return 0 === b.$row && 0 === b.$offset ? (a.$row = 0, a.$offset = 0, c) : !1;
                if (":" === b.currentValue()) {
                    for (;
                        ":" === b.currentValue();)
                        if (!b.moveToPreviousToken()) return !1;
                    if (!b.moveToPreviousToken()) return !1
                }
                if (!/\binfix\b/.test(b.currentToken().type)) break
            }
            if (!b.moveToNextToken()) return !1;
            a.$row = b.$row;
            a.$offset = b.$offset;
            return c
        };
        this.getVariablesInScope = function(a) {
            var b = this.getTokenCursor();
            if (!b.moveToPosition(a)) return [];
            a = b.cloneCursor();
            a.findOpeningBracket("(", !0) && a.moveToPreviousToken() && "function" === a.currentValue() ? (b.$row = a.$row, b.$offset = a.$offset, a = !0) : a = !1;
            a && p(b) && b.findStartOfEvaluationContext();
            a = {};
            do
                if (!b.bwdToMatchingToken()) {
                    var c = a,
                        e = b.cloneCursor();
                    if ("for" === e.currentValue() && e.moveToNextToken() && "(" === e.currentValue() && e.moveToNextToken()) {
                        var f = e.currentValue();
                        e.moveToNextToken() && "in" === e.currentValue() && (c[f] = "variable")
                    }
                    d(b.currentToken()) && (c = "variable", e = b.cloneCursor(), e.moveToNextToken() && "function" === e.currentValue() && (c = "function"), e = b.cloneCursor(), e.moveToPreviousToken() && n(e.currentToken()) && (e = e.currentValue(), a[e] = c))
                } while (b.moveToPreviousToken());
            b = [];
            for (var h in a) b.push({
                token: h,
                type: a[h]
            });
            b.sort();
            return b
        };
        this.$buildScopeTreeUpToRow = function(a) {
            function c(a, c) {
                if ("undefined" === typeof a) return "";
                var d = a.exec(c);
                if (!d) return null;
                var e =
                    d[1].split(",");
                if (0 == e.length) return null;
                if (!/=/.test(e[0])) return e[0].replace(/(^\s+)|(\s+$)/g, "");
                for (var f = 0; f < e.length; f++)
                    if (d = /^\s*label\s*=\s*(.*)$/.exec(e[f])) return b.stripEnclosingQuotes(d[1].trim());
                return null
            }
            var d = this.$session.getMode().$id;
            a = Math.min(a + 30, this.$doc.getLength() - 1);
            var e = this.$scopes.parsePos.row;
            if (e >= a) return e;
            e = new k(this.$session);
            e.tokenizeUpToRow(a);
            this.$tokenizeUpToRow(a);
            var h = this.$scopes.parsePos.row;
            e.moveToPosition({
                    row: h,
                    column: this.$scopes.parsePos.column
                },
                !0);
            var g = e.getCurrentToken();
            if (null == g) return h;
            var n = g.value,
                m = g.type,
                q = e.getCurrentTokenPosition();
            h = this.$scopes.getChunkCount();
            do {
                if (e.$row > a) break;
                n = g.value;
                m = g.type;
                q = e.getCurrentTokenPosition();
                g = b.getPrimaryState(this.$session, q.row);
                if ("rd-start" === g) e.moveToEndOfRow();
                else {
                    var r = !0;
                    this.$codeBeginPattern && (r = /^r-/.test(g));
                    if (b.startsWith(m, "markup.heading")) {
                        m = "";
                        r = {
                            row: q.row,
                            column: 0
                        };
                        var t = {
                            row: q.row + 1,
                            column: 0
                        };
                        g = 0;
                        if (/^\s*#+\s*$/.test(n)) g = n.split("#").length - 1, n = this.$session.getLine(q.row),
                            m = n.replace(/^\s*[#]+\s*/, "");
                        else if (/^[-=]{3,}\s*$/.test(n) && (g = "=" === n[0] ? 1 : 2, m = this.$session.getLine(q.row - 1).trim(), r.row--, 0 === m.length)) continue;
                        0 === m.length && (m = "(Untitled)");
                        m = m.replace(/{.*}\s*$/, "");
                        this.$scopes.onMarkdownHead(m, r, t, g, !0)
                    } else if (r && /\bsectionhead\b/.test(m)) {
                        m = "(Untitled)";
                        if (g = /[^#=-\s]/.exec(n)) m = n.substr(g.index), m = m.replace(/\s*[#=-]+\s*$/, "");
                        n = /^\s*([#]+)\s*\w/.exec(n);
                        if (null != n)
                            if (g = n[1].length, 6 < g) this.$scopes.onSectionStart(m, q);
                            else r = {
                                row: q.row,
                                column: 0
                            }, t = {
                                row: q.row,
                                column: Infinity
                            }, this.$scopes.onMarkdownHead(m, r, t, g, !1);
                        else this.$scopes.onSectionStart(m, q)
                    } else if (r || "mode/sweave" !== d || "keyword" !== m || 0 !== q.column || 0 !== n.indexOf("\\") || "\\chapter" !== n && "\\section" !== n && "\\subsection" !== n && "\\subsubsection" !== n)
                        if (/\bcodebegin\b/.test(m) && "---" === n) n = I(this.$session), this.$scopes.onSectionStart(n, q, {
                            isYaml: !0
                        });
                        else if (/\bcodeend\b/.test(m) && "---" === n) q.column = Infinity, this.$scopes.onSectionEnd(q);
                    else if ("mode/rmarkdown" === d && /\bcodebegin\b/.test(m) &&
                        0 === n.trim().indexOf("/***")) this.$scopes.onSectionStart("(R Code Chunk)", q);
                    else if ("mode/rmarkdown" === d && /\bcodeend\b/.test(m) && 0 === n.trim().indexOf("*/")) this.$scopes.onSectionEnd(q);
                    else /\bcodebegin\b/.test(m) ? (h++, m = {
                        row: q.row + 1,
                        column: 0
                    }, r = h, g = c(this.$codeBeginPattern, n), r = "Chunk " + r, g && "YAML Header" !== n && (r += ": " + g), this.$scopes.onChunkStart(g, r, q, m)) : /\bcodeend\b/.test(m) ? (q.column += n.length, this.$scopes.onChunkEnd(q)) : r && "{" === n ? (n = this.getTokenCursor(), n.moveToPosition(q, !0), m = n.cloneCursor(),
                        l(m) ? (g = m.cloneCursor(), g.moveToNextToken(), q = null, p(m) && (r = m.cloneCursor(), t = m.cloneCursor(), t.findStartOfEvaluationContext() && (q = t.currentPosition(), t = r.currentPosition(), q.row !== t.row ? (q.row = t.row, q.column = 0, m.$row = q.row, m.$offset = 0) : m.moveToPosition(q, !0), q = this.$doc.getTextRange(new f(q.row, q.column, t.row, t.column + r.currentValue().length)))), r = m.currentPosition(), m.isFirstSignificantTokenOnLine() && (r.column = 0), m = B(g), g = "(" + m.join(", ") + ")", g = null == q ? E("<function>" + g) : E(q + g), this.$scopes.onFunctionScopeStart(g,
                            r, n.currentPosition(), q, m)) : (r = n.currentPosition(), n.isFirstSignificantTokenOnLine() && (r.column = 0), this.$scopes.onScopeStart(r))) : r && "}" === n && (q.column += 1, this.$scopes.onScopeEnd(q));
                    else g = 1, "\\chapter" === n ? g = 2 : "\\section" === n ? g = 3 : "\\subsection" === n ? g = 4 : "\\subsubsection" === n && (g = 5), n = this.$doc.getLine(q.row), n = /{([^}]*)}/.exec(n), m = "", null != n && (m = n[1]), r = {
                        row: q.row,
                        column: 0
                    }, t = {
                        row: q.row,
                        column: Infinity
                    }, this.$scopes.onMarkdownHead(m, r, t, g, !0)
                }
            } while (g = e.moveToNextToken());
            a = Math.max(a, e.$row);
            this.$scopes.parsePos = {
                row: a,
                column: -1
            };
            return a
        };
        this.$getFoldToken = function(a, b, c) {
            this.$tokenizeUpToRow(c);
            if (this.$statePattern && !this.$statePattern.test(this.$endStates[c])) return "";
            a = this.$tokens[c];
            for (c = 0; c < a.length; c++)
                if (/\bsectionhead\b/.test(a[c].type)) return a[c];
            var d = 0,
                e = null,
                f = null;
            for (c = 0; c < a.length; c++) {
                var h = a[c];
                if (/\bparen\b/.test(h.type)) switch (h.value) {
                    case "{":
                        d++;
                        1 == d && (e = h);
                        break;
                    case "}":
                        d--, 0 == d && (e = null), 0 > d && (f = h, d = 0)
                }
            }
            return e ? e : "markbeginend" == b && f ? f : 1 <= a.length && (/\bcodebegin\b/.test(a[0].type) ||
                /\bcodeend\b/.test(a[0].type)) ? a[0] : null
        };
        this.getFoldWidget = function(a, b, c) {
            a = this.$getFoldToken(a, b, c);
            return null == a ? "" : "{" == a.value ? "start" : "}" == a.value ? "end" : /\bcodebegin\b/.test(a.type) ? "start" : /\bcodeend\b/.test(a.type) ? "end" : /\bsectionhead\b/.test(a.type) ? "start" : ""
        };
        this.getFoldWidgetRange = function(a, b, c) {
            var d = this.$getFoldToken(a, b, c);
            if (d) {
                b = {
                    row: c,
                    column: d.column + 1
                };
                if ("{" == d.value) return (a = a.$findClosingBracket(d.value, b)) ? f.fromPoints(b, a) : void 0;
                if ("}" == d.value) return (a = a.$findOpeningBracket(d.value,
                    b)) ? f.fromPoints({
                    row: a.row,
                    column: a.column + 1
                }, {
                    row: b.row,
                    column: b.column - 1
                }) : void 0;
                if (/\bcodebegin\b/.test(d.type)) {
                    b = new k(a, c, 0);
                    for (var e; e = b.stepForward();)
                        if (/\bcode(begin|end)\b/.test(e.type)) return e = /\bcodebegin\b/.test(e.type), b = b.getCurrentTokenRow(), a = e ? {
                            row: b - 1,
                            column: a.getLine(b - 1).length
                        } : {
                            row: b,
                            column: a.getLine(b).length
                        }, f.fromPoints({
                            row: c,
                            column: d.column + d.value.length
                        }, a)
                } else if (/\bcodeend\b/.test(d.type))
                    for (b = new k(a, c, 0); d = b.stepBackward();) {
                        if (/\bcodebegin\b/.test(d.type)) return b =
                            b.getCurrentTokenRow(), f.fromPoints({
                                row: b,
                                column: a.getLine(b).length
                            }, {
                                row: c,
                                column: a.getLine(c).length
                            })
                    } else if (/\bsectionhead\b/.test(d.type)) {
                        d = a.getLine(c);
                        if (/^\s*[#=-]+\s*$/.test(d)) d = d.length;
                        else {
                            d = /[#=-]+\s*$/.exec(d);
                            if (!d) return;
                            d = d.index
                        }
                        b.column = d;
                        c = new k(a, c + 1);
                        for (c.$tokenIndex = -1;
                            (token = c.stepForward()) && "}" !== token.value && !/\bsectionhead\b/.test(token.type) && !/\bcode(?:begin|end)/.test(token.type);) "{" === token.value && c.fwdToMatchingToken();
                        c = c.getCurrentTokenRow();
                        token && c--;
                        a = {
                            row: c,
                            column: a.getLine(c).length
                        };
                        return f.fromPoints(b, a)
                    }
            }
        };
        this.getCurrentScope = function(a, b) {
            b || (b = function(a) {
                return !0
            });
            if (!a) return "";
            this.$buildScopeTreeUpToRow(a.row);
            var c = this.$scopes.getActiveScopes(a);
            if (c)
                for (var d = c.length - 1; 0 <= d; d--)
                    if (b(c[d])) return c[d];
            return null
        };
        this.getScopeTree = function() {
            this.$buildScopeTreeUpToRow(this.$doc.getLength() - 1);
            return this.$scopes.getScopeList()
        };
        this.findFunctionDefinitionFromUsage = function(a, b) {
            this.$buildScopeTreeUpToRow(this.$doc.getLength() -
                1);
            return this.$scopes.findFunctionDefinitionFromUsage(a, b)
        };
        this.getIndentForOpenBrace = function(a) {
            if (this.$tokenizeUpToRow(a.row)) {
                var b = this.getTokenCursor();
                if (b.seekToNearestToken(a, a.row) && "{" == b.currentValue() && b.moveBackwardOverMatchingParens()) return this.$getIndent(this.$getLine(b.currentPosition().row))
            }
            return this.$getIndent(this.$getLine(a.row))
        };
        this.getIndentForRow = function(a) {
            return this.getNextLineIndent("start", this.$getLine(a), this.$session.getTabString(), a)
        };
        this.getNextLineIndent =
            function(a, e, f, h) {
                if (b.endsWith(a, "qstring")) return this.$getIndent(e);
                "number" !== typeof h && (h = this.$session.getSelection().getCursor().row - 1);
                var k = this.$session.getTabSize();
                a = Array(k + 1).join(" ");
                this.$lineOverrides = null;
                this.$doc.getLine(h) !== e && (this.$lineOverrides = {}, this.$lineOverrides[h] = e, this.$invalidateRow(h));
                try {
                    var n = 0 > h ? "" : this.$getIndent(this.$getLine(h));
                    if (!this.$tokenizeUpToRow(h)) return n;
                    var q = {
                            row: h,
                            column: this.$getLine(h).length
                        },
                        l = this.$findPreviousSignificantToken(q, h - 10);
                    n = "";
                    var p = !1;
                    if (l && x(l.token.type)) n = f, p = !0;
                    else if (l && /\bparen\b/.test(l.token.type) && /\)$/.test(l.token.value)) {
                        var v = this.$walkParensBalanced(l.row, l.row - 10, null, function(a, b, c) {
                            return 0 === a.length
                        });
                        if (null != v) {
                            var w = this.$findPreviousSignificantToken(v, 0);
                            if (w && "keyword" === w.token.type && /^(if|while|for|function)$/.test(w.token.value)) return this.$getIndent(this.$getLine(w.row)) + f
                        }
                    } else if (l && "keyword" === l.token.type && ("repeat" === l.token.value || "else" === l.token.value)) return this.$getIndent(this.$getLine(l.row)) +
                        f;
                    var t = this.getTokenCursor();
                    if (!t.moveToPosition(q)) return "";
                    do {
                        var B = t.currentType();
                        if ("support.function.codebegin" === B || "support.function.codeend" === B) return this.$getIndent(this.$doc.getLine(t.$row)) + n;
                        var z = t.currentValue();
                        if (t.isAtStartOfNewExpression(!1)) {
                            if ("{" === z || "[" === z || "(" === z) n += f;
                            return this.$getIndent(this.$doc.getLine(t.$row)) + n
                        }
                        if ("(" === z && t.isAtStartOfNewExpression(!0)) return this.$getIndent(this.$doc.getLine(t.$row)) + f;
                        if (!t.bwdToMatchingToken()) {
                            if ("{" === z) break;
                            if (y(["[",
                                    "("
                                ], z)) {
                                var A = t.currentPosition();
                                q = null;
                                c && (q = this.$findNextSignificantToken({
                                    row: A.row,
                                    column: A.column + 1
                                }, h));
                                if (q) {
                                    e = this.$getLine(q.row);
                                    var I = e.replace(/[^\s].*$/, ""),
                                        J = q.column - I.length,
                                        P = Math.floor(J / k);
                                    A = J - k * P;
                                    J = "";
                                    for (e = 0; e < P; e++) J += f;
                                    for (f = 0; f < A; f++) J += " ";
                                    f = I + J;
                                    var E = f.replace("\t", a).length;
                                    for (e = q.row + 1; e <= h; e++)
                                        if (/[^\s]/.test(this.$getLine(e))) {
                                            var G = this.$endStates[e - 1];
                                            if ("qstring" !== G && "qqstring" !== G) {
                                                var F = this.$getLine(e).replace(/[^\s].*$/, "");
                                                var C = F.replace("\t", a).length;
                                                C < E && (f = F, E = C)
                                            }
                                        } return r(t) ? f : f + n
                                }
                                return this.getIndentForOpenBrace(A) + f + n
                            }
                        }
                    } while (t.moveToPreviousToken());
                    if (!t.moveToPosition(q)) return "";
                    do
                        if (!t.bwdToMatchingToken()) {
                            if ("{" === t.currentValue()) return this.getIndentForOpenBrace(t.currentPosition()) + f + n;
                            if (d(t.currentToken())) {
                                for (; d(t.currentToken()) && t.moveToPreviousToken() && t.findStartOfEvaluationContext();) {
                                    var D = t.cloneCursor();
                                    if (D.moveToPreviousToken()) {
                                        if ("else" === D.currentValue() || "repeat" === D.currentValue()) return this.$getIndent(this.$doc.getLine(D.$row)) +
                                            n + n;
                                        if (")" === D.currentValue() && D.bwdToMatchingToken() && D.moveToPreviousToken() && m(D.currentValue())) {
                                            e = this.$doc.getLine(D.$row);
                                            if (!p)
                                                for (; D.moveToPreviousToken() && ")" === D.currentValue() && D.bwdToMatchingToken() && D.moveToPreviousToken() && m(D.currentValue());) e = this.$doc.getLine(D.$row);
                                            return this.$getIndent(e) + n + n
                                        }
                                    }
                                    d(t.peekBwd().currentToken()) && t.moveToPreviousToken()
                                }
                                return this.$getIndent(this.$getLine(t.$row)) + n
                            }
                        } while (t.moveToPreviousToken());
                    if (p) {
                        E = 0;
                        t = this.getTokenCursor();
                        t.moveToPosition(q);
                        t.moveToPreviousToken();
                        do {
                            if (g(t.currentValue(), ["if", "else"])) {
                                n += f;
                                break
                            }
                            if (t.hasType("constant", "identifier")) {
                                if (!t.moveToPreviousToken()) break;
                                if (g(t.currentValue(), ["if", "else"])) {
                                    n += f;
                                    break
                                }
                                if (")" === t.currentValue()) {
                                    if (!t.bwdToMatchingToken()) break;
                                    if (!t.moveToPreviousToken()) break;
                                    if (g(t.currentValue(), ["if", "else"])) {
                                        n += f;
                                        break
                                    }
                                }
                                if (!t.hasType("operator")) break
                            } else if (!t.findStartOfEvaluationContext()) break
                        } while (t.moveToPreviousToken() && 20 > E++)
                    }
                    var K = this.$findNextSignificantToken({
                        row: 0,
                        column: 0
                    }, h);
                    return K ? this.$getIndent(this.$getLine(K.row)) + n : "" + n
                } finally {
                    this.$lineOverrides && (this.$lineOverrides = null, this.$invalidateRow(h))
                }
            };
        this.getBraceIndent = function(a) {
            var b = this.getTokenCursor(),
                c = {
                    row: a,
                    column: this.$getLine(a).length
                };
            if (!b.moveToPosition(c)) return "";
            if (")" === b.currentValue()) {
                if (b.bwdToMatchingToken() && b.moveToPreviousToken() && (c = b.currentValue(), g(c, ["if", "while", "for", "function"]))) return this.$getIndent(this.$getLine(b.$row))
            } else if (g(b.currentValue(), ["else", "repeat"])) return this.$getIndent(this.$getLine(b.$row));
            return this.getIndentForRow(a)
        };
        this.getTokenForPos = function(a, b, c) {
            this.$tokenizeUpToRow(a.row);
            if (this.$tokens.length <= a.row) return null;
            for (var d = this.$tokens[a.row], e = 0; e < d.length; e++) {
                var f = d[e];
                if (b && a.column == f.column) return f;
                if (a.column <= f.column) break;
                if (c && a.column == f.column + f.value.length || a.column < f.column + f.value.length) return f
            }
            return null
        };
        this.$tokenizeUpToRow = function(a) {
            a = Math.min(a, this.$endStates.length - 1);
            for (var b = 0, c = !0; b <= a; b++)
                if (!c || !this.$endStates[b]) {
                    c = !1;
                    var d = 0 === b ?
                        "start" : this.$endStates[b - 1],
                        e = this.$getLine(b);
                    e = this.$tokenizer.getLineTokens(e, d, b);
                    !this.$statePattern || this.$statePattern.test(e.state) || this.$statePattern.test(d) ? this.$tokens[b] = this.$filterWhitespaceAndComments(e.tokens) : this.$tokens[b] = [];
                    e.state === this.$endStates[b] ? c = !0 : this.$endStates[b] = e.state
                } c || b < this.$tokens.length && this.$invalidateRow(b);
            return !0
        };
        this.$onDocChange = function(a) {
            "insert" === a.action ? this.$insertNewRows(a.start.row, a.end.row - a.start.row) : this.$removeRows(a.start.row,
                a.end.row - a.start.row);
            this.$invalidateRow(a.start.row);
            this.$scopes.invalidateFrom(a.start)
        };
        this.$invalidateRow = function(a) {
            this.$tokens[a] = null;
            this.$endStates[a] = null
        };
        this.$insertNewRows = function(a, b) {
            for (var c = [a, 0], d = 0; d < b; d++) c.push(null);
            this.$tokens.splice.apply(this.$tokens, c);
            this.$endStates.splice.apply(this.$endStates, c)
        };
        this.$removeRows = function(a, b) {
            this.$tokens.splice(a, b);
            this.$endStates.splice(a, b)
        };
        this.$getIndent = function(a) {
            return (a = /^([ \t]*)/.exec(a)) ? a[1] : ""
        };
        this.$getLine =
            function(a) {
                return this.$lineOverrides && "undefined" != typeof this.$lineOverrides[a] ? this.$lineOverrides[a] : this.$doc.getLine(a)
            };
        this.$walkParens = function(a, b, c) {
            var d = /\bparen\b/;
            return a < b ? function() {
                for (; a <= b; a++)
                    for (var e = this.$tokens[a], f = 0; f < e.length; f++)
                        if (d.test(e[f].type) && !c(e[f].value, {
                                row: a,
                                column: e[f].column
                            })) return !1;
                return !0
            }.call(this) : function() {
                a = Math.max(0, a);
                for (b = Math.max(0, b); a >= b; a--)
                    for (var e = this.$tokens[a], f = e.length - 1; 0 <= f; f--)
                        if (d.test(e[f].type) && !c(e[f].value, {
                                row: a,
                                column: e[f].column
                            })) return !1;
                return !0
            }.call(this)
        };
        this.$walkParensBalanced = function(a, b, c, d) {
            var e = [],
                f = null,
                h = this;
            this.$walkParens(a, b, function(a, b) {
                if (c && c(e, a, b)) return f = b, !1;
                if (/[\[({]/.test(a))
                    if (e[e.length - 1] === h.$complements[a]) e.pop();
                    else return !0;
                else e.push(a);
                return d && d(e, a, b) ? (f = b, !1) : !0
            });
            return f
        };
        this.$findNextSignificantToken = function(a, b) {
            if (0 == this.$tokens.length) return null;
            b = Math.min(b, this.$tokens.length - 1);
            for (var c = a.row, d = a.column; c <= b; c++) {
                for (var e = this.$tokens[c],
                        f = 0; f < e.length; f++)
                    if (e[f].column + e[f].value.length > d) return {
                        token: e[f],
                        row: c,
                        column: Math.max(e[f].column, d),
                        offset: f
                    };
                d = 0
            }
            return null
        };
        this.findNextSignificantToken = function(a) {
            return this.$findNextSignificantToken(a, this.$tokens.length - 1)
        };
        this.$findPreviousSignificantToken = function(a, b) {
            if (0 === this.$tokens.length) return null;
            b = Math.max(0, b);
            for (var c = Math.min(a.row, this.$tokens.length - 1); c >= b; c--) {
                var d = this.$tokens[c];
                if (0 !== d.length) {
                    if (c != a.row) return {
                        row: c,
                        column: d[d.length - 1].column,
                        token: d[d.length -
                            1],
                        offset: d.length - 1
                    };
                    for (var e = d.length - 1; 0 <= e; e--)
                        if (d[e].column < a.column) return {
                            row: c,
                            column: d[e].column,
                            token: d[e],
                            offset: e
                        }
                }
            }
        };
        this.$filterWhitespaceAndComments = function(a) {
            a = a.filter(function(a) {
                a = /\bcode(?:begin|end)\b/.test(a.type) ? !1 : /\bsectionhead\b/.test(a.type) ? !1 : /^\s*$/.test(a.value) || a.type.match(/\b(?:ace_virtual-)?comment\b/);
                return !a
            });
            for (var b = a.length - 1; 0 <= b; b--)
                if (1 < a[b].value.length && /\bparen\b/.test(a[b].type)) {
                    var c = a[b];
                    a.splice(b, 1);
                    for (var d = c.value.length - 1; 0 <= d; d--) {
                        var e = {
                            type: c.type,
                            value: c.value.charAt(d),
                            column: c.column + d
                        };
                        a.splice(b, 0, e)
                    }
                } return a
        }
    }).call(a.prototype);
    p.RCodeModel = a;
    p.setVerticallyAlignFunctionArgs = function(a) {
        c = a
    };
    p.getVerticallyAlignFunctionArgs = function() {
        return c
    }
});
var $colorFunctionCalls = !1;
define("mode/r_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    function g(a) {
        for (var b = Array(a.length), c = 0; c < a.length; c++) b[c] = {
            include: a[c]
        };
        return b
    }
    l = a("ace/lib/oop");
    var m = a("ace/lib/lang"),
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/rainbow_paren_highlight_rules").RainbowParenHighlightRules,
        e = a("mode/utils"),
        b = function() {
            this.$rules = {
                start: [{
                    token: "comment",
                    regex: "@@",
                    merge: !1
                }, {
                    token: "keyword",
                    regex: "\\\\[a-zA-Z0-9]+",
                    merge: !1
                }, {
                    token: ["keyword", "comment"],
                    regex: "(@(?:export|inheritParams|name|param|rdname|slot|template|useDynLib))(\\s+)(?=[a-zA-Z0-9._-])",
                    merge: !1,
                    next: "rd-highlight"
                }, {
                    token: "keyword",
                    regex: "@(?!@)[^ ]*",
                    merge: !1
                }, {
                    token: ["paren.keyword.operator", "comment"],
                    regex: "(\\[)(=)",
                    merge: !1,
                    next: "markdown-link"
                }, {
                    token: "paren.keyword.operator",
                    regex: "\\[",
                    merge: !1,
                    next: "markdown-link"
                }, {
                    token: ["support.function", "support.function", "support.function"],
                    regex: "(`+)(.*?[^`])(\\1)",
                    merge: !1
                }, {
                    token: ["comment", "constant.language.boolean"],
                    regex: "(\\s+|^)(__.+?__)\\b",
                    merge: !1
                }, {
                    token: ["comment", "constant.language.boolean"],
                    regex: "(\\s+|^)(_(?=[^_])(?:(?:\\\\.)|(?:[^_\\\\]))*?_)\\b",
                    merge: !1
                }, {
                    token: ["constant.numeric"],
                    regex: "([*][*].+?[*][*])",
                    merge: !1
                }, {
                    token: ["constant.numeric"],
                    regex: "([*](?=[^*])(?:(?:\\\\.)|(?:[^*\\\\]))*?[*])",
                    merge: !1
                }, {
                    token: "paren.keyword.operator",
                    regex: "(?:[[({]|[\\])}])",
                    merge: !1
                }, {
                    defaultToken: "comment"
                }],
                highlight: [{
                    token: "identifier.support.function",
                    regex: "[^ ,]+"
                }, {
                    token: "comment",
                    regex: ","
                }, {
                    token: "comment",
                    regex: "\\s*",
                    next: "start"
                }],
                "markdown-link": [{
                    token: "paren.keyword.operator",
                    regex: "\\]",
                    next: "start"
                }, {
                    token: ["identifier.support.class", "comment"],
                    regex: "([a-zA-Z0-9_.]+)(:{1,3})"
                }, {
                    token: "support.function",
                    regex: "`.*?`"
                }, {
                    token: "support.function",
                    regex: "[^{}()[\\]]+"
                }, {
                    token: "paren.keyword.operator",
                    regex: "(?:[[({]|[\\])}])"
                }, {
                    defaultToken: "comment"
                }]
            };
            this.normalizeRules()
        };
    l.inherits(b, f);
    a = function() {
        var a = m.arrayToMap("\\ function if else in break next repeat for while".split(" ")),
            d = m.arrayToMap("return switch try tryCatch stop warning require library attach detach source setMethod setGeneric setGroupGeneric setClass setRefClass R6Class UseMethod NextMethod".split(" ")),
            f = m.arrayToMap("NULL NA TRUE FALSE T F Inf NaN NA_integer_ NA_real_ NA_character_ NA_complex_".split(" ")),
            q = {
                "{": "}",
                "[": "]",
                "(": ")"
            },
            h = {
                "#comment": [{
                    token: "comment.sectionhead",
                    regex: "#+(?!').*(?:----|====|####)\\s*$",
                    next: "start"
                }, {
                    token: ["comment", "comment.keyword.operator"],
                    regex: "(#+'\\s*)(TODO|FIXME)\\b",
                    next: "rd-start"
                }, {
                    token: "comment",
                    regex: "#+'",
                    next: "rd-start"
                }, {
                    token: ["comment", "comment.keyword.operator", "comment"],
                    regex: "(#+\\s*)(TODO|FIXME)\\b(.*)$",
                    next: "start"
                }, {
                    token: "comment",
                    regex: "#.*$",
                    next: "start"
                }],
                "#string": [{
                    token: "string",
                    regex: "[rR]['\"][-]*[[({]",
                    next: "rawstring",
                    onMatch: function(a, b, c, d) {
                        c = c || [];
                        c[0] = b;
                        c[2] = q[a[a.length - 1]] + a.substring(2, a.length - 1) + a[1];
                        return this.token
                    }
                }, {
                    token: "string",
                    regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]',
                    next: "start"
                }, {
                    token: "string",
                    regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']",
                    next: "start"
                }, {
                    token: "string",
                    merge: !0,
                    regex: '["]',
                    next: "qqstring"
                }, {
                    token: "string",
                    merge: !0,
                    regex: "[']",
                    next: "qstring"
                }],
                "#number": [{
                    token: "constant.numeric",
                    regex: "0[xX][0-9a-fA-F]+[Li]?",
                    merge: !1,
                    next: "start"
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:\\d+(?:\\.\\d*)?)|(?:\\.\\d+))(?:[eE][+\\-]?\\d*)?[iL]?",
                    merge: !1,
                    next: "start"
                }],
                "#quoted-identifier": [{
                    token: "identifier",
                    regex: "`.*?`",
                    merge: !1,
                    next: "start"
                }],
                "#identifier": [{
                    token: function(a) {
                        return f.hasOwnProperty(a) ? "constant.language" : a.match(/^\.\.\d+$/) ? "variable.language" : "identifier"
                    },
                    regex: "(?:\\\\|[a-zA-Z.][a-zA-Z0-9._]*)",
                    next: "start"
                }],
                "#keyword-or-identifier": [{
                    token: function(b) {
                        return f.hasOwnProperty(b) ? "constant.language" :
                            a.hasOwnProperty(b) ? "keyword" : b.match(/^\.\.\d+$/) ? "variable.language" : "identifier"
                    },
                    regex: "(?:\\\\|[a-zA-Z.][a-zA-Z0-9._]*)",
                    next: "start"
                }],
                "#package-access": [{
                    token: function(a) {
                        return $colorFunctionCalls ? "identifier.support.class" : "identifier"
                    },
                    regex: "(?:\\\\|[a-zA-Z.][a-zA-Z0-9._]*)(?=\\s*::)",
                    next: "start"
                }],
                "#function-call": [{
                    token: function(a) {
                        return $colorFunctionCalls ? "identifier.support.function" : "identifier"
                    },
                    regex: "(?:\\\\|[a-zA-Z.][a-zA-Z0-9._]*)(?=\\s*\\()",
                    next: "start"
                }],
                "#function-call-or-keyword": [{
                    token: function(b) {
                        return d.hasOwnProperty(b) ||
                            a.hasOwnProperty(b) ? "keyword" : $colorFunctionCalls ? "identifier.support.function" : "identifier"
                    },
                    regex: "(?:\\\\|[a-zA-Z.][a-zA-Z0-9._]*)(?=\\s*\\()",
                    next: "start"
                }]
            };
        h["#operator"] = [{
                token: "keyword.operator",
                regex: "\\$|@",
                merge: !1,
                next: "afterDollar"
            }, {
                token: "keyword.operator",
                regex: ":::|::|:=|\\|>|=>|%%|>=|<=|==|!=|<<\\-|\\->>|\\->|<\\-|\\|\\||&&|=|\\+|\\-|\\*\\*?|/|\\^|>|<|!|&|\\||~|\\$|:|@|\\?",
                merge: !1,
                next: "start"
            }, {
                token: "keyword.operator.infix",
                regex: "%.*?%",
                merge: !1,
                next: "start"
            }, k.getParenRule(),
            {
                token: function(a) {
                    return $colorFunctionCalls ? "punctuation.keyword.operator" : "punctuation"
                },
                regex: "[;]",
                merge: !1,
                next: "start"
            }, {
                token: function(a) {
                    return $colorFunctionCalls ? "punctuation.keyword.operator" : "punctuation"
                },
                regex: "[,]",
                merge: !1,
                next: "start"
            }
        ];
        h["#text"] = [{
            token: "text",
            regex: "\\s+"
        }];
        h.start = g("#comment #string #number #package-access #quoted-identifier #function-call-or-keyword #keyword-or-identifier #operator #text".split(" "));
        h.afterDollar = g("#comment #string #number #quoted-identifier #function-call #keyword-or-identifier #operator #text".split(" "));
        h.rawstring = [{
            token: "string",
            regex: "[\\]})][-]*['\"]",
            onMatch: function(a, b, c, d) {
                this.next = a === c[2] ? c[0] : "rawstring";
                return this.token
            }
        }, {
            defaultToken: "string"
        }];
        h.qqstring = [{
            token: "string",
            regex: '(?:(?:\\\\.)|(?:[^"\\\\]))*?"',
            next: "start"
        }, {
            token: "string",
            regex: ".+",
            merge: !0
        }];
        h.qstring = [{
            token: "string",
            regex: "(?:(?:\\\\.)|(?:[^'\\\\]))*?'",
            next: "start"
        }, {
            token: "string",
            regex: ".+",
            merge: !0
        }];
        this.$rules = h;
        var n = (new b).getRules(),
            l;
        for (l in n) {
            h = n[l];
            for (var p = 0; p < h.length; p++)
                if (e.isArray(h[p].token))
                    for (var w =
                            0; w < h[p].token.length; w++) h[p].token[w] += ".virtual-comment";
                else h[p].token += ".virtual-comment"
        }
        this.embedRules(n, "rd-", [{
            token: "text",
            regex: "^",
            next: "start"
        }]);
        this.normalizeRules()
    };
    l.inherits(a, f);
    p.RHighlightRules = a;
    p.setHighlightRFunctionCalls = function(a) {
        $colorFunctionCalls = a
    }
});
define("mode/r_matching_brace_outdent", ["require", "exports", "module"], function(a, p, l) {
    var g = a("ace/range").Range;
    a = function(a) {
        this.codeModel = a
    };
    (function() {
        this.checkOutdent = function(a, f, k) {
            return /^\s+$/.test(f) && /^\s*[\{\}\)\]]/.test(k) || /^\s*}\s*$/.test(f) && "\n" == k || /}\s*$/.test(f) && /\n/.test(k) ? !0 : !1
        };
        this.autoOutdent = function(a, f, k) {
            if (0 === k) return 0;
            a = f.getLine(k);
            var e = a.match(/^(\s*[\}\)\]])/);
            if (e) {
                e = e[1].length;
                var b = f.findMatchingBracket({
                    row: k,
                    column: e
                });
                if (!b || b.row == k) return 0;
                b = this.codeModel.getIndentForOpenBrace(b);
                f.replace(new g(k, 0, k, e - 1), b)
            }
            if (e = a.match(/^(\s*\{)/)) e = e[1].length, b = this.codeModel.getBraceIndent(k - 1), f.replace(new g(k, 0, k, e - 1), b)
        }
    }).call(a.prototype);
    p.RMatchingBraceOutdent = a
});
define("mode/r_scope_tree", ["require", "exports", "module"], function(a, p, l) {
    function g(a, k) {
        return a.row != k.row ? a.row - k.row : a.column - k.column
    }
    var m = function(a, k, e, b, c) {
        this.label = a;
        if ((this.start = k) && e && (e.row > k.row || e.row === k.row && e.column > k.column)) throw Error("Malformed preamble: should lie before start position");
        this.preamble = e || k;
        this.end = null;
        this.scopeType = b;
        this.parentScope = null;
        this.attributes = c || {};
        this.$children = []
    };
    m.TYPE_ROOT = 1;
    m.TYPE_BRACE = 2;
    m.TYPE_CHUNK = 3;
    m.TYPE_SECTION = 4;
    (function() {
        this.isRoot =
            function() {
                return this.scopeType == m.TYPE_ROOT
            };
        this.isBrace = function() {
            return this.scopeType == m.TYPE_BRACE
        };
        this.isChunk = function() {
            return this.scopeType == m.TYPE_CHUNK
        };
        this.isSection = function() {
            return this.scopeType == m.TYPE_SECTION
        };
        this.isFunction = function() {
            return this.isBrace() && !!this.attributes.args
        };
        this.equals = function(a) {
            return this.scopeType !== a.scopeType || this.start.row !== a.start.row || this.start.column !== a.start.column ? !1 : !0
        };
        this.addNode = function(a) {
            a.end && window.alert("[ASSERTION FAILED] New node is already closed");
            0 != a.$children.length && window.alert("[ASSERTION FAILED] New node already had children");
            if (!this.equals(a)) {
                this.end = null;
                var f = this.$binarySearch(a.preamble);
                0 <= f ? this.$children[f].addNode(a) : (f = -(f + 1), f < this.$children.length && (a.$children = this.$children.splice(f, this.$children.length - f)), a.parentScope = this, this.$children.push(a))
            }
        };
        this.closeScope = function(a, g) {
            if (0 == this.$children.length) return null;
            var e = this.$children[this.$children.length - 1];
            if (e.end) return null;
            var b = e.closeScope(a, g);
            return b ?
                b : g == e.scopeType ? (e.end = a, e.$forceDescendantsClosed(a), e) : null
        };
        this.$forceDescendantsClosed = function(a) {
            if (0 != this.$children.length) {
                var f = this.$children[this.$children.length - 1];
                f.end || (f.$forceDescendantsClosed(a), f.end = a)
            }
        };
        this.findNode = function(a) {
            var f = this.$binarySearch(a);
            return 0 <= f && (a = this.$children[f].findNode(a)) ? (this.label && a.unshift(this), a) : this.label ? [this] : null
        };
        this.$getFunctionStack = function(a) {
            var f = this.$binarySearch(a);
            a = 0 <= f ? this.$children[f].$getFunctionStack(a) : [];
            this.isFunction() &&
                a.push(this);
            return a
        };
        this.findFunctionDefinitionFromUsage = function(a, g) {
            for (var e = this.$getFunctionStack(a), b = 0; b < e.length; b++)
                for (var c = e[b], d = 0; d < c.$children.length; d++)
                    if (c.$children[d].label == g) return c.$children[d];
            return null
        };
        this.getFunctionsInScope = function(a) {
            a = this.$getFunctionStack(a);
            for (var f = [], e = 0; e < a.length; e++) f.push({
                name: a[e].attributes.name,
                args: a[e].attributes.args.slice()
            });
            return f
        };
        this.invalidateFrom = function(a) {
            var f = this.$binarySearch(a);
            0 <= f ? 0 >= g(a, this.$children[f].start) ?
                a = this.$children[f].preamble : (a = this.$children[f].invalidateFrom(a), f++) : f = -(f + 1);
            f < this.$children.length && this.$children.splice(f, this.$children.length - f);
            this.end = null;
            return a
        };
        this.$binarySearch = function(a, g, e) {
            "undefined" === typeof g && (g = 0);
            "undefined" === typeof e && (e = this.$children.length);
            if (g === e) return -(g + 1);
            var b = Math.floor((g + e) / 2),
                c = this.$children[b].comparePosition(a);
            return 0 === c ? b : 0 > c ? this.$binarySearch(a, g, b) : this.$binarySearch(a, b + 1, e)
        };
        this.comparePosition = function(a) {
            return 0 > g(a,
                this.preamble) ? -1 : null != this.end && 0 <= g(a, this.end) ? 1 : 0
        };
        this.printDebug = function(a) {
            "undefined" === typeof a && (a = "");
            for (var f = 0; f < this.$children.length; f++) this.$children[f].printDebug(a + "    ")
        }
    }).call(m.prototype);
    a = function(a) {
        this.$ScopeNodeFactory = a || m;
        this.parsePos = {
            row: 0,
            column: 0
        };
        this.$root = new this.$ScopeNodeFactory("(Top Level)", this.parsePos, null, m.TYPE_ROOT)
    };
    (function() {
        function a(e) {
            count = e.isChunk() ? 1 : 0;
            e = e.$children || [];
            for (var b = 0; b < e.length; b++) count += a(e[b]);
            return count
        }
        this.getParsePosition =
            function() {
                return this.parsePos
            };
        this.setParsePosition = function(a) {
            this.parsePos = a
        };
        this.onSectionStart = function(a, b, c) {
            "undefined" == typeof c && (c = {});
            var d = this.getActiveScopes(b);
            if (1 < d.length) {
                d = d[d.length - 2].$children;
                for (var e = d.length - 1; 0 <= e; e--)
                    if (d[e].isSection()) {
                        this.$root.closeScope(b, m.TYPE_SECTION);
                        break
                    }
            }
            a = new this.$ScopeNodeFactory(a, b, b, m.TYPE_SECTION, c);
            this.$root.addNode(a)
        };
        this.onSectionEnd = function(a) {
            this.$root.closeScope(a, m.TYPE_SECTION)
        };
        this.closeMarkdownHeaderScopes = function(a,
            b, c) {
            for (var d = a.$children, e = d.length - 1; 0 <= e; e--) {
                var f = d[e];
                if (f.isFunction() || f.isChunk()) return;
                if (f.isSection() && f.attributes.depth >= c) return this.$root.closeScope(b, m.TYPE_SECTION), f.attributes.depth === c || a.isRoot() || null == a ? void 0 : this.closeMarkdownHeaderScopes(a.parentScope, b, c)
            }
            a.isRoot() || null == a || this.closeMarkdownHeaderScopes(a.parentScope, b, c)
        };
        this.onMarkdownHead = function(a, b, c, d, f) {
            var e = this.getActiveScopes(b);
            1 < e.length && this.closeMarkdownHeaderScopes(e[e.length - 2], b, d);
            this.$root.addNode(new this.$ScopeNodeFactory(a,
                c, b, m.TYPE_SECTION, {
                    depth: d,
                    isMarkdown: f
                }))
        };
        this.onChunkStart = function(a, b, c, d) {
            this.$root.closeScope(c, m.TYPE_CHUNK);
            b = new this.$ScopeNodeFactory(b, d, c, m.TYPE_CHUNK);
            b.chunkLabel = a;
            this.$root.addNode(b);
            this.printScopeTree()
        };
        this.onChunkEnd = function(a) {
            a = this.$root.closeScope(a, m.TYPE_CHUNK);
            this.printScopeTree();
            return a
        };
        this.onFunctionScopeStart = function(a, b, c, d, f) {
            this.$root.addNode(new this.$ScopeNodeFactory(a, c, b, m.TYPE_BRACE, {
                name: d,
                args: f
            }));
            this.printScopeTree()
        };
        this.onNamedScopeStart =
            function(a, b) {
                this.$root.addNode(new this.$ScopeNodeFactory(a, b, null, m.TYPE_BRACE))
            };
        this.onScopeStart = function(a) {
            this.$root.addNode(new this.$ScopeNodeFactory(null, a, null, m.TYPE_BRACE));
            this.printScopeTree()
        };
        this.onScopeEnd = function(a) {
            a = this.$root.closeScope(a, m.TYPE_BRACE);
            this.printScopeTree();
            return a
        };
        this.getActiveScopes = function(a) {
            return this.$root.findNode(a)
        };
        this.getScopeList = function() {
            return this.$root.$children
        };
        this.findFunctionDefinitionFromUsage = function(a, b) {
            return this.$root.findFunctionDefinitionFromUsage(a,
                b)
        };
        this.getFunctionsInScope = function(a, b) {
            return this.$root.getFunctionsInScope(a, b)
        };
        this.invalidateFrom = function(a) {
            a = {
                row: Math.max(0, a.row - 1),
                column: 0
            };
            0 < g(this.parsePos, a) && (this.parsePos = this.$root.invalidateFrom(a));
            this.printScopeTree()
        };
        this.getChunkCount = function(e) {
            return a(this.$root)
        };
        this.getTopLevelScopeCount = function() {
            return this.$root.$children.length
        };
        this.printScopeTree = function() {};
        this.getAllFunctionScopes = function() {
            var a = [];
            k(this.$root, a);
            return a
        };
        var k = function(a, b) {
            a.isFunction() &&
                b.push(a);
            for (var c = a.$children, d = 0; d < c.length; d++) k(c[d], b)
        }
    }).call(a.prototype);
    p.ScopeManager = a;
    p.ScopeNode = m
});
var $rainbowParentheses = !1,
    $numParenColors = 7;
define("mode/rainbow_paren_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    a = function() {};
    p.RainbowParenHighlightRules = a;
    p.setRainbowParentheses = function(a) {
        $rainbowParentheses = a
    };
    p.getRainbowParentheses = function() {
        return $rainbowParentheses
    };
    p.setNumParenColors = function(a) {
        $numParenColors = a
    };
    a.getParenRule = function() {
        return {
            token: "paren.keyword.operator.nomatch",
            regex: "[[({})\\]]",
            merge: !1,
            onMatch: function(a, m, f) {
                if (!$rainbowParentheses) return this.token = "paren.keyword.operator.nomatch";
                f = f || [];
                f[0] = m;
                f[1] = f[1] || 0;
                switch (a) {
                    case "[":
                    case "{":
                    case "(":
                        this.token = "paren.paren_color_" + f[1] % $numParenColors;
                        f[1] += 1;
                        break;
                    case "]":
                    case "}":
                    case ")":
                        f[1] = Math.max(0, f[1] - 1), this.token = "paren.paren_color_" + f[1] % $numParenColors
                }
                return this.token
            },
            next: "start"
        }
    }
});
define("mode/rdoc", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/rdoc_highlight_rules").RDocHighlightRules,
        e = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
    a = function(a) {
        a ? (this.$highlightRules = new f, this.$tokenizer = new m((new f).getRules())) : (this.$highlightRules = new k, this.$tokenizer = new m((new k).getRules()));
        this.$outdent = new e
    };
    l.inherits(a,
        g);
    (function() {
        this.getNextLineIndent = function(a, c, d) {
            return this.$getIndent(c)
        }
    }).call(a.prototype);
    p.Mode = a
});
define("mode/rdoc_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a("ace/lib/lang");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        var a = "\\" + "name|alias|method|S3method|S4method|item|code|preformatted|kbd|pkg|var|env|option|command|author|email|url|source|cite|acronym|href|code|preformatted|link|eqn|deqn|keyword|usage|examples|dontrun|dontshow|figure|if|ifelse|Sexpr|RdOpts|inputencoding|usepackage".replace(/\|/g, "|\\");
        this.createKeywordMapper({
                keyword: a
            },
            "identifer");
        this.$rules = {
            start: [{
                token: "comment",
                regex: "%.*$"
            }, {
                token: "text",
                regex: "\\\\[$&%#\\{\\}]"
            }, {
                token: "keyword",
                regex: "\\\\(?:name|alias|method|S3method|S4method|item|code|preformatted|kbd|pkg|var|env|option|command|author|email|url|source|cite|acronym|href|code|preformatted|link|eqn|deqn|keyword|usage|examples|dontrun|dontshow|figure|if|ifelse|Sexpr|RdOpts|inputencoding|usepackage)\\b",
                next: "nospell"
            }, {
                token: "keyword",
                regex: "\\\\(?:[a-zA-z0-9]+|[^a-zA-z0-9])"
            }, {
                token: "paren.keyword.operator",
                regex: "[[({]"
            }, {
                token: "paren.keyword.operator",
                regex: "[\\])}]"
            }, {
                token: "text",
                regex: "\\s+"
            }],
            nospell: [{
                token: "comment",
                regex: "%.*$",
                next: "start"
            }, {
                token: "nospell.text",
                regex: "\\\\[$&%#\\{\\}]"
            }, {
                token: "keyword",
                regex: "\\\\(?:name|alias|method|S3method|S4method|item|code|preformatted|kbd|pkg|var|env|option|command|author|email|url|source|cite|acronym|href|code|preformatted|link|eqn|deqn|keyword|usage|examples|dontrun|dontshow|figure|if|ifelse|Sexpr|RdOpts|inputencoding|usepackage)\\b"
            }, {
                token: "keyword",
                regex: "\\\\(?:[a-zA-z0-9]+|[^a-zA-z0-9])",
                next: "start"
            }, {
                token: "paren.keyword.operator",
                regex: "[[({]"
            }, {
                token: "paren.keyword.operator",
                regex: "[\\])]"
            }, {
                token: "paren.keyword.operator",
                regex: "}",
                next: "start"
            }, {
                token: "nospell.text",
                regex: "\\s+"
            }, {
                token: "nospell.text",
                regex: "\\w+"
            }]
        }
    };
    l.inherits(g, a);
    p.RDocHighlightRules = g
});
define("mode/rhtml", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/html").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("mode/rhtml_highlight_rules").RHtmlHighlightRules,
        k = a("mode/r_code_model").RCodeModel,
        e = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        b = a("mode/r_matching_brace_outdent").RMatchingBraceOutdent,
        c = a("mode/utils");
    a = function(a, c) {
        this.$session = c;
        this.$tokenizer = new m((new f).getRules());
        this.codeModel = new k(c, this.$tokenizer, /^r-/, /^\x3c!--\s*begin.rcode\s*(.*)/,
            /^\s*end.rcode\s*--\x3e/);
        this.$outdent = new e;
        this.$r_outdent = new b(this.codeModel);
        this.foldingRules = this.codeModel
    };
    l.inherits(a, g);
    (function() {
        this.insertChunkInfo = {
            value: "\x3c!--begin.rcode\n\nend.rcode--\x3e\n",
            position: {
                row: 0,
                column: 15
            },
            content_position: {
                row: 1,
                column: 0
            }
        };
        this.checkOutdent = function(a, b, e) {
            return "r" === c.activeMode(a, "html") ? this.$r_outdent.checkOutdent(a, b, e) : this.$outdent.checkOutdent(b, e)
        };
        this.autoOutdent = function(a, b, e) {
            return "r" === c.activeMode(a, "html") ? this.$r_outdent.autoOutdent(a,
                b, e) : this.$outdent.autoOutdent(b, e)
        };
        this.getLanguageMode = function(a) {
            return c.getPrimaryState(this.$session, a.row).match(/^r-/) ? "R" : "HTML"
        };
        this.$getNextLineIndent = this.getNextLineIndent;
        this.getNextLineIndent = function(a, b, e, f) {
            return "r" === c.activeMode(a, "html") ? this.codeModel.getNextLineIndent(a, b, e, f) : this.$getNextLineIndent(a, b, e)
        };
        this.$id = "mode/rhtml"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/rhtml_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/r_highlight_rules").RHighlightRules,
        m = a("ace/mode/html_highlight_rules").HtmlHighlightRules;
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var f = function() {
        this.$rules = (new m).getRules();
        this.$rules.start.unshift({
            token: "support.function.codebegin",
            regex: "^\x3c!--\\s*begin.rcode\\s*(?:.*)",
            next: "r-start"
        });
        var a = (new g).getRules();
        this.addRules(a, "r-");
        this.$rules["r-start"].unshift({
            token: "support.function.codeend",
            regex: "^\\s*end.rcode\\s*--\x3e",
            next: "start"
        })
    };
    l.inherits(f, a);
    p.RHtmlHighlightRules = f
});
define("mode/rmarkdown", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/markdown").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("mode/rmarkdown_highlight_rules").RMarkdownHighlightRules,
        k = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        e = a("mode/r_matching_brace_outdent").RMatchingBraceOutdent,
        b = a("mode/c_cpp_matching_brace_outdent").CppMatchingBraceOutdent,
        c = a("mode/r_code_model").RCodeModel,
        d = a("mode/cpp_code_model").CppCodeModel,
        r = a("mode/python").Mode,
        q = a("rstudio/folding/rmarkdown").FoldMode,
        h = a("ace/mode/folding/cstyle").FoldMode;
    a("mode/auto_brace_insert");
    var n = a("mode/utils"),
        v = a("ace/unicode");
    a = function(a, g) {
        var l = this;
        this.$session = g;
        this.$tokenizer = new m((new f).getRules());
        this.$outdent = new k;
        this.codeModel = new c(g, this.$tokenizer, /^r-/, new RegExp(f.prototype.$reChunkStartString), new RegExp(f.prototype.$reChunkEndString));
        this.$r_outdent = new e(this.codeModel);
        this.cpp_codeModel = new d(g, this.$tokenizer, /^r-cpp-/, new RegExp(f.prototype.$reCppChunkStartString), new RegExp(f.prototype.$reChunkEndString));
        this.$cpp_outdent = new b(this.cpp_codeModel);
        this.$python = new r;
        var p = new q,
            v = new h;
        this.$tokenizer.getLineTokens = function(a, b, c) {
            0 === c && (b = "firstLine");
            return m.prototype.getLineTokens.call(this, a, b, c)
        };
        this.foldingRules = {
            getFoldWidget: function(a, b, c) {
                var d = l.getLanguageMode({
                        row: c,
                        column: 0
                    }),
                    e = a.getLine(c);
                return "Markdown" === d || n.startsWith(e, "```") || 0 === c ? p.getFoldWidget(a, b, c) : "C_CPP" === d ? v.getFoldWidget(a, b, c) : l.codeModel.getFoldWidget(a, b, c)
            },
            getFoldWidgetRange: function(a, b, c) {
                var d = l.getLanguageMode({
                        row: c,
                        column: 0
                    }),
                    e = a.getLine(c);
                return "Markdown" === d || n.startsWith(e, "```") || 0 === c ? p.getFoldWidgetRange(a, b, c) : "C_CPP" === d ? v.getFoldWidgetRange(a, b, c) : l.codeModel.getFoldWidgetRange(a, b, c)
            }
        }
    };
    l.inherits(a, g);
    (function() {
        function a(a) {
            return n.activeMode(a, "markdown")
        }
        this.insertChunkInfo = {
            value: "```{r}\n\n```\n",
            position: {
                row: 0,
                column: 5
            },
            content_position: {
                row: 1,
                column: 0
            }
        };
        this.getLanguageMode = function(b) {
            b = n.getPrimaryState(this.$session, b.row);
            b = a(b);
            return "r" === b ? "R" : "r-cpp" === b ? "C_CPP" : "yaml" === b ? "YAML" :
                "python" === b ? "Python" : "sql" == b ? "SQL" : "stan" === b ? "Stan" : "Markdown"
        };
        this.$getNextLineIndent = this.getNextLineIndent;
        this.getNextLineIndent = function(b, c, d, e, f) {
            var h = a(b);
            return "r" === h ? this.codeModel.getNextLineIndent(b, c, d, e) : "r-cpp" === h ? this.cpp_codeModel.getNextLineIndent(b, c, d, e, f) : "yaml" === h ? this.$getIndent(this.$session.getLine(e + 1)) : "python" === h ? this.$python.getNextLineIndent(b, c, d, e) : this.$getNextLineIndent(b, c, d)
        };
        this.checkOutdent = function(b, c, d) {
            var e = a(b);
            return "r" === e ? this.$r_outdent.checkOutdent(b,
                c, d) : "r-cpp" === e ? this.$cpp_outdent.checkOutdent(b, c, d) : "yaml" === e ? !1 : this.$outdent.checkOutdent(c, d)
        };
        this.autoOutdent = function(b, c, d) {
            var e = a(b);
            if ("r" === e) return this.$r_outdent.autoOutdent(b, c, d);
            if ("r-cpp" === e) return this.$cpp_outdent.autoOutdent(b, c, d);
            if ("yaml" !== e) return "python" === e ? this.$python.autoOutdent(b, c, d) : this.$outdent.autoOutdent(c, d)
        };
        this.transformAction = function(b, c, d, e, f) {
            var h = a(b);
            return "markdown" === h ? this.transformActionMarkdown(b, c, d, e, f) : "r-cpp" === h ? this.transformActionCpp(b,
                c, d, e, f) : "yaml" === h ? this.transformActionYaml(b, c, d, e, f) : "python" === h ? this.$python.transformAction(b, c, d, e, f) : !1
        };
        this.transformActionMarkdown = function(a, b, c, d, e) {
            if ("insertion" === b)
                if ("r" === e) {
                    if (a = c.getCursorPosition(), b = d.getLine(a.row), d = d.getTokenAt(a.row, a.column - 1), null !== d && -1 === d.type.indexOf("support.function") && "`" === b[a.column - 1]) return {
                        text: "r`",
                        selection: [0, a.column + 1, 0, a.column + 1]
                    }
                } else if ("`" === e && (a = c.getCursorPosition(), b = d.getLine(a.row), d = d.getTokenAt(a.row, a.column + 1), null !== d &&
                    -1 !== d.type.indexOf("support.function") && "`" === b[a.column])) return {
                text: "",
                selection: [0, a.column + 1, 0, a.column + 1]
            }
        };
        this.transformActionCpp = function(a, b, c, d, e) {
            if ("insertion" === b)
                if ("\n" === e) {
                    if (a = c.getSelectionRange().start, (d = /^((\s*\/\/+')\s*)/.exec(d.doc.getLine(a.row))) && c.getSelectionRange().start.column >= d[2].length) return {
                        text: "\n" + d[1]
                    }
                } else if ("R" === e && (a = c.getSelectionRange().start, (d = /^(\s*\/\*{3,}\s*)/.exec(d.doc.getLine(a.row))) && c.getSelectionRange().start.column >= d[1].length)) return {
                text: "R\n\n*/\n",
                selection: [1, 0, 1, 0]
            };
            return !1
        };
        this.transformActionYaml = function(a, b, c, d, e) {
            return "insertion" === b && "\n" === e ? (a = c.getCursorPosition().row, a = d.getLine(a), d = this.$getIndent(a), /[:({[]$/.test(a) ? (a = this.$session.getTabString(), {
                text: "\n" + d + a
            }) : {
                text: "\n" + d
            }) : !1
        };
        this.tokenRe = new RegExp("^[" + v.wordChars + "._]+", "g");
        this.nonTokenRe = new RegExp("^(?:[^" + v.wordChars + "._]|\\s)+", "g");
        this.allowAutoInsert = this.smartAllowAutoInsert;
        this.$id = "mode/rmarkdown"
    }).call(a.prototype);
    p.Mode = a
});
define("rstudio/folding/rmarkdown", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/folding/fold_mode").FoldMode,
        m = a("ace/range").Range;
    p = p.FoldMode = function() {};
    var f = a("mode/utils");
    l.inherits(p, g);
    (function() {
        this.getFoldWidget = function(a, b, c) {
            b = "markbeginend" === b ? "end" : "";
            var d = a.getLine(c),
                e = a.getState(c);
            a = 0 < c ? a.getState(c - 1) : "start";
            if (f.startsWith(d, "===") || f.startsWith(d, "---") || f.startsWith(d, "...")) return f.startsWith(a, "yaml") ? b : "start";
            if ("start" ===
                e && f.startsWith(d, "#")) return "start";
            a = d.trim();
            return f.startsWith(a, "```") ? "start" === e ? b : "start" : ""
        };
        var a = function(a, b, c, d, g) {
            b = 0 === c ? 1 : "start" === b ? -1 : 1;
            var e = {
                row: c,
                column: 0
            };
            1 === b && (e.column = a.getLine(c).length);
            c += b;
            for (var h = 0 < b ? a.getLength() : 0; c !== h;) {
                var n = a.getLine(c).trim();
                if (f.startsWith(n, d)) break;
                if (g && f.startsWith(n, g)) break;
                c += b
            }
            d = {
                row: c,
                column: 0
            }; - 1 === b && (d.column = a.getLine(c).length);
            return 1 === b ? m.fromPoints(e, d) : m.fromPoints(d, e)
        };
        this.$getFoldWidgetRange = function(e, b, c) {
            var d =
                e.getState(c);
            b = e.getLine(c);
            var g = b.trim();
            if (f.startsWith(b, "```")) return a(e, d, c, "```");
            var k = 0 < c ? e.getState(c - 1) : "start";
            g = 0 === c && "---" === g;
            k = f.startsWith(k, "yaml");
            if (g || k) return a(e, d, c, "---", g ? "..." : void 0);
            if ("=" === b[0]) k = 1;
            else if ("-" === b[0]) k = 2;
            else {
                k = /^(#+)(?:.*)$/.exec(b);
                if (!k) return;
                k = k[1].length
            }
            if (null !== k) {
                a: {
                    g = e.getLength();
                    for (var h = c + 1; h < g; h++)
                        if (e.getState(h) === d) {
                            var n = e.getLine(h);
                            if (1 === k && /^[=]{3,}\s*/.test(n)) {
                                d = h - 2;
                                break a
                            }
                            if (2 === k && /^[-]{3,}\s*/.test(n)) {
                                d = h - 2;
                                break a
                            }
                            if ((n =
                                    /^(#+)(?:.*)$/.exec(n)) && n[1].length <= k) {
                                d = h - 1;
                                break a
                            }
                        } d = g
                }
                return new m(c, b.length, d, e.getLine(d).length)
            }
        };
        this.getFoldWidgetRange = function(a, b, c) {
            a = this.$getFoldWidgetRange(a, b, c);
            if (null != a && a.start.row !== a.end.row) return a
        }
    }).call(p.prototype)
});
define("mode/rmarkdown_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/r_highlight_rules").RHighlightRules,
        m = a("mode/c_cpp_highlight_rules").c_cppHighlightRules,
        f = a("ace/mode/perl_highlight_rules").PerlHighlightRules,
        k = a("mode/python_highlight_rules").PythonHighlightRules,
        e = a("ace/mode/ruby_highlight_rules").RubyHighlightRules,
        b = a("mode/markdown_highlight_rules").MarkdownHighlightRules,
        c = a("ace/mode/text_highlight_rules").TextHighlightRules,
        d = a("mode/yaml_highlight_rules").YamlHighlightRules,
        r = a("mode/sh_highlight_rules").ShHighlightRules,
        q = a("mode/stan_highlight_rules").StanHighlightRules,
        h = a("mode/sql_highlight_rules").SqlHighlightRules,
        n = a("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules,
        v = a("mode/utils");
    a = function() {
        this.$rules = (new b).getRules();
        this.$rules.firstLine = this.$rules.allowBlock.slice();
        v.embedRules(this, g, "r", this.$reChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, m, "r-cpp", this.$reCppChunkStartString, this.$reChunkEndString,
            ["start", "listblock", "allowBlock"]);
        v.embedRules(this, f, "perl", this.$rePerlChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, k, "python", this.$rePythonChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, e, "ruby", this.$reRubyChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, b, "markdown", this.$reMarkdownChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, r, "sh", this.$reShChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, q, "stan", this.$reStanChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, h, "sql", this.$reSqlChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, n, "js", this.$reJavaScriptChunkStartString, this.$reChunkEndString, ["start", "listblock", "allowBlock"]);
        v.embedRules(this, d, "yaml", "^\\s*---\\s*$",
            "^\\s*(?:---|\\.\\.\\.)\\s*$", ["firstLine"]);
        this.$rules["yaml-start"].unshift({
            token: ["string"],
            regex: /((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|s|n|r)?(?:\s*(?:,)?(?:\s*\d+)?)?)/
        });
        this.$rules["yaml-start"].push({
            defaultToken: "text.nospell"
        });
        this.normalizeRules()
    };
    l.inherits(a, c);
    (function() {
        function a(a) {
            return "^(?:[ ]{4})?`{3,}\\s*\\{[Rr]\\b(?:.*)engine\\s*\\=\\s*['\"]" + a + "['\"](?:.*)\\}\\s*$|^(?:[ ]{4})?`{3,}\\s*\\{" + a + "\\b(?:.*)\\}\\s*$"
        }
        this.$reChunkStartString = "^(?:[ ]{4})?`{3,}\\s*\\{\\w+\\b(.*)\\}\\s*$";
        this.$reChunkEndString = "^(?:[ ]{4})?`{3,}\\s*$";
        this.$reCppChunkStartString = a("(?:[rR][cC]pp|[cC](?:pp)?)\\d*");
        this.$reMarkdownChunkStartString = a("block");
        this.$rePerlChunkStartString = a("perl");
        this.$rePythonChunkStartString = a("python");
        this.$reRubyChunkStartString = a("ruby");
        this.$reShChunkStartString = a("(?:bash|sh)");
        this.$reStanChunkStartString = a("stan");
        this.$reSqlChunkStartString = a("sql");
        this.$reJavaScriptChunkStartString =
            a("(?:d3|js)")
    }).call(a.prototype);
    p.RMarkdownHighlightRules = a
});
define("mode/sh", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("mode/sh_highlight_rules").ShHighlightRules,
        f = a("ace/range").Range,
        k = a("ace/mode/folding/cstyle").FoldMode,
        e = a("ace/mode/behaviour/cstyle").CstyleBehaviour;
    a = function() {
        this.HighlightRules = m;
        this.foldingRules = new k;
        this.$behaviour = new e
    };
    l.inherits(a, g);
    (function() {
        this.lineCommentStart = "#";
        this.getNextLineIndent = function(a, b, e) {
            var c = this.$getIndent(b),
                d = this.getTokenizer().getLineTokens(b,
                    a).tokens;
            if (d.length && "comment" == d[d.length - 1].type) return c;
            "start" == a && b.match(/^.*[\{\(\[:]\s*$/) && (c += e);
            return c
        };
        var a = {
            pass: 1,
            "return": 1,
            raise: 1,
            "break": 1,
            "continue": 1
        };
        this.checkOutdent = function(b, d, e) {
            if ("\r\n" !== e && "\r" !== e && "\n" !== e) return !1;
            b = this.getTokenizer().getLineTokens(d.trim(), b).tokens;
            if (!b) return !1;
            do d = b.pop(); while (d && ("comment" == d.type || "text" == d.type && d.value.match(/^\s+$/)));
            return d ? "keyword" == d.type && a[d.value] : !1
        };
        this.autoOutdent = function(a, b, e) {
            e += 1;
            a = this.$getIndent(b.getLine(e));
            var c = b.getTabString();
            a.slice(-c.length) == c && b.remove(new f(e, a.length - c.length, e, a.length))
        };
        this.$id = "mode/sh"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/sh_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = p.reservedKeywords = "!|{|}|case|do|done|elif|else|esac|fi|for|if|in|then|until|while|&|;|export|local|read|typeset|unset|elif|select|set|function|declare|readonly",
        m = p.languageConstructs = "[|]|alias|bg|bind|break|builtin|cd|command|compgen|complete|continue|dirs|disown|echo|enable|eval|exec|exit|fc|fg|getopts|hash|help|history|jobs|kill|let|logout|popd|printf|pushd|pwd|return|set|shift|shopt|source|suspend|test|times|trap|type|ulimit|umask|unalias|wait",
        f = function() {
            this.$rules = {
                start: [{
                    token: "constant",
                    regex: /\\./
                }, {
                    token: ["text", "comment"],
                    regex: /(^|\s)(#.*)$/
                }, {
                    token: "string.start",
                    regex: '"',
                    push: [{
                        token: "constant.language.escape",
                        regex: /\\(?:[$`"\\]|$)/
                    }, {
                        include: "variables"
                    }, {
                        token: "keyword.operator",
                        regex: /`/
                    }, {
                        token: "string.end",
                        regex: '"',
                        next: "pop"
                    }, {
                        defaultToken: "string"
                    }]
                }, {
                    token: "string",
                    regex: "\\$'",
                    push: [{
                        token: "constant.language.escape",
                        regex: /\\(?:[abeEfnrtv\\'"]|x[a-fA-F\d]{1,2}|u[a-fA-F\d]{4}([a-fA-F\d]{4})?|c.|\d{1,3})/
                    }, {
                        token: "string",
                        regex: "'",
                        next: "pop"
                    }, {
                        defaultToken: "string"
                    }]
                }, {
                    regex: "<<<",
                    token: "keyword.operator"
                }, {
                    stateName: "heredoc",
                    regex: "(<<-?)(\\s*)(['\"`]?)([\\w\\-]+)(['\"`]?)",
                    onMatch: function(a, e, b) {
                        var c = e.substring(0, e.length - 5);
                        c = "-" === a[2] ? c + "indentedHeredoc" : c + "heredoc";
                        a = a.split(this.splitRegex);
                        b.push(c, a[4], e);
                        return [{
                            type: "constant",
                            value: a[1]
                        }, {
                            type: "text",
                            value: a[2]
                        }, {
                            type: "string",
                            value: a[3]
                        }, {
                            type: "support.class",
                            value: a[4]
                        }, {
                            type: "string",
                            value: a[5]
                        }]
                    },
                    rules: {
                        heredoc: [{
                            onMatch: function(a, e, b) {
                                if (a ===
                                    b[1]) return this.next = b[2], b.splice(-3), "support.class";
                                this.next = "";
                                return "string"
                            },
                            regex: ".*$"
                        }],
                        indentedHeredoc: [{
                            token: "string",
                            regex: "^\t+"
                        }, {
                            onMatch: function(a, e, b) {
                                if (a === b[1]) return this.next = b[2], b.splice(-3), "support.class";
                                this.next = "";
                                return "string"
                            },
                            regex: ".*$"
                        }]
                    }
                }, {
                    regex: "$",
                    token: "empty",
                    next: function(a, e) {
                        return /heredoc$/i.test(e[0]) ? e[0] : a
                    }
                }, {
                    token: ["keyword", "text", "text", "text", "variable"],
                    regex: /(declare|local|readonly)(\s+)(?:(-[fixar]+)(\s+))?([a-zA-Z_][a-zA-Z0-9_]*\b)/
                }, {
                    token: "variable.language",
                    regex: "(?:\\$(?:SHLVL|\\$|\\!|\\?))"
                }, {
                    token: "variable",
                    regex: "(?:[a-zA-Z_][a-zA-Z0-9_]*(?==))"
                }, {
                    include: "variables"
                }, {
                    token: "support.function",
                    regex: "(?:[a-zA-Z_][a-zA-Z0-9_]*\\s*\\(\\))"
                }, {
                    token: "support.function",
                    regex: "(?:&(?:\\d+))"
                }, {
                    token: "string",
                    start: "'",
                    end: "'"
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:(?:(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.))|(?:\\d+)))|(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.)))"
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:[1-9]\\d*)|(?:0))\\b"
                }, {
                    token: this.createKeywordMapper({
                        keyword: g,
                        "support.function.builtin": m,
                        "invalid.deprecated": "debugger"
                    }, "identifier"),
                    regex: "[a-zA-Z_][a-zA-Z0-9_]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|~|<|>|<=|=>|=|!=|[%&|`]"
                }, {
                    token: "punctuation.operator",
                    regex: ";"
                }, {
                    token: "paren.lparen",
                    regex: "[\\[\\(\\{]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\]]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\)\\}]",
                    next: function(a, e) {
                        if (2 > e.length) return a;
                        e.shift();
                        return e.shift()
                    }
                }],
                variables: [{
                    token: "variable",
                    regex: /(\$)(\w+)/
                }, {
                    token: ["variable", "paren.lparen"],
                    regex: /(\$)(\()/,
                    push: "start"
                }, {
                    token: ["variable", "paren.lparen", "keyword.operator", "variable", "keyword.operator"],
                    regex: /(\$)(\{)([#!]?)(\w+|[*@#?\-$!0_])(:[?+\-=]?|##?|%%?|,,?\/|\^\^?)?/,
                    push: "start"
                }, {
                    token: "variable",
                    regex: /\$[*@#?\-$!0_]/
                }, {
                    token: ["variable", "paren.lparen"],
                    regex: /(\$)(\{)/,
                    push: "start"
                }]
            };
            this.normalizeRules()
        };
    l.inherits(f, a);
    p.ShHighlightRules = f
});
define("mode/sql", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("mode/sql_highlight_rules").SqlHighlightRules;
    a("ace/range");
    a = function() {
        this.HighlightRules = m
    };
    l.inherits(a, g);
    a.prototype.lineCommentStart = "--";
    a.prototype.$id = "mode/sql";
    p.Mode = a
});
define("mode/sql_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a("ace/lib/lang");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.$rules = {
            start: [{
                token: "comment",
                regex: "--.*$"
            }, {
                token: "comment",
                start: "/\\*",
                end: "\\*/"
            }, {
                token: "comment.doc.tag",
                regex: "\\?[a-zA-Z_][a-zA-Z0-9_$]*"
            }, {
                token: "paren.keyword.operator",
                merge: !1,
                regex: "[[({]",
                next: "start"
            }, {
                token: "paren.keyword.operator",
                merge: !1,
                regex: "[\\])}]",
                next: "start"
            }, {
                token: "string",
                regex: '".*?"'
            }, {
                token: "string",
                regex: "'.*?'"
            }, {
                token: "constant.numeric",
                regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
            }, {
                token: this.createKeywordMapper({
                    "support.function": "avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|coalesce|ifnull|isnull|nvl",
                    keyword: "select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|foreign|not|references|default|null|inner|cross|natural|database|drop|grant|into|values|between|like|in|alter|index|view|exists|full|distinct|top|truncate|all",
                    "constant.language": "true|false",
                    "storage.type": "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|money|real|number|integer"
                }, "identifier", !0),
                regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token: "keyword.operator",
                regex: "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=|\\."
            }, {
                token: "paren.lparen",
                regex: "[\\(]"
            }, {
                token: "paren.rparen",
                regex: "[\\)]"
            }, {
                token: "text",
                regex: "\\s+"
            }]
        };
        this.normalizeRules()
    };
    l.inherits(g, a);
    p.SqlHighlightRules = g
});
define("mode/stan", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        k = a("mode/stan_highlight_rules").StanHighlightRules,
        e = a("ace/mode/folding/cstyle").FoldMode;
    a = function() {
        this.$highlightRules = new k;
        this.$tokenizer = new m(this.$highlightRules.getRules());
        this.$outdent = new f;
        this.foldingRules = new e
    };
    l.inherits(a, g);
    (function() {
        this.lineCommentStart = ["//", "#"];
        this.blockComment = {
            start: "/*",
            end: "*/"
        };
        this.toggleCommentLines = function(a, c, d, e) {
            var b = !0;
            a = /^(\s*)\/\//;
            for (var f = d; f <= e; f++)
                if (!a.test(c.getLine(f))) {
                    b = !1;
                    break
                } if (b)
                for (b = new Range(0, 0, 0, 0), f = d; f <= e; f++) d = c.getLine(f).match(a), b.start.row = f, b.end.row = f, b.end.column = d[0].length, c.replace(b, d[1]);
            else c.indentRows(d, e, "//")
        };
        this.getLanguageMode = function(a) {
            return "Stan"
        };
        this.getNextLineIndent = function(a, c, d) {
            var b = this.$getIndent(c),
                e = this.getTokenizer().getLineTokens(c, a).tokens;
            if (e.length && "comment" == e[e.length -
                    1].type) return b;
            "start" == a && c.match(/^.*(?:[\{\(\[])\s*$/) && (b += d);
            return b
        };
        this.checkOutdent = function(a, c, d) {
            return this.$outdent.checkOutdent(c, d)
        };
        this.autoOutdent = function(a, c, d) {
            this.$outdent.autoOutdent(c, d)
        };
        this.$id = "mode/stan"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/stan_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a("ace/lib/lang");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.$rules = {
            start: [{
                    token: "comment.line.number-sign",
                    regex: "\\/\\/.*$"
                }, {
                    token: "comment.line.double-dash",
                    regex: "#.*$"
                }, {
                    token: "comment.block",
                    regex: "\\/\\*",
                    merge: !0,
                    next: "comment"
                }, {
                    token: "keyword.other.block",
                    regex: "\\b(functions|data|transformed\\s+data|parameters|transformed\\s+parameters|model|generated\\s+quantities)\\b"
                },
                {
                    token: "string.quoted.double",
                    regex: '["][ a-zA-Z0-9~@#$%^&*_\'`\\-+={}[\\]()<>|/!?.,;:]*["]'
                }, {
                    token: "constant.numeric",
                    regex: "(?:(?:\\d+(?:\\.\\d*)?)|(?:\\.\\d+))(?:[eE][+\\-]?\\d*)?\\b"
                }, {
                    token: "keyword.operator",
                    regex: "\\bT(?=\\s*\\[)"
                }, {
                    token: ["keyword.other", "text", "punctuation"],
                    regex: "(lower|upper)(\\s*)(=)"
                }, {
                    token: ["keyword.other", "text", "keyword.operator"],
                    regex: "(target)(\\s*)(\\+=)"
                }, {
                    token: "keyword.control",
                    regex: "\\b(for|in|while|if|then|else|return)\\b"
                }, {
                    token: "keyword.other",
                    regex: "\\b(print|reject)\\b"
                },
                {
                    token: "storage.type",
                    regex: "\\b(int|real|vector|simplex|unit_vector|ordered|positive_ordered|row_vector|matrix|cholesky_factor_cov|cholesky_factor_corr|corr_matrix|cov_matrix|void)\\b"
                }, {
                    token: "invalid.deprecated",
                    regex: "\\b(bernoulli_ccdf_log|bernoulli_cdf_log|bernoulli_log|bernoulli_logit_log|beta_binomial_ccdf_log|beta_binomial_cdf_log|beta_binomial_log|beta_ccdf_log|beta_cdf_log|beta_log|binomial_ccdf_log|binomial_cdf_log|binomial_coefficient_log|binomial_log|binomial_logit_log|categorical_log|categorical_logit_log|cauchy_ccdf_log|cauchy_cdf_log|cauchy_log|chi_square_ccdf_log|chi_square_cdf_log|chi_square_log|dirichlet_log|double_exponential_ccdf_log|double_exponential_cdf_log|double_exponential_log|exp_mod_normal_ccdf_log|exp_mod_normal_cdf_log|exp_mod_normal_log|exponential_ccdf_log|exponential_cdf_log|exponential_log|frechet_ccdf_log|frechet_cdf_log|frechet_log|gamma_ccdf_log|gamma_cdf_log|gamma_log|gaussian_dlm_obs_log|get_lp|gumbel_ccdf_log|gumbel_cdf_log|gumbel_log|hypergeometric_log|increment_log_prob|integrate_ode|inv_chi_square_ccdf_log|inv_chi_square_cdf_log|inv_chi_square_log|inv_gamma_ccdf_log|inv_gamma_cdf_log|inv_gamma_log|inv_wishart_log|lkj_corr_cholesky_log|lkj_corr_log|logistic_ccdf_log|logistic_cdf_log|logistic_log|lognormal_ccdf_log|lognormal_cdf_log|lognormal_log|multi_gp_cholesky_log|multi_gp_log|multi_normal_cholesky_log|multi_normal_log|multi_normal_prec_log|multi_student_t_log|multinomial_log|multiply_log|neg_binomial_2_ccdf_log|neg_binomial_2_cdf_log|neg_binomial_2_log|neg_binomial_2_log_log|neg_binomial_ccdf_log|neg_binomial_cdf_log|neg_binomial_log|normal_ccdf_log|normal_cdf_log|normal_log|ordered_logistic_log|pareto_ccdf_log|pareto_cdf_log|pareto_log|pareto_type_2_ccdf_log|pareto_type_2_cdf_log|pareto_type_2_log|poisson_ccdf_log|poisson_cdf_log|poisson_log|poisson_log_log|rayleigh_ccdf_log|rayleigh_cdf_log|rayleigh_log|scaled_inv_chi_square_ccdf_log|scaled_inv_chi_square_cdf_log|scaled_inv_chi_square_log|skew_normal_ccdf_log|skew_normal_cdf_log|skew_normal_log|student_t_ccdf_log|student_t_cdf_log|student_t_log|uniform_ccdf_log|uniform_cdf_log|uniform_log|von_mises_log|weibull_ccdf_log|weibull_cdf_log|weibull_log|wiener_log|wishart_log)\\b"
                },
                {
                    token: ["keyword.operator.sampling", "text", "support.function"],
                    regex: "(~)(\\s*)(bernoulli|bernoulli_logit|beta|beta_binomial|binomial|binomial_logit|categorical|categorical_logit|cauchy|chi_square|dirichlet|double_exponential|exp_mod_normal|exponential|frechet|gamma|gaussian_dlm_obs|gumbel|hypergeometric|inv_chi_square|inv_gamma|inv_wishart|lkj_corr|lkj_corr_cholesky|logistic|lognormal|multi_gp|multi_gp_cholesky|multi_normal|multi_normal_cholesky|multi_normal_prec|multi_student_t|multinomial|neg_binomial|neg_binomial_2|neg_binomial_2_log|normal|ordered_logistic|pareto|pareto_type_2|poisson|poisson_log|rayleigh|scaled_inv_chi_square|skew_normal|student_t|uniform|von_mises|weibull|wiener|wishart)\\b"
                },
                {
                    token: "support.function",
                    regex: "\\b(Phi|Phi_approx|abs|acos|acosh|append_col|append_row|asin|asinh|atan|atan2|atanh|bernoulli_cdf|bernoulli_lccdf|bernoulli_lcdf|bernoulli_logit_lpmf|bernoulli_lpmf|bernoulli_rng|bessel_first_kind|bessel_second_kind|beta_binomial_cdf|beta_binomial_lccdf|beta_binomial_lcdf|beta_binomial_lpmf|beta_binomial_rng|beta_cdf|beta_lccdf|beta_lcdf|beta_lpdf|beta_rng|binary_log_loss|binomial_cdf|binomial_lccdf|binomial_lcdf|binomial_logit_lpmf|binomial_lpmf|binomial_rng|block|categorical_logit_lpmf|categorical_lpmf|categorical_rng|cauchy_cdf|cauchy_lccdf|cauchy_lcdf|cauchy_lpdf|cauchy_rng|cbrt|ceil|chi_square_cdf|chi_square_lccdf|chi_square_lcdf|chi_square_lpdf|chi_square_rng|cholesky_decompose|col|cols|columns_dot_product|columns_dot_self|cos|cosh|cov_exp_quad|crossprod|csr_extract_u|csr_extract_v|csr_extract_w|csr_matrix_times_vector|csr_to_dense_matrix|cumulative_sum|determinant|diag_matrix|diag_post_multiply|diag_pre_multiply|diagonal|digamma|dims|dirichlet_lpdf|dirichlet_rng|distance|dot_product|dot_self|double_exponential_cdf|double_exponential_lccdf|double_exponential_lcdf|double_exponential_lpdf|double_exponential_rng|e|eigenvalues_sym|eigenvectors_sym|erf|erfc|exp|exp2|exp_mod_normal_cdf|exp_mod_normal_lccdf|exp_mod_normal_lcdf|exp_mod_normal_lpdf|exp_mod_normal_rng|expm1|exponential_cdf|exponential_lccdf|exponential_lcdf|exponential_lpdf|exponential_rng|fabs|falling_factorial|fdim|floor|fma|fmax|fmin|fmod|frechet_cdf|frechet_lccdf|frechet_lcdf|frechet_lpdf|frechet_rng|gamma_cdf|gamma_lccdf|gamma_lcdf|gamma_lpdf|gamma_p|gamma_q|gamma_rng|gaussian_dlm_obs_lpdf|gumbel_cdf|gumbel_lccdf|gumbel_lcdf|gumbel_lpdf|gumbel_rng|head|hypergeometric_lpmf|hypergeometric_rng|hypot|inc_beta|int_step|integrate_ode_bdf|integrate_ode_rk45|inv|inv_chi_square_cdf|inv_chi_square_lccdf|inv_chi_square_lcdf|inv_chi_square_lpdf|inv_chi_square_rng|inv_cloglog|inv_gamma_cdf|inv_gamma_lccdf|inv_gamma_lcdf|inv_gamma_lpdf|inv_gamma_rng|inv_logit|inv_phi|inv_sqrt|inv_square|inv_wishart_lpdf|inv_wishart_rng|inverse|inverse_spd|is_inf|is_nan|lbeta|lchoose|lgamma|lkj_corr_cholesky_lpdf|lkj_corr_cholesky_rng|lkj_corr_lpdf|lkj_corr_rng|lmgamma|lmultiply|log|log10|log1m|log1m_exp|log1m_inv_logit|log1p|log1p_exp|log2|log_determinant|log_diff_exp|log_falling_factorial|log_inv_logit|log_mix|log_rising_factorial|log_softmax|log_sum_exp|logistic_cdf|logistic_lccdf|logistic_lcdf|logistic_lpdf|logistic_rng|logit|lognormal_cdf|lognormal_lccdf|lognormal_lcdf|lognormal_lpdf|lognormal_rng|machine_precision|max|mdivide_left_spd|mdivide_left_tri_low|mdivide_right_spd|mdivide_right_tri_low|mean|min|modified_bessel_first_kind|modified_bessel_second_kind|multi_gp_cholesky_lpdf|multi_gp_lpdf|multi_normal_cholesky_lpdf|multi_normal_cholesky_rng|multi_normal_lpdf|multi_normal_prec_lpdf|multi_normal_rng|multi_student_t_lpdf|multi_student_t_rng|multinomial_lpmf|multinomial_rng|multiply_lower_tri_self_transpose|neg_binomial_2_cdf|neg_binomial_2_lccdf|neg_binomial_2_lcdf|neg_binomial_2_log_lpmf|neg_binomial_2_log_rng|neg_binomial_2_lpmf|neg_binomial_2_rng|neg_binomial_cdf|neg_binomial_lccdf|neg_binomial_lcdf|neg_binomial_lpmf|neg_binomial_rng|negative_infinity|normal_cdf|normal_lccdf|normal_lcdf|normal_lpdf|normal_rng|not_a_number|num_elements|ordered_logistic_lpmf|ordered_logistic_rng|owens_t|pareto_cdf|pareto_lccdf|pareto_lcdf|pareto_lpdf|pareto_rng|pareto_type_2_cdf|pareto_type_2_lccdf|pareto_type_2_lcdf|pareto_type_2_lpdf|pareto_type_2_rng|pi|poisson_cdf|poisson_lccdf|poisson_lcdf|poisson_log_lpmf|poisson_log_rng|poisson_lpmf|poisson_rng|positive_infinity|pow|prod|qr_Q|qr_R|quad_form|quad_form_diag|quad_form_sym|rank|rayleigh_cdf|rayleigh_lccdf|rayleigh_lcdf|rayleigh_lpdf|rayleigh_rng|rep_array|rep_matrix|rep_row_vector|rep_vector|rising_factorial|round|row|rows|rows_dot_product|rows_dot_self|scaled_inv_chi_square_cdf|scaled_inv_chi_square_lccdf|scaled_inv_chi_square_lcdf|scaled_inv_chi_square_lpdf|scaled_inv_chi_square_rng|sd|segment|sin|singular_values|sinh|size|skew_normal_cdf|skew_normal_lccdf|skew_normal_lcdf|skew_normal_lpdf|skew_normal_rng|softmax|sort_asc|sort_desc|sort_indices_asc|sort_indices_desc|sqrt|sqrt2|square|squared_distance|step|student_t_cdf|student_t_lccdf|student_t_lcdf|student_t_lpdf|student_t_rng|sub_col|sub_row|sum|tail|tan|tanh|target|tcrossprod|tgamma|to_array_1d|to_array_2d|to_matrix|to_row_vector|to_vector|trace|trace_gen_quad_form|trace_quad_form|trigamma|trunc|uniform_cdf|uniform_lccdf|uniform_lcdf|uniform_lpdf|uniform_rng|variance|von_mises_lpdf|von_mises_rng|weibull_cdf|weibull_lccdf|weibull_lcdf|weibull_lpdf|weibull_rng|wiener_lpdf|wishart_lpdf|wishart_rng)\\b"
                },
                {
                    token: "invalid.illegal",
                    regex: "\\b(STAN_MAJOR|STAN_MATH_MAJOR|STAN_MATH_MINOR|STAN_MATH_PATCH|STAN_MINOR|STAN_PATCH|alignas|alignof|and|and_eq|asm|auto|bitand|bitor|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|const_cast|constexpr|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|false|float|for|friend|fvar|goto|if|in|inline|int|long|lp__|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|private|protected|public|register|reinterpret_cast|repeat|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|then|this|thread_local|throw|true|try|typedef|typeid|typename|union|unsigned|until|using|var|virtual|void|volatile|wchar_t|while|xor|xor_eq)\\b"
                },
                {
                    token: "invalid.illegal",
                    regex: "[a-zA-Z][a-zA-Z0-9_]*(?!__)\\b__\\b"
                }, {
                    token: "invalid.illegal",
                    regex: "\\b(?:_|[_0-9][A-Za-z0-9_]+|[A-Za-z][A-Za-z0-9_]*__)\\b"
                }, {
                    token: "function",
                    regex: "[a-zA-Z][a-zA-Z0-9_]*(?!__)\\b(?=\\s*\\()"
                }, {
                    token: "identifier",
                    regex: "[a-zA-Z][a-zA-Z0-9_]*(?!__)\\b"
                }, {
                    token: "invalid.deprecated",
                    regex: "<-"
                }, {
                    token: "keyword.operator",
                    regex: "~|[|]{2}|&&|==?|!=|<=?|>=?|\\+|-|\\.?\\*|\\.?/|\\\\|\\^|!|'|%|\\?|:"
                }, {
                    token: "punctuation.operator",
                    regex: ",|;|[|]"
                }, {
                    token: "paren.lparen.keyword.operator",
                    regex: "[\\[\\(\\{]"
                }, {
                    token: "paren.rparen.keyword.operator",
                    regex: "[\\]\\)\\}]"
                }, {
                    token: "text",
                    regex: "\\s+"
                }
            ],
            comment: [{
                token: "comment",
                regex: ".*?\\*\\/",
                next: "start"
            }, {
                token: "comment",
                merge: !0,
                regex: ".+"
            }]
        }
    };
    l.inherits(g, a);
    p.StanHighlightRules = g
});
define("mode/sweave", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/sweave_highlight_rules").SweaveHighlightRules,
        e = a("mode/r_code_model").RCodeModel,
        b = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        c = a("mode/r_matching_brace_outdent").RMatchingBraceOutdent,
        d = a("ace/unicode"),
        r = a("mode/utils");
    a("mode/auto_brace_insert");
    a = function(a, d) {
        this.$tokenizer =
            a ? new m((new f).getRules()) : new m((new k).getRules());
        this.$session = d;
        this.$outdent = new b;
        this.codeModel = new e(d, this.$tokenizer, /^r-/, /<<(.*?)>>/, /^\s*@\s*$/);
        this.$r_outdent = new c(this.codeModel);
        this.foldingRules = this.codeModel
    };
    l.inherits(a, g);
    (function() {
        this.tokenRe = new RegExp("^[" + d.wordChars + "._]+", "g");
        this.nonTokenRe = new RegExp("^(?:[^" + d.wordChars + "._]|\\s)+", "g");
        this.$complements = {
            "(": ")",
            "[": "]",
            '"': '"',
            "'": "'",
            "{": "}"
        };
        this.$reOpen = /^[(["'{]$/;
        this.$reClose = /^[)\]"'}]$/;
        this.insertChunkInfo = {
            value: "<<>>=\n\n@\n",
            position: {
                row: 0,
                column: 2
            },
            content_position: {
                row: 1,
                column: 0
            }
        };
        this.getLanguageMode = function(a) {
            return r.getPrimaryState(this.$session, a.row).match(/^r-/) ? "R" : "TeX"
        };
        this.$getNextLineIndent = this.getNextLineIndent;
        this.getNextLineIndent = function(a, b, c, d) {
            return "r" === r.activeMode(a, "tex") ? this.codeModel.getNextLineIndent(a, b, c, d) : this.$getNextLineIndent(a, b, c)
        };
        this.checkOutdent = function(a, b, c) {
            return "r" === r.activeMode(a, "tex") ? this.$r_outdent.checkOutdent(a, b, c) : this.$outdent.checkOutdent(b,
                c)
        };
        this.autoOutdent = function(a, b, c) {
            return "r" === r.activeMode(a, "tex") ? this.$r_outdent.autoOutdent(a, b, c) : this.$outdent.autoOutdent(b, c)
        };
        this.allowAutoInsert = this.smartAllowAutoInsert;
        this.$id = "mode/sweave"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/sweave_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/tex_highlight_rules").TexHighlightRules,
        m = a("mode/r_highlight_rules").RHighlightRules;
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var f = function() {
        this.$rules = (new g).getRules();
        this.$rules.start.unshift({
            token: "comment.codebegin",
            regex: "^\\s*\\<\\<.*\\>\\>=.*$",
            next: "r-start"
        });
        this.$rules.start.unshift({
            token: "comment",
            regex: "^\\s*@(?:\\s.*)?$"
        });
        this.$rules.start.unshift({
            regex: "(\\\\Sexpr)([{])",
            next: "r-start",
            onMatch: function(a, b, c, d) {
                c.length = 2;
                c[0] = b;
                c[1] = 1;
                return [{
                    type: "keyword",
                    value: "\\Sexpr"
                }, {
                    type: "paren.keyword.operator",
                    value: "{"
                }]
            }
        });
        var a = (new m).getRules();
        this.addRules(a, "r-");
        this.$rules["r-start"].unshift({
            token: "paren.keyword.operator",
            regex: "[{]",
            merge: !1,
            onMatch: function(a, b, c, d) {
                c.length && (c[1] += 1);
                return this.token
            }
        });
        this.$rules["r-start"].unshift({
            token: "paren.keyword.operator",
            regex: "[}]",
            merge: !1,
            onMatch: function(a, b, c, d) {
                this.next = "r-start";
                c.length && (--c[1], 0 ==
                    c[1] && (this.next = c[0], c.splice(0)));
                return this.token
            }
        });
        this.$rules["r-start"].unshift({
            token: "comment.codeend",
            regex: "^\\s*@(?:\\s.*)?$",
            next: "start"
        });
        this.$rules["r-start"].unshift({
            token: "comment.codebegin",
            regex: "^\\<\\<.*\\>\\>=.*$",
            next: "r-start"
        })
    };
    l.inherits(f, a);
    p.SweaveHighlightRules = f
});
define("mode/tex", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        k = a("mode/tex_highlight_rules").TexHighlightRules,
        e = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
    a = function(a) {
        this.$tokenizer = a ? new m((new f).getRules()) : new m((new k).getRules());
        this.$outdent = new e
    };
    l.inherits(a, g);
    (function() {
        this.getNextLineIndent = function(a, c, d) {
            return this.$getIndent(c)
        };
        this.allowAutoInsert = function() {
            return !1
        }
    }).call(a.prototype);
    p.Mode = a
});
define("mode/tex_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a("ace/lib/lang");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function(a) {
        a || (a = "text");
        this.$rules = {
            start: [{
                token: "comment",
                regex: "%.*$"
            }, {
                token: a,
                regex: "\\\\[$&%#\\{\\}]"
            }, {
                token: "keyword",
                regex: "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b",
                next: "nospell"
            }, {
                token: "keyword",
                regex: "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])"
            }, {
                token: "paren.keyword.operator",
                regex: "[[({]"
            }, {
                token: "paren.keyword.operator",
                regex: "[\\])}]"
            }, {
                token: a,
                regex: "\\s+"
            }],
            nospell: [{
                    token: "comment",
                    regex: "%.*$",
                    next: "start"
                }, {
                    token: "nospell." + a,
                    regex: "\\\\[$&%#\\{\\}]"
                }, {
                    token: "keyword",
                    regex: "\\\\(?:documentclass|usepackage|newcounter|setcounter|addtocounter|value|arabic|stepcounter|newenvironment|renewenvironment|ref|vref|eqref|pageref|label|cite[a-zA-Z]*|tag|begin|end|bibitem)\\b"
                },
                {
                    token: "keyword",
                    regex: "\\\\(?:[a-zA-Z0-9]+|[^a-zA-Z0-9])",
                    next: "start"
                }, {
                    token: "paren.keyword.operator",
                    regex: "[[({]"
                }, {
                    token: "paren.keyword.operator",
                    regex: "[\\])]"
                }, {
                    token: "paren.keyword.operator",
                    regex: "}",
                    next: "start"
                }, {
                    token: "nospell." + a,
                    regex: "\\s+"
                }, {
                    token: "nospell." + a,
                    regex: "\\w+"
                }
            ]
        }
    };
    l.inherits(g, a);
    p.TexHighlightRules = g
});
define("mode/token_cursor", ["require", "exports", "module"], function(a, p, l) {
    var g = /(?:^|[.])paren(?:$|[.])/;
    l = a("ace/lib/oop");
    var m = a("mode/utils"),
        f = function(a, c, d) {
            this.$tokens = a;
            this.$row = c || 0;
            this.$offset = d || 0
        };
    (function() {
        this.cloneCursor = function() {
            return new f(this.$tokens, this.$row, this.$offset)
        };
        var a = m.isArray,
            c = m.contains,
            d = {
                "(": ")",
                "{": "}",
                "<": ">",
                "[": "]",
                ")": "(",
                "}": "{",
                ">": "<",
                "]": "["
            },
            e = ["(", "[", "{"],
            g = [")", "]", "}"];
        this.moveToStartOfRow = function(a) {
            this.$row = a;
            this.$offset = 0
        };
        this.moveToEndOfRow =
            function(a) {
                this.$row = a;
                this.$offset = (a = this.$tokens[a]) && a.length ? a.length - 1 : 0
            };
        this.moveToPreviousToken = function() {
            if (0 >= this.$row && 0 >= this.$offset) return this.$offset = this.$row = 0, !1;
            if (0 < this.$offset) return this.$offset--, !0;
            for (var a = this.$row - 1, b = 0; 0 <= a;) {
                var c = this.$tokens[a];
                if (c && 0 !== c.length) {
                    b = c.length;
                    break
                }
                a--
            }
            if (0 > a) return !1;
            this.$row = a;
            this.$offset = b - 1;
            return !0
        };
        this.moveToNextToken = function(a) {
            "undefined" === typeof a && (a = (this.$tokens || []).length);
            if (this.$row > a) return !1;
            null == this.$tokens[this.$row] &&
                this.$codeModel && this.$codeModel.$tokenizeUpToRow && this.$codeModel.$tokenizeUpToRow.call(this.$codeModel, a);
            var b = this.$tokens[this.$row];
            if (b && this.$offset < b.length - 1) return this.$offset++, !0;
            for (var c = this.$row + 1; c <= a && (!(b = this.$tokens[c]) || 0 === b.length);) c++;
            if (c > a) return !1;
            this.$row = c;
            this.$offset = 0;
            return !0
        };
        this.peekBwd = function(a) {
            "undefined" === typeof a && (a = 1);
            for (var b = this.cloneCursor(), c = 0; c < a; c++)
                if (!b.moveToPreviousToken()) return b.$invalidate();
            return b
        };
        this.peekFwd = function(a) {
            "undefined" ===
            typeof a && (a = 1);
            for (var b = this.cloneCursor(), c = 0; c < a; c++)
                if (!b.moveToNextToken()) return b.$invalidate();
            return b
        };
        this.$invalidate = function() {
            this.$column = this.$row = 0;
            this.$tokens = [];
            return this
        };
        this.seekToNearestToken = function(a, b) {
            if (a.row > b) return !1;
            this.$row = a.row;
            var c = this.$tokens[this.$row] || [];
            for (this.$offset = 0; this.$offset < c.length; this.$offset++)
                if (c[this.$offset].column >= a.column) return !0;
            return a.row < b ? this.moveToNextToken(b) : !1
        };
        this.bwdToNearestToken = function(a) {
            this.$row = a.row;
            this.$offset =
                a.column;
            for (var b = this.$tokens[this.$row] || []; 0 <= this.$offset; this.$offset--) {
                var c = b[this.$offset];
                if ("undefined" !== typeof c && c.column <= a.column) return !0
            }
            return this.moveToPreviousToken()
        };
        this.bwdToMatchingToken = function() {
            var a = this.currentValue();
            if (!c(g, a)) return !1;
            for (var b = d[a], e = 0; this.moveToPreviousToken();) {
                var f = this.currentValue();
                if (f === b) {
                    if (0 === e) return !0;
                    e--
                } else f === a && e++
            }
            return !1
        };
        this.fwdToMatchingToken = function() {
            var a = this.currentValue();
            if (!c(e, a)) return !1;
            for (var b = d[a], f =
                    0; this.moveToNextToken();) {
                var g = this.currentValue();
                if (g === b) {
                    if (0 === f) return !0;
                    f--
                } else g === a && f++
            }
            return !1
        };
        this.equals = function(a) {
            return this.$row === a.$row && this.$offset === a.$offset
        };
        this.moveBackwardOverMatchingParens = function() {
            if (!this.moveToPreviousToken()) return !1;
            if (")" !== this.currentValue()) return this.moveToNextToken(), !1;
            for (var a = !1, b = 0; this.moveToPreviousToken();) {
                var c = this.currentValue();
                if ("(" === c) {
                    if (0 === b) {
                        a = !0;
                        break
                    }
                    b--
                } else ")" === c && b++
            }
            return a
        };
        this.findToken = function(a, b) {
            do {
                var c =
                    this.currentToken();
                if (c && a(c)) return c
            } while (this.moveToNextToken(b));
            return null
        };
        this.findTokenBwd = function(a, b) {
            do {
                var c = this.currentToken();
                if (c && a(c)) return c
            } while (this.moveToPreviousToken(b));
            return null
        };
        this.currentToken = function() {
            var a = this.$tokens[this.$row];
            if (null == a) return {};
            a = a[this.$offset];
            return null == a ? {} : a
        };
        this.currentValue = function() {
            return this.currentToken().value
        };
        this.currentType = function() {
            return this.currentToken().type
        };
        this.hasType = function() {
            var a = this.currentType();
            if (null == a) return !1;
            for (var b = 0; b < arguments.length; b++) {
                var c = arguments[b];
                if (a === c || -1 !== a.indexOf(c + ".") || -1 !== a.indexOf("." + c)) return !0
            }
            return !1
        };
        this.currentPosition = function() {
            var a = this.currentToken();
            return null == a ? null : {
                row: this.$row,
                column: a.column
            }
        };
        this.isFirstSignificantTokenOnLine = function() {
            return 0 === this.$offset
        };
        this.isLastSignificantTokenOnLine = function() {
            return this.$offset == (this.$tokens[this.$row] || []).length - 1
        };
        this.bwdUntil = function(a) {
            for (; !a(this);) this.moveToPreviousToken()
        };
        this.bwdWhile = function(a) {
            for (; a(this);) this.moveToPreviousToken()
        };
        this.moveToPosition = function(a, b) {
            var c = a.row,
                d = a.column,
                e = this.$tokens[c];
            null == e && this.$codeModel && this.$codeModel.$tokenizeUpToRow && (this.$codeModel.$tokenizeUpToRow.call(this.$codeModel, c), e = this.$tokens[c]);
            if (e && 0 < e.length && e[0].column <= d) {
                for (var f = 0; f < e.length && !(e[f].column >= d); f++);
                this.$row = c;
                this.$offset = f === e.length ? f - 1 : b && e[f].column === d ? f : f - 1;
                return !0
            }
            d = this.cloneCursor();
            d.$row = c;
            d.$offset = 0;
            return d.moveToPreviousToken() ?
                (this.$row = d.$row, this.$offset = d.$offset, !0) : !1
        };
        this.findOpeningBracket = function(b, c) {
            a(b) || (b = [b]);
            var d = this.cloneCursor();
            do
                if (!d.bwdToMatchingToken()) {
                    var e = d.currentValue();
                    if (c && "{" === e) break;
                    for (var f = 0; f < b.length; f++)
                        if (e === b[f]) return this.$row = d.$row, this.$offset = d.$offset, !0
                } while (d.moveToPreviousToken());
            return !1
        };
        this.findOpeningBracketCountCommas = function(b, c) {
            a(b) || (b = [b]);
            var d = this.cloneCursor(),
                e = 0;
            do
                if (!d.bwdToMatchingToken()) {
                    var f = d.currentValue();
                    "," === f && (e += 1);
                    if (c && "{" ===
                        f) break;
                    for (var g = 0; g < b.length; g++)
                        if (f === b[g]) return this.$row = d.$row, this.$offset = d.$offset, e
                } while (d.moveToPreviousToken());
            return -1
        }
    }).call(f.prototype);
    var k = function(a, c, d, e) {
        this.$tokens = a;
        this.$row = c || 0;
        this.$offset = d || 0;
        this.$codeModel = e
    };
    l.mixin(k.prototype, f.prototype);
    (function() {
        this.cloneCursor = function() {
            return new k(this.$tokens, this.$row, this.$offset, this.$codeModel)
        };
        var a = m.contains;
        this.bwdOverConstNoexceptDecltype = function() {
            var a = this.cloneCursor();
            if ("{" !== a.currentValue() ||
                !a.moveToPreviousToken()) return !1;
            var b = a.cloneCursor();
            ")" === b.currentValue() && b.bwdToMatchingToken() && b.moveToPreviousToken() && "decltype" === b.currentValue() && b.moveToPreviousToken() && (a.$row = b.$row, a.$offset = b.$offset);
            b = a.cloneCursor();
            ")" === b.currentValue() && b.bwdToMatchingToken() && b.moveToPreviousToken() && "noexcept" === b.currentValue() && (a.$row = b.$row, a.$offset = b.$offset);
            if ("noexcept" === a.currentValue() && !a.moveToPreviousToken() || "const" === a.currentValue() && !a.moveToPreviousToken() || ")" === a.currentValue() &&
                !a.moveToNextToken()) return !1;
            this.$row = a.$row;
            this.$offset = a.$offset;
            return !0
        };
        this.bwdToMatchingArrow = function() {
            if (">" !== this.currentValue()) return !1;
            for (var a = 0, b = this.cloneCursor(); b.moveToPreviousToken();)
                if ("<" === b.currentValue()) {
                    if (0 === a) return this.$row = b.$row, this.$offset = b.$offset, !0;
                    a--
                } else ">" === b.currentValue() && a++;
            return !1
        };
        this.bwdOverClassySpecifiers = function() {
            var a = this.currentValue();
            ":" !== a && "," !== a && "{" !== a || this.moveToPreviousToken();
            do {
                this.bwdToMatchingArrow() && this.moveToPreviousToken();
                a = this.currentType();
                var b = this.currentValue();
                if ("keyword" !== a && "::" !== b && "identifier" !== a && "constant" !== a) break;
                if ("class" === b || "struct" === b || "enum" === b || ":" === b || "," === b) return !0
            } while (this.moveToPreviousToken());
            return !1
        };
        this.bwdOverClassInheritance = function() {
            var a = this.cloneCursor();
            return c(a, this)
        };
        var c = function(a, b) {
            a.bwdOverClassySpecifiers();
            var d = a.currentValue();
            return "," === d ? c(a, b) : ":" === d ? (b.$row = a.$row, b.$offset = a.$offset, !0) : !1
        };
        this.bwdOverInitializationList = function() {
            var a = this.cloneCursor();
            return this.doBwdOverInitializationList(a, this)
        };
        this.doBwdOverInitializationList = function(b, c) {
            b.moveBackwardOverMatchingParens();
            if (!b.moveBackwardOverMatchingParens() && !b.moveToPreviousToken()) return !1;
            for (;
                "keyword" === b.currentType();)
                if (!b.moveToPreviousToken()) return !1;
            if (b.moveToPreviousToken()) {
                var d = b.currentValue();
                if ("," === d) return this.doBwdOverInitializationList(b, c);
                if (":" === d && (d = b.peekBwd().currentValue(), !a(["public", "private", "protected"], d))) return c.$row = b.$row, c.$offset = b.$offset,
                    !0
            }
            return !1
        }
    }).call(k.prototype);
    var e = function(a, c, d, e) {
        this.$tokens = a;
        this.$row = c || 0;
        this.$offset = d || 0;
        this.$codeModel = e
    };
    l.mixin(e.prototype, f.prototype);
    (function() {
        function a(a) {
            return 0 === a.indexOf("'") ? a.lastIndexOf("'") === a.length - 1 : 0 === a.indexOf('"') ? a.lastIndexOf('"') === a.length - 1 : !1
        }

        function c(a) {
            return "(" === a || "[" === a || "{" === a
        }

        function d(a) {
            return ")" === a || "]" === a || "}" === a
        }
        this.cloneCursor = function() {
            return new e(this.$tokens, this.$row, this.$offset, this.$codeModel)
        };
        var f = m.contains;
        this.isValidAsIdentifier =
            function() {
                var a = this.currentType();
                return this.hasType("identifier", "constant") || "symbol" === a || "keyword" === a || "string" === a
            };
        this.isExtractionOperator = function() {
            var a = this.currentValue();
            return "$" === a || "@" === a || "::" === a || ":::" === a
        };
        this.findStartOfEvaluationContext = function() {
            var a = this.cloneCursor();
            do
                if (!a.bwdToMatchingToken()) {
                    if (a.isValidAsIdentifier()) {
                        if (!a.moveToPreviousToken()) break;
                        if (a.isExtractionOperator()) continue;
                        if (!a.moveToNextToken()) return !1;
                        break
                    }
                    return !1
                } while (a.moveToPreviousToken());
            this.$row = a.$row;
            this.$offset = a.$offset;
            return !0
        };
        this.isLookingAtBinaryOp = function() {
            var a = this.currentType();
            return "keyword.operator" === a || "keyword.operator.infix" === a
        };
        this.moveToStartOfCurrentStatement = function() {
            for (var a = this.cloneCursor(); a.isLookingAtBinaryOp();)
                if (!a.moveToPreviousToken()) return !1;
            do
                if (!a.bwdToMatchingToken()) {
                    if (a.isValidAsIdentifier()) {
                        if (!a.moveToPreviousToken()) break;
                        if (a.isLookingAtBinaryOp()) {
                            for (; a.isLookingAtBinaryOp();)
                                if (!a.moveToPreviousToken()) return !1;
                            if (!a.moveToNextToken()) return !1;
                            continue
                        }
                        if (!a.moveToNextToken()) return !1;
                        break
                    }
                    return !1
                } while (a.moveToPreviousToken());
            this.$row = a.$row;
            this.$offset = a.$offset;
            return !0
        };
        this.moveToEndOfCurrentStatement = function() {
            for (var a = this.cloneCursor(); a.isLookingAtBinaryOp();)
                if (!a.moveToNextToken()) return !1;
            do
                if (!a.fwdToMatchingToken()) {
                    if (a.isValidAsIdentifier()) {
                        if (!a.moveToNextToken()) break;
                        if (a.isLookingAtBinaryOp()) {
                            for (; a.isLookingAtBinaryOp();)
                                if (!a.moveToNextToken()) return !1;
                            if (!a.moveToPreviousToken()) return !1;
                            continue
                        }
                        if (!a.moveToPreviousToken()) return !1;
                        break
                    }
                    return !1
                } while (a.moveToNextToken());
            this.$row = a.$row;
            this.$offset = a.$offset;
            return !0
        };
        this.isSingleLineString = function() {
            return a(this.currentValue())
        };
        this.isLeftBracket = function() {
            return c(this.currentValue())
        };
        this.isRightBracket = function() {
            return d(this.currentValue())
        };
        this.isValidForEndOfStatement = function() {
            var b = this.currentType(),
                c = this.currentValue();
            return -1 !== b.search(g) ? d(c) : a(c) || this.hasType("identifier", "constant", "variable")
        };
        this.isValidForStartOfStatement = function() {
            var b =
                this.currentType();
            this.currentValue();
            if (-1 !== b.search(g)) return c(this.currentValue());
            b = this.currentValue();
            return a(b) || this.hasType("identifier", "constant", "variable")
        };
        this.isConditionalControlFlowKeyword = function() {
            var a = this.currentValue();
            return f(["if", "for", "while", "function"], a)
        };
        this.isControlFlowKeyword = function() {
            var a = this.currentValue();
            return f("if for while else function repeat break next".split(" "), a)
        };
        this.isAtStartOfNewExpression = function(a) {
            var b = this.cloneCursor();
            return b.moveToPreviousToken() ?
                this.isValidForStartOfStatement() && b.isValidForEndOfStatement() && this.$row > b.$row ? b.isControlFlowKeyword() || ")" === b.currentValue() && b.bwdToMatchingToken() && b.moveToPreviousToken() && b.isConditionalControlFlowKeyword() ? !1 : !0 : !1 : a
        }
    }).call(e.prototype);
    p.TokenCursor = f;
    p.CppTokenCursor = k;
    p.RTokenCursor = e
});
define("mode/token_utils", ["require", "exports", "module"], function(a, p, l) {
    a = function(a, m, f, k, e, b) {
        this.$doc = a;
        this.$tokenizer = m;
        this.$tokens = f;
        this.$endStates = Array(a.getLength());
        this.$statePattern = k;
        this.$codeBeginPattern = e;
        this.$codeEndPattern = b
    };
    (function() {
        this.getTokenForPos = function(a, m, f) {
            this.$tokenizeUpToRow(a.row);
            if (this.$tokens.length <= a.row) return null;
            for (var g = this.$tokens[a.row], e = 0; e < g.length; e++) {
                var b = g[e];
                if (m && a.column == b.column) return b;
                if (a.column <= b.column) break;
                if (f && a.column ==
                    b.column + b.value.length || a.column < b.column + b.value.length) return b
            }
            return null
        };
        this.$tokenizeUpToRow = function(a) {
            a = Math.min(a, this.$doc.getLength() - 1);
            for (var g = 0, f = !0; g <= a; g++)
                if (!f || !this.$endStates[g]) {
                    f = !1;
                    var k = 0 === g ? "start" : this.$endStates[g - 1],
                        e = this.$doc.getLine(g);
                    e = this.$tokenizer.getLineTokens(e, k, g);
                    !this.$statePattern || this.$statePattern.test(e.state) || this.$statePattern.test(k) ? this.$tokens[g] = this.$filterWhitespaceAndComments(e.tokens) : this.$tokens[g] = [];
                    e.state === this.$endStates[g] ?
                        f = !0 : this.$endStates[g] = e.state
                } f || g < this.$tokens.length && this.$invalidateRow(g);
            return !0
        };
        this.$filterWhitespaceAndComments = function(a) {
            a = a.filter(function(a) {
                a = /\bcode(?:begin|end)\b/.test(a.type) ? !1 : /\bsectionhead\b/.test(a.type) ? !1 : /^\s*$/.test(a.value) || a.type.match(/\b(?:ace_virtual-)?comment\b/);
                return !a
            });
            for (var g = a.length - 1; 0 <= g; g--)
                if (1 < a[g].value.length && /\bparen\b/.test(a[g].type)) {
                    var f = a[g];
                    a.splice(g, 1);
                    for (var k = f.value.length - 1; 0 <= k; k--) {
                        var e = {
                            type: f.type,
                            value: f.value.charAt(k),
                            column: f.column + k
                        };
                        a.splice(g, 0, e)
                    }
                } return a
        };
        this.$invalidateRow = function(a) {
            this.$tokens[a] = null;
            this.$endStates[a] = null
        };
        this.$insertNewRows = function(a, m) {
            for (var f = [a, 0], g = 0; g < m; g++) f.push(null);
            this.$tokens.splice.apply(this.$tokens, f);
            this.$endStates.splice.apply(this.$endStates, f)
        };
        this.$removeRows = function(a, m) {
            this.$tokens.splice(a, m);
            this.$endStates.splice(a, m)
        };
        this.$walkParens = function(a, m, f) {
            var g = /\bparen\b/;
            return a < m ? function() {
                for (; a <= m; a++)
                    for (var e = this.$tokens[a], b = 0; b < e.length; b++)
                        if (g.test(e[b].type) &&
                            !f(e[b].value, {
                                row: a,
                                column: e[b].column
                            })) return !1;
                return !0
            }.call(this) : function() {
                a = Math.max(0, a);
                for (m = Math.max(0, m); a >= m; a--)
                    for (var e = this.$tokens[a], b = e.length - 1; 0 <= b; b--)
                        if (g.test(e[b].type) && !f(e[b].value, {
                                row: a,
                                column: e[b].column
                            })) return !1;
                return !0
            }.call(this)
        };
        this.$walkParensBalanced = function(a, m, f, k, e) {
            var b = [],
                c = null;
            this.$walkParens(a, m, function(a, g) {
                if (f && f(b, a, g)) return c = g, !1;
                if (/[\[({]/.test(a))
                    if (b[b.length - 1] === e[a]) b.pop();
                    else return !0;
                else b.push(a);
                return k && k(b, a, g) ? (c = g,
                    !1) : !0
            });
            return c
        };
        this.$findNextSignificantToken = function(a, m) {
            if (0 == this.$tokens.length) return null;
            m = Math.min(m, this.$tokens.length - 1);
            for (var f = a.row, g = a.column; f <= m; f++) {
                for (var e = this.$tokens[f], b = 0; b < e.length; b++)
                    if (e[b].column + e[b].value.length > g) return {
                        token: e[b],
                        row: f,
                        column: Math.max(e[b].column, g),
                        offset: b
                    };
                g = 0
            }
            return null
        };
        this.findNextSignificantToken = function(a) {
            return this.$findNextSignificantToken(a, this.$tokens.length - 1)
        };
        this.$findPreviousSignificantToken = function(a, m) {
            if (0 == this.$tokens.length) return null;
            m = Math.max(0, m);
            for (var f = Math.min(a.row, this.$tokens.length - 1); f >= m; f--) {
                var g = this.$tokens[f];
                if (0 != g.length) {
                    if (f != a.row) return {
                        row: f,
                        column: g[g.length - 1].column,
                        token: g[g.length - 1],
                        offset: g.length - 1
                    };
                    for (var e = g.length - 1; 0 <= e; e--)
                        if (g[e].column < a.column) return {
                            row: f,
                            column: g[e].column,
                            token: g[e],
                            offset: e
                        }
                }
            }
            return null
        }
    }).call(a.prototype);
    p.TokenUtils = a
});
define("mode/utils", ["require", "exports", "module"], function(a, p, l) {
    a("ace/range");
    var g = a("ace/token_iterator").TokenIterator,
        m = a("ace/unicode");
    (function() {
        var a = this,
            k = new RegExp("^[" + m.wordChars + "._]+", "");
        this.construct = function(a, c) {
            function b() {
                return a.apply(this, c)
            }
            b.prototype = a.prototype;
            return new b
        };
        this.contains = function(a, c) {
            for (var b = 0; b < a.length; b++)
                if (a[b] === c) return !0;
            return !1
        };
        this.isArray = function(a) {
            return "[object Array]" === Object.prototype.toString.call(a)
        };
        this.asArray = function(b) {
            return a.isArray(b) ?
                b : [b]
        };
        this.getPrimaryState = function(b, c) {
            return a.primaryState(b.getState(c))
        };
        this.primaryState = function(b) {
            if (a.isArray(b))
                for (var c = 0; c < b.length; c++) {
                    var d = b[c];
                    if ("#tmp" !== d) return d || "start"
                }
            return b || "start"
        };
        this.activeMode = function(b, c) {
            var d = a.primaryState(b),
                e = d.lastIndexOf("-");
            return -1 === e ? c : d.substring(0, e).toLowerCase()
        };
        this.endsWith = function(a, c) {
            return -1 !== a.indexOf(c, a.length - c.length)
        };
        this.escapeRegExp = function(a) {
            return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
        };
        this.embedRules = function(b, c, d, e, f, g, n) {
            "undefined" === typeof g && (g = ["start"]);
            "undefined" === typeof n && (n = "start");
            g = a.asArray(g);
            n = b.$rules;
            for (var h = function(a, b, c, d) {
                    c.splice(0);
                    return this.token
                }, k = 0; k < g.length; k++) n[g[k]].unshift({
                token: "support.function.codebegin",
                regex: e,
                onMatch: h,
                next: d + "-start"
            });
            b.embedRules(c, d + "-", [{
                token: "support.function.codeend",
                regex: f,
                onMatch: h,
                next: "start"
            }])
        };
        this.isSingleLineString = function(a) {
            if (2 > a.length) return !1;
            var b = a[0];
            return "'" !== b && '"' !== b || a[a.length -
                1] !== b || "\\" === a[a.length - 2] && "\\" !== a[a.length - 3] ? !1 : !0
        };
        this.createTokenIterator = function(a) {
            var b = a.getSelectionRange().start;
            a = a.getSession();
            return new g(a, b.row, b.column)
        };
        this.isWordCharacter = function(a) {
            return k.test(a)
        };
        var e = {
            "'": "'",
            '"': '"',
            "`": "`",
            "{": "}",
            "(": ")",
            "[": "]",
            "<": ">",
            "}": "{",
            ")": "(",
            "]": "[",
            ">": "<"
        };
        this.isBracket = function(a, c) {
            return !c || "<" !== a && ">" !== a ? "{" === a || "}" === a || "(" === a || ")" === a || "[" === a || "]" === a : !0
        };
        this.isOpeningBracket = function(a, c) {
            return "{" === a || "(" === a || "[" ===
                a || !!c && "<" === a
        };
        this.isClosingBracket = function(a, c) {
            return "}" === a || ")" === a || "]" === a || !!c && ">" === a
        };
        this.getComplement = function(a, c) {
            "undefined" === typeof c && (c = e);
            var b = c[a];
            return "undefined" === typeof b ? a : b
        };
        this.stripEnclosingQuotes = function(a) {
            var b = a.length;
            if (2 > b) return a;
            var d = a[0];
            return "'" !== d && '"' !== d && "`" !== d || a[b - 1] !== d ? a : a.substr(1, b - 2)
        };
        this.startsWith = function(a, c) {
            if ("string" !== typeof a || "string" !== typeof c || a.length < c.length) return !1;
            for (var b = 0; b < c.length; b++)
                if (a[b] !== c[b]) return !1;
            return !0
        }
    }).call(p)
});
define("mode/xml", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("ace/tokenizer").Tokenizer,
        f = a("mode/xml_highlight_rules").XmlHighlightRules,
        k = a("mode/xml_behavior").XmlBehaviour,
        e = a("mode/xml_fold_mode").FoldMode;
    a = function() {
        this.$tokenizer = new m((new f).getRules());
        this.$behaviour = new k;
        this.foldingRules = new e
    };
    l.inherits(a, g);
    (function() {
        this.getNextLineIndent = function(a, c, d) {
            return this.$getIndent(c)
        }
    }).call(a.prototype);
    p.Mode = a
});
define("mode/xml_behavior", ["require", "exports", "module"], function(a, p, l) {
    function g(a, b) {
        var c = !0,
            d = a.type.split(".");
        b.split(".").forEach(function(a) {
            if (-1 == d.indexOf(a)) return c = !1
        });
        return c
    }
    l = a("ace/lib/oop");
    var m = a("ace/mode/behaviour").Behaviour,
        f = a("ace/mode/behaviour/cstyle").CstyleBehaviour,
        k = a("ace/token_iterator").TokenIterator;
    a = function() {
        this.inherit(f, ["string_dquotes"]);
        this.add("autoclosing", "insertion", function(a, b, c, d, f) {
            if (">" == f) {
                a = c.getCursorPosition();
                c = new k(d, a.row, a.column);
                d = c.getCurrentToken();
                b = !1;
                if (d && (g(d, "meta.tag") || g(d, "text") && d.value.match("/"))) b = !0;
                else {
                    do d = c.stepBackward(); while (d && (g(d, "string") || g(d, "keyword.operator") || g(d, "entity.attribute-name") || g(d, "text")))
                }
                if (d && g(d, "meta.tag-name") && !c.stepBackward().value.match("/")) return c = d.value, b && (c = c.substring(0, a.column - d.start)), {
                    text: "></" + c + ">",
                    selection: [1, 1]
                }
            }
        });
        this.add("autoindent", "insertion", function(a, b, c, d, f) {
            if ("\n" == f && (b = c.getCursorPosition(), "</" == d.doc.getLine(b.row).substring(b.column,
                    b.column + 2))) return a = this.$getIndent(d.doc.getLine(b.row)) + d.getTabString(), d = this.$getIndent(d.doc.getLine(b.row)), {
                text: "\n" + a + "\n" + d,
                selection: [1, a.length, 1, a.length]
            }
        })
    };
    l.inherits(a, m);
    p.XmlBehaviour = a
});
define("mode/xml_fold_mode", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/lib/lang"),
        m = a("ace/range").Range,
        f = a("ace/mode/folding/fold_mode").FoldMode,
        k = a("ace/token_iterator").TokenIterator;
    a = p.FoldMode = function(a) {
        f.call(this);
        this.voidElements = a || {}
    };
    l.inherits(a, f);
    (function() {
        this.getFoldWidget = function(a, b, c) {
            a = this._getFirstTagInLine(a, c);
            return a.closing ? "markbeginend" == b ? "end" : "" : !a.tagName || this.voidElements[a.tagName.toLowerCase()] || a.selfClosing || -1 !==
                a.value.indexOf("/" + a.tagName) ? "" : "start"
        };
        this._getFirstTagInLine = function(a, b) {
            for (var c = a.getTokens(b), d = "", e = 0; e < c.length; e++) {
                var f = c[e];
                d = 0 === f.type.indexOf("meta.tag") ? d + f.value : d + g.stringRepeat(" ", f.value.length)
            }
            return this._parseTag(d)
        };
        this.tagRe = /^(\s*)(<?(\/?)([-_a-zA-Z0-9:!]*)\s*(\/?)>?)/;
        this._parseTag = function(a) {
            var b = this.tagRe.exec(a),
                c = this.tagRe.lastIndex || 0;
            this.tagRe.lastIndex = 0;
            return {
                value: a,
                match: b ? b[2] : "",
                closing: b ? !!b[3] : !1,
                selfClosing: b ? !!b[5] || "/>" == b[2] : !1,
                tagName: b ?
                    b[4] : "",
                column: b[1] ? c + b[1].length : c
            }
        };
        this._readTagForward = function(a) {
            var b = a.getCurrentToken();
            if (!b) return null;
            var c = "",
                d;
            do
                if (0 === b.type.indexOf("meta.tag") && (d || (d = {
                        row: a.getCurrentTokenRow(),
                        column: a.getCurrentTokenColumn()
                    }), c += b.value, -1 !== c.indexOf(">"))) return c = this._parseTag(c), c.start = d, c.end = {
                    row: a.getCurrentTokenRow(),
                    column: a.getCurrentTokenColumn() + b.value.length
                }, a.stepForward(), c; while (b = a.stepForward());
            return null
        };
        this._readTagBackward = function(a) {
            var b = a.getCurrentToken();
            if (!b) return null;
            var c = "",
                d;
            do
                if (0 === b.type.indexOf("meta.tag") && (d || (d = {
                        row: a.getCurrentTokenRow(),
                        column: a.getCurrentTokenColumn() + b.value.length
                    }), c = b.value + c, -1 !== c.indexOf("<"))) return b = this._parseTag(c), b.end = d, b.start = {
                    row: a.getCurrentTokenRow(),
                    column: a.getCurrentTokenColumn()
                }, a.stepBackward(), b; while (b = a.stepBackward());
            return null
        };
        this._pop = function(a, b) {
            for (; a.length;) {
                var c = a[a.length - 1];
                if (b && c.tagName != b.tagName)
                    if (this.voidElements[b.tagName]) break;
                    else if (this.voidElements[c.tagName]) a.pop();
                else return null;
                else return a.pop()
            }
        };
        this.getFoldWidgetRange = function(a, b, c) {
            var d = this._getFirstTagInLine(a, c);
            if (!d.match) return null;
            b = [];
            if (d.closing || d.selfClosing)
                for (a = new k(a, c, d.column + d.match.length), d = {
                        row: c,
                        column: d.column
                    }; c = this._readTagBackward(a);) {
                    if (c.selfClosing)
                        if (b.length) continue;
                        else return c.start.column += c.tagName.length + 2, c.end.column -= 2, m.fromPoints(c.start, c.end);
                    if (c.closing) b.push(c);
                    else if (this._pop(b, c), 0 == b.length) return c.start.column += c.tagName.length + 2, m.fromPoints(c.start,
                        d)
                } else
                    for (a = new k(a, c, d.column), d = {
                            row: c,
                            column: d.column + d.tagName.length + 2
                        }; c = this._readTagForward(a);) {
                        if (c.selfClosing)
                            if (b.length) continue;
                            else return c.start.column += c.tagName.length + 2, c.end.column -= 2, m.fromPoints(c.start, c.end);
                        if (c.closing) {
                            if (this._pop(b, c), 0 == b.length) return m.fromPoints(d, c.start)
                        } else b.push(c)
                    }
        }
    }).call(a.prototype)
});
define("mode/xml_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("mode/xml_util");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var m = function() {
        this.$rules = {
            start: [{
                token: "text",
                regex: "<\\!\\[CDATA\\[",
                next: "cdata"
            }, {
                token: "xml_pe",
                regex: "<\\?.*?\\?>"
            }, {
                token: "comment",
                merge: !0,
                regex: "<\\!--",
                next: "comment"
            }, {
                token: "xml_pe",
                regex: "<\\!.*?>"
            }, {
                token: "meta.tag",
                regex: "<\\/?",
                next: "tag"
            }, {
                token: "text",
                regex: "\\s+"
            }, {
                token: "constant.character.entity",
                regex: "(?:&#[0-9]+;)|(?:&#x[0-9a-fA-F]+;)|(?:&[a-zA-Z0-9_:\\.-]+;)"
            }, {
                token: "text",
                regex: "[^<]+"
            }],
            cdata: [{
                token: "text",
                regex: "\\]\\]>",
                next: "start"
            }, {
                token: "text",
                regex: "\\s+"
            }, {
                token: "text",
                regex: "(?:[^\\]]|\\](?!\\]>))+"
            }],
            comment: [{
                token: "comment",
                regex: ".*?--\x3e",
                next: "start"
            }, {
                token: "comment",
                merge: !0,
                regex: ".+"
            }]
        };
        g.tag(this.$rules, "tag", "start")
    };
    l.inherits(m, a);
    p.XmlHighlightRules = m
});
define("mode/xml_util", ["require", "exports", "module"], function(a, p, l) {
    function g(a, f) {
        return [{
            token: "string",
            merge: !0,
            regex: ".*?" + a,
            next: f
        }, {
            token: "string",
            merge: !0,
            regex: ".+"
        }]
    }
    p.tag = function(a, f, k, e) {
        a[f] = [{
            token: "text",
            regex: "\\s+"
        }, {
            token: function(a) {
                return e && e[a] ? "meta.tag.tag-name." + e[a] : "meta.tag.tag-name"
            },
            merge: !0,
            regex: "[-_a-zA-Z0-9:]+",
            next: f + "_embed_attribute_list"
        }, {
            token: "empty",
            regex: "",
            next: f + "_embed_attribute_list"
        }];
        a[f + "_qstring"] = g("'", f + "_embed_attribute_list");
        a[f + "_qqstring"] =
            g('"', f + "_embed_attribute_list");
        a[f + "_embed_attribute_list"] = [{
            token: "meta.tag",
            merge: !0,
            regex: "/?>",
            next: k
        }, {
            token: "keyword.operator",
            regex: "="
        }, {
            token: "entity.other.attribute-name",
            regex: "[-_a-zA-Z0-9:]+"
        }, {
            token: "constant.numeric",
            regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token: "text",
            regex: "\\s+"
        }].concat([{
            token: "string",
            regex: '".*?"'
        }, {
            token: "string",
            merge: !0,
            regex: '["].*',
            next: f + "_qqstring"
        }, {
            token: "string",
            regex: "'.*?'"
        }, {
            token: "string",
            merge: !0,
            regex: "['].*",
            next: f + "_qstring"
        }])
    }
});
define("mode/yaml", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    var g = a("ace/mode/text").Mode,
        m = a("mode/yaml_highlight_rules").YamlHighlightRules,
        f = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        k = a("ace/mode/folding/coffee").FoldMode;
    a = function() {
        this.HighlightRules = m;
        this.$outdent = new f;
        this.foldingRules = new k;
        this.$behaviour = this.$defaultBehaviour
    };
    l.inherits(a, g);
    (function() {
        this.lineCommentStart = "#";
        this.getNextLineIndent = function(a, b, c) {
            var d = this.$getIndent(b);
            "start" == a && b.match(/^.*[\{\(\[]\s*$/) && (d += c);
            return d
        };
        this.checkOutdent = function(a, b, c) {
            return this.$outdent.checkOutdent(b, c)
        };
        this.autoOutdent = function(a, b, c) {
            this.$outdent.autoOutdent(b, c)
        };
        this.$id = "mode/yaml"
    }).call(a.prototype);
    p.Mode = a
});
define("mode/yaml_highlight_rules", ["require", "exports", "module"], function(a, p, l) {
    l = a("ace/lib/oop");
    a = a("ace/mode/text_highlight_rules").TextHighlightRules;
    var g = function() {
        this.$rules = {
            start: [{
                    token: ["whitespace", "comment"],
                    regex: "(^|\\s+)(#.*)$"
                }, {
                    token: "list.markup",
                    regex: /^(?:-{3}|\.{3})\s*(?=#|$)/
                }, {
                    token: "list.markup",
                    regex: /^\s*[\-?](?:$|\s)/
                }, {
                    token: "constant",
                    regex: "!![\\w//]+"
                }, {
                    token: "constant.language",
                    regex: "[&\\*][a-zA-Z0-9-_]+"
                }, {
                    token: ["meta.tag", "keyword", "meta.tag", "keyword"],
                    regex: /^(\s*\w.*?)(:{2,3})(\s*\w.*?)(:(?:\s+|$))/
                },
                {
                    token: ["meta.tag", "keyword"],
                    regex: /^(\s*\w.*?)(:(?:\s+|$))/
                }, {
                    token: ["meta.tag", "keyword"],
                    regex: /(\w+?)(\s*:(?:\s+|$))/
                }, {
                    token: "keyword.operator",
                    regex: "<<\\w*:\\w*"
                }, {
                    token: "keyword.operator",
                    regex: "-\\s*(?=[{])"
                }, {
                    token: "string",
                    regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                }, {
                    token: "string",
                    regex: /[|>][-+\d\s]*$/,
                    onMatch: function(a, f, g, e) {
                        a = /^\s*/.exec(e)[0];
                        g.length = 2;
                        g[0] = f;
                        g[1] = a.length;
                        return this.token
                    },
                    next: "mlString"
                }, {
                    token: "string",
                    regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                }, {
                    token: "constant.numeric",
                    regex: /(\b|[+\-\.])[\d_]+(?:(?:\.[\d_]*)?(?:[eE][+\-]?[\d_]+)?)/
                }, {
                    token: "constant.numeric",
                    regex: /[+\-]?\.inf\b|NaN\b|0x[\dA-Fa-f_]+|0b[10_]+/
                }, {
                    token: "constant.language.boolean",
                    regex: "\\b(?:true|false|TRUE|FALSE|True|False|yes|no)\\b"
                }, {
                    token: "paren.lparen",
                    regex: "[[({]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\])}]"
                }
            ],
            mlString: [{
                    token: "indent",
                    regex: /^\s*$/
                }, {
                    token: "indent",
                    regex: /^\s*/,
                    onMatch: function(a, f, g) {
                        g[1] >= a.length ? (this.next = g[0], g.splice(0)) : this.next = f;
                        return this.token
                    },
                    next: "mlString"
                },
                {
                    token: "string",
                    regex: ".+"
                }
            ]
        };
        this.normalizeRules()
    };
    l.inherits(g, a);
    p.YamlHighlightRules = g
});
define("theme/default", ["require", "exports", "module"], function(a, p, l) {
    a("ace/lib/dom");
    p.cssClass = "ace-rs"
});
if (!String.prototype.trimRight) {
    var trimEndRegexp = /\s\s*$/;
    String.prototype.trimRight = function() {
        return String(this).replace(trimEndRegexp, "")
    }
}
define("rstudio/loader", ["require", "exports", "module"], function(a, p, l) {
    var g = a("ace/edit_session").EditSession,
        m = a("ace/editor").Editor;
    a("ace/lib/event_emitter");
    a("util/expand_selection");
    var f = a("ace/range").Range,
        k = a("ace/virtual_renderer").VirtualRenderer,
        e = a("ace/mode/text").Mode,
        b = a("ace/undomanager").UndoManager,
        c = a("mode/utils");
    a("ace/lib/event");
    l = a("ace/lib/oop");
    a("mixins/token_iterator");
    var d = function(a, b) {
        m.call(this, a, b);
        this.setBehavioursEnabled(!0)
    };
    l.inherits(d, m);
    (function() {
        this.$highlightBrackets =
            function() {
                this.session.$bracketHighlight && (this.session.removeMarker(this.session.$bracketHighlight), this.session.$bracketHighlight = null);
                this.session.selection.isEmpty() && m.prototype.$highlightBrackets.call(this)
            };
        this.insert = function(a, b) {
            if (!this.session.selection.isEmpty()) {
                var d = [];
                "quotes" === this.$surroundSelection ? d = ["'", '"', "`"] : "quotes_and_brackets" === this.$surroundSelection && (d = "'\"`({[".split(""));
                if ("quotes_and_brackets" === this.$surroundSelection) {
                    var e = this.session.$mode;
                    if (/\/markdown$/.test(e.$id)) d.push("*",
                        "_");
                    else {
                        var f = this.getCursorPosition();
                        e.getLanguageMode && "Markdown" === e.getLanguageMode(f) && d.push("*", "_")
                    }
                }
                if (c.contains(d, a)) return d = c.getComplement(a), this.session.replace(this.session.selection.getRange(), a + this.session.getTextRange() + d)
            }
            return m.prototype.insert.call(this, a, b)
        };
        this.remove = function(a) {
            return this.session.getMode().wrapRemove ? this.session.getMode().wrapRemove(this, m.prototype.remove, a) : m.prototype.remove.call(this, a)
        };
        this.undo = function() {
            m.prototype.undo.call(this);
            this._dispatchEvent("undo")
        };
        this.redo = function() {
            m.prototype.redo.call(this);
            this._dispatchEvent("redo")
        };
        this.onPaste = function(a, b) {
            m.prototype.onPaste.call(this, a.replace(/\r\n|\n\r|\r/g, "\n"), b)
        }
    }).call(d.prototype);
    var r = function(a, b) {
        g.call(this, a, b)
    };
    l.inherits(r, g);
    (function() {
        this.insert = function(a, b) {
            return this.getMode().wrapInsert ? this.getMode().wrapInsert(this, g.prototype.insert, a, b) : g.prototype.insert.call(this, a, b)
        };
        this.reindent = function(a) {
            var b = this.getMode();
            if (b.getNextLineIndent) {
                var d = a.start.row;
                a = a.end.row;
                0 === d && (this.applyIndent(0, ""), d++);
                for (var e = d; e <= a; e++) {
                    var f = c.getPrimaryState(this, e - 1);
                    if (!c.endsWith(f, "qstring")) {
                        var g = b.getNextLineIndent(f, this.getLine(e - 1), this.getTabString(), e - 1, !0);
                        this.applyIndent(e, g);
                        b.autoOutdent(f, this, e)
                    }
                }
                b = b.codeModel;
                "undefined" !== typeof b && (b = b.alignContinuationSlashes, "undefined" !== typeof b && b(this.getDocument(), {
                    start: d,
                    end: a
                }))
            }
        };
        this.applyIndent = function(a, b) {
            var c = this.getLine(a).match(/^\s*/g)[0].length;
            this.replace(new f(a, 0, a, c), b)
        };
        this.setDisableOverwrite =
            function(a) {
                a ? (this.setOverwrite(!1), this.setOverwrite = function() {}, this.getOverwrite = function() {
                    return !1
                }) : (this.setOverwrite = g.prototype.setOverwrite, this.getOverwrite = g.prototype.getOverwrite)
            }
    }).call(r.prototype);
    var q = function() {
        b.call(this)
    };
    l.inherits(q, b);
    (function() {
        this.peek = function() {
            return this.$undoStack.length ? this.$undoStack[this.$undoStack.length - 1] : null
        }
    }).call(q.prototype);
    var h = function(a, b) {
        k.call(this, a, b)
    };
    l.inherits(h, k);
    (function() {
        this.setTheme = function(a) {
            a && k.prototype.setTheme.call(this,
                a)
        }
    }).call(h.prototype);
    p.RStudioEditor = d;
    p.loadEditor = function(b) {
        function c(a) {
            f.editor.commands.removeCommand(a)
        }
        var f = {};
        b.env = f;
        b = new h(b, "");
        var g = new r("");
        b = new d(b, g);
        f.editor = b;
        g = b.getSession();
        g.setMode(new e);
        g.setUndoManager(new q);
        b = a("ace/config");
        b.set("basePath", "ace");
        b.set("workerPath", "js/workers");
        b.setDefaultValue("session", "useWorker", !1);
        c("findnext");
        c("findprevious");
        c("find");
        c("replace");
        c("togglecomment");
        c("gotoline");
        c("foldall");
        c("unfoldall");
        return f.editor
    }
});
define("rstudio/snippets", ["require", "exports", "module"], function(a, p, l) {
    p.toSnippetText = function(a) {
        for (var g = a.length, f = "", k = 0; k < g; k++) {
            var e = a[k];
            f += "snippet " + e.name + "\n\t" + e.content.replace(/\n/g, "\n\t") + "\n\n"
        }
        return f
    };
    p.normalizeSnippets = function(a) {
        for (var g = a.length, f = 0; f < g; f++) {
            var k = a[f];
            null == k.tabTrigger && (k.tabTrigger = k.name);
            k.content = k.content.replace("\n    ", "\n\t")
        }
    }
});
define("rstudio/snippets/c_cpp", ["require", "exports", "module"], function(a, p, l) {
    l = a("rstudio/snippets");
    a = a("ace/snippets").snippetManager;
    var g = [{
            name: "once",
            content: "#ifndef ${1:`HeaderGuardFileName`}\n#define ${1:`HeaderGuardFileName`}\n\n${0}\n\n#endif /* ${1:`HeaderGuardFileName`} */"
        }, {
            name: "ans",
            content: "namespace {\n${0}\n} // anonymous namespace"
        }, {
            name: "ns",
            content: "namespace ${1:ns} {\n${0}\n} // namespace ${1:ns}"
        }, {
            name: "cls",
            content: "class ${1:ClassName} {\npublic:\n    ${2}\nprivate:\n    ${3}\n};"
        },
        {
            name: "str",
            content: "struct ${1} {\n    ${0}\n};"
        }, {
            name: "ept",
            content: "// [[Rcpp::export]]\n"
        }
    ];
    l.normalizeSnippets(g);
    p.snippetText = l.toSnippetText(g);
    a.register(g, "c_cpp")
});
define("rstudio/snippets/markdown", ["require", "exports", "module"], function(a, p, l) {
    l = a("rstudio/snippets");
    a = a("ace/snippets").snippetManager;
    var g = [{
        name: "[",
        content: "[${1:label}](${2:location})"
    }, {
        name: "![",
        content: "![${1:label}](${2:location})"
    }, {
        name: "r",
        content: "```{r ${1:label}, ${2:options}}\n${0}\n```"
    }, {
        name: "rcpp",
        content: "```{r, engine='Rcpp'}\n#include <Rcpp.h>\nusing namespace Rcpp;\n\n${0}\n\n```"
    }];
    l.normalizeSnippets(g);
    p.snippetText = l.toSnippetText(g);
    a.register(g, "markdown")
});
define("rstudio/snippets/r", ["require", "exports", "module"], function(a, p, l) {
    l = a("rstudio/snippets");
    a = a("ace/snippets").snippetManager;
    var g = [{
            name: "lib",
            content: "library(${1:package})"
        }, {
            name: "req",
            content: "require(${1:package})"
        }, {
            name: "src",
            content: 'source("${1:file.R}")'
        }, {
            name: "ret",
            content: "return(${1:code})"
        }, {
            name: "mat",
            content: "matrix(${1:data}, nrow = ${2:rows}, ncol = ${3:cols})"
        }, {
            name: "sg",
            content: 'setGeneric("${1:generic}", function(${2:x, ...}) {\n    standardGeneric("${1:generic}")\n})'
        },
        {
            name: "sm",
            content: 'setMethod("${1:generic}", ${2:class}, function(${2:x, ...}) {\n    ${0}\n})'
        }, {
            name: "sc",
            content: 'setClass("${1:Class}", slots = c(${2:name = "type"}))'
        }, {
            name: "if",
            content: "if (${1:condition}) {\n    ${0}\n}"
        }, {
            name: "el",
            content: "else {\n    ${0}\n}"
        }, {
            name: "ei",
            content: "else if (${1:condition}) {\n    ${0}\n}"
        }, {
            name: "fun",
            content: "${1:name} <- function(${2:variables}) {\n    ${0}\n}"
        }, {
            name: "for",
            content: "for (${1:variable} in ${2:vector}) {\n    ${0}\n}"
        }, {
            name: "while",
            content: "while (${1:condition}) {\n    ${0}\n}"
        },
        {
            name: "switch",
            content: "switch (${1:object},\n    ${2:case} = ${3:action}\n)"
        }, {
            name: "apply",
            content: "apply(${1:array}, ${2:margin}, ${3:...})"
        }, {
            name: "lapply",
            content: "lapply(${1:list}, ${2:function})"
        }, {
            name: "sapply",
            content: "sapply(${1:list}, ${2:function})"
        }, {
            name: "mapply",
            content: "mapply(${1:function}, ${2:...})"
        }, {
            name: "tapply",
            content: "tapply(${1:vector}, ${2:index}, ${3:function})"
        }, {
            name: "vapply",
            content: "vapply(${1:list}, ${2:function}, FUN.VALUE = ${3:type}, ${4:...})"
        }, {
            name: "rapply",
            content: "rapply(${1:list}, ${2:function})"
        }, {
            name: "ts",
            content: '`r paste("#", date(), "------------------------------\\n")`'
        }, {
            name: "shinyapp",
            content: "library(shiny)\n\nui <- fluidPage(\n  ${0}\n)\n\nserver <- function(input, output, session) {\n  \n}\n\nshinyApp(ui, server)"
        }, {
            name: "shinymod",
            content: "${1:name}_UI <- function(id) {\n  ns <- NS(id)\n  tagList(\n    ${0}\n  )\n}\n\n${1:name} <- function(input, output, session) {\n  \n}"
        }
    ];
    l.normalizeSnippets(g);
    p.snippetText = l.toSnippetText(g);
    a.register(g,
        "r")
});
define("rstudio/snippets/stan", ["require", "exports", "module"], function(a, p, l) {
    l = a("rstudio/snippets");
    a = a("ace/snippets").snippetManager;
    var g = [{
            name: "for",
            content: "for (${1:var} in ${2:start}:${3:end}) {\n  ${0}\n}"
        }, {
            name: "if",
            content: "if (${1:condition}) {\n  ${0}\n}"
        }, {
            name: "el",
            content: "else (${1:condition}) {\n  ${0}\n}"
        }, {
            name: "ei",
            content: "else if (${1:condition}) {\n  ${0}\n}"
        }, {
            name: "<l",
            content: "<lower = ${1:expression}>${0}"
        }, {
            name: "<u",
            content: "<upper = ${1:expression}>${0}"
        }, {
            name: "<lu",
            content: "<lower = ${1:expression}, upper = ${2:expression}>${0}"
        }, {
            name: "while",
            content: "while (${1:condition}) {\n  ${0}\n}"
        }, {
            name: "gen",
            content: "generated quantities {\n  ${0}\n}"
        }, {
            name: "mdl",
            content: "model {\n  ${0}\n}"
        }, {
            name: "par",
            content: "parameters {\n  ${0}\n}"
        }, {
            name: "tpar",
            content: "transformed parameters {\n  ${0}\n}"
        }, {
            name: "data",
            content: "data {\n  ${0}\n}"
        }, {
            name: "tdata",
            content: "transformed data {\n  ${0}\n}"
        }, {
            name: "ode",
            content: "integrate_ode(${1:function}, ${2:y0}, ${3:t0}, ${4:t}, ${5:theta}, ${6:x_r}, ${7:x_i});"
        },
        {
            name: "funs",
            content: "functions {\n  ${0}\n}"
        }, {
            name: "fun",
            content: "${1:return} ${2:name} (${3:args}) {\n  ${0}\n}"
        }
    ];
    l.normalizeSnippets(g);
    p.snippetText = l.toSnippetText(g);
    a.register(g, "stan")
});
define("rstudio/snippets/yaml", ["require", "exports", "module"], function(a, p, l) {
    l = a("rstudio/snippets");
    a = a("ace/snippets").snippetManager;
    var g = [{
        name: "key",
        content: "${1:key}: ${2:value}"
    }, {
        name: "list",
        content: "${1:key}:\n  - ${2:value1}\n  - ${3:value2}"
    }];
    l.normalizeSnippets(g);
    p.snippetText = l.toSnippetText(g);
    a.register(g, "yaml")
});