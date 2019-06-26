let result_message = document.getElementById('result-message');
if (result_message) {
    let message = result_message.innerHTML;

    if (message.includes('ER_DUP_ENTRY')) {
        result_message.innerHTML = 'ERROR: Ya existe un item con el Id = "' + 
            message.substring(message.indexOf("'") + 1, message.indexOf("'", message.indexOf("'") + 1)) + '"';
    }
}

let categoriaCbx = document.getElementById('categoria-cbx');
let subcategoriaCbx = document.getElementById('subcategoria-cbx');
let combo_card = document.getElementById('combo-card');

function checkSelectedCat(cat) {
    return cat.nombre == cat_selected;
}

function updateSubcategorias () {
    subcategoriaCbx.innerText = '';
    cat_selected = categoriaCbx.options[categoriaCbx.selectedIndex].innerHTML;
    if (cat_selected === 'Combo') {
        combo_card.style.display = 'flex';
    }else{
        combo_card.style.display = 'none';
    }
    let id = categorias.find(checkSelectedCat).id_categoria;
    subcategorias.forEach(function (subcat) {
        if (subcat.id_categoria_padre == id) {
            let option = document.createElement("option");
            option.value = subcat.id_categoria;
            option.innerHTML = subcat.nombre;
            subcategoriaCbx.appendChild(option);
        }
    });
}

let setSelectedComboBox = (comboBox, nombre) => {
    for (let i = 0; i < comboBox.options.length; i++) {
        if (comboBox.options[i].innerHTML === nombre) {
            comboBox.options[i].selected = 'selected'
        }
    }
}

if (document.getElementById('reg-button').innerHTML === 'Modificar') {
    document.getElementById('id-item').disabled = true;
    // categoriaCbx.disabled = true;
    updateSubcategorias();
    setSelectedComboBox(subcategoriaCbx, item.subcategoria);
} else {
    let cat_selected = '';
    updateSubcategorias();
}

let max_guarnicion = document.getElementById('max-guarnicion');
let max_bebida = document.getElementById('max-bebida');
let lista_guarnicion = document.getElementById('lista-guarnicion');
let lista_bebida = document.getElementById('lista-bebida');

function updateGuarniciones() {
    let guarniciones = lista_guarnicion.getElementsByTagName('input');
    if (max_guarnicion.value < max_guarnicion.max) {
        guarniciones[0].checked = false;
    }else {
        guarniciones[0].checked = true;
    }
}

function updateBebidas() {
    if (max_bebida.value < max_bebida.max) {
        console.log(lista_guarnicion);
    }
}