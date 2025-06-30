const axios = require('axios');
const apiConfig = require('../config/api-config');

class LibraryApiService {
  constructor() {
    this.baseURL = apiConfig.libraryApiBaseUrl;
    this.apiKey = apiConfig.apiKey;
    this.apiSecret = apiConfig.apiSecret;
    this.requestConfig = apiConfig.requestConfig;
  }

  // 创建API客户端
  createApiClient() {
    return axios.create({
      baseURL: this.baseURL,
      timeout: this.requestConfig.timeout,
      headers: {
        ...this.requestConfig.headers,
        'Authorization': `Bearer ${this.apiKey}`,
        'X-API-Secret': this.apiSecret
      }
    });
  }

  // 数据映射工具
  mapData(data, mappingType) {
    const mapping = apiConfig.dataMapping[mappingType];
    if (!mapping) return data;

    const mappedData = {};
    for (const [key, value] of Object.entries(data)) {
      const mappedKey = mapping[key] || key;
      mappedData[mappedKey] = value;
    }
    return mappedData;
  }

  // 用户相关API
  async getUserProfile(userToken) {
    try {
      const client = this.createApiClient();
      const response = await client.get(apiConfig.endpoints.userProfile, {
        headers: { 'User-Token': userToken }
      });
      return this.mapData(response.data, 'user');
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      throw error;
    }
  }

  async authenticateUser(username, password) {
    try {
      const client = this.createApiClient();
      const response = await client.post(apiConfig.endpoints.userLogin, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('用户认证失败:', error.message);
      throw error;
    }
  }

  async logoutUser(userToken) {
    try {
      const client = this.createApiClient();
      await client.post(apiConfig.endpoints.userLogout, {}, {
        headers: { 'User-Token': userToken }
      });
      return true;
    } catch (error) {
      console.error('用户退出失败:', error.message);
      throw error;
    }
  }

  // 座位相关API
  async getSeats(roomId = null) {
    try {
      const client = this.createApiClient();
      const params = roomId ? { room_id: roomId } : {};
      const response = await client.get(apiConfig.endpoints.seats, { params });
      
      // 映射座位数据
      const seats = Array.isArray(response.data) 
        ? response.data.map(seat => this.mapData(seat, 'seat'))
        : [this.mapData(response.data, 'seat')];
      
      return seats;
    } catch (error) {
      console.error('获取座位信息失败:', error.message);
      throw error;
    }
  }

  async getSeatAvailability(seatId, date) {
    try {
      const client = this.createApiClient();
      const response = await client.get(`${apiConfig.endpoints.seatAvailability}/${seatId}`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('获取座位可用性失败:', error.message);
      throw error;
    }
  }

  async getSeatMap(roomId) {
    try {
      const client = this.createApiClient();
      const response = await client.get(`${apiConfig.endpoints.seatMap}/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('获取座位地图失败:', error.message);
      throw error;
    }
  }

  // 预约相关API
  async createBooking(userToken, bookingData) {
    try {
      const client = this.createApiClient();
      const response = await client.post(apiConfig.endpoints.createBooking, bookingData, {
        headers: { 'User-Token': userToken }
      });
      return this.mapData(response.data, 'booking');
    } catch (error) {
      console.error('创建预约失败:', error.message);
      throw error;
    }
  }

  async cancelBooking(userToken, bookingId) {
    try {
      const client = this.createApiClient();
      const response = await client.post(`${apiConfig.endpoints.cancelBooking}/${bookingId}`, {}, {
        headers: { 'User-Token': userToken }
      });
      return response.data;
    } catch (error) {
      console.error('取消预约失败:', error.message);
      throw error;
    }
  }

  async getBookingHistory(userToken) {
    try {
      const client = this.createApiClient();
      const response = await client.get(apiConfig.endpoints.bookingHistory, {
        headers: { 'User-Token': userToken }
      });
      
      // 映射预约历史数据
      const bookings = Array.isArray(response.data) 
        ? response.data.map(booking => this.mapData(booking, 'booking'))
        : [this.mapData(response.data, 'booking')];
      
      return bookings;
    } catch (error) {
      console.error('获取预约历史失败:', error.message);
      throw error;
    }
  }

  // 房间相关API
  async getRooms() {
    try {
      const client = this.createApiClient();
      const response = await client.get(apiConfig.endpoints.rooms);
      return response.data;
    } catch (error) {
      console.error('获取房间信息失败:', error.message);
      throw error;
    }
  }

  async getRoomStatus(roomId) {
    try {
      const client = this.createApiClient();
      const response = await client.get(`${apiConfig.endpoints.roomStatus}/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('获取房间状态失败:', error.message);
      throw error;
    }
  }

  // 错误处理
  handleApiError(error) {
    if (error.response) {
      // 服务器响应了错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 401:
          throw new Error('认证失败，请重新登录');
        case 403:
          throw new Error('权限不足');
        case 404:
          throw new Error('请求的资源不存在');
        case 429:
          throw new Error('请求过于频繁，请稍后再试');
        case 500:
          throw new Error('服务器内部错误');
        default:
          throw new Error(data.message || `请求失败 (${status})`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      throw new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      throw new Error(error.message || '未知错误');
    }
  }
}

module.exports = new LibraryApiService(); 