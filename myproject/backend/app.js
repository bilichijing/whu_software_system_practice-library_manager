const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库初始化
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功');
    initDatabase();
  }
});

// 设置数据库为全局变量，供路由使用
app.locals.db = db;

// 导入路由
const libraryApiRoutes = require('./routes/library-api');

// 使用路由
app.use('/api/library', libraryApiRoutes);

// 初始化数据库表
function initDatabase() {
  // 用户表
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE,
      real_name TEXT,
      student_id TEXT,
      phone TEXT,
      points INTEGER DEFAULT 100,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 用户评价记录表
  const createRatingTable = `
    CREATE TABLE IF NOT EXISTS user_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      booking_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      tags TEXT,
      rating_type TEXT DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (booking_id) REFERENCES bookings (id)
    )
  `;

  // 积分变动记录表
  const createPointsHistoryTable = `
    CREATE TABLE IF NOT EXISTS points_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points_change INTEGER NOT NULL,
      points_before INTEGER NOT NULL,
      points_after INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      action_description TEXT,
      related_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `;

  // 积分规则表
  const createPointsRulesTable = `
    CREATE TABLE IF NOT EXISTS points_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name TEXT UNIQUE NOT NULL,
      action_type TEXT NOT NULL,
      points_change INTEGER NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 座位预约表（为积分系统预留）
  const createBookingTable = `
    CREATE TABLE IF NOT EXISTS seat_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status TEXT DEFAULT 'active',
      check_in_time DATETIME,
      check_out_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `;

  // 创建自习室表
  const createStudyRoomsTable = `
    CREATE TABLE IF NOT EXISTS study_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      floor INTEGER NOT NULL,
      area TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      equipment TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建座位表
  const createSeatsTable = `
    CREATE TABLE IF NOT EXISTS seats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seat_number TEXT NOT NULL,
      room_id INTEGER NOT NULL,
      seat_type TEXT DEFAULT 'standard',
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES study_rooms (id)
    )
  `;

  // 创建预约表
  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      seat_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      status TEXT DEFAULT 'active',
      check_in_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (seat_id) REFERENCES seats (id)
    )
  `;

  // 按顺序创建表
  db.run(createUserTable, (err) => {
    if (err) {
      console.error('创建用户表失败:', err.message);
    } else {
      console.log('用户表创建成功');
      
      db.run(createRatingTable, (err) => {
        if (err) {
          console.error('创建评价表失败:', err.message);
        } else {
          console.log('评价表创建成功');
          
          db.run(createPointsHistoryTable, (err) => {
            if (err) {
              console.error('创建积分历史表失败:', err.message);
            } else {
              console.log('积分历史表创建成功');
              
              db.run(createPointsRulesTable, (err) => {
                if (err) {
                  console.error('创建积分规则表失败:', err.message);
                } else {
                  console.log('积分规则表创建成功');
                  initDefaultPointsRules();
                  
                  db.run(createBookingTable, (err) => {
                    if (err) {
                      console.error('创建预约表失败:', err.message);
                    } else {
                      console.log('预约表创建成功');
                      
                      db.run(createStudyRoomsTable, (err) => {
                        if (err) {
                          console.error('创建自习室表失败:', err.message);
                        } else {
                          console.log('自习室表创建成功');
                          
                          db.run(createSeatsTable, (err) => {
                            if (err) {
                              console.error('创建座位表失败:', err.message);
                            } else {
                              console.log('座位表创建成功');
                              
                              db.run(createBookingsTable, (err) => {
                                if (err) {
                                  console.error('创建预约表失败:', err.message);
                                } else {
                                  console.log('预约表创建成功');
                                  
                                  // 所有表创建完成后，初始化数据
                                  initDefaultData();
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
}

// 初始化默认数据
function initDefaultData() {
  // 初始化自习室数据
  db.run(`
    INSERT OR IGNORE INTO study_rooms (id, name, floor, area, capacity, equipment) VALUES
    (1, '自习室A', 1, '安静区', 50, '空调,WiFi,插座'),
    (2, '自习室B', 1, '讨论区', 30, '空调,WiFi,插座,白板'),
    (3, '自习室C', 2, '安静区', 40, '空调,WiFi,插座'),
    (4, '自习室D', 2, '讨论区', 25, '空调,WiFi,插座,投影仪')
  `, (err) => {
    if (err) {
      console.error('初始化自习室数据失败:', err.message);
    } else {
      console.log('自习室数据初始化成功');
    }
  });

  // 初始化座位数据
  db.run(`
    INSERT OR IGNORE INTO seats (id, seat_number, room_id, seat_type) VALUES
    (1, 'A001', 1, 'standard'),
    (2, 'A002', 1, 'standard'),
    (3, 'A003', 1, 'standard'),
    (4, 'A004', 1, 'standard'),
    (5, 'A005', 1, 'standard'),
    (6, 'B001', 2, 'standard'),
    (7, 'B002', 2, 'standard'),
    (8, 'B003', 2, 'standard'),
    (9, 'C001', 3, 'standard'),
    (10, 'C002', 3, 'standard'),
    (11, 'C003', 3, 'standard'),
    (12, 'D001', 4, 'standard'),
    (13, 'D002', 4, 'standard'),
    (14, 'D003', 4, 'standard')
  `, (err) => {
    if (err) {
      console.error('初始化座位数据失败:', err.message);
    } else {
      console.log('座位数据初始化成功');
    }
  });
}

// 初始化默认积分规则
function initDefaultPointsRules() {
  const defaultRules = [
    {
      rule_name: '预约成功',
      action_type: 'booking_success',
      points_change: 10,
      description: '成功预约座位'
    },
    {
      rule_name: '按时到场',
      action_type: 'check_in_on_time',
      points_change: 5,
      description: '按时到达并签到'
    },
    {
      rule_name: '提交评价',
      action_type: 'submit_rating',
      points_change: 3,
      description: '提交座位使用评价'
    },
    {
      rule_name: '优质评价',
      action_type: 'high_quality_rating',
      points_change: 5,
      description: '提交高质量评价（4-5星）'
    },
    {
      rule_name: '爽约扣除',
      action_type: 'no_show',
      points_change: -20,
      description: '预约但未到场'
    },
    {
      rule_name: '违规占座',
      action_type: 'illegal_occupation',
      points_change: -30,
      description: '违规占用座位'
    },
    {
      rule_name: '提前取消',
      action_type: 'early_cancel',
      points_change: -5,
      description: '预约后提前取消'
    }
  ];

  defaultRules.forEach(rule => {
    db.get('SELECT id FROM points_rules WHERE rule_name = ?', [rule.rule_name], (err, row) => {
      if (err) {
        console.error('查询积分规则失败:', err.message);
        return;
      }
      if (!row) {
        db.run(
          'INSERT INTO points_rules (rule_name, action_type, points_change, description) VALUES (?, ?, ?, ?)',
          [rule.rule_name, rule.action_type, rule.points_change, rule.description],
          function(err) {
            if (err) {
              console.error('插入积分规则失败:', err.message);
            } else {
              console.log(`积分规则 "${rule.rule_name}" 创建成功`);
            }
          }
        );
      }
    });
  });
}

// 积分变动函数
async function updateUserPoints(userId, actionType, actionDescription = '', relatedId = null) {
  return new Promise((resolve, reject) => {
    // 获取积分规则
    db.get('SELECT points_change FROM points_rules WHERE action_type = ? AND is_active = 1', [actionType], (err, rule) => {
      if (err) {
        reject(err);
        return;
      }
      if (!rule) {
        reject(new Error('未找到对应的积分规则'));
        return;
      }

      // 获取用户当前积分
      db.get('SELECT points FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          reject(err);
          return;
        }
        if (!user) {
          reject(new Error('用户不存在'));
          return;
        }

        const pointsBefore = user.points;
        const pointsChange = rule.points_change;
        const pointsAfter = pointsBefore + pointsChange;

        // 更新用户积分
        db.run('UPDATE users SET points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [pointsAfter, userId], function(err) {
          if (err) {
            reject(err);
            return;
          }

          // 记录积分变动历史
          db.run(
            'INSERT INTO points_history (user_id, points_change, points_before, points_after, action_type, action_description, related_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, pointsChange, pointsBefore, pointsAfter, actionType, actionDescription, relatedId],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              resolve({
                pointsChange,
                pointsBefore,
                pointsAfter,
                historyId: this.lastID
              });
            }
          );
        });
      });
    });
  });
}

// 用户注册API
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, real_name, student_id, phone } = req.body;
    
    console.log('注册请求参数:', { username, email, real_name, student_id, phone });

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 处理可选字段，空字符串转为null
    const safeEmail = email && email.trim() !== '' ? email : null;
    const safeRealName = real_name && real_name.trim() !== '' ? real_name : null;
    const safeStudentId = student_id && student_id.trim() !== '' ? student_id : null;
    const safePhone = phone && phone.trim() !== '' ? phone : null;

    // 检查用户名是否已存在
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        console.error('注册时检查用户名失败:', err);
        return res.status(500).json({ error: '数据库错误' });
      }
      if (row) {
        return res.status(400).json({ error: '用户名已存在' });
      }

      try {
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('密码加密成功');

        // 插入新用户
        const insertUser = `
          INSERT INTO users (username, password, email, real_name, student_id, phone)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(insertUser, [username, hashedPassword, safeEmail, safeRealName, safeStudentId, safePhone], function(err) {
          if (err) {
            console.error('注册时插入用户失败:', err);
            return res.status(500).json({ error: '注册失败: ' + err.message });
          }

          console.log('用户插入成功，ID:', this.lastID);

          // 生成JWT token - 使用id字段保持一致性
          const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });

          res.status(201).json({
            message: '注册成功',
            token,
            user: {
              id: this.lastID,
              username,
              email: safeEmail,
              real_name: safeRealName,
              student_id: safeStudentId,
              phone: safePhone,
              points: 100
            }
          });
        });
      } catch (hashError) {
        console.error('密码加密失败:', hashError);
        return res.status(500).json({ error: '密码加密失败' });
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器错误: ' + error.message });
  }
});

