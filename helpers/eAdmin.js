module.exports = {
    
    // funcao para verificar se é admin
    eAdmin: function(req, res, next){

         // se o usuario estiver autenticado e o campo Admin for == 1 entao pode ter acesso a pagina
        if(req.isAuthenticated() && req.user.admin == 1){

            console.log(req.user)

            return next();

        }

        // se nao vai da erro e redirecionar para o inicio
        req.flash('error_msg', 'voce precisa ser admin para entrar aqui')

        res.redirect('/')
    }
    
    
}