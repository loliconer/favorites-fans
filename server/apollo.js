const { ApolloServer } = require('apollo-server')
const { gql } = require('apollo-server')

const schema = gql`
  type Category {
    id: Int!
    serialNo: Int
    name: String!
    parentId: Int
    createTime: Int
  }
  type Site {
    id: Int!
    serialNo: Int
    title: String!
    description: String
    url: String!
    categoryId: Int
    category: String
    likers: Int
    createTime: Int
  }
  input SiteInput {
    title: String!
    description: String
    url: String!
    categoryId: Int
    category: String
  }
  type Query {
    categories: [Category]!
    sites: [Site]!
  }
  type Mutation {
    createCategory(name: String!, parentId: Int): Int
    updateCategory(id: Int!, name: String!): Int
    deleteCategory(id: Int!): Int
    createSite(site: SiteInput): Int
  }
`

const resolvers = {
  Query: {
    categories: async (_, { pageSize = 20, after }, { dataSources }, info) => {
      return await dataSources.categoryAPI.get()
    },
    sites: async (_, {}, { dataSources }) => {
      return await dataSources.SQLiteAPI.get('site')
    }
  },
  Mutation: {
    createCategory: async (_, { name, parentId }, { dataSources }, info) => {
      return await dataSources.categoryAPI.post(name, parentId)
    },
    updateCategory: async(_, { id, name }, { dataSources }, info) => {
      return await dataSources.categoryAPI.put(id, name)
    },
    deleteCategory: async (_, { id }, { dataSources }, info) => {
      return await dataSources.categoryAPI.del(id)
    },
    createSite: async(_, { site }, { dataSources }, info) => {
      return await dataSources.SQLiteAPI.post('site', site)
    }
  }
}

const { createStore } = require('./utils')
const CategoryAPI = require('./datasources/category')
const SiteAPI = require('./datasources/site')
const SQLiteAPI = require('./datasources/sqlite')
const store = createStore()
const dataSources = () => ({
  categoryAPI: new CategoryAPI({ store }),
  siteAPI: new SiteAPI({ store }),
  SQLiteAPI: new SQLiteAPI({ store })
})

const context = async ({ req }) => {
  return {}
}
const aplServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources,
  context
})

aplServer.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
