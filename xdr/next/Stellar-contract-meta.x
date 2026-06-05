// Copyright 2022 Stellar Development Foundation and contributors. Licensed
// under the Apache License, Version 2.0. See the COPYING file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

// The contract meta XDR is highly experimental, incomplete, and still being
// iterated on. Breaking changes expected.

% #include "xdr/Stellar-types.h"
namespace stellar
{

struct SCMetaV0
{
    string key<>;
    string val<>;
};

enum SCMetaKind
{
    SC_META_V0 = 0
};

union SCMetaEntry switch (SCMetaKind kind)
{
case SC_META_V0:
    SCMetaV0 v0;
};

}
