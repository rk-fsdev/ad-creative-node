import express from 'express'
import ApiRouter from './ApiRouter'

let router = express.Router()

router.use('/api', ApiRouter)

export default router