const { gql } = require('apollo-server')

module.exports = gql`
  interface MutationResponse {
    code: Int!
    success: Boolean!
    message: String
  }
  type CommonMutationResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String
    data: Int
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
    createCategory(category: CategoryInput): CommonMutationResponse
    updateCategory(id: Int!, category: CategoryInput): Int
    deleteCategory(id: Int!): Int
    createSite(site: SiteInput): Int
    updateSite(id: Int!, site: SiteInput): Int
    deleteSite(id: Int!): Int
  }
`
