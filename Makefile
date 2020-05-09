#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash

.PHONY: watch
.SILENT:

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

lint:
	eslint .

publish:
	git pull origin $(git_branch) --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) --tags
	npm publish --access public
