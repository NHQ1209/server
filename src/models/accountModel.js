import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from "~/config/mongodb";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import argon2 from 'argon2';

// Define Collection (Name & Schema)
const ACCOUNT_COLLECTION_NAME = "users";
const ACCOUNT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  username: Joi.string().required().trim().strict(),
  password: Joi.string().min(6).required().trim().strict(),
  email: Joi.string().required().trim().strict(),

  boardIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"];

const comparePasswords = async (plaintextPassword, hashedPassword) => {
  try {
      const result = await argon2.verify(hashedPassword, plaintextPassword);
      return result;
  } catch (error) {
      console.error('Error occurred while comparing passwords:', error);
      throw error;
  }
}

const validateBeforeCreate = async (data) => {
  return await ACCOUNT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const usernameRegex = new RegExp('^' + validData.username + '$', 'i');

    const exists = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOne({ username: { $regex: usernameRegex } });

    if (exists) return {
      message: 'Tên đăng nhập đã tồn tại trên hệ thống!',
      messageCode: 409,
    };

    const createdUser = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .insertOne(validData);

    return {
      message: 'Đăng ký thành công!',
      messageCode: 200,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const login = async (data) => {
  try {
    const user = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOne({ username: data.username });

    if (user == null) return {
      message: 'Tên đăng nhập không đúng!',
      messageCode: 404,
    };

    let compareResult = await comparePasswords(data.password, user.password);
    if (!compareResult) return {
      message: 'Mật khẩu không chính xác!',
      messageCode: 404,
    };

    return {
      user,
      message: 'OK',
      messageCode: 200,
    };
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(userId) });
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            _destroy: false,
          },
        },
      ])
      .toArray();

    return result[0] || null;
  } catch (error) {
    throw new Error(error);
  }
};

const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.userId) },
        { $push: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(column.userId) },
        { $pull: { columnOrderIds: new ObjectId(column._id) } },
        { returnDocument: "after" }
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (userId, updateData) => {
  try {
    // Lọc những field mà chúng ta không cho phép cập nhật linh tinh
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName];
      }
    });

    // Đối với những dữ liệu liên quan ObjectId, biến đổi ở đây
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (_id) => new ObjectId(_id)
      );
    }

    const result = await GET_DB()
      .collection(ACCOUNT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updateData },
        { returnDocument: "after" } // sẽ trả về kết quả mới sau khi cập nhật
      );
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

export const userModel = {
  ACCOUNT_COLLECTION_NAME,
  ACCOUNT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  login,
};
