const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

// modulo para transformar a senha em hash
const bcrypt = require('bcryptjs')

const passport = require('passport')

// rotas --

router.get('/registro', (req, res) => {

    res.render("usuarios/registro")

})


router.post('/registro', (req, res) => {


    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "nome invalido"})
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: 'e-mail invalido'})
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: 'senha invalida'})
    }

    if (!req.body.senha_confirm || typeof req.body.senha_confirm == undefined || req.body.senha_confirm == null) {
        erros.push({texto: 'confirmacao de senha invalida'})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: 'senha muito curta'})
    }

    if(req.body.senha != req.body.senha_confirm){
        erros.push({texto: 'senhas divergentes'})
    }

    if(erros.length > 0){

       res.render('usuarios/registro', {erros: erros}) 

    } else {

        
        // verificar se o email ja esta cadastrado
        Usuario.findOne( {email: req.body.email} ).lean().then( (usuario) => {

            if(usuario) {
  
                // caso tenha um usuario com esse email entao nao vai permitir
                req.flash('error_msg', 'email ja cadastrado no sistema')
                res.redirect('/usuarios/registro')
            
            } else {

                // criar novo usuario
                const novoUsuario = new Usuario({

                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha

                })

                // gerar senha hash
                bcrypt.genSalt(10, (erro, salt) => {

                    //hash na senha do usuario
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        
                        if(erro){

                            req.flash('error_msg', 'erro ao salvar usuario')
                            res.redirect('/')
                        
                        }

                        novoUsuario.senha = hash

                        // salvar usuario
                        novoUsuario.save().then( () => {
                        
                            req.flash('success_msg', 'usuario cadastrado com sucesso')
                            res.redirect('/')
                        
                        }).catch( (erro) => {
                        
                            req.flash('error_msg', 'erro ao criar o usuario, tente novamente')
                            res.redirect('/usuarios/registro')
                        
                        })
                    })

                })

            }

        }).catch( (erro)=> {
            req.flash('error_msg', 'erro interno')
            res.redirect('/')
        })
        
    }

})


router.get('/login', (req, res) => {
    
    res.render('usuarios/login')

})


router.post('/login', (req, res, next) => {
    
    // autenticacao do tipo local
    passport.authenticate('local', {
        // caso consiga autenticar vai mandar para alguma rota
        successRedirect: '/',
        // caso tenha dado erro na autenticacao
        failureRedirect: '/usuarios/login',
        failureFlash: true
        
    })(req, res, next)

})


router.get('/logout', (req, res) =>{
    
    req.logout()
    req.flash('success_msg', 'deslogado com sucesso')
    res.redirect('/')


})

module.exports = router