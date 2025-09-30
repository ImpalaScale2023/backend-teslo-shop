import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt  from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}
  
  async create(createUserhDto: CreateUserDto) {
    
    try {
        const {password: plainPassword, ...restUserData} = createUserhDto; //usamos otros nombre del passowrsd para no crear conflito con la otra deconstruccion
      
        const user = this.userRepository.create({
          ...restUserData,
          password: bcrypt.hashSync(plainPassword,10)
        }) ;
        await this.userRepository.save(user)
        //no deseamos regresar el dato de passowrs
       //delete user.password; esta sentencia no funcionma por q no esta delcarado como opciones, hay que usar decontrcutccion
        //console.log(user);
        const { password, ...userWithoutPassword } = user;
        
        return {
          ...userWithoutPassword,
          token: this.getJwtToken({id:userWithoutPassword.id})
        };
        
    } catch (error) {
        this.handleDBErros(error);
    }

  }

async login(loginUserDto: LoginUserDto){
  
  const { password, email}    = loginUserDto; 
  
  // const user = await this.userRepository.findOneBy({email});
  const user = await this.userRepository.findOne({
    where: {email},
    select : { email:true, password:true, id:true} //solo estos campos se vana de volver
  });
  //console.log(user);
  if (!user){
    throw new UnauthorizedException(`Credentials are not valid (email)`);
  }
  
  if (!bcrypt.compareSync(password,user.password)){
    throw new UnauthorizedException(`Credentials are not valid (password)`);
  }

    return {
      ...user,
    token: this.getJwtToken({id: user.id}) };

  }

  async checkAuthStatus(user: User){
      return {
      ...user,
      token: this.getJwtToken({id: user.id}) };
  }


  private getJwtToken(payload:JwtPayload){
    //obtner toek
    const token = this.jwtService.sign(payload);

    return token;
  }

  private handleDBErros(err:any):never{

    if (err.code ==='23505'){
        throw new BadRequestException(err.detail);
    }
    //console.log(err);
    throw new InternalServerErrorException('PLease check Server Logs');
  }

}
