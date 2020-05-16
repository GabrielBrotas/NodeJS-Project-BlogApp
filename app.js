/* 
todo, *** Recursos nessarios para o projeto ***

    >npm install --save express
    >npm install --save express-handlebars
    >npm install body-parser --save
    >npm install --save mongoose
    >npm install --save express-session
    >npm install --save connect-flash
    >npm install --save bcryptjs    <-gerar senhas hash

    >npm install --save  passport <- pegar o pacote de autenticacao

    >npm install --save  passport-local <- pegar a estrategia de autenticacao
    
    http://www.passportjs.org/
    esse pacote de autenticacao, é para validaçao de dados caso alguem queira logar com o gmail, linkedin, github....
    a que utilizamos foi a passport-local para validar com o nosso banco de dados
    */



// todo, *** CARREGANDO MODULOS ***

    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const mongoose = require('mongoose')
    
    // carregando rotas, é bom deixar o nome da constante com o mesmo nome do arquivo
    const admin = require('./routes/admin')

    // Manipular pastas
    const path = require('path')

    // Carregar o modulo de sessions para guardar o usuario que esta logado
    const session = require('express-session')

    // flash é um tipo de sessao que dura por um tempo ou só aparece uma vez quando ocorre algum evento, se carregar a pagina ele some.
    const flash = require('connect-flash')

    // modulo de postage, para parecer na pagina inicial
    require('./models/Postagens')
    const Postagem = mongoose.model('postagens')

    // pegar as categorias
    require('./models/Categoria')
    const Categoria = mongoose.model("categorias")

    // pegar as rotas criada para usuarios
    const usuarios = require('./routes/usuario')
    
    // chamar configuracoes de autenticacao
    const passport = require('passport')
    require('./control/auth')(passport)

    
// todo, *** CONFIGURACOES ***
    

    // *  Session / Sessão + Flash
        // configurar a seessao
        app.use(session({
            secret: 'CursoDeNodeBlogAPP',
            resave: true,
            saveUninitialized: true
        }))

        // configurar o passport
        app.use(passport.initialize() )

        // configurar a sessao
        app.use(passport.session())

        // carregar o flash
        app.use(flash())

    
    // * CONFIG do Middleware
        /*
        o middleware pega 3 parametros (request, response, next)
        vamos criar variaveis globais dentro dessa funcao para poder acessar por qualquer parte da applicação
        Nesse caso vamos criar uma para aparecer uma mensagem de sucesso quando o usuario cadastrar uma postagem

            res.local.<nome da variavel> é a funcao para criar variaveis globais
            next()
            */
        app.use( (req, res, next) => {
        
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            res.locals.error = req.flash('error')
            // Variavel para pessoas logadas(permissao), vai armazenar os dados da pessoa logada e, caso nao tenha nenhum usuario logado vai pegar null
            res.locals.user = req.user || null
            //sempre no final do codigo do middleware vamos colocar o comando next() se nao vai travar a applicacao
            next()
        })



    // * body-parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())


    // * Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars');


    // * mongoose
        mongoose.Promise = global.Promise

        mongoose.connect('mongodb://localhost/blogapp', {

            useNewUrlParser: true, // Config padrao de seguranca
            useUnifiedTopology: true// Config padrao de seguranca

        }).then( () => {

            console.log('conectado ao mongoDB')

        }).catch( (err) => {

            console.log('Erro ao se conectar' + err)

        })


    // * Pasta de arquivos estaticos (public)
        // estamos dizendo para o express que a pasta que esta guardando todos os nossos arquivos estaticos é a pastas public
        app.use(express.static('public'));



// todo, *** ROTAS ***
// as rotas vao ficar na pasta 'routes' para esse arquivo nao ficar muito grande, aqui vamos apenas chamar os arquivos de cada rota

    app.get('/', (req, res) => {

        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then( (postagens) => {

            res.render('index', {postagens: postagens})
        
        }).catch( (erro) => {
            req.flash('error_msg', 'erro ao carregar postagens')
            res.redirect('/404')
        })

        
    })


    app.get('/postagem/:slug', (req, res) => {
        
        Postagem.findOne({slug: req.params.slug}).lean().then( (postagem) => {

            if(postagem){

                res.render('postagem/index', {postagem: postagem})

            } else {

                req.flash('error_msg', 'esta pagina nao existe')
                res.redirect('/')

            }

        
        }).catch( (erro) => {

            req.flash('error_msg', 'erro interno')
            res.redirect('/')

        })

    })


    app.get('/categorias', (req, res) => {
    
        Categoria.find().lean().then( (categorias) => {

            res.render('categorias/index', {categorias: categorias})

        }).catch( (erro) => {

            req.flash('error_msg', 'erro ao listar categorias')
            res.redirect('/')
            
        })

    })


    app.get('/categorias/:slug', (req, res) => {

        Categoria.findOne({slug: req.params.slug}).lean().then( (categoria) => {

            if(categoria) {

                Postagem.find({categoria: categoria._id}).lean().then( (postagens) => {

                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})

                }).catch( (err) => {
                    req.flash('error_msg', 'erro ao listar os posts')
                    req.redirect('/')
                })


            } else {
                req.flash('error_msg', 'categoria nao existe')
                req.redirect('/')
            }
            



        }).catch( (err) => {

            req.flash('error_msg', 'erro interno')
            req.redirect('/')

        })

    })


    app.get('/404', (req,res) => {
        res.send('error 404')
    })

    app.use('/admin', admin)

    app.use('/usuarios', usuarios)

// todo, *** INICIAR SERVIDOR ***
    const door = 8081;

    app.listen(door, () => {
        console.log('Servidor rodando na porta ' + door)
    })