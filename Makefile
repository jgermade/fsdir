#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

js:
	@echo "building js"

json:
	@echo "building json"

watch:
	./watchdir src \
		--when "{,**/}*.js" "make js" \
		--when "{,**/}*.json" "make json" \
		--then "echo 'all when detected has finished'"

publish:
	git pull --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch)
	git push --tags
	npm publish --access public
