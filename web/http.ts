import { checkAppConfig, boot, AppProvider, Application } from '../core/app';
import { Service, Context } from '../core/service';
import { Input as BaseInput } from '../core/store';
import { provideHttpErrorHandler } from './error';
import { argument } from '../core/environment';
import { KeyValuePair } from '../core/misc';
import { File } from '../core/filesystem';
import * as formidable from 'formidable';
import { WebApplication } from './app';
import { Error } from '../core/error';
import { Session } from './session';
import * as express from 'express';
import * as cluster from 'cluster';
import * as pathlib from 'path';
import * as bytes from 'bytes';
import * as http from 'http';
import * as os from 'os';
import * as fs from 'fs';

const qs = require('qs');

/**
 * Request interface
 */
export interface Request extends express.Request {

  /**
   * Contains parsed request body
   */
  readonly body: KeyValuePair<string>;

  /**
   * Session object
   */
  readonly session: Session;

  /**
   * Input object that contains parsed body and query string
   */
  readonly input: Input;

  /**
   * Make an instance of service
   */
  make<U extends Service>(serviceClass: new(...args: any[]) => U): U;

  /**
   * Context instance
   */
  readonly context: Context;

  /**
   * Application instance
   */
  readonly app: Application;
}

/**
 * Install body parser
 */
export function provideBodyParser(): AppProvider {
  return async (app: Application): Promise<void> => {
    checkAppConfig(app);

    let requestConf = app.config.get('request') || {};
    requestConf.encoding = requestConf.encoding || 'utf-8';
    requestConf.postMaxSize = requestConf.postMaxSize || '2MB';
    requestConf.uploadMaxSize = requestConf.uploadMaxSize || '5MB';
    requestConf.tmpUploadDir = requestConf.tmpUploadDir || os.tmpdir();

    if (!pathlib.isAbsolute(requestConf.tmpUploadDir)) {
      requestConf.tmpUploadDir = pathlib.join(app.rootDir, requestConf.tmpUploadDir);
    }

    let postMaxSize = bytes.parse(requestConf.postMaxSize);
    let uploadMaxSize = bytes.parse(requestConf.uploadMaxSize);

    app.use((req: Request, res: express.Response, next: Function) => {

      (req as any).body = {};
      (req as any)._files = {};

      let form = new formidable.IncomingForm();
      form.encoding = requestConf.encoding;
      form.uploadDir = requestConf.tmpUploadDir;
      form.maxFieldsSize = postMaxSize;
      form.multiples = true;
      form.keepExtensions = true;

      form.parse(req, (err, fields, files) => {
        if (err) return next(err);

        if (fields) {
          (req as any).body = qs.parse(fields);
        }

        let totalUploadSize = 0;
        if (files) {
          for (let key in files) {
            if (Array.isArray(files[key])) {

              (req as any)._files[key] = [];
              for (let file of files[key] as any) {
                let uploaded = new UploadedFile(file);
                totalUploadSize += uploaded.size;
                (req as any)._files[key].push(uploaded);
              }

            } else {
              let uploaded = new UploadedFile(files[key]);
              totalUploadSize += uploaded.size;
              (req as any)._files[key] = uploaded;
            }
          }
        }

        if (totalUploadSize > uploadMaxSize) {
          return next(new Error('Reached upload max size'));
        }

        (req as any).input = new Input(req);
        next();
      });
    });
  };
}

/**
 * Input class
 */
export class Input extends BaseInput {

  /**
   * File input
   */
  private fileInput: KeyValuePair;

  /**
   * Input constructor
   */
  constructor(req: Request) {
    super();
    let content = {};
    switch (req.method) {
      case 'GET':
      case 'DELETE':
        content = req.query || (req as any)._query;
        break;
      default:
        content = req.body;
        break;
    }
    this.content = content;
    this.fileInput = (req as any)._files || {};
  }

  /**
   * Has file
   */
  public hasFile(key: string): boolean {
    return this.file(key) ? true : false;
  }

  /**
   * Get input file
   */
  public file(key: string): UploadedFile | undefined {
    if (Array.isArray(this.fileInput[key])) {
      return this.fileInput[key][0];
    }
    return this.fileInput[key];
  }

