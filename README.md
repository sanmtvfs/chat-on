# Chat-On Backend

Aplicativo de bate-papo online com restrições de idade, mensagens em tempo real e moderação de conteúdo.

## 🎯 Funcionalidades

- ✅ Verificação de idade por data de nascimento
- ✅ Autenticação com JWT
- ✅ Mensagens em tempo real com WebSocket
- ✅ Perfis de usuário
- ✅ Moderação e filtragem de conteúdo
- ✅ Salas de bate-papo por faixa etária
- ✅ Suporte a emojis e reações
- ✅ Compartilhamento de arquivos com restrições

## 🚀 Instalação

### Pré-requisitos
- Node.js (v14+)
- MongoDB
- npm ou yarn

### Passos

1. Clone o repositório:
```bash
git clone https://github.com/sanmtvfs/chat-on.git
cd chat-on
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Atualize o arquivo `.env` com suas configurações

5. Inicie o servidor:
```bash
npm run dev
```

## 📦 Estrutura do Projeto

```
chat-on/
├── config/              # Configurações do banco e autenticação
├── models/              # Modelos do Mongoose
├── routes/              # Rotas da API
├── controllers/         # Controladores da lógica de negócio
├── middleware/          # Middlewares customizados
├── services/            # Serviços de lógica
├── utils/               # Funções utilitárias
├── uploads/             # Arquivos uploadados
├── server.js            # Arquivo principal
├── .env.example         # Exemplo de variáveis de ambiente
└── package.json         # Dependências do projeto
```

## 🔐 Segurança

- Senhas criptografadas com bcryptjs
- Autenticação JWT
- Rate limiting
- Helmet para headers HTTP seguros
- Validação de entrada com express-validator
- Filtragem de conteúdo profano

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Atualizar token

### Usuários
- `GET /api/users/:id` - Obter perfil
- `PUT /api/users/:id` - Atualizar perfil

### Salas
- `GET /api/rooms` - Listar salas
- `POST /api/rooms` - Criar sala
- `GET /api/rooms/:id` - Obter detalhes da sala

### Mensagens
- `GET /api/messages/:roomId` - Histórico de mensagens
- `POST /api/messages` - Enviar mensagem

## 🔌 WebSocket Events

- `user-joined` - Usuário entrou na sala
- `user-left` - Usuário saiu da sala
- `message` - Nova mensagem
- `reaction` - Reação a uma mensagem
- `typing` - Usuário está digitando
- `file-upload` - Novo arquivo compartilhado

## 📄 Licença

MIT
