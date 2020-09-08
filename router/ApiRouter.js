import express from 'express'
import { RouteBuilder } from '../utils'

let router = express.Router()
let routes = {
  get: [
    { path: '/fetch', controllers: [(req, res, next) => {PermissionController.setPermissionParams('MANAGE_ORGANIZATION',2,req, res, next)},PermissionController.checkPermission,OrganizationController.fetch]},
  ],
}

new RouteBuilder(router, routes)

export default router
