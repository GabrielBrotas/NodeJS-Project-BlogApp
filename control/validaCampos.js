// todo, *** FUNCAO PARA VALIDAR DADOS AO CRIAR/EDITAR CATEGORIAS ***

var verifica = function validaCampos(dados){

    var erros = []

    // ao inves de utilizar o req.body.nome você deve utilizar o dados.nome
    //devido ao dados ter recebido o req.body

    // Verificar o campo nome se esta vazio.
    if(!dados.nome || typeof dados.nome == undefined || dados.nome == null){
        erros.push({
            texto: "Nome inválido"
        })
    }


    if(dados.nome.length < 2){
        erros.push({
            texto: "Nome da categoria é muito pequeno. "
        })
    }

    // Verificar o campo slug
    if(!dados.slug || typeof dados.slug == undefined || dados.slug == null){
        erros.push({
            texto: "Slug inválido"
        })
    }

    //Tem que retornar a quantidade de erros! 
    return erros;

}

//Muito importante, não se esquecer de exportar o "módulo"

module.exports = verifica;