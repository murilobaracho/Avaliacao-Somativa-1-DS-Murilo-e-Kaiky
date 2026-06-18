const DATABASE_URL = "postgresql://neondb_owner:npg_iSmjb58RgQLN@ep-dry-butterfly-acofm1zs-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const host = new URL(DATABASE_URL).host.replace('-pooler', '');

const neonHttpEndPoint = `https://${host}/sql`;

const NEON_API_TOKEN ="https://ep-dry-butterfly-acofm1zs.apirest.sa-east-1.aws.neon.tech/neondb/rest/v1";

async function executarQueryNeon(querySQL, parametros = []) {
    try {
        
        //Requisição de conexão com o banco
        const resposta = await fetch(neonHttpEndPoint, {

            // Header da Requisição
            method: 'POST',
            headers: { 
                'neon-connection-string': DATABASE_URL,
                'Content-Type': 'application/json' // Corrigido 'aplication' para 'application'
            },

            //corpo da requisição
            body: JSON.stringify({
                query: querySQL, //SQL: Ex. INSERT INTO...
                params: parametros 
            })
        });

        if (!resposta.ok) {
            // Resposta do Servidor Neon
            const erroTexto = await resposta.text();

            // joga o erro para o catch "pegar" e mostrar no console
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`);
        }

        const dados = await resposta.json() //Resposta do Neon com dados
        return dados.rows; // Extraindo linhas dos dados
      
        // pega o erro gerado pelo catch
    } catch (erro) {
        console.error("Falha ao comunicar com o banco de dados: ", erro);
        return null
    }
}

// CRUD

//c
export async function insertTarefa(titulo, descricao, urgencia) {
    const query = 'INSERT INTO tarefas (titulo, descricao, urgencia) VALUES ($1, $2, $3) RETURNING *';

    const params = [titulo, descricao, urgencia]

        // Linhas que o RETURNING irá retornar
    const linhas = await executarQueryNeon(query, params);
    
    // Retorna um booleano se tem linhas true ou false
    return linhas !== null;
};

//r
export async function consultarDiretoComFetch() {
    
    const query = 'SELECT * FROM tarefas ORDER BY criado_em DESC';

        //Executa as linhas que a query select vai retornar chamando a função executarQueryNeon
    const linhas = await executarQueryNeon(query);

    //Garante a função volte um Array mesmo se vazio
    return linhas || [];
};

//U
export async function sqlAtualizarTarefa(id, titulo, descricao, urgencia) {
    const query = 'UPDATE tarefas SET titulo = $1, descricao = $2, urgencia = $3 WHERE id = $4 RETURNING *';

    const params = [titulo, descricao, urgencia, id];

    // Executa as linhas que a query de update vai retornar chamando a função executarQueryNeon
    const linhas = await executarQueryNeon(query, params);

    // Retorna um booleano se tem linhas true ou false
    return linhas !== null; 
};

//D
export async function sqlDeletarTarefa(id) {
    const query = 'DELETE FROM tarefas where id = $1 RETURNING *'

    //Parametros para o Delete
    const params = [id];

    // Executa as linhas que a query de delete vai retornar chamando a função executarQueryNeon
    const linhas = await executarQueryNeon(query, params);

     // Retorna um booleano se tem linhas true ou false
    return linhas !== null;
}

export async function timestamp(criado_em) {

    const params = [criado_em]
    const query = 'SELECT * FROM tarefas WHERE criado_em IS NOT NULL'
    const linhas = await executarQueryNeon(query)

    return linhas || [];
}

