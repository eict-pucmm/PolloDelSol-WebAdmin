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