// permissoes de acesso
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Usuario = new Schema({

    nome: {
        type: String,
        required: true
    },
    // verificar se é admin
    admin: {
        type: Number,
        default: 0 // =1 = admin
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    }

})

mongoose.model('usuarios', Usuario)