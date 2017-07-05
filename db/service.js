"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const service_1 = require("../core/service");
/**
 * Abstract SqlService class
 */
class SqlService extends service_1.Service {
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     */
    getConnection(name = 'default') {
        return typeorm_1.getConnectionManager().get(name);
    }
    /**
     * Gets repository for the service model
     */
    getRepository(connection = 'default') {
        return this.getConnection(connection).getRepository(this.modelClass);
    }
    /**
     * Creates a new query builder that can be used to build a sql query
     */
    createQueryBuilder(alias, connection = 'default') {
        return this.getRepository(connection).createQueryBuilder(alias);
    }
    /**
     * Creates a new model instance and copies all model properties from this object into a new model
     */
    createModelInstance(attrs) {
        return this.getRepository().create(attrs || {});
    }
    /**
     * Finds models that match given options.
     */
    find(options) {
        return this.getRepository().find(options);
    }
    /**
     * Finds model by given id.
     * Optionally find options can be applied.
     */
    findOneById(id, options) {
        return this.getRepository().findOneById(id, options);
    }
    /**
     * Finds first model that matches given options.
     */
    findOne(options) {
        return this.getRepository().findOne(options);
    }
    /**
     * Finds models that match given conditions.
     * Also counts all models that match given conditions,
     * but ignores pagination settings (from and take options).
     */
    findAndCount(options) {
        return this.getRepository().findAndCount(options);
    }
    /**
     * Finds entities by ids.
     * Optionally find options can be applied.
     */
    findByIds(ids, optionsOrConditions) {
        return this.getRepository().findByIds(ids, optionsOrConditions);
    }
    /**
     * Saves one or many given entities.
     */
    save(entityOrEntities, options) {
        return this.getRepository().persist(entityOrEntities, options);
    }
    /**
     * Removes one or many given entities.
     */
    remove(entityOrEntities, options) {
        return this.getRepository().remove(entityOrEntities, options);
    }
    /**
     * Removes entity by a given entity id.
     */
    removeById(id, options) {
        return this.getRepository().removeById(id, options);
    }
    /**
     * Removes entity by a given entity id.
     */
    removeByIds(ids, options) {
        return this.getRepository().removeByIds(ids, options);
    }
    /**
     * Updates entity partially. Entity can be found by a given conditions.
     */
    update(conditionsOrFindOptions, partialEntity, options) {
        return this.getRepository().update(conditionsOrFindOptions, partialEntity, options);
    }
    /**
     * Updates entity partially. Entity will be found by a given id.
     */
    updateById(id, partialEntity, options) {
        return this.getRepository().updateById(id, partialEntity, options);
    }
}
exports.SqlService = SqlService;
//# sourceMappingURL=service.js.map