#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash

.PHONY: watch
.SILENT:

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef FORCE_COLOR
  export FORCE_COLOR=true
endif

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

lint:
	eslint 'src/{,**/}*.{js,ts}'

bundle: src/*.ts
	for file in $^ ; do \
		echo "bundling: $${file}"; \
		esbuild $${file} --outdir=dist \
			--format=cjs; \
	done

typescript.declarations:
	echo "generating typescript declarations"; \
	tsc src/*.ts --outDir dist \
		--declaration \
		--allowJs \
		--emitDeclarationOnly \
		--esModuleInterop

build: bundle typescript.declarations
	cp package.json dist

publish:
	git pull origin $(git_branch) --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) --tags
	npm publish --access public
