// Rewrites relative imports of `./http-client/index.js` (or `./http-client`
// before the .js-extension codemod) to `./http-client/axios.js` so the axios
// variant of the Node/browser build wires every downstream consumer to the
// axios re-export without runtime branching. Applied only when USE_AXIOS=true.
// Paths already pointing at sibling files (e.g. `./http-client/types.js`,
// `./http-client/axios.js`) are left untouched.
export default function aliasHttpClient() {
const patterns = [
    { match: /(^|\/)http-client\/index\.js$/, replace: "$1http-client/axios.js" },
    { match: /(^|\/)http-client$/, replace: "$1http-client/axios" },
  ];
  const rewrite = (value) => {
    for (const { match, replace } of patterns) {
      if (match.test(value)) return value.replace(match, replace);
    }
    return value;
  };

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
