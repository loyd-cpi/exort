"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
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
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     */
    getConnection(name) {
        return typeorm_1.getConnectionManager().get(name);
    }
    /**
     * Get transaction connection
     */
    getTransaction() {
        return this.context.store.get(SqlService.STORE_TRANS_KEY);
    }
    /**
     * Gets repository for the service model
     */
    getRepository(connection) {
        let transaction = this.getTransaction();
        if (transaction && (!connection || transaction.connection.name == connection)) {
            return transaction.getRepository(this.modelClass);
        }
        return this.getConnection(connection).getRepository(this.modelClass);
    }
    /**
     * Creates a new query builder that can be used to build a sql query
     */
    createQueryBuilder(alias, connection) {
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
    /**
     * Make the closure run with transaction object
     */
    transaction(closure, connection) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let result;
            yield this.getConnection(connection).transaction((transaction) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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