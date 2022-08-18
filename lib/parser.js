import tokens from "./analizador_lexico";

const make_parse = function () {
  var scope; // current scope
  var symbol_table = {};
  var token;
  var tokensH;
  var token_nr;

  var itself = function () {
    return this;
  };

  var original_scope = {
    define: function (n) {
      var t = this.def[n.value];
      if (typeof t === "object") {
        n.error = (t.reserved ? "Already reserved." : "Already defined.");
      }
      this.def[n.value] = n;
      n.reserved = false;
      n.nud = itself; //A nud method is used by values and by prefix operators.
      //A nud does not care about the tokensH to the left.
      n.led = null;
      n.std = null; //callback parsing the kind of statement. Used at the beginning of the staement

      n.lbp = 0; // binding power = precedence level
      n.scope = scope;
      return n;
    },
    find: function (n) {
      var e = this, o;
      while (true) {
        o = e.def[n];
        if (o && typeof o !== 'function') {
          return e.def[n];
        }
        e = e.parent;
        if (!e) {
          o = symbol_table[n];
          return o && typeof o !== 'function' ? o : symbol_table["(variable)"];
        }
      }
    },
    pop: function () {
      scope = this.parent;
    },
    reserve: function (n) {
      if (n.arity !== "variable" || n.reserved) {
        return;
      }
      var t = this.def[n.value];
      if (t) {
        if (t.reserved) {
          return;
        }
        if (t.arity === "variable") {
          n.error = ("Already defined.");
        }
      }
      this.def[n.value] = n;
      n.reserved = true;
    }
  };

  var new_scope = function () {
    var s = scope;
    scope = Object.create(original_scope);
    scope.def = {};
    scope.parent = s;
    return scope;
  };

  var advance = function (id) {
    var a, o, t, v;
    if (id && token.id !== id) {
      token.error = ("Expected '" + id + "'.");
    }
    if (token_nr >= tokensH.length) {
      token = symbol_table["(end)"];
      return;
    }
    t = tokensH[token_nr];
    token_nr += 1;
    v = t.value;
    a = t.type;
    if (a === "variable") {
      o = scope.find(v);
    } else if (a === "keyword") {
      o = scope.find(v);
    } else if (a === "operator") {
      o = symbol_table[v];
      if (!o && t) {
        t.error = ("Unknown operator.");
      }
    } else if (a === "string" || a === "number" || a == "dir") {
      o = symbol_table["(literal)"];
      a = "literal";
    } else if (a === "salto" ) {
      o = symbol_table["\n"];
      a = "salto";
    }else if (a === "tab" ) {
      o = symbol_table["\t"];
      a = "tab";
    }else {
      if (t) {
        t.error = ("Unexpected token.");
      }
    }
    console.log(o)
    token = Object.create(o);
    console.log("Colas")
    token.from = t.from;
    token.to = t.to;
    token.value = v;
    token.arity = a;
    return token;
  };

  var expression = function (rbp) {
    var left;
    var t = token;
    advance();
    left = t.nud();
    while (rbp < token.lbp) {
      t = token;
      advance();
      left = t.led(left);
    }
    return left;
  };

  var statement = function () {
    var n = token, v;

    if (n.std) {
      advance();
      scope.reserve(n);
      return n.std();
    }
    v = expression(0);
    // console.log(v)
    // if (!v.assignment && v.id !== "(") {
    //   v.error = ("Bad expression statement.");
    // }
    advance("\n");
    return v;
  };

  var statements = function () {
    var a = [], s;
    while (true) {
      if (token.id === "(end)") {
        break;
      }
      s = statement();
      if (s) {
        a.push(s);
      }
    }
    return a.length === 0 ? null : a.length === 1 ? a[0] : a;
  };

  var block = function () {
    var t = token;
    advance("\n");
    advance("\t");
    return t.std();
  };

  var original_symbol = {
    nud: function () {
      this.error = ("Undefined.");
    },
    led: function (left) {
      this.error = ("Missing operator.");
    }
  };

  var symbol = function (id, bp) { // bp = binding power
    var s = symbol_table[id];
    bp = bp || 0;
    if (s) {
      if (bp >= s.lbp) { // update left binding power
        s.lbp = bp;
      }
    } else {
      s = Object.create(original_symbol);
      s.id = s.value = id;
      s.lbp = bp; // lbp = left binding power
      symbol_table[id] = s;
    }
    return s;
  };

  var constant = function (s, v) {
    var x = symbol(s);
    x.nud = function () {
      scope.reserve(this);
      this.value = symbol_table[this.id].value;
      this.arity = "literal";
      return this;
    };
    x.value = v;
    return x;
  };

  var infix = function (id, bp, led) {
    var s = symbol(id, bp);
    s.led = led || function (left) {
      this.first = left;
      this.second = expression(bp);
      this.arity = "binary";
      return this;
    };
    return s;
  };

  var infixr = function (id, bp, led) {
    var s = symbol(id, bp);
    s.led = led || function (left) {
      this.first = left;
      this.second = expression(bp - 1);
      this.arity = "binary";
      return this;
    };
    return s;
  };

  var assignment = function (id) {
    return infixr(id, 10, function (left) {
      if (left.id !== "." && left.id !== "[" && left.arity !== "variable") {
        left.error = ("Bad lvalue.");
      }
      this.first = left;
      this.second = expression(9);
      this.assignment = true;
      this.arity = "binary";
      return this;
    });
  };

  var prefix = function (id, nud) {
    var s = symbol(id);
    s.nud = nud || function () {
      scope.reserve(this);
      this.first = expression(70);
      this.arity = "unary";
      return this;
    };
    return s;
  };

  var stmt = function (s, f) {
    var x = symbol(s);
    x.std = f;
    return x;
  };

  symbol("(end)");
  symbol("(variable)");
  symbol(":");
  symbol("\n");

  symbol("(literal)").nud = itself;

  symbol("this").nud = function () {
    scope.reserve(this);
    this.arity = "this";
    return this;
  };

  assignment("=");
  assignment("==");
  
  prefix("-");
  

  stmt("saltar", function () {
    advance("\n");
    this.arity = "statement";
    return this;
  });
  stmt("pasos", function () {
    // advance("(literal)");
    this.first = expression(0)
    advance("\n");
    this.arity = "statement";
    return this;
  });
  stmt("girar", function () {
    this.first = expression(0)
    advance("\n");
    this.arity = "statement";
    return this;
  });
  stmt("(variable)", function () {
    advance("=")
    this.first = expression(0)
    advance("\n");
    this.arity = "statement";
    return this;
  });
  stmt("imprimir", function () {
    advance("(variable)")
    this.first = expression(0)
    advance("\n");
    this.arity = "statement";
    return this;
  });
  stmt("leer", function () {
    advance("(variable)")
    this.first = expression(0)
    advance("\n");
    this.arity = "statement";
    return this;
  });

  stmt("si", function () {
      advance("(variable)");
      advance("==");
      this.first = expression(0);
      advance(":");
      this.second = block();
      this.third = null;
      this.arity = "statement";
      return this;
  });

  stmt(".veces", function () {
      advance(":");
      this.second = block();
      this.arity = "statement";
      return this;
  });

  return function (source) {
    tokensH = tokens(source);

    token_nr = 0;
    new_scope();
    advance();
    var s = statements();
    advance("(end)");
    scope.pop();
    return s;

  };
};

export default make_parse;