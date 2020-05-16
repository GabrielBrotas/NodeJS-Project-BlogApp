const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Postagem = new Schema ({

    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    // referenciar a postagem com uma categoria
    categoria: {
        // a categoria vai armazenar o id de algum objeto
        type: Schema.Types.ObjectId,

        // referenciar com o model 'categorias' criado
        ref: 'categorias',
        required: true

    },
    data: {
        type: Date,
        default: Date.now()
    }

})

mongoose.model('postagens', Postagem)