// 用户登录API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // 查询用户
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error('登录时查询用户失败:', err);
      return res.status(500).json({ error: '数据库错误' });
    }
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成JWT token - 使用id字段保持一致性
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        real_name: user.real_name,
        student_id: user.student_id,
        phone: user.phone,
        points: user.points,
        avatar: user.avatar
      }
    });
  });
});

// 获取用户信息API
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT id, username, email, real_name, student_id, phone, points, avatar, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  });
});

// 更新用户信息API
app.put('/api/user/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { email, real_name, phone, avatar } = req.body;

  const updateUser = `
    UPDATE users 
    SET email = ?, real_name = ?, phone = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(updateUser, [email, real_name, phone, avatar, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: '更新失败' });
    }

    res.json({ message: '用户信息更新成功' });
  });
});

// 获取用户积分API
app.get('/api/user/points', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT points FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    if (!row) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ points: row.points });
  });
});

// 获取用户评价记录API
app.get('/api/user/ratings', authenticateToken, (req, res) => {
  // const userId = req.user.id;

  const getRatings = `
    SELECT r.*, u.username
    FROM user_ratings r
    JOIN users u ON r.user_id = u.id
    ORDER BY r.created_at DESC
  `;

  db.all(getRatings, [], (err, ratings) => {
    if (err) {
      console.error('获取评价记录失败:', err);
      return res.status(500).json({ error: '获取评价记录失败' });
    }

    // 解析标签
    const ratingsWithTags = ratings.map(rating => ({
      ...rating,
      tags: rating.tags ? JSON.parse(rating.tags) : []
    }));

    res.json({ ratings: ratingsWithTags });
  });
});

// 获取评价统计信息
app.get('/api/ratings/stats', authenticateToken, (req, res) => {
  const statsQuery = `
    SELECT 
      COUNT(*) as total_ratings,
      AVG(rating) as avg_rating,
      COUNT(CASE WHEN rating >= 4 THEN 1 END) as high_ratings,
      COUNT(CASE WHEN rating <= 2 THEN 1 END) as low_ratings
    FROM user_ratings
  `;

  db.get(statsQuery, [], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: '获取评价统计失败' });
    }

    // 获取标签统计
    const tagsQuery = `
      SELECT tags FROM user_ratings WHERE tags IS NOT NULL AND tags != ''
    `;

    db.all(tagsQuery, [], (err, tagResults) => {
      if (err) {
        return res.status(500).json({ error: '获取标签统计失败' });
      }

      // 统计标签频率
      const tagCounts = {};
      tagResults.forEach(result => {
        try {
          const tags = JSON.parse(result.tags);
          tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        } catch (e) {
          // 忽略解析错误
        }
      });

      res.json({
        stats: {
          ...stats,
          avg_rating: stats.avg_rating ? Math.round(stats.avg_rating * 10) / 10 : 0
        },
        tagCounts
      });
    });
  });
});

// 积分相关API

// 获取积分历史记录
app.get('/api/user/points/history', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const getHistory = `
    SELECT ph.*, pr.rule_name, pr.description as rule_description
    FROM points_history ph
    LEFT JOIN points_rules pr ON ph.action_type = pr.action_type
    WHERE ph.user_id = ?
    ORDER BY ph.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const getTotal = `
    SELECT COUNT(*) as total
    FROM points_history
    WHERE user_id = ?
  `;

  db.get(getTotal, [userId], (err, totalResult) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }

    db.all(getHistory, [userId, limit, offset], (err, history) => {
      if (err) {
        return res.status(500).json({ error: '数据库错误' });
      }

      res.json({
        history,
        pagination: {
          page,
          limit,
          total: totalResult.total,
          totalPages: Math.ceil(totalResult.total / limit)
        }
      });
    });
  });
});

