import { expect, describe, it, beforeEach } from 'vitest';

import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { UserAlreadyExistsError } from '../errors/userAlreadyExists';
import { CreateUsersUseCase } from '../users/createUsersUseCase';

let usersRepository: InMemoryUsersRepository;
let sut: CreateUsersUseCase;

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new CreateUsersUseCase(usersRepository);
  });

  it('Should be able to register', async () => {
    const email = 'johndoe22323@gmail.com';

    const { user } = await sut.execute({
      email,
      name: 'John Doe',
      password: 'johndoe',
    });

    expect(user.id).toBeTypeOf('string');
  });

  it('Should not be able to register with same email twice', async () => {
    const email = 'johndoe23232415@gmail.com';

    await sut.execute({
      email,
      name: 'John Doe',
      password: 'johndoe',
    });

    await expect(async () => {
      await sut.execute({
        email,
        name: 'John Doe',
        password: 'johndoe',
      });
    }).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
