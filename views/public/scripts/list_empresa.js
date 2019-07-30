const table = document.getElementById("empresa-table");
let tableRows = table.getElementsByTagName("tr");
let inputRNC, inputNombre;

const filter = () => {

    let rncCell, nombreCell, rncText, nombreText;
    inputRNC = document.getElementById("filtro-rnc").value;
    inputNombre = document.getElementById("filtro-nombre").value;

    for (let i = 0; i < tableRows.length; i++) {
      rncCell = tableRows[i].getElementsByTagName("td")[0];
      nombreCell = tableRows[i].getElementsByTagName("td")[1];

      if (rncCell && nombreCell) {
        rncText = rncCell.innerHTML;
        nombreText = nombreCell.innerHTML;

        if (rncText.includes(inputRNC) && nombreText.includes(inputNombre)) {
          tableRows[i].style.display = "table-row";
        } else {
          tableRows[i].style.display = "none";
        }
      } 
    }
  }