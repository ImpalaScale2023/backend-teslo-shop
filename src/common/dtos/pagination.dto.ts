import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto{

    @ApiProperty({
        default:10,
        description:'How many rows you need'
    })
    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(()=>Number)
    limit?: number;

    @ApiProperty({
        default:0,
        description:'How many rows you want to skip'
    })
    @IsOptional()
    // @IsPositive()
    @IsNumber()
    @Min(0)
    @Type(()=>Number)
    offset?:number;
}
