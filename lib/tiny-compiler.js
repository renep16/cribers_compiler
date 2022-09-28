'use strict';

function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];
    if (!token) return

    //number
    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }
    //string
    if (token.type === 'string') {
      current++;
      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }
    //dir
    if (token.type === 'dir') {
      current++;
      return {
        type: 'NumberLiteral',
        value: (token.value === "d" ? 45 : -45),
      };
    }

    // keywords acciones
    if (token.type === 'keyword') {
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      while (
        (token.type !== 'salto')
      ) {
      
        if (token.type === 'variable') {
          node.params.push(walk());
          token = tokens[current];
          break
        } else {
          node.params.push(walk());
        }

        token = tokens[current];
        if (token === undefined) break;
      }
      if (node.name === 'pasos') {
        if (node.params.length == 0) {
          throw new Error("Debe especificar una variable o un numero de pasos")
        }
      }
      
      if (node.name === 'girar') {
        if (node.params.length == 0) {
          throw new Error("Debe especificar una dirección o un radio de giro")
        }
      }
      if (node.name === 'saltar') {
        if (node.params.length > 0) {
          throw new Error("Saltar no tiene parámetros")
        }
      }
      
      current++;
      return node;
    }

    // keywords acciones
    if (token.type === 'variable') {
      let node = {
        type: 'VariableExpression',
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      if (token.type === "operator" && token.value === "=") {
        token = tokens[++current];
        node.params.push(walk());
      } else {
      }

      current++;
      return node;
    }

    if (token.type === 'salto') {
      token = tokens[++current];
      // current++;
      return {
        type: 'SaltoExpression',
        name: '\n',
        params: [],
      };
    }

    if (token.type === "operator") {
      let node = {
        type: 'OperatorLiteral',
        name: token.value,
        params: [],
      };
      // token = tokens[++current];

      current++;
      return node;
    }

    if (token.type === "tab") {
      let node = {
        type: 'TabLiteral',
        name: token.value,
        params: [],
      };
      // token = tokens[++current];

      current++;
      return node;
    }

    // si acciones
    if (token.type === 'if') {
      let node = {
        type: 'IfExpression',
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      while ((token.type === 'operator' && token.value === ".")) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }

    // si acciones
    if (token.type == 'bucle') {
      let node = {
        type: 'BucleExpression',
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      while ((token.type === 'operator' && token.value === ":")) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }

    // Again, if we haven't recognized the token type by now we're going to give error
    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // At the end of our parser we'll return the AST.
  return ast;
}

/**
 * ============================================================================
 *                                 ⌒(❀>◞౪◟<❀)⌒
 *                               THE TRAVERSER!!!
 * ============================================================================
 */

function traverser(ast, visitor) {

  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {

    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {

      case 'Program':
        traverseArray(node.body, node);
        break;

      // Next we do the same with `CallExpression` and traverse their `params`.
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      // Next we do the same with `CallExpression` and traverse their `params`.
      case 'BucleExpression':
        traverseArray(node.params, node);
        break;

      case 'VariableExpression':
        traverseArray(node.params, node);
        break;

      case 'IfExpression':
        traverseArray(node.params, node);
        break;

      // In the cases of `NumberLiteral` and `StringLiteral` we don't have any
      // child nodes to visit, so we'll just break.
      case 'NumberLiteral':
      case 'StringLiteral':
      case 'SaltoExpression':
      case 'OperatorLiteral':
      case 'TabLiteral':
        break;

      // And again, if we haven't recognized the node type then we'll throw an
      // error.
      default:
        throw new TypeError(node.type);
    }

    // If there is an `exit` method for this node type we'll call it with the
    // `node` and its `parent`.
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // Finally we kickstart the traverser by calling `traverseNode` with our ast
  // with no `parent` because the top level of the AST doesn't have a parent.
  traverseNode(ast, null);
}

/**
 * ============================================================================
 *                                   ⁽(◍˃̵͈̑ᴗ˂̵͈̑)⁽
 *                              THE TRANSFORMER!!!
 * ============================================================================
 */

// So we have our transformer function which will accept the lisp ast.
function transformer(ast) {

  // We'll create a `newAst` which like our previous AST will have a program
  // node.
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  // We'll start by calling the traverser function with our ast and a visitor.
  traverser(ast, {

    // The first visitor method accepts any `NumberLiteral`
    NumberLiteral: {
      // We'll visit them on enter.
      enter(node, parent) {
        // We'll create a new node also named `NumberLiteral` that we will push to
        // the parent context.
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },

    // Next we have `StringLiteral`
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },

    // Next up, `CallExpression`.
    CallExpression: {
      enter(node, parent) {

        // We start creating a new node `CallExpression` with a nested
        // `Identifier`.
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        node._context = expression.arguments;


        if (parent.type !== 'CallExpression') {

          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
        // `context`.
        parent._context.push(expression);
      },
    },
    // Next up, `CallExpression`.
    BucleExpression: {
      enter(node, parent) {

        // We start creating a new node `BucleExpression` with a nested
        // `Identifier`.
        let expression = {
          type: 'BucleExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // Next we're going to define a new context on the original
        // `BucleExpression` node that will reference the `expression`'s arguments
        // so that we can push arguments.
        node._context = expression.arguments;

        // Then we're going to check if the parent node is a `BucleExpression`.
        // If it is not...
        if (parent.type !== 'BucleExpression') {

          // We're going to wrap our `BucleExpression` node with an
          // `ExpressionStatement`. We do this because the top level
          // `BucleExpression` in JavaScript are actually statements.
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
        // `context`.
        parent._context.push(expression);
      },
    },
    // Next up, `CallExpression`.
    VariableExpression: {
      enter(node, parent) {

        // We start creating a new node `CallExpression` with a nested
        // `Identifier`.
        let expression = {
          type: 'VariableExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: node.params,
        };

        // Next we're going to define a new context on the original
        // `CallExpression` node that will reference the `expression`'s arguments
        // so that we can push arguments.
        node._context = expression.arguments;

        // Then we're going to check if the parent node is a `CallExpression`.
        // If it is not...
        if (parent.type !== 'VariableExpression') {

          // We're going to wrap our `CallExpression` node with an
          // `ExpressionStatement`. We do this because the top level
          // `CallExpression` in JavaScript are actually statements.
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
        // `context`.
        parent._context.push(expression);
      },
    },
    IfExpression: {
      enter(node, parent) {

        // We start creating a new node `CallExpression` with a nested
        // `Identifier`.
        let expression = {
          type: 'IfExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        // Next we're going to define a new context on the original
        // `IfExpression` node that will reference the `expression`'s arguments
        // so that we can push arguments.
        node._context = expression.arguments;

        // Then we're going to check if the parent node is a `IfExpression`.
        // If it is not...
        if (parent.type !== 'IfExpression') {

          // We're going to wrap our `CallExpression` node with an
          // `ExpressionStatement`. We do this because the top level
          // `CallExpression` in JavaScript are actually statements.
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        // Last, we push our (possibly wrapped) `CallExpression` to the `parent`'s
        // `context`.
        parent._context.push(expression);
      },
    },
  });

  // if expression


  // At the end of our transformer function we'll return the new ast that we
  // just created.
  return newAst;
}

/**
 * ============================================================================
 *                               ヾ（〃＾∇＾）ﾉ♪
 *                            THE CODE GENERATOR!!!!
 * ============================================================================
 */


function codeGenerator(node) {

  // We'll break things down by the `type` of the `node`.

  switch (node.type) {

    // If we have a `Program` node. We will map through each node in the `body`
    // and run them through the code generator and join them with a newline.
    case 'Program':
      return "function main (){\n" + "\t" + node.body.map(codeGenerator)
        .join('\n\t') + "\n}";

    // For `ExpressionStatement` we'll call the code generator on the nested
    // expression and we'll add a semicolon...
    case 'ExpressionStatement':

      if (node.expression.type === "VariableExpression")
        return codeGenerator(node.expression)
      return (
        codeGenerator(node.expression) + ";"
        // << (...because we like to code the *correct* way)
      );


    case 'CallExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    case 'BucleExpression':
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    case 'IfExpression':
      console.log(node)
      return (
        codeGenerator(node.callee) +
        '(' +
        node.arguments.map(codeGenerator)
          .join(', ') +
        ')'
      );

    // variable
    case 'VariableExpression':
      if (node.arguments.length > 0)
        return (
          "var " + codeGenerator(node.callee) + " = " + codeGenerator(node.arguments[0]) + ";"
        )
      else
        return (
          codeGenerator(node.callee)
        )

    // For `Identifier` we'll just return the `node`'s name.
    case 'Identifier':
      return node.name;

    // For `NumberLiteral` we'll just return the `node`'s value.
    case 'NumberLiteral':
      return node.value;

    // For `StringLiteral` we'll add quotations around the `node`'s value.
    case 'StringLiteral':
      return '"' + node.value + '"';

    // And if we haven't recognized the node, we'll throw an error.
    default:
      throw new TypeError(node.type);
  }
}

/**
 * ============================================================================
 *                                  (۶* ‘ヮ’)۶”
 *                         !!!!!!!!THE COMPILER!!!!!!!!
 * ============================================================================
 */

function compiler(tokens) {
  // let tokens = tokenizer(input);
  let ast = parser(tokens);
  // console.log(ast)
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  // and simply return the output!
  return output;
}

/**
 * ============================================================================
 *                                   (๑˃̵ᴗ˂̵)و
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!YOU MADE IT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * ============================================================================
 */

// Now I'm just exporting everything...
module.exports = {
  parser,
  traverser,
  transformer,
  codeGenerator,
  compiler,
};