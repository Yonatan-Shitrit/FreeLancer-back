const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { getGigs, getGigById, addGig, updateGig, removeGig } = require('./gig.controller')
const router = express.Router()

// router.use(requireAuth)

router.get('/', getGigs)
router.get('/:id', getGigById)
router.post('/', addGig)
// router.post('/', requireAuth, requireAdmin, addGig)
router.put('/:id', updateGig)
router.delete('/:id', removeGig)
// router.delete('/:id', requireAuth, requireAdmin, removeGig)

module.exports = router