import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { Connection } from 'typeorm/connection/Connection';
import { Context } from '../core/service';

/**
 * Entity transformer with context
 */
export class Transformer {

  /**
   * Transformer constructor
   */
  constructor(private connection: Connection) {}

  /**
   * trigger transform method of entities
   */
  public async transformAll(target: Function | string, context: Context, entities: ObjectLiteral[], rawData: ObjectLiteral[] | ObjectLiteral) {
    await Promise.all(
      entities.map((entity, index) => this.transform(target, context, entity, Array.isArray(rawData) ? rawData[index] : rawData))
    );
  }

  /**
   * trigger transform method of entity
   */
  public async transform(target: Function | string, context: Context, entity: ObjectLiteral, rawData: ObjectLiteral) {
    if (entity instanceof Promise) return; // todo: check why need this?

    let transformCalls = this.connection.getMetadata(target).relations.reduce((promises, relation) => {
      if (!entity.hasOwnProperty(relation.propertyName)) {
        return promises;
      }

      const value = relation.getEntityValue(entity);
      if (Array.isArray(value)) {
        promises = promises.concat(this.transformAll(relation.inverseEntityMetadata.target!, context, value, rawData));
      } else if (value) {
        promises.push(this.transform(relation.inverseEntityMetadata.target!, context, value, rawData));
      }

      return promises;
    }, [] as Promise<void>[]);

    if (typeof (target as any).prototype.transform == 'function') {
      transformCalls = transformCalls.concat(entity.transform(context, rawData));
    }

    await Promise.all(transformCalls);
  }
}
