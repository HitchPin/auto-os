package environment

import (
	"errors"
	"fmt"
	"github.com/pterm/pterm"
)

func (discoEnv DiscoveredEnvironment) RunSafetyChecks() error {

	clusterModeSpinner, _ := pterm.DefaultSpinner.Start("Verifying cluster is in bootstrapping mode...")
	err := discoEnv.VerifyClusterInBootstrappingMode()
	if err == nil {
		clusterModeSpinner.Success("Cluster mode check successful!")
	} else {
		clusterModeSpinner.Fail(err.Error())
		return err
	}

	instanceCountZeroSpinner, _ := pterm.DefaultSpinner.Start("Verifying ASGs have no instances...")
	err = discoEnv.VerifyRunningInstanceCountZero()
	if err == nil {
		instanceCountZeroSpinner.Success("ASGs are empty!")
	} else {
		instanceCountZeroSpinner.Fail(err.Error())
		return err
	}
	return nil
}

func (discoEnv DiscoveredEnvironment) VerifyClusterInBootstrappingMode() error {
	if discoEnv.conf.GetClusterMode() != "bootstrapping" {
		return errors.New("Cluster is not in bootstrapping mode! Try:\n\t\tmaestro-admin conf set-cluster-mode --bootstrapping")
	}
	return nil
}

func (discoEnv DiscoveredEnvironment) VerifyRunningInstanceCountZero() error {
	asgs := discoEnv.AsgsByRole.All()
	for _, asg := range asgs {
		if asg.CurCapacity > 0 {
			return errors.New(fmt.Sprintf("ASG %s for role %s has a desired capacity of %s.", asg.Name, asg.Role, asg.CurCapacity))
		}
		if asg.ActualCapacity > 0 {
			return errors.New(fmt.Sprintf("ASG %s for role %s has %s instances in it.", asg.Name, asg.Role, asg.ActualCapacity))
		}
	}
	return nil
}