  /**
   * Get input files
   */
  public files(key: string): UploadedFile[] {
    if (!Array.isArray(this.fileInput[key])) {
      return this.fileInput[key] ? [this.fileInput[key]] : [];
    }
    return this.fileInput[key];
  }
}

/**
 * UploadedFile class
 */
export class UploadedFile extends File {

  /**
   * Flag if uploaded file is already moved to another location
   */
  private moved: boolean = false;

  /**
   * Flag if uploaded file is currently in process
   */
  private processing: boolean = false;

  /**
   * UploadedFile constructor
   */
  constructor(uploaded: formidable.File) {
    super({
      name: uploaded.name,
      path: uploaded.path,
      type: uploaded.type,
      hash: uploaded.hash,
      size: uploaded.size,
      lastModifiedDate: uploaded.lastModifiedDate
    });
  }

  /**
   * Get JSON Object
   */
  public toJSON(): KeyValuePair {
    return {
      name: this.name,
      path: this.path,
      type: this.type,
      hash: this.hash,
      size: this.size,
      lastModifiedDate: this.lastModifiedDate
    };
  }

  /**
   * Check availability of file for processing
   */
  public isMovedOrInProcess(): boolean {
    return this.moved || this.processing;
  }

  /**
   * Move uploaded file
   */
  public move(destination: string, fileName?: string): Promise<boolean> {
    if (this.isMovedOrInProcess()) {
      throw new Error('File is already moved or in process');
    }

    this.processing = true;
    destination = pathlib.join(destination, fileName || this.name);
    return new Promise<boolean>((resolve, reject) => {

      fs.rename(this.path, destination, err => {
        this.processing = false;

        if (err) {
          return reject(err);
        }

        this.name = pathlib.basename(destination);
        this.path = pathlib.resolve(destination);
        this.moved = true;

        resolve(true);
      });
    });
  }

  /**
   * Delete temporary file
   */
  public deleteTempFile(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {

      if (this.isMovedOrInProcess()) {
        return resolve(false);
      }

      fs.unlink(this.path, err => {

        if (err) return reject(err);
        resolve(true);
      });
    });
  }
}

/**
 * Response interface
 */
export interface Response extends express.Response {}

/**
 * Prepare server for launch
 */
export function prepareServer(app: Application) {
  checkAppConfig(app);

  app.disable('x-powered-by');
  app.disable('strict routing');
  app.enable('case sensitive routing');

  app.use((req: Request, res: Response, next: express.NextFunction) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  if (typeof (app as WebApplication).server != 'undefined') {
    throw new Error('app.server already exists. There might be conflict with expressjs');
  }

  return (app as any).server = http.createServer(app);
}

/**
 * Start HTTP Server and convert Application instance to a WebApplication instance
 */
export function startServer(app: Application) {
  const clusterize = argument('cluster');
  if (clusterize) {

    const server = prepareServer(app);
    const sticky = require('sticky-session');
    if (cluster.isMaster) {

      if (sticky.listen(server, app.config.get('app.port'))) {
        throw new Error('Sticky should return false');
      }

      server.on('error', err => console.error(err));
      server.once('listening', () => {
        console.info(`Listening on port ${app.config.get('app.port')}`);
      });

    } else {
      boot(app)
        .then(() => {
          provideHttpErrorHandler()(app);

          if (!sticky.listen(server, app.config.get('app.port'))) {
            throw new Error('Sticky should return true');
          }

          console.info(`Spawned worker ${cluster.worker.id} with process ID ${process.pid}`);
        })
        .catch(err => console.error(err));
    }

    return;
  }

  startSingleNodeServer(app).catch(err => console.error(err));
}

/**
 * Start HTTP Server and convert Application instance to a WebApplication instance
 * using just one node
 */
export function startSingleNodeServer(app: Application): Promise<WebApplication> {
  const server = prepareServer(app);
  return new Promise<WebApplication>((resolve, reject) => {

    boot(app)
      .then(() => {
        provideHttpErrorHandler()(app);

        server.on('error', err => reject(err))
          .on('listening', () => {
            console.info(`Listening on port ${app.config.get('app.port')}`);
            resolve(app as WebApplication);
          })
          .listen(app.config.get('app.port'));

      })
      .catch(err => reject(err));
  });
}
