import { z } from 'zod';

import type { FastifyTypedInstance } from '@/@types/fastifyTypes';

import { authenticate, createUser } from './controllers/auth.controller';
import {
  createDeck,
  deleteDeckById,
  getAllDecks,
  getDeckById,
  updateDeckById,
} from './controllers/decks.controller';
import {
  createFlashCard,
  getFlashCardUseCase,
} from './controllers/flashcards.controller';
import { getUser } from './controllers/users.controller';
import { verifyJWT } from './middlewares/verifyJWT';

export const appRoutes = async (app: FastifyTypedInstance) => {
  app.post(
    '/auth/sign-up',
    {
      schema: {
        tags: ['Auth'],
        operationId: 'createUser',
        body: z.object({
          name: z.string(),
          email: z.string(),
          password: z.string(),
        }),

        response: {
          201: z.object({
            createdAt: z.date(),
            id: z.string(),
            name: z.string(),
            email: z.string(),
            password: z.string(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    createUser,
  );
  app.post(
    '/auth/sign-in',
    {
      schema: {
        tags: ['Auth'],
        operationId: 'authUser',
        body: z.object({
          email: z.string(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    authenticate,
  );

  /* Authenticated routes */

  // User
  app.get(
    '/user',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['User'],
        operationId: 'getUser',
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            createdAt: z.date(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    getUser,
  );

  // Decks
  app.post(
    '/decks',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Decks'],
        operationId: 'createDecks',
        response: {
          200: z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            isPublic: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    createDeck,
  );

  app.get(
    '/decks',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Decks'],
        operationId: 'getAllDecks',
        querystring: z.object({
          title: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
          isPublic: z.boolean().optional().nullable(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                description: z.string().nullable(),
                isPublic: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
              }),
            ),
            count: z.number(),
            page: z.number(),
            pageSize: z.number(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    getAllDecks,
  );

  app.get(
    '/decks/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Decks'],
        operationId: 'getDeckById',
        params: z.object({
          id: z.string().uuid(),
        }),

        response: {
          200: z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            isPublic: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    getDeckById,
  );

  app.put(
    '/decks/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Decks'],
        operationId: 'updateDeck',
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          isPublic: z.boolean().optional(),
        }),

        response: {
          200: z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            isPublic: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    updateDeckById,
  );

  app.delete(
    '/decks/:id',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Decks'],
        operationId: 'deleteDeck',
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({}),
          400: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    deleteDeckById,
  );
  // Flashcards

  app.post(
    '/decks/:deckId/flashcards',
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Flashcards'],
        operationId: 'createFlashcard',
        params: z.object({
          deckId: z.string().uuid(),
        }),
        body: z.object({
          front: z.string(),
          back: z.string(),
        }),
        response: {
          201: z.object({
            id: z.string().uuid(),
            front: z.string(),
            back: z.string(),
            deckId: z.string().uuid(),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          404: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    createFlashCard,
  );

  app.get(
    `/decks/:deckId/flashcards`,
    {
      onRequest: [verifyJWT],
      schema: {
        tags: ['Flashcards'],
        operationId: 'getFlashCards',
        params: z.object({
          deckId: z.string().uuid(),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              front: z.string().nullable(),
              back: z.string(),
              deckId: z.string().uuid(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          ),
          404: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    getFlashCardUseCase,
  );
};
