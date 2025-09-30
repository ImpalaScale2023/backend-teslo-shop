import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const GetUSer = createParamDecorator(
    (data:string, ctx: ExecutionContext)=>{
        
        //data es la info a buscar y/o validar

        const req =  ctx.switchToHttp().getRequest();
        const user =  req.user;

        //console.log(req);

        if (!user){
            throw new InternalServerErrorException(`User not found (request)`);
        }

        return (!data) ? user: user[data]

        /*user desde el req
        user: User {
            id: '7f240753-93e9-4030-8d5e-9c75e3bc3c5e',
            email: 'user@mail.com',
            password: undefined,
            fullName: 'Antonio Vivanco',
            isActive: true,
            roles: [ 'user' ]
        },
         */
    }
)