// 获取积分规则列表
app.get('/api/points/rules', authenticateToken, (req, res) => {
  const getRules = `
    SELECT * FROM points_rules 
    WHERE is_active = 1 
    ORDER BY points_change DESC
  `;

  db.all(getRules, (err, rules) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }

    res.json({ rules });
  });
});

// 手动调整用户积分（管理员功能）
app.post('/api/user/points/adjust', authenticateToken, async (req, res) => {
  try {
    const { userId, pointsChange, reason } = req.body;
    const adminUserId = req.user.id;

    // 这里应该检查管理员权限，暂时跳过
    if (!userId || !pointsChange || !reason) {
      return res.status(400).json({ error: '参数不完整' });
    }

    const result = await updateUserPoints(userId, 'manual_adjust', reason, null);
    
    res.json({
      message: '积分调整成功',
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交评价并获取积分
app.post('/api/user/rating', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment, bookingId, tags, ratingType = 'general' } = req.body;

    console.log('评价提交请求:', { userId, rating, comment, bookingId, tags, ratingType });

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: '评分必须在1-5之间' });
    }

    // 验证bookingId是否存在且属于当前用户（只有当bookingId不为空时才验证）
    if (bookingId && bookingId !== null && bookingId !== undefined) {
      const bookingCheck = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM bookings WHERE id = ? AND user_id = ?', [bookingId, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!bookingCheck) {
        return res.status(400).json({ error: '预约记录不存在或不属于当前用户' });
      }
    }

    // 处理可选字段
    const safeBookingId = bookingId && bookingId !== null && bookingId !== undefined ? bookingId : null;
    const safeComment = comment && comment.trim() !== '' ? comment : null;
    const safeTags = tags && tags.length > 0 ? JSON.stringify(tags) : null;

    console.log('处理后的数据:', { safeBookingId, safeComment, safeTags });

    // 插入评价记录
    db.run(
      'INSERT INTO user_ratings (user_id, booking_id, rating, comment, tags, rating_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, safeBookingId, rating, safeComment, safeTags, ratingType, new Date().toISOString()],
      async function(err) {
        if (err) {
          console.error('评价插入失败:', err);
          return res.status(500).json({ error: '评价提交失败: ' + err.message });
        }

        const ratingId = this.lastID;
        console.log('评价插入成功，ID:', ratingId);

        try {
          // 根据评分给予积分
          let actionType = 'submit_rating';
          if (rating >= 4) {
            actionType = 'high_quality_rating';
          }

          const pointsResult = await updateUserPoints(
            userId, 
            actionType, 
            `评价评分：${rating}星${safeComment ? '，评价内容：' + safeComment : ''}`,
            ratingId
          );

          res.json({
            message: '评价提交成功',
            ratingId,
            pointsResult
          });
        } catch (pointsError) {
          console.error('积分更新失败:', pointsError);
          res.status(500).json({ error: '积分更新失败', details: pointsError.message });
        }
      }
    );
  } catch (error) {
    console.error('评价提交服务器错误:', error);
    res.status(500).json({ error: '服务器错误: ' + error.message });
  }
});

