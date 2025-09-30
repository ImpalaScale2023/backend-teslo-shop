import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from 'src/auth/decorators/auth.decorators';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth(ValidRoles.superUser) //hay q importar desde seed el AuthModule
  executeSeed() {
    return this.seedService.runSeed();
  }


}
