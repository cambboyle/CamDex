import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateBoxDto {
  @IsString()
  @MaxLength(20)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  wallpaper?: string;
}
