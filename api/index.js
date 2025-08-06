const registerRoomApi = require('./room')
const registerStaffApi = require('./staff')
const registerSettingApi = require('./setting')
const registerQueueApi = require('./queue')
const registerMemberApi = require('./member')

function registerAllApi() {
  registerRoomApi()
  registerStaffApi()
  registerSettingApi()
  registerQueueApi()
  registerMemberApi()
}

module.exports = registerAllApi