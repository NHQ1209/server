
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { accountValidation } from '~/validations/accountValidation'
import { accountController } from '~/controllers/accountController'

const Router = express.Router()

Router.route('/register')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: API get list accounts' })
  })
  .post(accountValidation.createNew, accountController.createNew)

Router.route('/:id')
  .get(accountController.getDetails)
  .put(accountValidation.update, accountController.update)

Router.route('/login')
  .post(accountController.login)


export const accountRoute = Router
