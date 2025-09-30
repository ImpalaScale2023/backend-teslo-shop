import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository (User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:configService.get<string>('JWT_SECRET')??''
        });
    }
    
    //validamos cuanto ya pasamova un token e email valido
    async validate( payload: JwtPayload): Promise<User> {
        
        const {id} = payload;

        const user = await this.userRepository.findOneBy({id});

        if (!user){
            throw new UnauthorizedException(`Token not valid.`);
        }

        if (!user.isActive){
            throw new UnauthorizedException(`User is inactive, contact Admin.`);
        }

        return user; //el resutaodo se agrega a la request.
    }

}
