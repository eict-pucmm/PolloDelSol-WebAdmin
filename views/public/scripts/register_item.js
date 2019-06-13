let messageP = document.getElementById('result-message');
if (messageP) {
    let message = messageP.innerHTML;

    if (message.includes('ER_DUP_ENTRY')) {
        messageP.innerHTML = 'ERROR: Ya existe un item con el Id = "' + 
            message.substring(message.indexOf("'") + 1, message.indexOf("'", message.indexOf("'") + 1)) + '"';
    }
}

if (document.getElementById('reg-button').innerHTML === 'Modificar') {
    document.getElementById('id-item').disabled = true;
}
