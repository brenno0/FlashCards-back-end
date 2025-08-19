README.md (inglês)
# 🎬 Movies & Series Streaming – Back-End

> [Português](README.pt-BR.md) | English

---

## 🚀 About the Project

This project simulates a full-featured streaming platform backend, using modern technologies:

- **Node.js** with **Fastify** for high performance
- **Prisma ORM** for database interactions
- **Vitest** for unit testing
- **Husky** for Git hooks

---

## 🛠️ Technologies Used

- **Fastify** – Lightweight, fast web framework
- **Prisma ORM** – ORM for Node.js
- **Vitest** – Unit testing framework
- **Husky** – Git hooks management
- **Prettier** – Code formatter
- **ESLint** – Linter for JavaScript/TypeScript

---

## 📁 Project Structure



├── .husky/ # Husky hooks
├── prisma/ # Prisma schema and migrations
├── src/ # Source code
├── .env.example # Example environment variables
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── vitest.config.mts # Vitest configuration
├── CHANGELOG.md # Project changelog
└── ... # Other configuration files


---

## 🧪 Tests

Run unit tests:

```bash
npm run test


Run tests with coverage:

npm run test:coverage

🔧 Available Scripts

npm run dev – Start the development server

npm run build – Compile code for production

npm run start – Start the production server

npm run lint – Run linter

npm run format – Format code

npm run release – Create a new release and update CHANGELOG

📦 Docker

Run the project with Docker:

docker-compose up --build

📝 Contributing

Fork the repository

Create a branch for your feature (git checkout -b feature/new-feature)

Commit your changes (git commit -am 'Add new feature')

Push to the branch (git push origin feature/new-feature)

Open a Pull Request

📄 License

This project is licensed under the MIT License – see LICENSE
 for details.
