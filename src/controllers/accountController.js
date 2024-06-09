
import { StatusCodes } from 'http-status-codes'
import { accountService } from '~/services/accountService'

const createNew = async (req, res, next) => {
  try {
    const createdAccount = await accountService.createNew(req.body)

    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdAccount)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const accountId = req.params.id

    const account = await accountService.getDetails(accountId)
    res.status(StatusCodes.OK).json(account)
  } catch (error) { next(error) }
}
const login = async(req, res, next)=>{
    
    try {
        const user = await accountService.login(req.body);
        res.status(StatusCodes.OK).json(user)
      } catch (error) { next(error) }

}

const update = async (req, res, next) => {
  try {
    const accountId = req.params.id
    const updatedAccount = await accountService.update(accountId, req.body)

    res.status(StatusCodes.OK).json(updatedAccount)
  } catch (error) { next(error) }
}


export const accountController = {
  createNew,
  getDetails,
  update,
  login
}
