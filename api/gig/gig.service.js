const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    console.log('fi',filterBy);
    console.log('cri',criteria);
    try {
        const collection = await dbService.getCollection('gig')
        var gigs = await collection.find(criteria).toArray()
        console.log('bout to sort');
        _sort(gigs, filterBy.sortBy)
        console.log('sorted');
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}

async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = collection.findOne({ '_id': ObjectId(gigId) })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ '_id': ObjectId(gigId) })
        return gigId
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function add(gig) {
    try {
        const collection = await dbService.getCollection('gig')
        const {ops} = await collection.insertOne(gig)
        return ops[0]
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}
async function update(gig) {
    try {
        var id = ObjectId(gig._id)
        delete gig._id
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ "_id": id }, { $set: { ...gig } })
        gig._id = id
        return gig
    } catch (err) {
        logger.error(`cannot update gig ${gigId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.title) {
        criteria.title = { $regex: filterBy.title , $options: 'i' }        
    }
    if(+filterBy.price) {
        criteria.price = { $lte : +filterBy.price }
    }
    if(filterBy.category){
        criteria['category.name'] = { $regex: filterBy.category , $options: 'i' }
    }    
        if(filterBy.labels && filterBy.labels.length) {
        criteria.labels = { $in: filterBy.labels }
    }
        return criteria
}

function _sort(gigs, sortBy){
    if(!sortBy) return

    switch(sortBy){
        case 'createdAt':
            gigs.sort((t1, t2) => t1.createdAt - t2.createdAt)
            break
        case 'name':
            console.log('i sort by name');
            gigs.sort((t1, t2) => t1.title.localeCompare(t2.title))
            console.log('i sorted by name');

            break
        case 'price':
            gigs.sort((t1, t2) => t1.price - t2.price)
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