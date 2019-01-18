const db = require('./db')
const errs = require('restify-errors')

class Modal {
  constructor(table) {
    this.sql = {}
    this.table = table
    this.columns = '*'
  }

  where(clause) {
    this.sql.where = clause
    return this
  }

  orderBy(clause) {
    this.sql.orderBy = clause
    return this
  }

  limit(num) {
    this.sql.limit = num
    return this
  }

  offset(num) {
    this.sql.offset = num
    return this
  }

  //当UPDATE SET子句使用了sqlite内置函数时，如：Datetime("now")，无法使用placeholder，可以调用此方法
  addRawSet(clause) {
    this.sql.setString = clause
    return this
  }

  select(columns) {
    let statement = ''
    columns = columns || this.columns
    statement = `SELECT ${columns} FROM ${this.table}`

    const { where, orderBy, limit, offset } = this.sql
    where && (statement += ` WHERE ${where}`)
    orderBy && (statement += ` ORDER BY ${orderBy}`)
    limit && (statement += ` LIMIT ${limit}`)
    offset && (statement += ` OFFSET ${offset}`)

    return new Promise((resolve, reject) => {
      db.all(statement, function (err, rows) {
        if (err !== null) {
          reject(new errs.InternalServerError(err))
          return
        }

        resolve(rows)
      })
    })
  }

  selectOne(columns) {
    let statement = ''
    columns = columns || this.columns
    statement = `SELECT ${columns} FROM ${this.table}`

    const { where, orderBy } = this.sql
    where && (statement += ` WHERE ${where}`)
    orderBy && (statement += ` ORDER BY ${orderBy}`)

    return new Promise((resolve, reject) => {
      db.get(statement, function (err, row) {
        if (err !== null) {
          reject(new errs.InternalServerError(err))
          return
        }

        resolve(row || null)
      })
    })
  }

  update(columns) {
    let setClause = ''
    const params = []

    if (typeof columns === 'string') {
      setClause = columns
    } else {
      const keys = Object.keys(columns), marks = []
      keys.forEach(k => {
        params.push(columns[k])
        marks.push(`${k}=?`)
      })
      setClause = marks.join(',')
    }

    this.sql.setString && (setClause += `,${this.sql.setString}`)

    let statement = `UPDATE ${this.table} SET ${setClause}`
    this.sql.where && (statement += ` WHERE ${this.sql.where}`)

    return new Promise((resolve, reject) => {
      db.run(statement, params, function (err) {
        if (err !== null) {
          reject(new errs.InternalServerError(err))
          return
        }

        resolve(this.changes)
      })
    })
  }

  insert(rows) {
    if (!Array.isArray(rows)) {
      rows = [rows]
    }
    const keys = Object.keys(rows[0])
    const params = [], marks = []
    rows.forEach(row => {
      let mark = []
      keys.forEach(k => {
        params.push(row[k])
        mark.push('?')
      })
      marks.push(`(${mark.join(',')})`)
    })

    let statement = `INSERT INTO ${this.table} (${keys.join(',')}) VALUES ${marks.join(',')}`
    return new Promise((resolve, reject) => {
      db.run(statement, params, function (err) {
        if (err !== null) {
          reject(new errs.InternalServerError(err))
          return
        }

        resolve(this.lastID)
      })
    })
  }

  del() {
    let statement = `DELETE FROM ${this.table}`
    this.sql.where && (statement += ` WHERE ${this.sql.where}`)

    return new Promise((resolve, reject) => {
      db.run(statement, function (err) {
        if (err !== null) {
          reject(new errs.InternalServerError(err))
          return
        }

        resolve(this.changes)
      })
    })
  }

  static transaction(execute) {
    const trx = null
    db.run('BEGIN TRANSACTION')
    execute(trx)

    trx.on('error', function () {
      db.run('ROLLBACK')
    })

    trx.on('success', function () {
      db.run('COMMIT')
    })
  }
}

module.exports = Modal

