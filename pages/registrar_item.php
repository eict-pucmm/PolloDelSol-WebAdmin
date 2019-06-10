<?php
  $host = "us-cdbr-iron-east-02.cleardb.net";
  $dbusername = "b0ccbe5cbcfbd1";
  $dbpassword = "9e38a45c";
  $dbname = "heroku_7fdb4fe0285393e";

  $conn = new mysqli($host, $dbusername, $dbpassword, $dbname);
  if (mysqli_connect_error()){
    die('Connect Error ('. mysqli_connect_errno() .') '
    . mysqli_connect_error());
  }
 
  if (isset($_GET['register'])) {
    $id = filter_input(INPUT_POST, 'id');
    $nombre = filter_input(INPUT_POST, 'nombre');
    $descripcion = filter_input(INPUT_POST, 'descripcion');
    $precio = filter_input(INPUT_POST, 'precio');
    $tipo = filter_input(INPUT_POST, 'tipo');

    $sql = "INSERT INTO item VALUES ('$id', '$nombre', '$descripcion', $precio, '$tipo');";
    $conn->query($sql);
    $conn->close();
    header("Location: ./registrar_item.php");
    die();
  }
?>

<!DOCTYPE html>
<html lang="en">

<head>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link rel="shortcut icon" href="../assets/images/favicon.png" />
  <title>Pollo del Sol</title>

  <link rel="stylesheet" href="../assets/vendors/ti-icons/css/themify-icons.css">
  <link rel="stylesheet" href="../assets/vendors/base/vendor.bundle.base.css">
  <link rel="stylesheet" href="../assets/css/style.css">
</head>

