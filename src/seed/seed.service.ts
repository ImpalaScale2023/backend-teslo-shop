import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';

@Injectable()
export class SeedService {

  constructor(
      private readonly productService : ProductsService){

  }
  
  async runSeed() {
    await this.InsertNewProducts();
    return `seed Excuted`;
  }

  private async InsertNewProducts(){
    await this.productService.deleteAllProducts();

    const seedProd = initialData.products;
    
    const insertPromises:Promise<any>[] = [];

    seedProd.forEach( prod => {
      insertPromises.push(this.productService.create(prod));
    })

    await Promise.all(insertPromises); // 👈 ejecuta todas las promesas

    return true;
  }


  
}
