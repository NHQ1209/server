
import { slugify } from '~/utils/formatters'
import { userModel } from '~/models/accountModel'

import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newaccount = {
      ...reqBody,
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newaccount vào trong Database
    const createdaccount = await userModel.createNew(newaccount)

    // Lấy bản ghi account sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewaccount = await userModel.findOneById(createdaccount.insertedId)

  
    return getNewaccount
  } catch (error) { throw error }
}
const login = async (reqBody) => {
    try {
      // Xử lý logic dữ liệu tùy đặc thù dự án
      const loginAccount = {
        ...reqBody,
      }
  
      // Gọi tới tầng Model để xử lý lưu bản ghi newaccount vào trong Database
      const createdaccount = await userModel.login(loginAccount)
  
    
      return createdaccount
    } catch (error) { throw error }
  }

const getDetails = async (accountId) => {
  try {
    const account = await userModel.getDetails(accountId)
    if (!account) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'account not found!')
    }

    
    const resaccount = cloneDeep(account)

    // B2: Đưa card về đúng column của nó
    resaccount.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
      column.cards = resaccount.cards.filter(card => card.columnId.equals(column._id))

    
    })

 
    delete resaccount.cards

    return resaccount
  } catch (error) { throw error }
}

const update = async (accountId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedAccount = await userModel.update(accountId, updateData)

    return updatedAccount
  } catch (error) { throw error }
}



export const accountService = {
  createNew,
  getDetails,
  update, 
  login
}
