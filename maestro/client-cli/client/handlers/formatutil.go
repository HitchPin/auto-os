package handlers

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"github.com/TylerBrock/colorjson"
	"os"
	"strings"
)

func PrintBody(body []byte, contentType string) error {
	lcct := strings.ToLower(contentType)
	if strings.Contains(lcct, "json") {
		return printJson(body)
	} else if strings.Contains(lcct, "text/plain") {
		fmt.Println(string(body))
		return nil
	} else {
		encoder := base64.NewEncoder(base64.StdEncoding, os.Stdout)
		encoder.Write(body)
		encoder.Close()
		return nil
	}
}

func printJson(body []byte) error {

	bodyStr := string(body)
	if strings.HasPrefix(strings.TrimSpace(bodyStr), "{") {
		bodyIface := map[string]interface{}{}
		err := json.Unmarshal(body, &bodyIface)
		if err != nil {
			return err
		}
		s, _ := colorjson.Marshal(bodyIface)
		fmt.Println(string(s))
	} else if strings.HasPrefix(strings.TrimSpace(bodyStr), "{") {
		bodyArr := []interface{}{}
		err := json.Unmarshal(body, &bodyArr)
		if err != nil {
			return err
		}
		s, _ := colorjson.Marshal(bodyArr)
		fmt.Println(string(s))
	} else {
		fmt.Println(bodyStr)
	}
	return nil
}