// 获取可用的评价标签
app.get('/api/ratings/tags', authenticateToken, (req, res) => {
  const availableTags = {
    facility: ['座位舒适', '桌面整洁', '灯光充足', '空调适宜', 'WiFi稳定', '插座可用'],
    service: ['预约便捷', '签到顺利', '服务态度好', '问题解决快'],
    environment: ['安静', '通风好', '温度适宜', '光线充足', '空间宽敞'],
    experience: ['学习效率高', '体验良好', '推荐使用', '会再次预约']
  };

  res.json({ tags: availableTags });
});

// 退出登录API
app.post('/api/logout', authenticateToken, (req, res) => {
  // 这里可以添加token黑名单逻辑，暂时简单返回成功
  res.json({ message: '退出登录成功' });
});

// 模拟预约成功获取积分
app.post('/api/booking/success', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { seatId, bookingDate, startTime, endTime } = req.body;

    // 这里应该先创建预约记录，然后给予积分
    // 暂时模拟预约成功
    const pointsResult = await updateUserPoints(
      userId,
      'booking_success',
      `预约座位成功：${seatId}，日期：${bookingDate}，时间：${startTime}-${endTime}`
    );

    res.json({
      message: '预约成功',
      pointsResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 模拟签到获取积分
app.post('/api/booking/checkin', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    // 这里应该更新预约记录的签到时间，然后给予积分
    const pointsResult = await updateUserPoints(
      userId,
      'check_in_on_time',
      `按时签到，预约ID：${bookingId}`
    );

    res.json({
      message: '签到成功',
      pointsResult
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取用户积分等级和权益
app.get('/api/user/points/level', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT points FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const points = user.points;
    let level = '普通会员';
    let levelName = '普通会员';
    let benefits = ['基础座位预约'];
    let nextLevel = '银牌会员';
    let pointsToNext = 200 - points;

    if (points >= 1000) {
      level = 'diamond';
      levelName = '钻石会员';
      benefits = ['所有座位预约', '优先预约权', '免费预约券 x3', '特殊时段预约'];
      nextLevel = null;
      pointsToNext = 0;
    } else if (points >= 500) {
      level = 'gold';
      levelName = '金牌会员';
      benefits = ['所有座位预约', '优先预约权', '免费预约券 x2'];
      nextLevel = '钻石会员';
      pointsToNext = 1000 - points;
    } else if (points >= 200) {
      level = 'silver';
      levelName = '银牌会员';
      benefits = ['所有座位预约', '免费预约券 x1'];
      nextLevel = '金牌会员';
      pointsToNext = 500 - points;
    } else {
      level = 'bronze';
      levelName = '普通会员';
      benefits = ['基础座位预约'];
      nextLevel = '银牌会员';
      pointsToNext = 200 - points;
    }

    res.json({
      points,
      level,
      levelName,
      benefits,
      nextLevel,
      pointsToNext
    });
  });
});

// JWT认证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
}

// 获取自习室列表
app.get('/api/study-rooms', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, floor, area, capacity, equipment, status
    FROM study_rooms 
    WHERE status = 'active'
    ORDER BY floor, name
  `;
  
  db.all(query, [], (err, rooms) => {
    if (err) {
      return res.status(500).json({ error: '获取自习室列表失败' });
    }
    res.json(rooms);
  });
});

// 获取座位列表
app.get('/api/seats', authenticateToken, (req, res) => {
  const { room_id, date, start_time, end_time } = req.query;
  
  if (!room_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  const query = `
    SELECT 
      s.id,
      s.seat_number,
      s.room_id,
      s.seat_type,
      s.status,
      sr.name as room_name,
      sr.floor,
      sr.area,
      CASE 
        WHEN b.id IS NOT NULL THEN 'booked'
        ELSE s.status
      END as availability_status
    FROM seats s
    JOIN study_rooms sr ON s.room_id = sr.id
    LEFT JOIN bookings b ON s.id = b.seat_id 
      AND b.booking_date = ? 
      AND b.status = 'active'
      AND (
        (b.start_time <= ? AND b.end_time > ?) OR
        (b.start_time < ? AND b.end_time >= ?) OR
        (b.start_time >= ? AND b.end_time <= ?)
      )
    WHERE s.room_id = ? AND s.status = 'available'
    ORDER BY s.seat_number
  `;
  
  db.all(query, [date, start_time, start_time, end_time, end_time, start_time, end_time, room_id], (err, seats) => {
    if (err) {
      return res.status(500).json({ error: '获取座位列表失败' });
    }
    res.json(seats);
  });
});

// 创建预约
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { seat_id, booking_date, start_time, end_time } = req.body;
  const user_id = req.user.id;
  
  if (!seat_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 验证时间格式
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ error: '时间格式不正确' });
  }
  
  // 验证时间逻辑
  if (start_time >= end_time) {
    return res.status(400).json({ error: '开始时间必须早于结束时间' });
  }
  
  // 校验预约时间必须在当前系统时间之后
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const bookingDateTime = new Date(`${booking_date}T${start_time}`);
  if (bookingDateTime <= now) {
    return res.status(400).json({ error: '只能预约当前时间之后的时间段' });
  }
  
  try {
    // 检查座位是否可用
    const seatCheckQuery = `
      SELECT s.id, s.status, sr.name as room_name
      FROM seats s
      JOIN study_rooms sr ON s.room_id = sr.id
      WHERE s.id = ? AND s.status = 'available'
    `;
    
    const seat = await new Promise((resolve, reject) => {
      db.get(seatCheckQuery, [seat_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!seat) {
      return res.status(400).json({ error: '座位不存在或不可用' });
    }
    
    // 检查时间段是否已被预约
    const conflictCheckQuery = `
      SELECT id FROM bookings 
      WHERE seat_id = ? 
        AND booking_date = ? 
        AND status = 'active'
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
    `;
    
    const conflict = await new Promise((resolve, reject) => {
      db.get(conflictCheckQuery, [seat_id, booking_date, start_time, start_time, end_time, end_time, start_time, end_time], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (conflict) {
      return res.status(400).json({ error: '该时间段已被预约' });
    }
    
    // 检查用户积分是否足够
    const userQuery = 'SELECT points FROM users WHERE id = ?';
    const user = await new Promise((resolve, reject) => {
      db.get(userQuery, [user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }
    
    // 创建预约
    const insertQuery = `
      INSERT INTO bookings (user_id, seat_id, booking_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.run(insertQuery, [user_id, seat_id, booking_date, start_time, end_time], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    
    // 添加预约成功积分
    await updateUserPoints(user_id, 'booking_success', `预约座位成功：${seat_id}，日期：${booking_date}，时间：${start_time}-${end_time}`, null);
    
    res.json({
      message: '预约成功',
      booking_id: result.lastID,
      room_name: seat.room_name,
      points_change: 10
    });
    
  } catch (error) {
    console.error('预约失败:', error);
    res.status(500).json({ error: '预约失败' });
  }
});

// 获取用户预约记录
app.get('/api/bookings', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const { status, page = 1, pageSize = 10 } = req.query;
  
  let whereClause = 'WHERE b.user_id = ?';
  let params = [user_id];
  
  if (status) {
    whereClause += ' AND b.status = ?';
    params.push(status);
  }
  
  const offset = (page - 1) * pageSize;
  
  const query = `
    SELECT 
      b.id,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      b.check_in_time,
      b.created_at,
      s.seat_number,
      sr.name as room_name,
      sr.floor,
      sr.area
    FROM bookings b
    JOIN seats s ON b.seat_id = s.id
    JOIN study_rooms sr ON s.room_id = sr.id
    ${whereClause}
    ORDER BY b.booking_date DESC, b.start_time DESC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(*) as total
    FROM bookings b
    ${whereClause}
  `;
  
  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: '获取预约记录失败' });
    }
    
    db.all(query, [...params, pageSize, offset], (err, bookings) => {
      if (err) {
        return res.status(500).json({ error: '获取预约记录失败' });
      }
      
      res.json({
        records: bookings,
        total: countResult.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    });
  });
});

