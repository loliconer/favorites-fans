const { paginateResults } = require('./utils')

module.exports = {
  Query: {
    categories: async (_, { pageSize = 20, after }, { dataSources }, info) => {
      return await dataSources.ModalAPI.get('Category')
    },
    sites: async (_, {}, { dataSources }) => {
      return await dataSources.ModalAPI.get('Site')
    }
  },
  Mutation: {
    createCategory: async (_, { category }, { dataSources }, info) => {
      return {
        code: 200,
        success: true,
        data: await dataSources.ModalAPI.post('Category', category)
      }
    },
    updateCategory: async (_, { id, category }, { dataSources }, info) => {
      return await dataSources.ModalAPI.put('Category', id, category)
    },
    deleteCategory: async (_, { id }, { dataSources }, info) => {
      return await dataSources.ModalAPI.del('Category', id)
    },
    createSite: async (_, { site }, { dataSources }, info) => {
      return await dataSources.ModalAPI.post('Site', site)
    },
    updateSite: async (_, { id, site }, { dataSources }, info) => {
      return await dataSources.ModalAPI.put('Site', id, site)
    },
    deleteSite: async (_, { id }, { dataSources }, info) => {
      return await dataSources.ModalAPI.del('Site', id)
    }
  }
}
