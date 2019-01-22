const {
  ApolloServer,
  AuthenticationError, ApolloError, UserInputError, ForbiddenError
} = require('apollo-server')
const schema = require('./schema')
const resolvers = require('./resolvers')

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
