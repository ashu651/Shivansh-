import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiPropertyOptional({ example: 'A day at the beach' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ type: 'array', items: { example: { public_id: 'abc', url: 'https://...' } } })
  @IsArray()
  media!: Array<Record<string, any>>;
}