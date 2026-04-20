import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsInt } from "class-validator";

export class RemoveStudentsFromGroupDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Type(() => Number)
  studentIds: number[];

  @IsInt()
  @Type(() => Number)
  groupId: number;
}