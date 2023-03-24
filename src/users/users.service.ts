import { Injectable } from '@nestjs/common';
import { User } from './entities/users.entitiy';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) { }

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findOne(username: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ username });
  }

  findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto){
    return this.usersRepository.update(id, updateUserDto)
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
