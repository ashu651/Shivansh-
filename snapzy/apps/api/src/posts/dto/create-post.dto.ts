import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsArray()
  media!: Array<Record<string, any>>;
}