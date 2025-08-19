
---

### **README.pt-BR.md** (português)

```markdown
# 🎬 Movies & Series Streaming – Back-End

> [English](README.md) | Português

---

## 🚀 Sobre o Projeto

Este projeto simula uma plataforma completa de streaming, utilizando tecnologias modernas:

- **Node.js** com **Fastify** para alta performance
- **Prisma ORM** para interação com banco de dados
- **Vitest** para testes unitários
- **Husky** para hooks do Git

---

## 🛠️ Tecnologias Utilizadas

- **Fastify** – Framework web leve e rápido
- **Prisma ORM** – ORM para Node.js
- **Vitest** – Framework de testes unitários
- **Husky** – Gerenciamento de hooks do Git
- **Prettier** – Formatador de código
- **ESLint** – Linter para JavaScript/TypeScript

---

## 📁 Estrutura do Projeto

├── .husky/ # Hooks do Husky
├── prisma/ # Esquemas e migrações do Prisma
├── src/ # Código-fonte
├── .env.example # Exemplo de variáveis de ambiente
├── package.json # Dependências e scripts
├── tsconfig.json # Configuração do TypeScript
├── vitest.config.mts # Configuração do Vitest
├── CHANGELOG.md # Histórico de versões
└── ... # Outros arquivos de configuração

yaml
Copiar
Editar

---

## 🧪 Testes

Para rodar os testes unitários:

```bash
npm run test
Para rodar os testes com cobertura:

bash
Copiar
Editar
npm run test:coverage
🔧 Scripts Disponíveis
npm run dev – Inicia o servidor em modo de desenvolvimento

npm run build – Compila o código para produção

npm run start – Inicia o servidor em produção

npm run lint – Executa o linter

npm run format – Formata o código

npm run release – Cria uma nova versão e atualiza o CHANGELOG

📦 Docker
Para rodar o projeto com Docker:

bash
Copiar
Editar
docker-compose up --build
📝 Contribuindo
Faça um fork do projeto

Crie uma branch para sua feature (git checkout -b feature/nova-feature)

Faça commit das suas alterações (git commit -am 'Adiciona nova feature')

Faça push para a branch (git push origin feature/nova-feature)

Abra um Pull Request

📄 Licença
Este projeto está licenciado sob a licença MIT – veja LICENSE para mais detalhes.