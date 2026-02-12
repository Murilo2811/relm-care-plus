# Relm Care+ (Frontend)

Interface de gestão de garantias para Relm Bikes. Este projeto é a camada de **Frontend** (React) que se conecta a uma API REST.

## Arquitetura Separada

Este frontend foi projetado para ser desacoplado do backend.
- **Frontend:** React + Tailwind (Porta 3000)
- **Backend:** NestJS + Prisma (Porta 3001)

## Configuração da API

O arquivo `services/api.ts` controla a fonte de dados.

### Modo Desenvolvimento (Mock)
Por padrão, a variável `USE_MOCK = true` em `services/api.ts` está ativa. Isso permite rodar o frontend sem precisar subir o servidor backend e banco de dados. Todos os dados são voláteis e resetam ao recarregar a página.

### Modo Produção (Real Backend)
Para conectar ao backend real:
1. Certifique-se que o backend (NestJS) esteja rodando em `http://localhost:3001`.
2. Altere `USE_MOCK = false` em `services/api.ts`.
3. O frontend passará a fazer chamadas `fetch` reais e exigirá um token JWT válido no login.

## Executando o Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Rode o servidor de desenvolvimento:
   ```bash
   npm start
   ```

## Estrutura de Pastas

- `/pages`: Telas da aplicação (Dashboard, Login, Formulário).
- `/components`: Componentes reutilizáveis (Layout, etc).
- `/services`: Camada de comunicação de dados (`api.ts`).
- `/types`: Definições de tipos compartilhados (DTOs).
