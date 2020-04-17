SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash

js:
	@echo "building json"

json:
	@echo "building json"

watch:
	./watchdir src \
		--when "{,**/}*.js" "make js" \
		--when "{,**/}*.json" "make json" \
		--then "echo 'all when detected has finished'"
