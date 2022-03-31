const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    console.log('fi',filterBy);
    console.log('cri',criteria);
    try {
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()
        _sort(orders, filterBy.sortBy)
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ '_id': ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ '_id': ObjectId(orderId) })
        return orderId
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        const {ops} = await collection.insertOne(order)
        return ops[0]
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}
async function update(order) {
    try {
        var id = ObjectId(order._id)
        delete order._id
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ "_id": id }, { $set: { ...order } })
        order._id = id
        return order
    } catch (err) {
        logger.error(`cannot update order ${orderId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title , $options: 'i' }
        // criteria.$or = [
        //     {
        //         name: txtCriteria
        //     }
        // ]
    }
    if(+filterBy.price) {
        criteria.price = { $lte : +filterBy.price }
    }
    if(filterBy.category){
        criteria['category.name'] = { $regex: filterBy.category , $options: 'i' }
    }
    // // if(filterBy.stock) {
        // //     criteria.inStock = { $eq: JSON.parse(filterBy.stock) }
        // // }
        if(filterBy.labels && filterBy.labels.length) {
        criteria.labels = { $in: filterBy.labels }
    }
        return criteria
}

function _sort(orders, sortBy){
    if(!sortBy) return

    switch(sortBy){
        case 'createdAt':
            orders.sort((t1, t2) => t1.createdAt - t2.createdAt)
            break
        case 'name':
            orders.sort((t1, t2) => t1.name.localeCompare(t2.name))
            break
        case 'price':
            orders.sort((t1, t2) => t1.price - t2.price)
            break
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}