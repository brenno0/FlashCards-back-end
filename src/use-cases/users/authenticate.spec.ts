import { hash } from 'bcryptjs';
import { expect, describe, it, beforeEach } from 'vitest';

import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository';
import { InvalidCredentialsError } from '../errors/invalidCretendials';
import { AuthenticateUseCase } from '../users/authenticate';

let usersRepository: InMemoryUsersRepository;
let sut: AuthenticateUseCase;

describe('Register Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new AuthenticateUseCase(usersRepository);
  });

  it('Should be able to authenticate', async () => {
    const email = 'johndoe22323@gmail.com';

    await usersRepository.create({
      email,
      password: await hash('123456', 6),
    });

    const { user } = await sut.handle({
      email,
      password: '123456',
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it('Should not be able to authenticate when email is wrong', async () => {
    const email = 'johndoe22323@gmail.com';

    await expect(async () => {
      await sut.handle({
        email,
        password: '123456',
      });
    }).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('Should not be able to authenticate when email is wrong', async () => {
    const email = 'johndoe22323@gmail.com';

    await usersRepository.create({
      email,
      password: await hash('123456', 6),
    });

    await expect(async () => {
      await sut.handle({
        email,
        password: '123123',
      });
    }).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
