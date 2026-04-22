// Rewrites relative imports of `./http-client` (or `../http-client`, etc.) to
// `./http-client/axios` so the axios variant of the Node/browser build wires
// every downstream consumer to the axios re-export without runtime branching.
// Applied only when USE_AXIOS=true. Paths already pointing inside the
// http-client directory (e.g. `./http-client/types`, `./http-client/axios`)
// are left untouched.
module.exports = function aliasHttpClient() {
  const isHttpClientIndex = (value) => /(^|\/)http-client$/.test(value);
  const rewrite = (value) =>
    isHttpClientIndex(value) ? `${value}/axios` : value;

  return {
    name: "alias-http-client",
    visitor: {
      ImportDeclaration(path) {
        path.node.source.value = rewrite(path.node.source.value);
      },
      ExportAllDeclaration(path) {
        if (path.node.source) {
          path.node.source.value = rewrite(path.node.source.value);
        }
      },
      ExportNamedDeclaration(path) {
        if (path.node.source) {
          path.node.source.value = rewrite(path.node.source.value);
        }
      },
      CallExpression(path) {
        const { node } = path;
        if (
          node.callee &&
          node.callee.name === "require" &&
          node.arguments[0] &&
          node.arguments[0].type === "StringLiteral"
        ) {
          node.arguments[0].value = rewrite(node.arguments[0].value);
        }
      },
    },
  };
};
