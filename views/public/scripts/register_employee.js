async function compressImage (event) {
    var file = event.target.files[0];
    document.getElementById('ProfilePic').src = URL.createObjectURL(file);

    var options = {
      maxSizeMB: 0.5, 
      maxWidthOrHeight: 1024, 
      useWebWorker: false
    }

    const output = await imageCompression(file,options);
    const downloadLink = URL.createObjectURL(output);
      document.getElementById('ProfilePic').src = downloadLink;
      // document.getElementById('ProfilePicText').value = output.fileName;
    console.log('input', file);
    console.log('output', output);
}

function readURL(input) {
  let url = input.value;
  let ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

  if (input.files && input.files[0]&& (ext == "png" || ext == "jpeg" || ext == "jpg")) {
    
      var fileName = url.split('fakepath' + String.fromCharCode(92)).pop();
      var reader = new FileReader();
  
      reader.onload = function (e) {
          // $('#ProfilePic').attr('src', e.target.result);
          $('#ProfilePicText').attr('value',fileName);
          // console.log('Pic',e.target.result);
          // console.log('Filename',fileName);
      }
      reader.readAsDataURL(input.files[0]);
  } else {
       $('#ProfilePic').attr('src', '/images/ProfilePic.png');
  }
}

const picText = document.getElementById('ProfilePicText');
const pic = document.getElementById('ProfilePic');

if (document.getElementById('reg-button').innerHTML === 'Modificar empleado') {
    document.getElementById('edit-employee-link').href = `'${window.location.href}'`;
    pic.src = employee.avatar;
    pic.value = employee.avatar;
    pic.style.width = '10rem';
    pic.style.height = '10rem';
    document.getElementById('nombre').readonly = true;
    document.getElementById('correo').readonly = true;
    document.getElementById('contrasena-field').style.display = 'none';
}
