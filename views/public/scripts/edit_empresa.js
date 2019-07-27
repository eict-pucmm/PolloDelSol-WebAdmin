$( function() {
    $("#datepicker").datepicker({dateFormat: 'dd-mm-yy'});
});

document.getElementById('edit-enterprise-link').href = `'${window.location.href}'`;