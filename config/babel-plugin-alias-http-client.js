export default function aliasHttpClient() {

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
