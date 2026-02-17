import { IsNumber, IsString } from "class-validator";

export class CreateLessonDto {
    @IsString()
    name: string;

    @IsString()
    description: string;
    
    @IsNumber()
    groupId: number;
    @IsNumber()
    teacherId: number;
    @IsString()
    lessonDate: string;
    @IsString()
    startTime: string;
    @IsString()
    endTime: string;
}
