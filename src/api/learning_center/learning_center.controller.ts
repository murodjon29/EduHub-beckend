import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';

@ApiTags('Learning Center')
@Controller('learning-centers')
export class LearningCenterController {
  constructor(
    private readonly learningCenterService: LearningCenterService,
  ) {}

  @UseGuards(JwtGuard, SelfGuard)
  @Delete(':id/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete learning center profile image',
    description:
      'Deletes profile image of the specified learning center and removes file from storage.',
  })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'Learning center ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image successfully deleted',
    schema: {
      example: {
        message: 'Profile image deleted successfully',
        success: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async deleteProfileImage(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.learningCenterService.deleteProfileImage(id);

    return {
      success: true,
      message: 'Profile image deleted successfully',
    };
  }
}