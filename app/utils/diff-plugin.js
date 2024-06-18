const _ = require('lodash')

const getDiff = (curr, prev) => {
    function changes(object, base) {
      return _.transform(object, (result, value, key) => {
        if (!_.isEqual(value, base[key]))
          result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value
      })
   }
   return changes(curr, prev)
}

const plugin = function (schema) {
  schema.post('init', doc => {
    doc._original = doc.toObject({transform: false})
  })
  schema.pre('save', function (next) {
    if (this.isNew) {
      next()
    }else {
      this._diff = getDiff(this, this._original)
      next()
    }
})
}

module.exports = plugin