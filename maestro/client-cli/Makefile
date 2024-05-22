build:
	mkdir -p ./out/arm64
	GOARCH=arm64 GOOS=linux CGO_ENABLED=0 go build -o out/arm64/maestro-cli main.go

build-x64:
	mkdir -p ./out/amd64
	GOARCH=amd64 GOOS=linux CGO_ENABLED=0 go build -o out/amd64/maestro-cli main.go

build-arm-mac:
	mkdir -p ./out/arm64
	GOARCH=arm64 GOOS=darwin CGO_ENABLED=0 go build -o out/arm64/mac-maestro-cli main.go

clean:
	go clean
	rm -rf out || true