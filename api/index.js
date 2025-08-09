const registerRoomApi = require('./room')
const registerStaffApi = require('./staff')
const registerSettingApi = require('./setting')
const registerQueueApi = require('./queue')
const registerMemberApi = require('./member')

async function registerAllApi() {
  await registerRoomApi()
  await registerStaffApi()
  await registerSettingApi()
  await registerQueueApi()
  await registerMemberApi()
}

module.exports = registerAllApi