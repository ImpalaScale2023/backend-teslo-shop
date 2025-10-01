import { Controller, Get, Post, Body, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

import { GetUSer } from './decorators/get-user.decorator';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { Auth } from './decorators/auth.decorators';

import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserhDto: CreateUserDto) {
    return this.authService.create(createUserhDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUSer() user:User
  ){
    //todo:algo

    return  this.authService.checkAuthStatus(user);
  }


  @Get('private')
  @UseGuards(AuthGuard() )
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUSer() user:User,
    @GetUSer('email') userEmail:string,
    @RawHeaders() rawHeaders:string[]
  ) {
    
    //visualizar todo lo que tioene el request del env 
    console.log(request)
    return {
      ok: true,
      message: "HolaMundo Private",
      user,
      userEmail,
      rawHeaders

    }
  }

  @Get('private2')
  //@SetMetadata('roles',['admin','super-user'])
  //el control con la metadata se manejara en roleprotected
  @RoleProtected(ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard) //(autenticacion, autorizacion)
  testingPrivateRoute2(
    @GetUSer() user: User
  ) {
    return {
      ok: true,
      user
    }
  }
  //
  //usaremos custom decorator que juna a otros
/*
 Ya estamos usando @GetUser en los parámetros del controlador, y este GetUser necesita que se establezca el usuario, 
 cosa que hace nuestro Auth al hacer UseGuards(AuthGuard()).
 Si no se llama al Auth el GetUser cae en la excepción que definimos en el archivo get-user.decorator.ts que es la que provoca el error 500
 El registrar no tiene problemas por que no usa GetUser
*/
  @Get('private3')
  @Auth(ValidRoles.superUser,ValidRoles.user)
  testingPrivateRoute3(
    @GetUSer() user: User
  ) {
    
    return {
      ok: true,
      user
    }

  }

  
}
