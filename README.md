 # Frontend

 ## Tecnologias

[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://github.com/vuejs/vue) [![Vue Router](https://img.shields.io/badge/Vue_Router-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)](https://github.com/vuejs/router) [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://github.com/vitejs/vite) [![MirageJS](https://img.shields.io/badge/MirageJS-FF6D70?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/miragejs/miragejs) [![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://github.com/axios/axios) [![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=for-the-badge&logo=pinia&logoColor=black)](https://github.com/vuejs/pinia) [![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://github.com/sass/sass) [![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)](https://github.com/eslint/eslint)

---

## Como rodar o projeto

### Pré-requisitos

É necessário ter o Node.js (v20+) e o npm instalados.

#### Linux

1.  Baixe o Node e o npm:
    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```

#### Windows

1.  Baixe o Node.js pelo site oficial e instale:
    👉 Download Node.js

### Instalação

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Após instalar as dependências, crie um arquivo `.env` na pasta raiz e copie o conteúdo de `.env.example`.

### (Opcional) Configuração de Lint/Formatter no VSCode

1.  Se estiver usando VSCode, instale as extensões Prettier e ESLint.

2.  Use o atalho `Ctrl + Shift + P`, digite `settings` e abra o arquivo de configurações do usuário (`settings.json`).

3.  Adicione o seguinte conteúdo ao arquivo:
    ```json
    {
       "editor.codeActionsOnSave": {
          "source.fixAll.eslint": "explicit"
       },
       "editor.formatOnSave": true,
       "eslint.validate": ["javascript", "vue"],
       "prettier.requireConfig": true
    }
    ```

### Executando o projeto

-   **Com backend:**
    ```bash
    npm run dev
    ```
    > Sobe na porta 5173, conectando ao backend na porta 8080.

-   **Sem backend (dados mockados):**
    ```bash
    npm run mock
    ```
    > Sobe na porta 5173 com dados fictícios.

---

## Build para produção

Para compilar e minificar o projeto para produção, execute:
```bash
npm run build
```

---

## Estrutura do projeto

```
src/
├── assets/     # Arquivos estáticos (imagens, fonts, etc.)
├── components/ # Componentes reutilizáveis
├── mock/       # Dados fictícios para API
├── pages/      # Páginas (rotas do projeto)
├── router/     # Configuração das rotas (Vue Router)
├── services/   # Serviços (API calls, lógica de negócio)
├── stores/     # Gerenciamento de estado (Pinia)
├── styles/     # Estilos globais ou específicos
├── utils/      # Funções helper, constantes, etc.
└── main.ts     # Ponto de entrada da aplicação
```

### Benefícios da estruturação

*   **Organização clara:** facilita localizar arquivos de uma mesma camada.
*   **Manutenção simplificada:** alterações em uma camada não afetam outras.
*   **Escalabilidade:** estrutura preparada para crescimento do projeto.

---

## Acordos do projeto

*   Código em inglês.
*   Todos os endpoints precisam ter um mock correspondente.

---

## Padrão de commits e branches

### Commits

*   **Formato:**
    ```
    <tipo>(<ID da tarefa no Jira>): <breve descrição em inglês>
    ```
*   **Exemplo:**
    ```
    feat(47): updates the readme with commits pattern
    ```

### Branches

*   **Formato:**
    ```
    SCRUM-<ID da tarefa no Jira>/<breve descrição em inglês>
    ```
*   **Exemplo:**
    ```
    SCRUM-47/update-readme
    ```
