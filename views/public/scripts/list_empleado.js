const employeeList = document.getElementById('employee-list').rows;
const rolCbx = document.getElementById('rol-cbx');

let updateList = () => {
    const canceladoCbx = document.getElementById('cancelado-cbx');
    const rol = rolCbx.options[rolCbx.selectedIndex].innerHTML;
    
    for (let i = 0; i < employeeList.length; i++) {
        employeeList[i].style.display = 'none';
      
      if (employeeList[i].title.includes(canceladoCbx.value)) {
        if (rol === "Todos") {
            employeeList[i].style.display = 'table-row';
        } else if (employeeList[i].title.includes(rol)) {
            employeeList[i].style.display = 'table-row';
        }
      }
    }
  }