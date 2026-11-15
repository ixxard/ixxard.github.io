# Everyday commands. `make` alone lists them.
HUGO ?= hugo

help:            ## list commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-8s %s\n", $$1, $$2}'

dev:             ## live preview with drafts at http://localhost:1313
	$(HUGO) server -D --navigateToChanged

build:           ## production build into ./public (what GitHub Pages serves)
	$(HUGO) --gc --minify

part:            ## new series part      make part series=hvf slug=00b-devices
	@test -n "$(series)" -a -n "$(slug)" || { echo "usage: make part series=hvf slug=00b-devices"; exit 1; }
	$(HUGO) new content --kind part series/$(series)/$(slug)/index.md

series:          ## new series           make series series=winhv
	@test -n "$(series)" || { echo "usage: make series series=winhv"; exit 1; }
	$(HUGO) new content --kind series series/$(series)/_index.md

post:            ## new standalone post  make post slug=why-hv-denied
	@test -n "$(slug)" || { echo "usage: make post slug=my-post"; exit 1; }
	$(HUGO) new content --kind post posts/$(slug)/index.md

note:            ## new dated note       make note slug=esr-decoding
	@test -n "$(slug)" || { echo "usage: make note slug=short-name"; exit 1; }
	$(HUGO) new content --kind note notes/$$(date +%Y-%m-%d)-$(slug).md

.PHONY: help dev build part series post note
