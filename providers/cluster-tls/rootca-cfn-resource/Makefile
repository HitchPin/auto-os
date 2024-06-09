.PHONY: build test clean

build:
	TAGS=logging make -f makebuild  # this runs build steps required by the cfn cli

test:
	cfn generate
	env make GOOS=linux go build -ldflags="-s -w" -tags="lambda.norpc,logging" -o bin/bootstrap cmd/main.go

clean:
	rm -rf bin
