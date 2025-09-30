import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { use } from 'passport';

@Injectable()
export class SeedService {

  /*
  se inyecta Repository<User> ya que es el objeto que te permite interactuar con la base de datos (find, save, delete, etc.).
  Es la forma de inyectar repositorios (DAO) de TypeORM que encapsulan la lógica de acceso a datos (CRUD)
  */
  constructor(
      private readonly productService : ProductsService,

      @InjectRepository (User)
      private readonly userRepository: Repository<User>){

  }
  
  async runSeed() {
    //bora data
    await this.deleteTables();
    //carga users
    const adminUser =  await this.insertUsers();
    //carga prod
    await this.InsertNewProducts(adminUser);

    return `seed Excuted`;
  }

  private async deleteTables(){
      //delete prod/ imgs
      await this.productService.deleteAllProducts();
      //delete usaurios
      const querybuilder =  this.userRepository.createQueryBuilder();
      await querybuilder
        .delete()
        .where({})
        .execute();

  }

  private async insertUsers( ){
      const seedUsers = initialData.users;

      const users: User[]=[];

      seedUsers.forEach(user =>{
        users.push( this.userRepository.create(user))
      });

      //Esto inserta en la base de datos todos los usuarios y retorna las entidades ya persistidas (con id)
      const dbUsers = await this.userRepository.save(users);
      //Devuelves el primer usuario que se guardó en la base.
      return dbUsers[0]; //regreas el primer usuario
  }

  private async InsertNewProducts( user:User){
    //limpiamos la data actual
    await this.productService.deleteAllProducts();

    const seedProd = initialData.products;
    
    const insertPromises:Promise<any>[] = [];

     seedProd.forEach( prod => {
       insertPromises.push(this.productService.create(prod, user));
     })

    await Promise.all(insertPromises); // 👈 ejecuta todas las promesas

    return true;
  }


  
}
