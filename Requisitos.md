📌 Ordem recomendada para criar as features
1. Usuário (User)

✅ Já pronto (login, signup, JWT).

Só confirme se o User do Prisma bate com os dados que você guarda (email, senha hash, etc.).

2. Decks

Criar, listar, atualizar, excluir baralhos.

Cada deck pertence a 1 usuário.

Endpoints sugeridos:

POST /decks → criar baralho

GET /decks → listar baralhos do usuário autenticado

GET /decks/:id → detalhes de 1 baralho

PUT /decks/:id → editar baralho

DELETE /decks/:id → excluir

3. Flashcards

CRUD de flashcards dentro de decks.

Endpoints sugeridos:

POST /decks/:deckId/flashcards → criar card

GET /decks/:deckId/flashcards → listar cards do baralho

PUT /flashcards/:id → editar card

DELETE /flashcards/:id → excluir card

4. Estudo (StudySession + Progress)

Iniciar e finalizar uma sessão de estudo.

Marcar flashcard como “acertou” ou “errou” → atualiza o FlashcardProgress.

Endpoints sugeridos:

POST /study-sessions/:deckId/start → cria sessão

POST /study-sessions/:id/finish → finaliza sessão

POST /flashcards/:id/answer → registra resposta do usuário (atualiza progress)

5. Progresso e Repetição espaçada

FlashcardProgress controla quando cada card deve ser mostrado de novo.

Pode começar simples (ex.: erro → volta no mesmo dia, acerto → +1 dia).

Depois evolui para Leitner ou SM-2.

6. Tags (opcional, segunda fase)

Criar/associar tags a decks e flashcards.

Endpoints sugeridos:

POST /tags → criar tag

POST /flashcards/:id/tags → adicionar tag ao card

GET /tags/:id/flashcards → buscar cards por tag

7. Estatísticas / Dashboard (opcional, fase extra)

Quantidade de decks, flashcards, sessões de estudo.

Histórico de acertos e erros.

Endpoint sugerido:

GET /stats → resumo geral do usuário

🚀 Resumindo a ordem

Decks (CRUD)

Flashcards (CRUD dentro dos decks)

Sessões de estudo (StudySession)

Progresso do usuário (FlashcardProgress)

Tags (opcional, v2)

Estatísticas (opcional, v2)

👉 Quer que eu já desenhe um mapa de rotas Fastify (com métodos, middlewares e quais usam autenticação) baseado nessa ordem?