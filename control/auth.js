// todo, *** ESTRUTURAR O SISTEMA DE AUTENTICACAO ***

const localStragery = require('passport-local').Strategy // autenticacao
const mongoose = require('mongoose') // pegar o banco de dados
const bcrypt = require('bcryptjs') // comparar as senhas hash

// Model de usuario

require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


// configurar o sistema de autenticaco
module.exports = function(passport) {

    /*
     Vamos analisar pelo email cadastrado ({usernameField: 'email'}) nesse caso pois cada usuario tem um email diferente, poderia ser nome, username, nick ou qualquer titulo do model.
     passar o passwordField: 'senha, pois no form de login colocamos como 'senha', ele reconheceria automaticamento caso o name fosse 'password'
     Depois vamos passar uma funcao de call back...
    */
     passport.use( new localStragery({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        
        // Vai procurar por algum usuario com o email passado no model 'Usuario' do banco de dados...
        Usuario.findOne({email: email}).lean().then( (usuario) => {
            
            // se nao achar nenhum usuario...
            if(!usuario){
                
                // retorna um done(funcao de call back) com 3 parametros (1º os dados da conta que foi autenticada = null pois nenhuma conta foi autenticada, 2º se a autenticacao aconteceu com sucesso ou nao = null pois nao aconteceu e 3º passando uma mensagem )
                return done(null, false, {message: 'Esta conta nao existe'})

            }
                
            // Se a conta existir...
            // comparar a senha digitada com a do banco de dados e passar uma funcao de call back
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {

                // se as senhas forem iguais...
                if(batem){
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: 'senha incorreta'})
                }

            })
        
        })

    } ))

    
    // salvar os dados do usuario em uma sessão para salvar os dados dele relativamente
    passport.serializeUser( (usuario, done) => {

        done(null, usuario._id)

    })

    
    passport.deserializeUser( (id, done) => {
        // buscar o usuario pelo ir
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })

}