// 取消预约
app.put('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const booking_id = req.params.id;
  const user_id = req.user.id;
  
  try {
    // 检查预约是否存在且属于当前用户
    const bookingQuery = `
      SELECT b.*, s.seat_number, sr.name as room_name
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      JOIN study_rooms sr ON s.room_id = sr.id
      WHERE b.id = ? AND b.user_id = ?
    `;
    
    const booking = await new Promise((resolve, reject) => {
      db.get(bookingQuery, [booking_id, user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!booking) {
      return res.status(404).json({ error: '预约记录不存在' });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({ error: '预约已取消或已完成' });
    }
    
    // 更新预约状态
    const updateQuery = 'UPDATE bookings SET status = ? WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.run(updateQuery, ['cancelled', booking_id], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    
    // 扣除积分（提前取消）
    await updateUserPoints(user_id, 'early_cancel', `提前取消预约，预约ID：${booking_id}`, null);
    
    res.json({
      message: '预约已取消',
      points_change: -5
    });
    
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ error: '取消预约失败' });
  }
});

// 签到
app.put('/api/bookings/:id/checkin', authenticateToken, async (req, res) => {
  const booking_id = req.params.id;
  const user_id = req.user.id;
  
  try {
    // 检查预约是否存在且属于当前用户
    const bookingQuery = `
      SELECT b.*, s.seat_number, sr.name as room_name
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      JOIN study_rooms sr ON s.room_id = sr.id
      WHERE b.id = ? AND b.user_id = ?
    `;
    
    const booking = await new Promise((resolve, reject) => {
      db.get(bookingQuery, [booking_id, user_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!booking) {
      return res.status(404).json({ error: '预约记录不存在' });
    }
    
    if (booking.status !== 'active') {
      return res.status(400).json({ error: '预约已取消或已完成' });
    }
    
    if (booking.check_in_time) {
      return res.status(400).json({ error: '已经签到过了' });
    }
    
    // 检查是否在预约日期
    const today = new Date().toISOString().split('T')[0];
    if (booking.booking_date !== today) {
      return res.status(400).json({ error: '只能在预约当天签到' });
    }
    
    // 检查是否在预约时间段内
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const currentTime = now.toTimeString().slice(0, 5);
    const startTime = booking.start_time;
    const endTime = booking.end_time;
    
    if (currentTime < startTime || currentTime > endTime) {
      return res.status(400).json({ error: '只能在预约时间段内签到' });
    }
    
    // 更新签到时间
    const updateQuery = 'UPDATE bookings SET check_in_time = CURRENT_TIMESTAMP WHERE id = ?';
    await new Promise((resolve, reject) => {
      db.run(updateQuery, [booking_id], function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
    
    // 添加签到积分
    await updateUserPoints(user_id, 'check_in_on_time', `按时签到，预约ID：${booking_id}`, null);
    
    res.json({
      message: '签到成功',
      points_change: 5
    });
    
  } catch (error) {
    console.error('签到失败:', error);
    res.status(500).json({ error: '签到失败' });
  }
});

// 清空数据库记录（仅用于开发调试）
app.delete('/api/admin/clear-data', authenticateToken, (req, res) => {
  // 注意：这里应该添加管理员权限检查，暂时跳过
  console.log('开始清空数据库记录...');
  
  // 清空预约记录
  db.run('DELETE FROM bookings', (err) => {
    if (err) {
      console.error('清空预约记录失败:', err);
      return res.status(500).json({ error: '清空预约记录失败' });
    }
    
    console.log('预约记录已清空');
    
    // 清空评价记录
    db.run('DELETE FROM user_ratings', (err) => {
      if (err) {
        console.error('清空评价记录失败:', err);
        return res.status(500).json({ error: '清空评价记录失败' });
      }
      
      console.log('评价记录已清空');
      
      // 重置自增ID
      db.run('DELETE FROM sqlite_sequence WHERE name IN ("bookings", "user_ratings")', (err) => {
        if (err) {
          console.error('重置自增ID失败:', err);
          // 不返回错误，因为这不是关键操作
        } else {
          console.log('自增ID已重置');
        }
        
        res.json({ 
          message: '数据库记录清空成功',
          cleared: {
            bookings: '预约记录已清空',
            ratings: '评价记录已清空'
          }
        });
      });
    });
  });
});

// 临时清空数据库端点（无需认证，仅用于开发调试）
app.delete('/api/dev/clear-data', (req, res) => {
  console.log('开始清空数据库记录（开发模式）...');
  
  // 清空预约记录
  db.run('DELETE FROM bookings', (err) => {
    if (err) {
      console.error('清空预约记录失败:', err);
      return res.status(500).json({ error: '清空预约记录失败' });
    }
    
    console.log('预约记录已清空');
    
    // 清空评价记录
    db.run('DELETE FROM user_ratings', (err) => {
      if (err) {
        console.error('清空评价记录失败:', err);
        return res.status(500).json({ error: '清空评价记录失败' });
      }
      
      console.log('评价记录已清空');
      
      // 重置自增ID
      db.run('DELETE FROM sqlite_sequence WHERE name IN ("bookings", "user_ratings")', (err) => {
        if (err) {
          console.error('重置自增ID失败:', err);
          // 不返回错误，因为这不是关键操作
        } else {
          console.log('自增ID已重置');
        }
        
        res.json({ 
          message: '数据库记录清空成功（开发模式）',
          cleared: {
            bookings: '预约记录已清空',
            ratings: '评价记录已清空'
          }
        });
      });
    });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

module.exports = app; 