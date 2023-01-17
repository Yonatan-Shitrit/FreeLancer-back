const MongoClient = require('mongodb').MongoClient

const config = require('../config')

module.exports = {
    getCollection
}

const dbName = 'FreeLancer-api'

var dbConn = null

async function getCollection(collectionName) {
    try {
        console.log('getting to get collection: ')
        const db = await connect()
        console.log('db name 16: ', db)
        const collection = await db.collection(collectionName)
        console.log('collection: ', collection)
        // console.log('connected to db', db);
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}

async function connect() {
    if (dbConn) return dbConn
console.log('config.dbURL :', config.dbURL);

try {
    const client = await MongoClient.connect(config.dbURL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true })
    dbConn = client
    return client
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}