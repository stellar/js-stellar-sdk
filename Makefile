# XDR schema regeneration.
#
# xdr/xdr.json is the canonical schema graph consumed by tools/xdrgen/generate.mjs
# (which emits the classes in src/xdr/generated/). It is produced by the
# `generator-definitions-json` tool from stellar/rs-stellar-xdr, run over the
# protocol .x files fetched from stellar/stellar-xdr at the commit pinned in
# $(XDR_COMMIT). The generator is built and run inside the Docker image pinned
# by $(RUST_IMAGE), so regenerating only needs docker, curl, and pnpm.
#
# Targets:
#   make [xdr]         regenerate xdr/xdr.json and src/xdr/generated/
#   make xdr-json      regenerate xdr/xdr.json only
#   make xdr-classes   regenerate src/xdr/generated/ only (pnpm run xdrgen)
#
# Taking a new protocol snapshot = bumping $(XDR_COMMIT) (a stellar/stellar-xdr
# main-branch commit) and rerunning `make`. Protocol changes that upstream
# still gates behind `#ifdef CAP_00XX` are excluded unless their feature
# symbols are listed in $(XDR_FEATURES) (comma-separated, lowercase), so
# individual gated CAPs can be cherry-picked; once upstream ungates a CAP it
# is always included.
#
# Notes:
#   - The recorded per-file sha256 values are computed by the generator over
#     content with #ifdef blocks and all whitespace stripped, not the raw bytes.
#   - The generator records input paths in its `files` list, so the .x files
#     are staged under $(BUILD)/stage/xdr/ to keep them as `xdr/Stellar-*.x`.

# Pinned stellar/stellar-xdr commit the schema is generated from.
XDR_REPO   ?= https://github.com/stellar/stellar-xdr
XDR_COMMIT ?= 9c9c145953e80990d6ff1ae3a6a973a0ce6d0694

# Pinned stellar/rs-stellar-xdr commit providing generator-definitions-json.
RS_XDR_REPO ?= https://github.com/stellar/rs-stellar-xdr
RS_XDR_REF  ?= 3305b3e31f19fdb4e64e4b7a4354bb120cdf4415

# Feature symbols resolving #ifdef-gated protocol changes, e.g. cap_0083.
XDR_FEATURES ?=

# Rust toolchain image, pinned by digest so the build stays reproducible
# (rust:slim is a mutable tag). Currently rustc 1.97.1. To move it:
#   docker buildx imagetools inspect rust:slim   # copy the Digest line
# then paste the digest below and rerun `make`.
RUST_IMAGE ?= rust:slim@sha256:5c6f46a6e4472ab1ca7ba7d494e6677f2f219ebc02f32025d3986f057635ec9c

BUILD := .xdr-build

# The protocol file set, matching stellar/stellar-xdr.
XDR_FILES := \
	Stellar-SCP.x \
	Stellar-contract-config-setting.x \
	Stellar-contract-env-meta.x \
	Stellar-contract-meta.x \
	Stellar-contract-spec.x \
	Stellar-contract.x \
	Stellar-exporter.x \
	Stellar-internal.x \
	Stellar-ledger-entries.x \
	Stellar-ledger.x \
	Stellar-overlay.x \
	Stellar-transaction.x \
	Stellar-types.x

.PHONY: xdr xdr-json xdr-classes

# xdr-json must finish before xdr-classes reads xdr/xdr.json.
.NOTPARALLEL:

xdr: xdr-json xdr-classes

# Download the pinned commit as a single tarball so every file comes from the
# same revision, then run the pinned generator over it in a container.
xdr-json:
	rm -rf $(BUILD)/stage
	mkdir -p $(BUILD)/stage/xdr
	curl -fsSL "$(XDR_REPO)/archive/$(XDR_COMMIT).tar.gz" | tar -xz -C $(BUILD)/stage --strip-components=1
	@for f in $(XDR_FILES); do \
		test -s "$(BUILD)/stage/$$f" || { echo "error: $$f missing or empty in $(XDR_COMMIT)" >&2; exit 1; }; \
		mv "$(BUILD)/stage/$$f" "$(BUILD)/stage/xdr/$$f"; \
	done
	docker run --rm -v "$$PWD/$(BUILD)/stage":/wd -w /wd \
		-e OUT_UID="$$(id -u)" -e OUT_GID="$$(id -g)" $(RUST_IMAGE) /bin/bash -c '\
		set -e && \
		apt-get update -qq && apt-get install -y -qq git >/dev/null && \
		git clone -q $(RS_XDR_REPO) /tmp/rs && \
		git -C /tmp/rs checkout -q $(RS_XDR_REF) && \
		cargo build --quiet --release --locked \
			--manifest-path /tmp/rs/xdr-generator-rust/Cargo.toml \
			-p generator-definitions-json && \
		/tmp/rs/xdr-generator-rust/target/release/generator-definitions-json \
			$(foreach f,$(XDR_FILES),-i xdr/$(f)) \
			$(if $(XDR_FEATURES),--feature $(XDR_FEATURES)) \
			-o xdr.json && \
		chown "$$OUT_UID:$$OUT_GID" xdr.json'
	mv $(BUILD)/stage/xdr.json xdr/xdr.json
	@echo "wrote xdr/xdr.json (stellar-xdr @ $(XDR_COMMIT))"

xdr-classes:
	pnpm run xdrgen
