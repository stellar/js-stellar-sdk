XDR_BASE_URL_CURR=https://github.com/stellar/stellar-xdr/raw/9c9c145953e80990d6ff1ae3a6a973a0ce6d0694
XDR_BASE_LOCAL_CURR=xdr/curr
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

XDR_BASE_URL_NEXT=https://github.com/stellar/stellar-xdr/raw/9c9c145953e80990d6ff1ae3a6a973a0ce6d0694
XDR_BASE_LOCAL_NEXT=xdr/next
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

# Last stellar/xdrgen commit with the JavaScript generator; it was removed
# upstream in 6f2c5b8c (#233), so master no longer works for this repo.
XDRGEN_COMMIT=d54959f8949b8f354541bf0cc2af6a9130f0f3a9
DTSXDR_COMMIT=master
PNPM_VERSION=10.28.0

all: generate

generate: src/base/generated/curr_generated.js src/base/generated/curr.d.ts src/base/generated/next_generated.js src/base/generated/next.d.ts

src/base/generated/curr_generated.js: $(XDR_FILES_LOCAL_CURR)
	mkdir -p $(dir $@)
	> $@
	docker run -i --rm -v $$PWD:/wd -w /wd ruby:3.1 /bin/bash -c '\
		git clone https://github.com/stellar/xdrgen.git /xdrgen && \
		git -C /xdrgen checkout $(XDRGEN_COMMIT) && \
		gem build -C /xdrgen xdrgen.gemspec -o /tmp/xdrgen.gem && \
		gem install /tmp/xdrgen.gem && \
		xdrgen --language javascript --namespace curr --output src/base/generated $^ \
		'

src/base/generated/next_generated.js: $(XDR_FILES_LOCAL_NEXT)
	mkdir -p $(dir $@)
	> $@
	docker run -i --rm -v $$PWD:/wd -w /wd ruby:3.1 /bin/bash -c '\
		git clone https://github.com/stellar/xdrgen.git /xdrgen && \
		git -C /xdrgen checkout $(XDRGEN_COMMIT) && \
		gem build -C /xdrgen xdrgen.gemspec -o /tmp/xdrgen.gem && \
		gem install /tmp/xdrgen.gem && \
		xdrgen --language javascript --namespace next --output src/base/generated $^ \
		'

src/base/generated/curr.d.ts: src/base/generated/curr_generated.js
	docker run -i --rm -v $$PWD:/wd -w / --entrypoint /bin/sh node:22-alpine -c '\
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
	docker run -i --rm -v $$PWD:/wd -w / --entrypoint /bin/sh node:22-alpine -c '\
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
	stellar-xdr xfile preprocess --features "$(XDR_FEATURES)" $@ > $@.pp && mv -f $@.pp $@

$(XDR_FILES_LOCAL_NEXT):
	mkdir -p $(dir $@)
	curl -L -o $@ $(XDR_BASE_URL_NEXT)/$(notdir $@)
	stellar-xdr xfile preprocess --features "$(XDR_FEATURES)" $@ > $@.pp && mv -f $@.pp $@
reset-xdr:
	rm -f xdr/*/*.x
	rm -f src/base/generated/*.js
	rm -f types/curr.d.ts
	rm -f types/next.d.ts
	$(MAKE) generate
