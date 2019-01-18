const { paginateResults } = require('./utils')

module.exports = {
  Query: {
    categories: async (_, { pageSize = 20, after }, { dataSource }) => {
      const allCategories = await dataSource.categoryAPI.get()
    }
  },
  Mutation: {}
}
