build: clean
	mkdir ./out
	mkdir ./out/x64
	mkdir ./out/arm64
	GOARCH=arm64 GOOS=linux CGO_ENABLED=0 go build -o out/arm64/maestro-admin main.go
	GOARCH=arm64 GOOS=darwin CGO_ENABLED=0 go build -o out/arm64/mac-maestro-admin main.go
	GOARCH=amd64 GOOS=darwin CGO_ENABLED=0 go build -o out/x64/mac-maestro-admin main.go

clean:
	go clean
	rm -rf out || true