const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { getOrders, getOrderById, addOrder, updateOrder, removeOrder } = require('./order.controller')
const router = express.Router()

// router.use(requireAuth)

router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/', addOrder)
// router.post('/', requireAuth, requireAdmin, addOrder)
router.put('/:id', updateOrder)
router.delete('/:id', removeOrder)
// router.delete('/:id', requireAuth, requireAdmin, removeOrder)

module.exports = router