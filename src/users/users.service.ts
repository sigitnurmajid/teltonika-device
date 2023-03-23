import { Injectable } from '@nestjs/common';
import { User } from './entities/users.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) { }

  async findOne(username: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ username });
  }

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(createUserDto.password, salt);
    const payload: CreateUserDto = { username: createUserDto.username, password: hash };

    const user = this.usersRepository.create(payload);
    await this.usersRepository.save(user);
    return { message: 'User created' };
  }
}
