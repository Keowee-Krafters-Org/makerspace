export class Repository {
    getEntities(entityType, params = {}) {
        throw new Error('Method not implemented');
    }
    getEntityById(entityType, id) {
        throw new Error('Method not implemented');
    }

    /**
     *  Gets entities using a filter object or predicate function.
     * @param {*} entityType   The type of entity to fetch (e.g., 'payments', 'contacts').
     * @param {*} params  Optional parameters for the query.
     * @param {*} predicate  Can be either a function or an object with field, operator, and value for simple equality checks.
     * @returns  Promise<object>}
     */
    getEntitiesByFilter(entityType, params = {}, predicate) {
        return this.getEntities(entityType, params).then(response => {
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format: expected an object with a data array');
            }

            let filteredData;
            if (typeof predicate === 'object' && predicate !== null) {
                const filterPredicate = this._createPredicateFromFilterObject(predicate);
                filteredData = response.data.filter(filterPredicate);
            } else {
                filteredData = response.data.filter(predicate);
            }

            return { ...response, data: filteredData };
        });
    }

    _createPredicateFromFilterObject(filter) {
        return (item) => {
            if (Array.isArray(filter)) {
                return filter.every(condition => this._evaluateCondition(item, condition));
            }
            return this._evaluateCondition(item, filter);
        };
    }

    _evaluateCondition(item, condition) {
        const { field, operator, value } = condition;
        const itemValue = item[field];

        switch (operator) {
            case 'equals':
                return itemValue === value;
            case 'notEquals':
                return itemValue !== value;
            case 'contains':
                return itemValue && itemValue.includes(value);
            case 'greaterThan':
                return itemValue > value;
            case 'lessThan':
                return itemValue < value;
            default:
                return false;
        }
    }
}