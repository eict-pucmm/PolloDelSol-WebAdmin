const categoriaCbx = document.getElementById('categoria-cbx');
const subcategoriaCbx = document.getElementById('subcategoria-cbx');
const canceladoCbx = document.getElementById('cancelado-cbx');
const itemList = document.getElementById('item-list').rows;
let cat_selected;

let updateSubcategorias = () => {
  subcategoriaCbx.innerHTML = `<option value="Todas" selected>Todas</option>`;
  if (categoriaCbx.value != '') {
    cat_selected = categoriaCbx.options[categoriaCbx.selectedIndex].innerHTML;
    let id = categorias.find(checkSelectedCat).id_categoria;

    subcategorias.forEach(subcat => {
      if (subcat.id_categoria_padre == id) {
          let option = document.createElement("option");
          option.value = subcat.id_categoria;
          option.innerHTML = subcat.nombre;
          subcategoriaCbx.appendChild(option);
      }
    });
  } else {
    subcategorias.forEach(subcat => {
      let option = document.createElement("option");
      option.value = subcat.id_categoria;
      option.innerHTML = subcat.nombre;
      subcategoriaCbx.appendChild(option);
    });
  }
  updateList();
}

let checkSelectedCat = cat => {
  return cat.nombre == cat_selected;
}

let updateList = () => {
  for (let i = 0; i < itemList.length; i++) {
    itemList[i].style.display = 'none';
    let selected_cat = categoriaCbx.options[categoriaCbx.selectedIndex].innerHTML;
    let selected_subcat = subcategoriaCbx.options[subcategoriaCbx.selectedIndex].innerHTML;
    
    if (itemList[i].cells[5].innerHTML.includes(canceladoCbx.value)) {
      if (selected_cat === 'Todas') {
        if (selected_subcat === 'Todas') {
          itemList[i].style.display = 'table-row';
        } else if (itemList[i].cells[4].innerHTML == selected_subcat) {
          itemList[i].style.display = 'table-row';
        }
      } else if (itemList[i].cells[3].innerHTML == selected_cat) {
        if (selected_subcat === 'Todas') {
          itemList[i].style.display = 'table-row';
        } else if (itemList[i].cells[4].innerHTML == selected_subcat) {
          itemList[i].style.display = 'table-row';
        }
      }
    }
  }
}

updateSubcategorias();
updateList();