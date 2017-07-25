import { FormValidationError } from '../core/validation';
import { AppProvider, Application } from '../core/app';
import { ServiceError } from '../core/service';
import { HttpErrorHandler } from './handler';
import { Request, Response } from './http';
import { Error } from '../core/error';
import * as express from 'express';
import { _ } from '../core/misc';

const STATUSES = require('statuses');

/**
 * HttpError class
 */
export class HttpError extends Error {

  /**
   * HttpError constructor
   */
  constructor(public statusCode: number, message?: string) {
    super(message || STATUSES[statusCode]);
    if (statusCode < 400) {
      throw new Error('HttpError only accepts status codes greater than 400');
    }
    if (!STATUSES[statusCode]) {
      throw new Error('HttpError invalid status code');
    }
  }
}

/**
 * HttpNotFoundError class
 */
export class HttpNotFoundError extends HttpError {

  /**
   * Status code used
   */
  public static STATUS_CODE: number = 404;

  /**
   * HttpNotFoundError constructor
   */
  constructor(message?: string) {
    super(HttpNotFoundError.STATUS_CODE, message);
  }
}

/**
 * HttpBadRequestError class
 */
export class HttpBadRequestError extends HttpError {

  /**
   * Status code used
   */
  public static STATUS_CODE: number = 400;

  /**
   * HttpBadRequestError constructor
   */
  constructor(message?: string) {
    super(HttpBadRequestError.STATUS_CODE, message);
  }
}

/**
 * HttpEntityError class
 */
export class HttpEntityError extends HttpError {

  /**
   * Status code used
   */
  public static STATUS_CODE: number = 422;

  /**
   * HttpEntityError constructor
   */
  constructor(message?: string) {
    super(HttpEntityError.STATUS_CODE, message);
  }
}

/**
 * HttpServerError class
 */
export class HttpServerError extends HttpError {

  /**
   * Status code used
   */
  public static STATUS_CODE: number = 500;

  /**
   * HttpServerError constructor
   */
  constructor(message?: string) {
    super(HttpServerError.STATUS_CODE, message);
  }
}

/**
 * Prepare error before passing to render
 */
function prepareResponse(response: Response, err: Error) {
  if (err instanceof FormValidationError || err instanceof ServiceError) {
    response.status(HttpEntityError.STATUS_CODE);
  } else if (err instanceof HttpError) {
    response.status(err.statusCode);
  } else {
    response.status(HttpServerError.STATUS_CODE);
  }
}

/**
 * Provide HttpErrorHandler
 */
export function provideHttpErrorHandler(errorHandlerPath?: string): AppProvider {
  return async (app: Application): Promise<void> => {

    if (!errorHandlerPath) {
      errorHandlerPath = `${app.bootDir}/ErrorHandler`;
    }

    const HttpErrorHandlerClass = _.requireClass(errorHandlerPath as string) as new(...args: any[]) => HttpErrorHandler;
    if (!_.classExtends(HttpErrorHandlerClass, HttpErrorHandler)) {
      throw new Error('ErrorHandler must extends HttpErrorHandler');
    }

    app.use((err: Error, request: Request, response: Response, next: express.NextFunction) => {

      const httpErrorHandler = new HttpErrorHandlerClass(app, request.context);
      httpErrorHandler.report(err).then(() => {

        prepareResponse(response, err);
        httpErrorHandler.render(err, request, response);

      }).catch(err => console.error(err));
    });
  };
}
