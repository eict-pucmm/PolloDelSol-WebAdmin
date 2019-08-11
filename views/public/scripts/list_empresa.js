const aprobadaCbx = document.getElementById('aprobada-cbx');
let tableRows = document.getElementById('empresa-list').rows;
let inputRNC, inputNombre;

const filter = () => {

  inputRNC = document.getElementById("filtro-rnc").value;
  inputNombre = document.getElementById("filtro-nombre").value;

  for (let i = 0; i < tableRows.length; i++) {
    tableRows[i].style.display = "none";

    if (tableRows[i].cells[5].innerHTML.includes(aprobadaCbx.value)) {
      if (tableRows[i].cells[0].innerHTML.includes(inputRNC) && tableRows[i].cells[1].innerHTML.includes(inputNombre)) {
        tableRows[i].style.display = "table-row";
      }
    }
  }
}