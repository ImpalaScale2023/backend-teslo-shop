import { META_ROLES } from './../../decorators/role-protected.decorator';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';


@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector //para obtener le matadata
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles : string[] = this.reflector.get(META_ROLES,context.getHandler());

    if(!validRoles) return true; //si no existen los roles definidos  cualquiera puede ingresar
    if(validRoles.length===0) return true; //roles vacios  cualquiera puede ingresar
    

    //console.log({validRoles});
      const req =  context.switchToHttp().getRequest();
      const user = req.user;

       if (!user){
                  throw new BadRequestException(`User not found (Guard)`);
              }
      
      for (const role of user.roles) {
          if (validRoles.includes(role)){
            return true;
          }
      }
    // console.log({userRoloes:user.roles });
    //return false;
    throw new ForbiddenException(`User ${user.fullName} needs a valir role:[${validRoles}]`); //esto retorna false del Guard
  }
}
