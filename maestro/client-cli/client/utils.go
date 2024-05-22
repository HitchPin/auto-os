package client

import (
	"fmt"
	"os"
)

func WriteStringToFile(str string, filePath string) error {
	f, err := os.Create(filePath)
	if err != nil {
		fmt.Println(err)
		return err
	}
	_, err = f.WriteString(str)
	if err != nil {
		fmt.Println(err)
		f.Close()
		return err
	}
	err = f.Close()
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
