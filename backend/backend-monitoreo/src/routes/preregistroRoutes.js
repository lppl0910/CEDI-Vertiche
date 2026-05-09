const express = require('express')
const router = express.Router()
const { getKPIsPreregistro } = require('../controllers/preregistroController')

router.get('/kpis', getKPIsPreregistro)

module.exports = router