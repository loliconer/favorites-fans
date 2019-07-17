const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('../favorites.db')
const fs = require('fs')

fs.readFile('backup.sql', 'utf8', (err, data) => {
  if (err) throw err

  db.exec(data, function (err) {
    if (err !== null) {
      console.error(err)
    } else {
      console.log('Succeed!')
    }
  })
})

