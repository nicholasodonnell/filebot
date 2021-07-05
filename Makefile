help: ## usage
	@cat Makefile | grep -E '^[a-zA-Z_-]+:.*?## .*$$' | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## build docker image
	@docker build \
		--tag nicholasodonnell/filebot:latest \
		.

clean: ## remove docker images
	@docker rmi \
		--force \
			nicholasodonnell/filebot:latest

run: ## run filebot
	@docker run \
		--name filebot \
		--rm \
		--volume $(soureDirectoryHostPath):$(sourceDirectoryContainerPath) \
		--volume $(destinationDirectoryHostPath):$(destinationDirectoryContainerPath) \
		--volume $(snapshotPath):/snapshot.json \
		nicholasodonnell/filebot:latest \
			--source=$(sourceDirectoryContainerPath) \
			--destination=$(destinationDirectoryContainerPath) \
			--snapshot=/snapshot.json \
			--safeDelete=$(safeDelete) \
    	--permissions=$(permissions) \
    	--puid=$(puid) \
    	--pgid=$(pgid)

.PHONY: \
	help \
	build \
	clean \
	run
