(function() {
    $("#menu-list option").each((index, option) => {
        $(`#combo-list option[value='${option.value}']`).remove();
    });

    $('#combo-to-menu').click((e) => {
        let selectedOpts = $('#combo-list option:selected');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#menu-list').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });

    $('#all-combo-to-menu').click((e) => {
        let selectedOpts = $('#combo-list option');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#menu-list').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });

    $('#menu-to-combo').click((e) => {
        let selectedOpts = $('#menu-list option:selected');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#combo-list').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });

    $('#all-menu-to-combo').click((e) => {
        let selectedOpts = $('#menu-list option');
        if (selectedOpts.length == 0) {
            e.preventDefault();
        }
        $('#combo-list').append($(selectedOpts).clone());
        $(selectedOpts).remove();
        e.preventDefault();
    });

    $('#save-menu').click((e) => {
        $("#menu-list option").each((index, option) => {
            option.selected = true;
        });
        $("#combo-list option").each((index, option) => {
            option.selected = true;
        });
    });
}(jQuery));

document.getElementById('edit-menu-link').href = `'${window.location.href}'`;
let categoriaCbx = document.getElementById('categoria-cbx');
let subcategoriaCbx = document.getElementById('subcategoria-cbx');
let itemCbx = document.getElementById('item-list');
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
    for (let i = 0; i < itemCbx.options.length; i++) {
        itemCbx.options[i].style.display = 'none';
        let selected_cat = categoriaCbx.options[categoriaCbx.selectedIndex].innerHTML;
        let selected_subcat = subcategoriaCbx.options[subcategoriaCbx.selectedIndex].innerHTML;

        if (selected_cat === 'Todas') {
            if (selected_subcat === 'Todas') {
                itemCbx.options[i].style.display = 'block';
            } else if (itemCbx.options[i].title.includes(selected_subcat)) {
                itemCbx.options[i].style.display = 'block';
            }
        } else if (itemCbx.options[i].title.includes(selected_cat)) {
            if (selected_subcat === 'Todas') {
                itemCbx.options[i].style.display = 'block';
            } else if (itemCbx.options[i].title.includes(selected_subcat)) {
                itemCbx.options[i].style.display = 'block';
            }
        }
    }
}
  
  updateSubcategorias();
  updateList();