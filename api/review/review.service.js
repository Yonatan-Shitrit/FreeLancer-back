const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {        const collection = await dbService.getCollection('review')
        const reviews = await collection
        .aggregate([
            { $match: _buildCriteria(filterBy) },
            {
              $lookup: {
                from: 'user',
                foreignField: '_id',
                localField: 'userId',
                as: 'user',
              },
            },
            { $unwind: '$user' }, // [{.....}] ==> {.....}
            {
              $lookup: {
                from: 'toy',
                foreignField: '_id',
                localField: 'toyId',
                as: 'toy',
              },
            },
            { $unwind: '$toy' }, // [{.....}] ==> {.....}
            {
              $project: {
                _id: 1,
                content: 1,
                rate: 1,
                user: { _id: 1, username: 1 },
                toy: { _id: 1, name: 1, price: 1 },
              },
            },
          ])
          .toArray()

        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!isAdmin) criteria.byUserId = ObjectId(userId)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    try {
        const reviewToAdd = {
            userId: ObjectId(review.userId),
            toyId: ObjectId(review.toyId),
            content: review.content,
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd;
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {

  if (filterBy.toyId) return { toyId: ObjectId(filterBy.toyId) }
  return {}
}

module.exports = {
    query,
    remove,
    add
}


