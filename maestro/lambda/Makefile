build: clean
	mkdir ./out
	GOARCH=arm64 GOOS=linux CGO_ENABLED=0 go build -tags lambda.norpc -o out/bootstrap main.go
	cd ./out && zip package.zip bootstrap && cd ../ && rm ./out/bootstrap

clean:
	go clean
	rm -rf out || true