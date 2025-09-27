import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID }  from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger= new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>
  )
  {} 
  
  async create(createProductDto: CreateProductDto) {
    try {
        const producto =  this.productRepository.create(createProductDto);
        await this.productRepository.save(producto);
        return producto;
    } catch (error) {

      this.handleDbExceptions(error);
    }
  }

  //TODO paginar
  async findAll(paginationDto:PaginationDto) {

    const  { limit=10 , offset =0 } = paginationDto;
    
    return await this.productRepository.find({
      take:limit,
      skip:offset
    });
  }

  async findOne(term: string) {
    
    let product: Product|null;

    if (isUUID(term)){
        product = await this.productRepository.findOneBy({id:term});
    }else {
        const querybuilder= this.productRepository.createQueryBuilder();

        product = await querybuilder
              .where('lower(title)=:title or lower(slug)=:slug', {
                  title:term.toLowerCase(),
                  slug:term.toLowerCase()
              }).getOne();
    }
    
    if(!product) throw new NotFoundException(`Product with id "${term}" not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    /*
    Preload: Busca en la BD un registro con ese id.
    Si lo encuentra, crea una entidad nueva en memoria con los datos actuales del registro, pero sobrescribiendo con lo que mandas en updateProductDto.
    Si no encuentra nada → devuelve undefined.
    No graba aun
    */
    const product = await this.productRepository.preload({
      id:id,
      ...updateProductDto
    });
    
    if (!product) {
      throw new NotFoundException(`Product with Id ${id} not found.`)
    }

    try {
      await this.productRepository.save(product); //graba
      return product;
    } catch (error) {
        this.handleDbExceptions(error);
    }
    
  }

  async remove(id: string) {

     const result = await this.productRepository.delete({id:id} )
    
      if ( result.affected ===0){
         throw new NotFoundException(`Product with id "${id}" not found`);
      }
    return ;
  }

  private handleDbExceptions(error:any) {
    if ( error.code === "23505") {
              throw new BadRequestException(error.detail);
         }

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs.');
       
  }
}
