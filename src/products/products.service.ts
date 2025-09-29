import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID }  from 'uuid';
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger= new Logger('ProductService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository : Repository<Product>,
     @InjectRepository(ProductImage)
    private readonly productImageRepository : Repository<ProductImage>,
    private readonly dataSource: DataSource
  )
  {} 
  
  async create(createProductDto: CreateProductDto) {
    try {

        /*
        Con desestructuración:
        images → se extrae y, si no viene en el DTO, se inicializa como un arreglo vacío.
        productDetails → contendrá el resto ({ name: 'Laptop', price: 1000 }). es un nombre arbitratio pudimos poner RestProduct
        */
        const { images=[] , ...productDetails } =  createProductDto;

        const producto =  this.productRepository.create({
          ...productDetails, //en este caso es spread
          images: images.map( img => this.productImageRepository.create({ url:img}))  //estamo creadno las imagenes deontro de la creacion del prd
        }
        );
        await this.productRepository.save(producto);
        //return producto;
        return {...producto, images:images}; //lo que haces es reremplzar el dato de las images por como se recibio el dato de imagenes
    } catch (error) {

      this.handleDbExceptions(error);
    }
  }

  //TODO paginar
  async findAll(paginationDto:PaginationDto) {

    const  { limit=10 , offset =0 } = paginationDto;
    
    const productos = await this.productRepository.find({
      take:limit,
      skip:offset,
      relations:{
        images:true
      }
    });

    return productos.map((prod)=>({
      ...prod,
      images: prod.images?.map(img=> img.url)
    }))
  }

  async findOne(term: string) {
    
    let product: Product|null;

    if (isUUID(term)){
        product = await this.productRepository.findOneBy({id:term}); //usaemos eaager en la entidad para que aparezacan las imagenes
    }else {
        const querybuilder= this.productRepository.createQueryBuilder('qProd'); //el eagre no funcioanar con query builder. se usas lefJoinandselect

        product = await querybuilder
              .where('lower(title)=:title or lower(slug)=:slug', {
                  title:term.toLowerCase(),
                  slug:term.toLowerCase()
              })
              .leftJoinAndSelect('qProd.images','prodImages')
              .getOne();
    }
    
    if(!product) throw new NotFoundException(`Product with id "${term}" not found`);

    return product;
  }

  async findONEPlain(term:string){
    const {images=[], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map(image=> image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    
    //saco images
    const { images, ...restToUpdate} = updateProductDto;
    
    /*
    Preload: Busca en la BD un registro con ese id.
    Si lo encuentra, crea una entidad nueva en memoria con los datos actuales del registro 
        pero sobrescribiendo con lo que mandas en restToUpdate.
    Si no encuentra nada → devuelve undefined.
    No graba aun
    */

    const product = await this.productRepository.preload({
      id:id,
      ...restToUpdate
    });

    
    if (!product) {
      throw new NotFoundException(`Product with Id ${id} not found.`)
    }

    //create query runner
    const queryRunner  = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //en esta logica se requiere que si vienen nuevas imagenes se borren las actuales
      if ( images) {
        //brrar
          await queryRunner.manager.delete(ProductImage, 
                        {
                          product: {id: id}
                        }
                );
        
        product.images = images.map(img => this.productImageRepository.create({ url: img}) )
      }else{

      }

      await queryRunner.manager.save(product);
      // await this.productRepository.save(product); //graba

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findONEPlain( id ); 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();  

      this.handleDbExceptions(error);
    }
    
  }

  async remove(id: string) {
    //para este casop se removera en casacada con las imagenes, en otros casos ser manejaria de primero borra detalle y lugo el padre
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

  async deleteAllProducts(){
    const query =  this.productRepository.createQueryBuilder('qProd');

    try {
        return await query.delete().where({}).execute();
    } catch (error) {
      
    }
  }
}
