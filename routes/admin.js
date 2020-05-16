// todo, ROTAS PARA A PAGINA ADMIN

const express = require('express')
const router = express.Router()


const mongoose = require('mongoose')            // Importar o mongoose

require('../models/Categoria')                  // chamar o model criado em Categoria.js
const Categoria = mongoose.model('categorias') // passar uma referencia do model criado em Categorias para a 

require('../models/Postagens')                  // chamar o model criado em Postagens.js
const Postagem = mongoose.model('postagens')

// funcao que valida os campos
const validaCampos = require('../control/validaCampos.js')

// pegar funcao para verificar se é admin
// dentro da pasta eAdmin pegar a funcao Admin apenas
const {eAdmin} = require('../helpers/eAdmin')


// entre esse inicio e o final vai ficar as rotas do admin ---

// ao inves de usar app.get()... vamos router.get()

// rota principal
router.get('/', eAdmin, (req, res) => {
    
    res.render('admin/index')

})



// rota segundaria dentro de admin, /admin/posts
router.get('/posts', eAdmin ,(req, res) => {

    res.send('Pagina de posts')

})



router.get('/categorias', eAdmin, (req, res) => {
    
    // passar as categorias existentes para a peegina principal

    Categoria.find().sort({date: 'desc'}).then( (categorias) => {
        
        // Nao é mais permitido passar diretamente o parametro para ser acessado na view, por questoes de seguranca, entao usamos a funcao .map para converter toJSON
        res.render('admin/categorias', {categorias: categorias.map( categoria => categoria.toJSON() )})

    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })

})



router.get('/categorias/add', eAdmin, (req, res) => {
    
    res.render('admin/addCategoria')

})


router.post('/categorias/nova', eAdmin, (req, res) => {
    
    // * Validacao de dados para as categorias

    var erros = validaCampos(req.body)

    if(erros.length > 0){

        res.render('admin/addCategoria', {erros: erros})

    } else {

        const novaCategoria = {
            // request.body.<nome do campo criado no form addCategoria>
            nome: req.body.nome,
            slug: req.body.slug  
        }
        
        new Categoria(novaCategoria).save().then( () => {
            // passar a mensagem de sucesso
            req.flash('success_msg', "Categoria criada com sucesso")
            res.redirect('/admin/categorias')
    
        }).catch((err) => {
             // passar a mensagem de erro
            req.flash('error_msg', "Erro ao salvar a categoria")
            res.redirect('/admin')
        })

    }
    
})



router.get('/categorias/edit/:id', eAdmin, (req, res) => {

    // Procurar apenas um pelo _id que seja igual ao passado pelo url
    // lean() é uma funcao de proteecao que permite passar valores
    Categoria.findOne({_id: req.params.id}).lean().then( (categoria) => {

        res.render('admin/editcategorias', {categoria: categoria})

    }).catch( (erro) => {

        req.flash('error_msg', 'Esta categoria nao existe')
        res.redirect('/admin/categorias')

    })
    
})

// rota que vai ser acessada quando clicar no submit de editcategorias
// post porque so vai poder ser acessada pelo botao 
router.post('/categorias/edit', eAdmin, (req, res) => {

    var erros = validaCampos(req.body)

    if(erros.length > 0){
        
        res.render('admin/addCategoria', {erros: erros})

    } else {

        // pegar o id passado pelo input invisivel que criamos no editcategorias

    Categoria.findOne({_id: req.body.id}).then( (categoria) => {

        // editar os dados antigos para os novos
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        // salvar as alteracoes

        categoria.save().then( () => {
        
            req.flash('success_msg', "categoria editada com sucesso")
            res.redirect('/admin/categorias')

        }).catch( (erro) => {

            req.flash('error_msg', 'Erro ao editar categoria')
            req.redirect('/admin/categorias')

        })
        

    }).catch( (erro) => {

        req.flash('error_msg', 'Houve uma erro ao editar a categoria')
        res.redirect('/admin/categorias')

    })
    
    }

})



router.post('/categorias/deletar', eAdmin, (req, res) => {

    Categoria.remove( {_id: req.body.id} ).then( () => {

        req.flash('success_msg', 'Categoria deletada com sucesso!')
        res.redirect('/admin/categorias')
    
    }).catch( (erro) => {

        req.flash('error_msg', 'Erro ao deletar categoria')
        res.redirect('/admin/categorias')

    })

})



router.get('/postagens', eAdmin, (req, res) => {
    
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {

        res.render('admin/postagens', {postagens: postagens})

    }).catch( (err) => {

        req.flash('error_msg', 'Erro ao listar os posts')
        res.render('/admin')

    })
    

})



router.get('/postagens/add', eAdmin, (req, res) => {
    // Passar as categorias para a pagina de adicionar postagens

    Categoria.find().lean().then( (categorias) => {

        res.render('admin/addPostagem', {categorias: categorias})

    }).catch( (erro) => {

        res.flash('error_msg', 'Erro ao carregar o formulario')
        res.redirect('/admin')

    })
    
})



router.post('/postagens/nova', eAdmin, (req, res) => {

    var erros = []

    if (req.body.categoria == '0'){

        erros.push( {texto: 'Categoria invalida, registre uma categoria'} )

    }

    if (erros.length > 0 ){

        res.render('admin/addpostagem', {erros: erros})

    } else {

        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then( () => {

            req.flash('success_msg', 'Postagem criada com sucesso')
            res.redirect('/admin/postagens')

        }).catch( (erro) => {

            req.flash('error_msg', 'Erro ao criar nova postagem')
            res.redirect('/admin/postagens')

        })

     }

})



router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    // * busca seguida pelo mongo
    /*
    Primeiro estamos buscando pela postagem e no segundo 'then' estamos buscando pela categoria
    depois renderizamos esses dados na view
    */
    Postagem.findOne({_id: req.params.id}).lean().then( (postagem) => {

        Categoria.find().lean().then( (categorias) => {

            res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})

        }).catch( (erro) => {
            req.flash('error_msg', 'erro ao listar categorias')
            res.redirect('/admin/postagens')
        })

    }).catch( (erro) => {
        req.flash('error_msg', 'erro ao carregar postagem')
        res.redirect('/admin/postagens')
    })

})


router.post('/postagens/edit', eAdmin, (req, res) => {
    // * fazer validacao dos valores

    Postagem.findOne({_id: req.body.id}).then( (postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then( () => {

            req.flash('success_msg', 'Postagem editada com suceesso')
            res.redirect('/admin/postagens')

        }).catch( (error) => {

            req.flash('error_msg', 'Erro ao salvar edicao')
            res.redirect('/admin/postagens')

        })



    }).catch( (erro) => {
        req.flash('error_msg', 'erro ao salvar edit')
        res.redirect('/admin/postagens')
    })
})


/*
Outra forma de deletar itens, porem ele nao é segura por ser do formato get

*/
router.get('/postagens/deletar/:id', eAdmin, (req, res) => {

    Postagem.remove({_id: req.params.id}).then( ()=> {
        req.flash('success_msg', 'post deletado com sucesso')
        res.redirect('/admin/postagens')
    }).catch( (error) => {
        req.flash('error_msg', 'erro ao deletar')
        res.redirect('/admin/postagens')

    })

})

// entre esse final e o inicio vai ficar as rotas do admin ---
module.exports = router