# Alerta Escola - FAP Estácio

## Visão Geral
O Alerta Escola é um projeto de extensão desenvolvido para a FAP Estácio que visa melhorar a comunicação entre a escola e os pais/responsáveis durante o momento de busca dos alunos. O sistema notifica a escola quando os pais estão a caminho, permitindo que os alunos sejam preparados para saída, otimizando o tempo de todos e aumentando a segurança no processo.

## Funcionalidades Principais
- Notificação em tempo real quando os pais estão a caminho
- Painel administrativo para gerenciamento de alunos e responsáveis
- Sistema de autenticação seguro para pais e funcionários da escola
- Interface intuitiva para facilitar o uso por todos os envolvidos
- Histórico de entradas e saídas para controle da escola

## Tecnologias Utilizadas
- Front-end: HTML, CSS, JavaScript
- Back-end: Node.js
- Banco de Dados: MongoDB
- Autenticação: JWT
- Notificações: WebSockets

## Requisitos
- Node.js v14+
- MongoDB
- Navegador atualizado (Chrome, Firefox, Safari ou Edge)

## Instalação
1. Clone o repositório:
```
git clone https://github.com/Gor0d/alerta-escola.git
```

2. Entre no diretório do projeto:
```
cd alerta-escola
```

3. Instale as dependências:
```
npm install
```

4. Configure as variáveis de ambiente:
```
cp .env.example .env
```
(Edite o arquivo .env com suas configurações)

5. Inicie o servidor:
```
npm start
```

## Como Usar
1. Acesse a aplicação pelo navegador em `http://localhost:3000`
2. Faça login com as credenciais adequadas (escola ou responsável)
3. Os responsáveis podem iniciar uma notificação ao sair para buscar o aluno
4. A escola recebe a notificação e prepara o aluno para saída

## Contribuição
Este projeto foi desenvolvido como parte de uma iniciativa acadêmica da FAP Estácio. Contribuições são bem-vindas através de pull requests.

## Equipe
- Desenvolvedores do projeto de extensão da FAP Estácio
- Orientadores acadêmicos

## Licença
[MIT](LICENSE)

## Contato
Para mais informações sobre o projeto, entre em contato através de issues no GitHub ou pelo e-mail institucional da FAP Estácio.
