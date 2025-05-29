const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAdmin } = require('../middleware/auth');

//获取普通员工数据
router.get('/getEmployee', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    // 将 page 和 limit 转换为数字
    const pageNum = parseInt(page);
    const pageSize = parseInt(limit);

    // 检查参数是否为有效的数字
    if (isNaN(pageNum) || isNaN(pageSize) || pageNum <= 0 || pageSize <= 0) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数'
      });
    }
    const offset = (pageNum - 1) * pageSize;
    console.log(pageNum, pageSize, offset);

    // 构建搜索条件
    let searchCondition = 'role = ?';
    let searchParams = ['staff'];

    if (keyword) {
      searchCondition += ' AND (username LIKE ? OR name LIKE ?)';
      searchParams.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 获取总人数（包含搜索条件）
    const [totalResult] = await db.query(
      `SELECT COUNT(*) as total FROM users WHERE ${searchCondition}`,
      searchParams
    );
    const total = totalResult[0].total;

    // 获取分页数据（包含搜索条件）
    const [result] = await db.query(
      `SELECT id, username, name, role, permissions FROM users WHERE ${searchCondition} ORDER BY id DESC LIMIT ?,?`,
      [...searchParams, offset, pageSize]
    );

    // 处理权限数据
    const processedResult = result.map(user => ({
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    }));

    res.json({
      code: 200,
      message: '获取普通员工数据成功',
      data: processedResult,
      total: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    });
  }
});

// 更新用户权限
router.post('/updatePermissions', isAdmin, async (req, res) => {
  try {
    const { userId, permissions } = req.body;
    
    // 更新用户权限
    const [result] = await db.query(
      'UPDATE users SET permissions = ? WHERE id = ?',
      [JSON.stringify(permissions), userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      message: '权限更新成功'
    });
  } catch (error) {
    console.error('更新权限失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新权限失败'
    });
  }
});

module.exports = router; 