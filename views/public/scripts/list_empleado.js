document.getElementById('filtro-cbx').onchange = function() {
    let rol = document.getElementById('filtro-cbx');
    let selected_rol;
    if(rol.value != ""){
        if(rol.value == 'Cajero') {
            console.log('Cajeros')
            selected_rol = rol.options[rol.selectedIndex].innerHTML;
        //   let cajeros = data.filter(cajero => data.rol === 'Cajero');
        //   console.log(cajeros);
        } else if(rol.value == 'Delivery') {
            console.log('Deslivery')
        }
    }
  }

console.log('inside filter cbx changes');
