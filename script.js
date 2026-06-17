// Importar todas as funções que foram exportadas no script_db.js
import {
consultarDiretoComFetch,
insertTarefa,
sqlAtualizarTarefa,
sqlDeletarTarefa
} from './script_db.js'

// Busca os Elementos Principais do HTML pelo ID e guarda em uma variável
const formTarefa = document.getElementById('form-tarefa');
const tabelaTarefa = document.getElementById('tabela-corpo');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitulo = document.getElementById('form-titulo');
const btnSalvarText = document.getElementById('btn-salvar-text');

//================================
// Funções Visuais, Auxiliares
//================================

function limparFormulario() {
formTarefa.reset();
document.getElementById('tarefa-id').value = '';

formTitulo.textContent = "Criar Tarefa";
btnSalvarText.textContent = "Criar Tarefa";
btnCancelar.classList.add('hidden');

}

function mostrarToast(mensagem, tipo = 'success') {
const container = document.getElementById('toast-container');
const toast = document.createElement('div');

const cores = {
    success: 'bg-green-600',
    error: 'bg-rose-600',
    info: 'bg-blue-600'
};

const icones = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
};

toast.className = `toast-enter ${cores[tipo]} toast-message`;
toast.innerHTML = `
    <i class="fas ${icones[tipo]} text-lg"></i>
    <span>${mensagem}</span>
`;

container.appendChild(toast);

setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';

    setTimeout(() => toast.remove(), 300);
}, 3000);

}

//=================================================
// Ler dados do Banco e Popular a Tabela
//=================================================

async function criarTabelaTarefas() {
const dados = await consultarDiretoComFetch();

tabelaTarefa.innerHTML = '';

if (!dados || dados.length === 0) {
    tabelaTarefa.innerHTML = `
        <tr>
            <td colspan="4" class="empty-state">
                Nenhuma tarefa encontrada
            </td>
        </tr>
    `;
    return;
}


dados.forEach(tarefa => {
    const linha = document.createElement('tr');

        const criado_em = new Date(tarefa.criado_em).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        }).replace(',', '')


    linha.innerHTML = `
        <td class="cell-id">#${tarefa.id}</td>

        <td>
            <p class="cell-tarefa">${tarefa.titulo}</p>
            <p class="cell-descricao">${tarefa.descricao}</p>
        </td>
    
        <td class="date"><p class="badge-date">${criado_em}</p></td>

        <td>
            <div class="action-container">
                <button
                    onclick="prepararEdicao(${tarefa.id}, '${tarefa.titulo}', '${tarefa.descricao}', '${tarefa.criado_em}')"
                    class="btn-action btn-edit"
                    title="Editar">
                    <i class="fas fa-pen"></i>
                </button>

                <button
                    onclick="deletarTarefa(${tarefa.id})"
                    class="btn-action btn-delete"
                    title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    tabelaTarefa.appendChild(linha);
});

}

window.criarTabelaTarefas = criarTabelaTarefas;

criarTabelaTarefas();

window.prepararEdicao = function (id, titulo, descricao, criado_em) {
document.getElementById('tarefa-id').value = id;
document.getElementById('tarefa-titulo').value = titulo;
document.getElementById('tarefa-descricao').value = descricao;

const campoData = document.getElementById('tarefa-criado_em');
if (campoData) {
    campoData.value = criado_em;
}

formTitulo.textContent = "Editar Tarefas";
btnSalvarText.textContent = "Atualizar Tarefas";
btnCancelar.classList.remove('hidden');

};

async function lidarComEnvioDoFormulario(event) {
event.preventDefault();

const id = document.getElementById('tarefa-id').value;
const titulo = document.getElementById('tarefa-titulo').value;
const descricao = document.getElementById('tarefa-descricao').value;

let sucesso = false;

if (id) {
    sucesso = await sqlAtualizarTarefa(id, titulo, descricao);

    if (sucesso) {
        mostrarToast("Tarefa atualizada com sucesso!", "success");
    }
} else {
    sucesso = await insertTarefa(titulo, descricao);

    if (sucesso) {
        mostrarToast("Tarefa cadastrada com sucesso!", "success");
    }
}

if (sucesso) {
    limparFormulario();
    criarTabelaTarefas();
}

}

window.deletarTarefa = async function(id) {
if (confirm("Tem certeza que deseja excluir essa tarefa?")) {
const sucesso = await sqlDeletarTarefa(id);

    if (sucesso) {
        mostrarToast("Tarefa excluída com sucesso!", "success");
        criarTabelaTarefas();
    } else {
        mostrarToast("Erro ao excluir tarefa!", "error");
    }
}

};

formTarefa.addEventListener('submit', lidarComEnvioDoFormulario);
btnCancelar.addEventListener('click', limparFormulario);
