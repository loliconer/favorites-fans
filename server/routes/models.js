import Sequelize from 'sequelize'
const sequelize  = new Sequelize({
  dialect: 'sqlite',
  storage: 'favorites.db',
  define: {
    timestamps: false
  }
})

class category extends Sequelize.Model {}
class site extends Sequelize.Model {}

category.init({
  serialNo: { type: Sequelize.INTEGER },
  name: { type: Sequelize.TEXT, allowNull: false, unique: true },
  parentId: { type: Sequelize.INTEGER },
  createTime: { type: Sequelize.INTEGER }
}, { sequelize })

site.init({
  serialNo: { type: Sequelize.INTEGER },
  title: { type: Sequelize.TEXT, allowNull: false },
  description: { type: Sequelize.TEXT },
  url: { type: Sequelize.TEXT },
  categoryId: { type: Sequelize.INTEGER },
  category: { type: Sequelize.TEXT },
  likers: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
  createTime: { type: Sequelize.INTEGER }
}, { sequelize })

category.hasMany(site)

export const Category = category
export const Site = site
