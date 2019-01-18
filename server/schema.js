const { gql } = require('apollo-server')
const schema = gql`
  type Category {
    id: ID!,
    serialNo: Int
    name: String!
    parentId: Int
    createTime: Int
  }
  type Query {
    categories: [Category]!
  }
`

module.exports = typeDefs
