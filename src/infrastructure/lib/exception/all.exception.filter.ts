import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const responseObj = res as any;

        // Agar ValidationPipe formatida kelsa
        if (responseObj.error?.code === 'VALIDATION_ERROR') {
          errorResponse = responseObj.error;
        } else {
          errorResponse = {
            code: responseObj.code || 'ERROR',
            message: responseObj.message || 'Unexpected error',
          };
        }

        if (responseObj.statusCode) {
          status = responseObj.statusCode;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        code: 'DB_ERROR',
        message: (exception as any).message,
      };
    } else if (exception instanceof Error) {
      errorResponse = {
        code: 'UNEXPECTED_ERROR',
        message: exception.message,
      };
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorResponse,
    });
  }
}
