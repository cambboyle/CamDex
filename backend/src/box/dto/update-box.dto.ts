import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateBoxDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  wallpaper?: string;
}
