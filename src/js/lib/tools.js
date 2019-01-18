export function makeTreeData(rows) {
  const result = [], indexes = []
  let index = 0

  rows.forEach(row => {
    row.value = row.id
    if (!row.parentId) {
      row.children = []
      result.push(row)
      indexes[row.id] = index
      index++
    }
  })
  rows.forEach(row => {
    if (row.parentId) {
      result[indexes[row.parentId]].children.push(row)
    }
  })

  return result
}
