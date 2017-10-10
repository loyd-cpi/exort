"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const connection_1 = require("./connection");
const service_1 = require("../core/service");
/**
 * Abstract SeedService class
 */
class SeedService extends service_1.Service {
}
exports.SeedService = SeedService;
/**
 * Abstract SqlService class
 */
class SqlService extends service_1.Service {
    /**
     * Gets entity manager from the registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     */
    getEntityManager(connection) {
        const manager = this.context.store.get(SqlService.STORE_TRANS_KEY);
        if (manager && manager.connection.name == connection_1.prefixConnectionName(this.app, connection)) {
            return manager;
        }
        return connection_1.getConnection(this.app, connection).manager;
    }
    /**
     * Gets repository for the service model
     */
    getRepository(connection) {
        return this.getEntityManager(connection).getRepository(this.entity);
    }
    /**
     * Creates a new query builder that can be used to build a sql query
     */
    createQueryBuilder(alias, connection) {
        return this.getRepository(connection).createQueryBuilder(alias || this.entity.name);
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
        return this.getRepository().save(entityOrEntities, options);
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
    /**
     * Executes insert query and returns raw database results.
     */
    insert(values) {
        return this.createQueryBuilder(this.entity.name).insert().into(this.entity).values(values).execute();
    }
    /**
     * Make the closure run with transaction object
     */
    transaction(closure, connection) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let result;
            yield this.getEntityManager(connection).transaction((transaction) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const newContext = this.context.newInstance();
                newContext.store.set(SqlService.STORE_TRANS_KEY, transaction);
                const startingService = newContext.make(this.constructor);
                try {
                    result = yield closure.call(startingService);
                }
                finally {
                    newContext.store.delete(SqlService.STORE_TRANS_KEY);
                }
            }));
            return result;
        });
    }
}
/**
 * Transaction key in context store
 */
SqlService.STORE_TRANS_KEY = '$exort:transaction';
exports.SqlService = SqlService;
//# sourceMappingURL=service.js.map