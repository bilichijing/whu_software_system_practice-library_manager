const express = require('express');
const router = express.Router();
const libraryApiService = require('../services/library-api-service');
const { authenticateToken } = require('../middleware/auth');

// 配置：是否启用学校图书馆API
const USE_LIBRARY_API = process.env.USE_LIBRARY_API === 'true';

// 座位相关API
router.get('/seats', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const roomId = req.query.room_id;
      const seats = await libraryApiService.getSeats(roomId);
      res.json({ success: true, seats });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      const roomId = req.query.room_id;
      
      let query = `
        SELECT s.*, sr.name as room_name 
        FROM seats s 
        JOIN study_rooms sr ON s.room_id = sr.id
      `;
      const params = [];
      
      if (roomId) {
        query += ' WHERE s.room_id = ?';
        params.push(roomId);
      }
      
      db.all(query, params, (err, seats) => {
        if (err) {
          console.error('查询座位失败:', err);
          return res.status(500).json({ success: false, message: '查询座位失败' });
        }
        res.json({ success: true, seats });
      });
    }
  } catch (error) {
    console.error('获取座位信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 座位可用性查询
router.get('/seats/:seatId/availability', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const { seatId } = req.params;
      const { date } = req.query;
      const availability = await libraryApiService.getSeatAvailability(seatId, date);
      res.json({ success: true, availability });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      const { seatId } = req.params;
      const { date } = req.query;
      
      const query = `
        SELECT b.*, s.seat_number, sr.name as room_name
        FROM bookings b
        JOIN seats s ON b.seat_id = s.id
        JOIN study_rooms sr ON s.room_id = sr.id
        WHERE b.seat_id = ? AND b.booking_date = ? AND b.status = 'active'
      `;
      
      db.all(query, [seatId, date], (err, bookings) => {
        if (err) {
          console.error('查询座位可用性失败:', err);
          return res.status(500).json({ success: false, message: '查询座位可用性失败' });
        }
        
        // 计算可用时间段
        const availability = calculateAvailability(bookings);
        res.json({ success: true, availability });
      });
    }
  } catch (error) {
    console.error('获取座位可用性失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建预约
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const userToken = req.headers.authorization?.split(' ')[1];
      const bookingData = req.body;
      const booking = await libraryApiService.createBooking(userToken, bookingData);
      res.json({ success: true, booking });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      const { seat_id, booking_date, start_time, end_time } = req.body;
      const user_id = req.user.id;
      
      // 检查座位是否可用
      const checkQuery = `
        SELECT COUNT(*) as count FROM bookings 
        WHERE seat_id = ? AND booking_date = ? AND status = 'active'
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `;
      
      db.get(checkQuery, [seat_id, booking_date, start_time, start_time, end_time, end_time, start_time, end_time], (err, result) => {
        if (err) {
          console.error('检查座位可用性失败:', err);
          return res.status(500).json({ success: false, message: '检查座位可用性失败' });
        }
        
        if (result.count > 0) {
          return res.status(400).json({ success: false, message: '该时间段座位已被预约' });
        }
        
        // 创建预约
        const insertQuery = `
          INSERT INTO bookings (user_id, seat_id, booking_date, start_time, end_time, status)
          VALUES (?, ?, ?, ?, ?, 'active')
        `;
        
        db.run(insertQuery, [user_id, seat_id, booking_date, start_time, end_time], function(err) {
          if (err) {
            console.error('创建预约失败:', err);
            return res.status(500).json({ success: false, message: '创建预约失败' });
          }
          
          res.json({ 
            success: true, 
            booking: {
              id: this.lastID,
              user_id,
              seat_id,
              booking_date,
              start_time,
              end_time,
              status: 'active'
            }
          });
        });
      });
    }
  } catch (error) {
    console.error('创建预约失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取预约历史
router.get('/bookings/history', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const userToken = req.headers.authorization?.split(' ')[1];
      const bookings = await libraryApiService.getBookingHistory(userToken);
      res.json({ success: true, bookings });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      const user_id = req.user.id;
      
      const query = `
        SELECT b.*, s.seat_number, sr.name as room_name
        FROM bookings b
        JOIN seats s ON b.seat_id = s.id
        JOIN study_rooms sr ON s.room_id = sr.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `;
      
      db.all(query, [user_id], (err, bookings) => {
        if (err) {
          console.error('查询预约历史失败:', err);
          return res.status(500).json({ success: false, message: '查询预约历史失败' });
        }
        res.json({ success: true, bookings });
      });
    }
  } catch (error) {
    console.error('获取预约历史失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 取消预约
router.post('/bookings/:bookingId/cancel', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const userToken = req.headers.authorization?.split(' ')[1];
      const { bookingId } = req.params;
      const result = await libraryApiService.cancelBooking(userToken, bookingId);
      res.json({ success: true, result });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      const { bookingId } = req.params;
      const user_id = req.user.id;
      
      const query = `
        UPDATE bookings 
        SET status = 'cancelled' 
        WHERE id = ? AND user_id = ?
      `;
      
      db.run(query, [bookingId, user_id], function(err) {
        if (err) {
          console.error('取消预约失败:', err);
          return res.status(500).json({ success: false, message: '取消预约失败' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: '预约不存在或无权限取消' });
        }
        
        res.json({ success: true, message: '预约已取消' });
      });
    }
  } catch (error) {
    console.error('取消预约失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取房间信息
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    if (USE_LIBRARY_API) {
      // 使用学校图书馆API
      const rooms = await libraryApiService.getRooms();
      res.json({ success: true, rooms });
    } else {
      // 使用本地数据库
      const db = req.app.locals.db;
      
      const query = 'SELECT * FROM study_rooms WHERE status = "active"';
      
      db.all(query, (err, rooms) => {
        if (err) {
          console.error('查询房间失败:', err);
          return res.status(500).json({ success: false, message: '查询房间失败' });
        }
        res.json({ success: true, rooms });
      });
    }
  } catch (error) {
    console.error('获取房间信息失败:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 辅助函数：计算可用时间段
function calculateAvailability(bookings) {
  // 这里可以实现复杂的时间段计算逻辑
  // 简单示例：返回已预约的时间段
  return bookings.map(booking => ({
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: 'booked'
  }));
}

module.exports = router; 