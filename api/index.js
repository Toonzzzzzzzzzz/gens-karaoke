const registerRoomApi = require('./room')
const registerStaffApi = require('./staff')
const registerSettingApi = require('./setting')
const registerQueueApi = require('./queue')
const registerMemberApi = require('./member')

async function registerAllApi() {
  console.log('api/index.js: registerAllApi() called');
  await registerRoomApi()
  await registerStaffApi()
  await registerSettingApi()
  await registerQueueApi()
  await registerMemberApi()
  console.log('api/index.js: registerAllApi() finished');
}

module.exports = registerAllApi