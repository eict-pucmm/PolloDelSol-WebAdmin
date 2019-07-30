$.datepicker.regional['es'] = {
    closeText: 'Cerrar',
    prevText: '< Ant',
    nextText: 'Sig >',
    currentText: 'Hoy',
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene','Feb','Mar','Abr', 'May','Jun','Jul','Ago','Sep', 'Oct','Nov','Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom','Lun','Mar','Mié','Juv','Vie','Sáb'],
    dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sá'],
    weekHeader: 'Sm',
    dateFormat: 'dd-mm-yy',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: false,
    yearSuffix: ''
};
$.datepicker.setDefaults($.datepicker.regional['es']);

$(function () {
    $("#datepicker").datepicker();
});

document.getElementById('edit-enterprise-link').href = `'${window.location.href}'`;

function updateCierre() {
    if (document.getElementById('tipo-de-cierre').value == 'Semanal') {
        document.getElementById('dia-de-cierre-cbx').style.display = 'block';
        document.getElementById('datepicker').style.display = 'none';
        document.getElementById('datepicker').value = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    } else {
        document.getElementById('datepicker').style.display = 'block';
        document.getElementById('dia-de-cierre-cbx').style.display = 'none';
    }
}

updateCierre();