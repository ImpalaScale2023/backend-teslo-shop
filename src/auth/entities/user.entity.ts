import { Product } from './../../products/entities/product.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('Users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column('text',{unique:true})
    email:string;

    @Column('text', {
        select:false //cuando se haga una bsuqeuda  findoneby no se va a retornar este campos
    })
    password:string;

    @Column('text')
    fullName:string;

    @Column('bool', {default:true})
    isActive:boolean;

    @Column('text',{array:true, default:['user']})
    roles:string[];


    @OneToMany(
        ()=> Product,
        ( prod) => prod.user
    )
    product: Product


    @BeforeInsert()
    checkFieldBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
     checkFieldBeforeUpdate(){
        this.checkFieldBeforeInsert();
    
    }

}
