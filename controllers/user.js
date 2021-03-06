const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Beer = require('../models/beer');
const bcrypt = require('bcrypt');

router.route('/')
	.get((req, res)=>{
		User.findOne({username: req.session.username}, (err, user)=>{
			if(err)
				res.send(err)
			if(!user)
				res.render('home', {loginMessage: 'You need to be logged in to access your profile', logged: req.session.lgged})
			else{
				res.render('user/profile', {user: user, userBeer: user.beer, sound: "", logged: req.session.logged})
			}
		})
	})

router.route('/register')
	.get((req,res)=>{
		res.render('user/register', {loginMessage: ''});
	})
	.post((req, res)=>{
		User.findOne({username: req.body.username}, (err, user)=>{
			if(err)
				res.send(err)
			if(user !== null)
				res.render('user/register', {loginMessage: 'error creating user'})
			else{
				const password = req.body.password;
				const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
				const userDBentry = {};
				userDBentry.username = req.body.username;
				userDBentry.password = passwordHash;
				User.create(userDBentry, (err, user)=>{
					if(err)
						res.send(err)
					else{
						req.session.logged = true;
						req.session.username = user.username;
						req.session.id = user._id;
						res.render('user/profile', {user: user, userBeer: user.beer, sound: "/audio/beer01.wav", logged: req.session.logged});
					}
				})
			}
		})
	})

router.route('/login')
	.post((req, res)=>{
		User.findOne({username: req.body.username}, (err, user)=>{
			if(err)
				res.send(err);
			if(user && bcrypt.compareSync(req.body.password, user.password)){
				req.session.logged = true;
				req.session.username = user.username;
				req.session.id = user._id;
				res.render('user/profile', {user: user, userBeer: user.beer, sound: "/audio/beer01.wav", logged: req.session.logged})
			}
			else
				res.render('home', {loginMessage: `Can't log in`, logged: req.session.logged});
		})
	})

router.route('/logout')
	.post((req, res)=>{
		req.session.destroy()
		res.redirect('/');
	})

router.route('/:id')
	.get((req, res)=>{
		User.findById(req.params.id, (err, user)=>{
			if(err)
				res.send(err)
			else
				res.render('user/profile', {user: user, userBeers: user.beer, logged: req.session.logged})
		})
	})

module.exports = router;