import { compare } from "bcryptjs";
import { User } from "generated/prisma";
import { InvalidCredentialsError } from "../errors/invalidCretendials";
import { UsersRepository } from "@/repositories/usersRepository";

interface AuthenticateUseCaseRequest {
    email:string;
    password:string;
}

interface AuthenticateUseCaseResponse {
    user:User;
}

export class AuthenticateUseCase {
    constructor(
        private readonly usersRepository:UsersRepository
    ) {}

    async handle({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
        const user = await this.usersRepository.findByEmail(email)

        if(!user) throw new InvalidCredentialsError();

        const doesPasswordMatches = await compare(password, user.password)

        if(!doesPasswordMatches) throw new InvalidCredentialsError();

        return { user };
    }
}
