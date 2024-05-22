package environment

import (
	"context"
	"reflect"
	"strings"

	"github.com/HitchPin/maestro/bootstrapping-workflow/configuration"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
)

type RoleAsg struct {
	conf           configuration.ExecutionConfiguration
	Name           string
	Role           string
	CurCapacity    int
	MinCapacity    int
	MaxCapacity    int
	ActualCapacity int
	ExposedToLb    bool
	InstanceType   string
	AmiId          string
	AmiName        string
}

type RoleAsgs struct {
	conf           configuration.ExecutionConfiguration
	Bootstrapping  *RoleAsg
	ClusterManager *RoleAsg
	Data           *RoleAsg
	Ingest         *RoleAsg
	ML             *RoleAsg
	Coordinator    *RoleAsg
	Search         *RoleAsg
}

type DiscoveredEnvironment struct {
	conf       configuration.ExecutionConfiguration
	AsgsByRole RoleAsgs
}

func (rasgs RoleAsgs) All() []RoleAsg {
	all := []RoleAsg{}
	roleAsgsT := reflect.TypeOf(rasgs)
	for i := 0; i < roleAsgsT.NumField(); i++ {
		pv := reflect.ValueOf(rasgs).Field(i)
		if pv.Kind() != reflect.Ptr {
			continue
		}
		if pv.IsNil() {
			continue
		}
		roleAsg := *pv.Interface().(*RoleAsg)
		all = append(all, roleAsg)
	}
	return all
}
func (rasgs RoleAsgs) AllExceptBootstrap() []RoleAsg {
	allExcept := []RoleAsg{}
	all := rasgs.All()
	for _, r := range all {
		if !strings.Contains(r.Name, "bootstrap") {
			allExcept = append(allExcept, r)
		}
	}
	return allExcept
}
func (de DiscoveredEnvironment) SetClusterModeToLaunched() error {
	overwrite := true
	paramVal := "launched"
	ssmClient := ssm.NewFromConfig(de.conf.Cloud.AwsConf)
	_, err := ssmClient.PutParameter(context.TODO(), &ssm.PutParameterInput{
		Name:      &de.conf.Params.ClusterMode,
		Value:     &paramVal,
		Overwrite: &overwrite,
	})
	if err != nil {
		return err
	}
	return nil
}
