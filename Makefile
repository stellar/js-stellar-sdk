# Protocol 28 / CAP-0085 (externally managed contract executables) pre-release.
# The `next` channel pins stellar-xdr#308 head (76218a99) and enables
# CAP_0085_EXECUTABLE_REF via `stellar-xdr xfile preprocess` before xdrgen
# (the Ruby xdrgen used here does not understand #ifdef). CAP_0085_EXECUTABLE_REF
# is gated to `next` only: the new SCVal/ContractExecutable arms are not enabled
# on `curr` until protocol 28 ships, so `curr` deliberately stays pinned at
# 68fa1ac5 with no features.
XDR_BASE_URL_CURR=https://github.com/stellar/stellar-xdr/raw/68fa1ac55692f68ad2a2ca549d0a283273554439
XDR_BASE_LOCAL_CURR=xdr/curr
XDR_FEATURES_CURR=
XDR_FILES_CURR= \
	Stellar-SCP.x \
	Stellar-ledger-entries.x \
	Stellar-ledger.x \
	Stellar-overlay.x \
	Stellar-transaction.x \
	Stellar-types.x \
	Stellar-contract.x \
	Stellar-contract-env-meta.x \
	Stellar-contract-meta.x \
	Stellar-contract-spec.x \
	Stellar-contract-config-setting.x \
	Stellar-exporter.x
XDR_FILES_LOCAL_CURR=$(addprefix xdr/curr/,$(XDR_FILES_CURR))

XDR_BASE_URL_NEXT=https://github.com/stellar/stellar-xdr/raw/76218a994f8c5ba752cba368080fb2f89843ad3c
XDR_BASE_LOCAL_NEXT=xdr/next
XDR_FEATURES_NEXT=CAP_0085_EXECUTABLE_REF
XDR_FILES_NEXT= \
	Stellar-SCP.x \
	Stellar-ledger-entries.x \
	Stellar-ledger.x \
	Stellar-overlay.x \
	Stellar-transaction.x \
	Stellar-types.x \
	Stellar-contract.x \
	Stellar-contract-env-meta.x \
	Stellar-contract-meta.x \
	Stellar-contract-spec.x \
	Stellar-contract-config-setting.x \
	Stellar-exporter.x
XDR_FILES_LOCAL_NEXT=$(addprefix xdr/next/,$(XDR_FILES_NEXT))

XDRGEN_COMMIT=master
DTSXDR_COMMIT=master
PNPM_VERSION=10.28.0

all: generate

generate: src/base/generated/curr_generated.js src/base/generated/curr.d.ts src/base/generated/next_generated.js src/base/generated/next.d.ts

src/base/generated/curr_generated.js: $(XDR_FILES_LOCAL_CURR)
	mkdir -p $(dir $@)
	> $@
	docker run -it --rm -v $$PWD:/wd -w /wd ruby:3.1 /bin/bash -c '\
		gem install specific_install -v 0.3.8 && \
		gem specific_install https://github.com/stellar/xdrgen.git -b $(XDRGEN_COMMIT) && \
		xdrgen --language javascript --namespace curr --output src/base/generated $^ \
		'
	python3 scripts/post-process-generated.py $@

src/base/generated/next_generated.js: $(XDR_FILES_LOCAL_NEXT)
	mkdir -p $(dir $@)
	> $@
	docker run -it --rm -v $$PWD:/wd -w /wd ruby:3.1 /bin/bash -c '\
		gem install specific_install -v 0.3.8 && \
		gem specific_install https://github.com/stellar/xdrgen.git -b $(XDRGEN_COMMIT) && \
		xdrgen --language javascript --namespace next --output src/base/generated $^ \
		'
	python3 scripts/post-process-generated.py $@

src/base/generated/curr.d.ts: src/base/generated/curr_generated.js
	docker run -it --rm -v $$PWD:/wd -w / --entrypoint /bin/sh node:22-alpine -c '\
		apk add --update git && \
		corepack enable && \
		corepack prepare pnpm@$(PNPM_VERSION) --activate && \
		git clone --depth 1 https://github.com/stellar/dts-xdr -b $(DTSXDR_COMMIT) --single-branch && \
		cd /dts-xdr && \
		printf "onlyBuiltDependencies:\n  - dts-dom\n" > pnpm-workspace.yaml && \
		pnpm install && \
		OUT=/wd/$@ pnpm exec jscodeshift -t src/transform.js /wd/$< && \
		cd /wd && \
		pnpm exec prettier --write /wd/$@ \
		'

src/base/generated/next.d.ts: src/base/generated/next_generated.js
	docker run -it --rm -v $$PWD:/wd -w / --entrypoint /bin/sh node:22-alpine -c '\
		apk add --update git && \
		corepack enable && \
		corepack prepare pnpm@$(PNPM_VERSION) --activate && \
		git clone --depth 1 https://github.com/stellar/dts-xdr -b $(DTSXDR_COMMIT) --single-branch && \
		cd /dts-xdr && \
		printf "onlyBuiltDependencies:\n  - dts-dom\n" > pnpm-workspace.yaml && \
		pnpm install && \
		OUT=/wd/$@ pnpm exec jscodeshift -t src/transform.js /wd/$< && \
		cd /wd && \
		pnpm exec prettier --write /wd/$@ \
		'

clean:
	rm -f src/base/generated/*

$(XDR_FILES_LOCAL_CURR):
	mkdir -p $(dir $@)
	curl -L -o $@ $(XDR_BASE_URL_CURR)/$(notdir $@)
	stellar-xdr xfile preprocess --features "$(XDR_FEATURES_CURR)" $@ > $@.pp && mv -f $@.pp $@

$(XDR_FILES_LOCAL_NEXT):
	mkdir -p $(dir $@)
	curl -L -o $@ $(XDR_BASE_URL_NEXT)/$(notdir $@)
	stellar-xdr xfile preprocess --features "$(XDR_FEATURES_NEXT)" $@ > $@.pp && mv -f $@.pp $@
reset-xdr:
	rm -f xdr/*/*.x
	rm -f src/base/generated/*.js
	rm -f types/curr.d.ts
	rm -f types/next.d.ts
	$(MAKE) generate
