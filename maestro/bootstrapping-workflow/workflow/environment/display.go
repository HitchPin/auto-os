package environment

import (
	"reflect"
	"strconv"

	"github.com/pterm/pterm"
)

func (roleAsgs RoleAsgs) PrintTable() error {

	td := pterm.TableData{
		{"Cluster Role", "Auto-scaling Group Name", "Instance Type", "AMI", "Desired Capacity", "Actual Capacity", "Min Capacity", "Max Capacity", "Exposed to Load Balancer"},
	}
	roleAsgsT := reflect.TypeOf(roleAsgs)
	for i := 0; i < roleAsgsT.NumField(); i++ {
		pv := reflect.ValueOf(roleAsgs).Field(i)
		if pv.Kind() != reflect.Ptr {
			continue
		}
		if pv.IsNil() {
			continue
		}
		roleAsg := *pv.Interface().(*RoleAsg)
		td = append(td, roleAsg.ToRow())
	}

	pterm.DefaultTable.WithHasHeader().WithRowSeparator("-").WithHeaderRowSeparator("-").WithData(td).Render()
	return nil
}

func (rasg RoleAsg) ToRow() []string {
	var exposed string
	if rasg.ExposedToLb {
		exposed = "Yes"
	} else {
		exposed = "No"
	}
	return []string{
		rasg.Role,
		rasg.Name,
		rasg.InstanceType,
		rasg.AmiId + " (" + rasg.AmiName + ")",
		strconv.Itoa(rasg.CurCapacity),
		strconv.Itoa(rasg.ActualCapacity),
		strconv.Itoa(rasg.MinCapacity),
		strconv.Itoa(rasg.MaxCapacity),
		exposed,
	}
}
