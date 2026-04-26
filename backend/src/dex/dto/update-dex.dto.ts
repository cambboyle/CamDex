import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDexDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;
}
