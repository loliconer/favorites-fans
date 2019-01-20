const { ApolloServer, gql } = require('apollo-server')

const schema = gql`
  type MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }
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
  input CategoryInput {
    name: String!
    parentId: Int
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
    createCategory(category: CategoryInput): Int
    updateCategory(id: Int!, category: CategoryInput): Int
    deleteCategory(id: Int!): Int
    createSite(site: SiteInput): Int
  }
`

const resolvers = {
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
      return await dataSources.ModalAPI.post('Category', category)
    },
    updateCategory: async(_, { id, category }, { dataSources }, info) => {
      return await dataSources.ModalAPI.put('Category', id, category)
    },
    deleteCategory: async (_, { id }, { dataSources }, info) => {
      return await dataSources.ModalAPI.del('Category', id)
    },
    createSite: async(_, { site }, { dataSources }, info) => {
      return await dataSources.ModalAPI.post('site', site)
    }
  }
}

const ModalAPI  = require('./datasources/modal')
const dataSources = () => ({
  ModalAPI: new ModalAPI()
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
