// 学校图书馆API配置
module.exports = {
  // 学校图书馆API基础URL
  libraryApiBaseUrl: process.env.LIBRARY_API_BASE_URL || 'https://library.your-university.edu/api',
  
  // API认证信息
  apiKey: process.env.LIBRARY_API_KEY || '',
  apiSecret: process.env.LIBRARY_API_SECRET || '',
  
  // API端点配置
  endpoints: {
    // 用户相关
    userProfile: '/user/profile',
    userLogin: '/auth/login',
    userLogout: '/auth/logout',
    
    // 座位相关
    seats: '/seats',
    seatAvailability: '/seats/availability',
    seatMap: '/seats/map',
    
    // 预约相关
    bookings: '/bookings',
    createBooking: '/bookings/create',
    cancelBooking: '/bookings/cancel',
    bookingHistory: '/bookings/history',
    
    // 房间相关
    rooms: '/rooms',
    roomStatus: '/rooms/status'
  },
  
  // 请求配置
  requestConfig: {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Library-Seat-Booking-System/1.0'
    }
  },
  
  // 数据映射配置（用于转换API数据格式）
  dataMapping: {
    // 用户信息映射
    user: {
      'student_id': 'studentId',
      'real_name': 'realName',
      'email': 'email'
    },
    
    // 座位信息映射
    seat: {
      'seat_id': 'id',
      'seat_number': 'seatNumber',
      'room_name': 'roomName',
      'status': 'status'
    },
    
    // 预约信息映射
    booking: {
      'booking_id': 'id',
      'seat_id': 'seatId',
      'start_time': 'startTime',
      'end_time': 'endTime',
      'status': 'status'
    }
  }
}; 