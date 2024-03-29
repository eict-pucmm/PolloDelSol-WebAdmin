const express = require('express');
const axios =   require('axios');
const url =     require('../../config').server.url;
const config =  require('../../config')

let app =       express();

app.get('/', (req, res, next) => {
	req.session.loggedIn = false;
	res.render('login', {
		correo: '',
		contrasena: '',
	})
});

app.post('/', (req, res, next) => {

	req.assert('correo', 'El correo no puede estar vacío').notEmpty();
	req.assert('correo', 'Debe insertar una dirección de correo válida').isEmail().normalizeEmail();
	req.assert('contrasena', 'La contraseña no puede estar vacía').notEmpty();

	let errors = req.validationErrors();
	if(!errors) {
		const email = req.sanitize('correo').escape().trim();
		const passwd = req.sanitize('contrasena').escape().trim();

		axios.post(`${url}/api/empleado/login`, {email: email, passwd: passwd})
		.then( (response) => {
			req.session.loggedIn = true;
			req.session.empleado = response.data.empleado;
			res.redirect('/');
		}).catch( (err) => {
			req.flash('error', err.response.data.message);
			res.render('login', {
				correo: email,
				contrasena: '',
			});
		});

	}else {
		req.flash('error', errors[0].msg);
		res.redirect('/login/');
	}
});

app.get('/logout', (req, res, next) => {
	if (req.session) {
		req.session.destroy((err) => {
			if(err) {
				next(err);
			} else {
				res.redirect('/login');
			}
		});
	}
});

module.exports = app;