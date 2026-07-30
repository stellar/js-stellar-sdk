#!/usr/bin/env python3
"""Post-process xdrgen JS output to inline xdr.const values at usage sites.

xdrgen master emits `xdr.const("NAME", N);` to register a constant in the
xdr namespace, then uses the bare identifier later (`xdr.string(NAME)`).
But `@stellar/js-xdr`'s TypeBuilder.const() does not put NAME into JS scope,
so the bare identifier ReferenceErrors at runtime.

Injecting `var NAME = N;` at the IIFE top fixes runtime but gets DCE'd by
terser in the production browser dist. The robust fix is to inline the
literal at each usage site so there's no identifier for terser to drop.

The `xdr.const("NAME", N);` declaration itself is left untouched: the NAME
there is a string literal (preceded by a quote), so the negative lookbehind
below skips it. Constants only referenced via `xdr.lookup("NAME")` string
lookups are likewise untouched.
"""
import re
import pathlib
import sys


def inline_consts(path: pathlib.Path) -> int:
    s = path.read_text()
    consts = dict(re.findall(
        r'xdr\.const\("([A-Z][A-Z0-9_]+)",\s*(0x[0-9a-fA-F]+|\d+)\);', s
    ))
    n_replaced = 0
    for name, value in consts.items():
        # Replace bare identifier (not preceded by quote or word char,
        # not followed by quote or word char). This skips string literals
        # like "NAME" and xdr.lookup("NAME"), so the xdr.const(...)
        # declaration's string name is preserved.
        new_s, count = re.subn(
            rf'(?<![\w"\'$]){re.escape(name)}(?![\w"\'$])',
            value,
            s,
        )
        if count > 0:
            s = new_s
            n_replaced += count
    path.write_text(s)
    return n_replaced


if __name__ == "__main__":
    files = sys.argv[1:] or [
        "src/base/generated/curr_generated.js",
        "src/base/generated/next_generated.js",
    ]
    for f in files:
        p = pathlib.Path(f)
        n = inline_consts(p)
        print(f"{f}: inlined {n} bare-identifier const reference(s)")
