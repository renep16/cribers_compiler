"use strict";  // ECMAScript 5 strict mode

// Produce an array of simple token objects from a string.
// A simple token object contains these members:
//      type: 'id', 'string', 'number', 'operator', 'tab','bucle',
//      value: string or number value of the token
//      from: index of first character of the token
//      to: index of the last character + 1

// Comments are ignored.

RegExp.prototype.bexec = function (s) {

	var li = this.lastIndex;
	var m = this.exec(s);

	if (m && m.index == li)
		return m;
	return null;
}

export default function tokens(entrada) {
	var from;                   // The index of the start of the token.
	var i = 0;                  // The index of the current character.
	var n;                      // The number value.
	var m;                      // Matching
	var result = [];            // An array to hold the results.

	var WHITES = /[ \x0b\r\f]/g;
	var ID = /[A-Z]\w*/g;
	var NUM = /[-]?[0-9]+/g;
	var KEYWORD = /(imprimir|pasos|girar|saltar|leer|si$)/g;
	var DIR = /(d|i)/g;
	var STR = /^["][\w\W]*["]$/g;
	var TAB = /\t+/g
	var SALTO = /\n+/g
	var BUCLE = /\.veces/g
	var TWOCHAROPERATORS = /[=]{2,2}/g;
	var ONECHAROPERATORS = /(=|:)/g; 
	var tokens = [WHITES, KEYWORD, DIR, BUCLE,
		ID, NUM, STR, TAB, SALTO, TWOCHAROPERATORS, ONECHAROPERATORS];

	// Make a token object.
	var make = function (type, value) {
		return {
			type: type,
			value: value,
			from: from,
			to: i
		};
	};

	var getTok = function () {
		var str = m[0];
		i += str.length; // Warning! side effect on i
		return str;
	};

	// Begin tokenization. If the source string is empty, return nothing.
	if (!entrada) return;

	// Loop through entrada text
	while (i < entrada.length) {
		tokens.forEach(function (t) { t.lastIndex = i; }); // Only ECMAScript5
		from = i;

		// Ignore whitespace and comments
		if (m = WHITES.bexec(entrada)) {
			getTok();
		}

		// tab
		else if (m = TAB.bexec(entrada)) {
			result.push(make('tab', getTok()));
		}
		// salto
		else if (m = SALTO.bexec(entrada)) {
			result.push(make('salto', getTok()));
		}

		// tab
		else if (m = BUCLE.bexec(entrada)) {

			result.push(make('bucle', getTok()));
		}

		// name.
		else if (m = ID.bexec(entrada)) {

			result.push(make('variable', getTok()));
		}
		// keyword
		else if (m = KEYWORD.bexec(entrada)) {

			result.push(make('keyword', getTok()));
		}
		// dir
		else if (m = DIR.bexec(entrada)) {

			result.push(make('dir', getTok()));
		}



		// number.
		else if (m = NUM.bexec(entrada)) {
			n = +getTok();

			if (isFinite(n)) {
				result.push(make('number', n));
			} else {
				make('number', m[0]).error("Bad number");
			}
		}

		// string
		else if (m = STR.bexec(entrada)) {
			result.push(make('string', getTok().replace(/^["']|["']$/g, '')));
		}

		// operators
		else if (m = TWOCHAROPERATORS.bexec(entrada) || (m = ONECHAROPERATORS.bexec(entrada))) {
			result.push(make('operator', getTok()));
		}

		else {

			throw " Syntax error: ('" + entrada.substr(i) + "') ";
		}
	}

	return result;
};

// const prueba = `
// 2.veces:
// 	pasos 5
// 	leer Nueva`

// console.log(prueba)
// console.log(tokens(prueba))