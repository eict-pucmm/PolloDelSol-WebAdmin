//error message from database
let result_message = document.getElementById('result-message');
let categoriaCbx = document.getElementById('categoria-cbx');
let subcategoriaCbx = document.getElementById('subcategoria-cbx');
let combo_card = document.getElementById('combo-card');
let max_guarnicion = document.getElementById('max-guarnicion');
let max_bebida = document.getElementById('max-bebida');
let lista_guarnicion = document.getElementById('lista-guarnicion');
let lista_bebida = document.getElementById('lista-bebida');
let guarnicionesCheckboxes = document.getElementsByName('guarniciones');
let bebidasCheckboxes = document.getElementsByName('bebidas');
let guarnicionesTodas = document.getElementById('guarniciones-todas');
let bebidasTodas = document.getElementById('bebidas-todas');

if (result_message) {
    let message = result_message.innerHTML;

    if (message.includes('ER_DUP_ENTRY')) {
        result_message.innerHTML = 'ERROR: Ya existe un item con el Id = "' + 
            message.substring(message.indexOf("'") + 1, message.indexOf("'", message.indexOf("'") + 1)) + '"';
    }
}
// set categories and subcategories
function checkSelectedCat(cat) {
    return cat.nombre == cat_selected;
}

function updateSubcategorias () {
    subcategoriaCbx.innerText = '';
    cat_selected = categoriaCbx.options[categoriaCbx.selectedIndex].innerHTML;
    document.getElementById('selected-category').value = cat_selected;
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

//combo data
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

//manage image
function readURL(input) {
    let url = input.value;
    let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
    let preview = document.getElementById('preview-image');
    let imageText = document.getElementById('image-text');

    if (input.files && input.files[0] && (ext == "png" || ext == "jpeg" || ext == "jpg")) {
        var fileName = url.split('fakepath' + String.fromCharCode(92)).pop();
        var reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            imageText.value = fileName;
        }
        reader.readAsDataURL(input.files[0]);
    }
    else{
        preview.src = '/images/placeholder.jpg';
        imageText.value = '';
    }
}

//guarniciones and bebidas checkboxes
let updateCheckedAll = todasInput => {
    if (todasInput.id === 'guarniciones-todas') {
        for (let i = 0; i < guarnicionesCheckboxes.length; i++) {
            guarnicionesCheckboxes[i].checked = guarnicionesTodas.checked;
        }
    } else if (todasInput.id === 'bebidas-todas') {
        for (let i = 0; i < bebidasCheckboxes.length; i++) {
            bebidasCheckboxes[i].checked = bebidasTodas.checked;
        }
    }
}

let checkAllChecked = inputCheckbox => {
    let allChecked = true, i = 0;

    if (inputCheckbox.name === 'guarniciones') {
        for (let i = 0; i < guarnicionesCheckboxes.length; i++) {
            if (!guarnicionesCheckboxes[i].checked) {
                allChecked = false;
                break;
            }
        }
        guarnicionesTodas.checked = allChecked ? true : false;
    } else if (inputCheckbox.name === 'bebidas') {
        for (let i = 0; i < bebidasCheckboxes.length; i++) {
            if (!bebidasCheckboxes[i].checked) {
                allChecked = false;
                break;
            }
        }
        bebidasTodas.checked = allChecked ? true : false;
    }
}

let setCheckBoxes = () => {
    for (let i = 0; i < guarnicionesCheckboxes.length; i++) {
        itemCombo.forEach(relation => {
            if (relation.id_item == guarnicionesCheckboxes[i].value) {
                guarnicionesCheckboxes[i].checked = true;
            }
        })
    }

    for (let i = 0; i < bebidasCheckboxes.length; i++) {
        itemCombo.forEach(relation => {
            if (relation.id_item == bebidasCheckboxes[i].value) {
                bebidasCheckboxes[i].checked = true;
            }
        })
    }

    checkAllChecked({name: 'bebidas'});
    checkAllChecked({name: 'guarniciones'});
}

//manage case Modificar
if (document.getElementById('reg-button').innerHTML === 'Modificar') {
    document.getElementById('id-item').disabled = true;
    updateSubcategorias();
    setSelectedComboBox(subcategoriaCbx, item.subcategoria);
    if (document.getElementById('selected-category').value == 'Combo') {
        setCheckBoxes();        
    }
} else {
    let cat_selected = '';
    updateSubcategorias();
}