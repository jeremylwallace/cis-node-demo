const path = require('path')
const fs = require('fs')

const usersFile = path.join(__dirname, '..', 'data', 'users.json')

const getUsers = async () => {
    return new Promise((resolve, reject) => {
      fs.readFile(usersFile, (err, usersData) => {
        if (err) {
          reject(err)
        } else {
          const users = JSON.parse(usersData)
          resolve(users)
        }
      })
    })
  }
  
  const saveUsers = async (users) => {
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
  getUsers,
  saveUsers
}