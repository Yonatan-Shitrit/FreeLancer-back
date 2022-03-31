const gigService = require('./gig.service.js')
const logger = require('../../services/logger.service')

async function getGigs(req, res) {
    try {
      var queryParams = req.query;
      console.log('queryParams',queryParams);
      const gigs = await gigService.query(queryParams)
      res.json(gigs);
    } catch (err) {
      logger.error('Failed to get gigs', err)
      res.status(500).send({ err: 'Failed to get gigs' })
    }
}

async function getGigById(req, res) {
    try {
      const gigId = req.params.id;
      const gig = await gigService.getById(gigId)
      res.json(gig)
    } catch (err) {
      logger.error('Failed to get gig', err)
      res.status(500).send({ err: 'Failed to get gig' })
    }
}

async function addGig(req, res) {
    try {
      const gig = req.body;
      const addedGig = await gigService.add(gig)
      res.json(addedGig)
    } catch (err) {
      logger.error('Failed to add gig', err)
      res.status(500).send({ err: 'Failed to add gig' })
    }
  }
  
  async function updateGig(req, res) {
    try {
      const gig = req.body;
      const updatedGig = await gigService.update(gig)
      res.json(updatedGig)
    } catch (err) {
      logger.error('Failed to update gig', err)
      res.status(500).send({ err: 'Failed to update gig' })
  
    }
  }
  
  async function removeGig(req, res) {
    try {
      const gigId = req.params.id;
      const removedId = await gigService.remove(gigId)
      res.send(removedId)
    } catch (err) {
      logger.error('Failed to remove gig', err)
      res.status(500).send({ err: 'Failed to remove gig' })
    }
  }
  
  module.exports = {
    getGigs,
    getGigById,
    addGig,
    updateGig,
    removeGig
  }