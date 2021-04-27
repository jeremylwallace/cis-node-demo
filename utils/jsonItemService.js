const path = require('path')
const fs = require('fs')

const itemsFile = path.join(__dirname, '..', 'data', 'items.json')

const getItems = async (email) => {
    return new Promise((resolve, reject) => {
      fs.readFile(itemsFile, (err, itemsData) => {
        if (err) {
          reject(err)
        } else {
          const items = JSON.parse(itemsData)

          const userItems = items.filter(i => i.userId == email)

          resolve(userItems)
        }
      })
    })
  }
  
  const saveItems = async (users) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(usersFile, JSON.stringify(users), (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(users)
        }
      })
    })
  }
  
module.exports = {
  getItems,
  saveItems
}