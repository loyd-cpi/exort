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
   * HttpNotFoundError constructor
   */
  constructor(message?: string) {
    super(404, message);
  }
}

/**
 * HttpBadRequestError class
 */
export class HttpBadRequestError extends HttpError {

  /**
   * HttpBadRequestError constructor
   */
  constructor(message?: string) {
    super(400, message);
  }
}

/**
 * HttpEntityError class
 */
export class HttpEntityError extends HttpError {

  /**
   * HttpEntityError constructor
   */
  constructor(message?: string) {
    super(422, message);
  }
}

/**
 * HttpServerError class
 */
export class HttpServerError extends HttpError {

  /**
   * HttpServerError constructor
   */
  constructor(message?: string) {
    super(500, message);
  }
}