<body>
  <div class="container-scroller">
    <!-- partial:../../partials/_navbar.html -->
    <nav class="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
        <div class="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
          <a class="navbar-brand brand-logo mr-5" href="../index.html"><img src="../assets/images/logo.svg" class="mr-2"
              alt="logo" /></a>
          <a class="navbar-brand brand-logo-mini" href="../index.html"><img src="../assets/images/logo-mini.svg" alt="logo" /></a>
        </div>
        <div class="navbar-menu-wrapper d-flex align-items-center justify-content-end">
          <button class="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
            <span class="ti-view-list"></span>
          </button>
          <ul class="navbar-nav navbar-nav-right">
            <li class="nav-item dropdown">
              <a class="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#"
                data-toggle="dropdown">
                <i class="ti-bell mx-0"></i>
                <span class="count"></span>
              </a>
              <div class="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="notificationDropdown">
                <p class="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>
                <a class="dropdown-item">
                  <div class="item-thumbnail">
                    <div class="item-icon bg-success">
                      <i class="ti-info-alt mx-0"></i>
                    </div>
                  </div>
                  <div class="item-content">
                    <h6 class="font-weight-normal">Application Error</h6>
                    <p class="font-weight-light small-text mb-0 text-muted">
                      Just now
                    </p>
                  </div>
                </a>
                <a class="dropdown-item">
                  <div class="item-thumbnail">
                    <div class="item-icon bg-warning">
                      <i class="ti-settings mx-0"></i>
                    </div>
                  </div>
                  <div class="item-content">
                    <h6 class="font-weight-normal">Settings</h6>
                    <p class="font-weight-light small-text mb-0 text-muted">
                      Private message
                    </p>
                  </div>
                </a>
                <a class="dropdown-item">
                  <div class="item-thumbnail">
                    <div class="item-icon bg-info">
                      <i class="ti-user mx-0"></i>
                    </div>
                  </div>
                  <div class="item-content">
                    <h6 class="font-weight-normal">New user registration</h6>
                    <p class="font-weight-light small-text mb-0 text-muted">
                      2 days ago
                    </p>
                  </div>
                </a>
              </div>
            </li>
            <li class="nav-item nav-profile dropdown">
              <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
                <img src="../assets/images/faces/face28.jpg" alt="profile" />
              </a>
              <div class="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
                <a class="dropdown-item">
                  <i class="ti-settings text-primary"></i>
                  Settings
                </a>
                <a class="dropdown-item">
                  <i class="ti-power-off text-primary"></i>
                  Logout
                </a>
              </div>
            </li>
          </ul>
          <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button"
            data-toggle="offcanvas">
            <span class="ti-view-list"></span>
          </button>
        </div>
      </nav>
    <!-- partial -->
    <div class="container-fluid page-body-wrapper">
      <!-- partial:../../partials/_sidebar.html -->
      <nav class="sidebar sidebar-offcanvas" id="sidebar">
          <ul class="nav">
            <li class="nav-item">
              <a class="nav-link" href="../index.html">
                <!-- <i class="ti-shield menu-icon"></i> -->
                <img class="menu-icon" src="../assets/images/icons/home.svg" width="18px" />
                <span class="menu-title">Inicio</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-toggle="collapse" href="#menu" aria-expanded="false" aria-controls="menu">
                <!-- <i class="ti-palette menu-icon"></i> -->
                <img class="menu-icon" src="../assets/images/icons/menu.svg" width="18px" />
                <span class="menu-title">Menu</span>
                <i class="menu-arrow"></i>
              </a>
              <div class="collapse" id="menu">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item"> <a class="nav-link" href="#">Gestionar menu</a>
                  </li>
                  <li class="nav-item"> <a class="nav-link" href="./registrar_item.php">Registrar item</a>
                  </li>
                  <li class="nav-item"> <a class="nav-link" href="./list_item.php">Listar items</a></li>
                </ul>
              </div>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-toggle="collapse" href="#empleados" aria-expanded="false" aria-controls="empleados">
                <!-- <i class="ti-palette menu-icon"></i> -->
                <img class="menu-icon" src="../assets/images/icons/employee.svg" width="18px" />
                <span class="menu-title">Empleados</span>
                <i class="menu-arrow"></i>
              </a>
              <div class="collapse" id="empleados">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item"> <a class="nav-link" href="#">Registrar</a></li>
                  <li class="nav-item"> <a class="nav-link" href="#">Listar</a></li>
                </ul>
              </div>
            </li>
            <li class="nav-item">
              <a class="nav-link" data-toggle="collapse" href="#empresas" aria-expanded="false" aria-controls="empresas">
                <!-- <i class="ti-palette menu-icon"></i> -->
                <img class="menu-icon" src="../assets/images/icons/enterprise.svg" width="18px" />
                <span class="menu-title">Empresas</span>
                <i class="menu-arrow"></i>
              </a>
              <div class="collapse" id="empresas">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item"> <a class="nav-link" href="#">Registrar</a></li>
                  <li class="nav-item"> <a class="nav-link" href="#">Listar</a></li>
                </ul>
              </div>
            </li>
          </ul>
        </nav>
      <!-- partial -->
      <div class="main-panel">
        <div class="content-wrapper">
          <div class="row">
            <div class="col-12 grid-margin stretch-card">
              <div class="card">
                <div class="card-body">
                  <h4 class="card-title">Registrar item</h4>
                  <form class="forms-sample" method="POST" action="?register=true">
                  <div class="row">
                      <div class="col-md-3">
                        <div class="form-group">
                          <label for="id">Id</label>
                          <div class="col-sm-12 row">
                            <input type="text" name="id" class="form-control" id="id" placeholder="Id" />
                          </div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-group">
                          <label for="nombre">Nombre</label>
                          <div class="col-sm-12 row">
                            <input type="text" name="nombre" class="form-control" id="nombre" placeholder="Nombre"/>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-3">
                          <div class="form-group">
                            <label for="tipo-item">Tipo</label>
                            <select class="form-control col-sm-10" id="tipo-item" name="tipo">
                              <option>Plato</option>
                              <option>Bebida</option>
                              <option>Guarnicion</option>
                              <option>Combo</option>
                            </select>
                          </div>
                        </div>
                    </div>
                    <div class="row">
                      <div class="col-md-12">
                        <div class="form-group">
                          <label for="descripcion">Descripción</label>
                          <div class="col-sm-12 row">
                            <input type="text" name="descripcion" class="form-control" id="descripcion" placeholder="Descripción">
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-12">
                        <div class="form-group">
                          <label>Precio</label>
                          <div class="input-group col-sm-12 row">
                            <div class="input-group-prepend">
                              <span class="input-group-text bg-primary text-white">DOP$</span>
                            </div>
                            <input type="number" name="precio" step="0.01" min="0" class="form-control price-int-input">
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="submit" class="btn btn-primary mr-2 reg-item" >Registrar</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="d-sm-flex justify-content-center justify-content-sm-between">
            <span class="text-muted text-center text-sm-left d-block d-sm-inline-block">Copyright © 2018 <a
                href="https://www.templatewatch.com/" target="_blank">Templatewatch</a>. All rights reserved.</span>
            <span class="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">Hand-crafted & made with <i
                class="ti-heart text-danger ml-1"></i></span>
          </div>
        </footer>
      </div>
    </div>
  </div>
  <script src="../assets/vendors/base/vendor.bundle.base.js"></script>
  <script src="../js/off-canvas.js"></script>
  <script src="../js/hoverable-collapse.js"></script>
  <script src="../js/template.js"></script>
  <script src="../js/todolist.js"></script>
  <script src="../js/file-upload.js"></script>
</body>

</html>