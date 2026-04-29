// Copyright 2024 Stellar Development Foundation and contributors. Licensed
// under the Apache License, Version 2.0. See the COPYING file at the root
// of this distribution or at http://www.apache.org/licenses/LICENSE-2.0

%#include "xdr/Stellar-ledger.h"

namespace stellar
{

// Batch of ledgers along with their transaction metadata
struct LedgerCloseMetaBatch
{
    // starting ledger sequence number in the batch
    uint32 startSequence;

    // ending ledger sequence number in the batch
    uint32 endSequence;

    // Ledger close meta for each ledger within the batch
    LedgerCloseMeta ledgerCloseMetas<>;
};

}
