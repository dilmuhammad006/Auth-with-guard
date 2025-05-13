import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status = exception.getStatus();
    let message = exception.message;
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse == 'object' && exceptionResponse !== null) {
      const res = exceptionResponse as any;
      if (Array.isArray(res.message)) {
        message = res.message.join(', ');
      } else {
        message = res.message || exception.message;
      }
    }

    response.status(status).send({
      succes: false,
      statusCode: status,
      message: message,
      error: exception.name,
      timeStamp: `${Date.now()}`,
      path: request.url,
    });
  }
}
