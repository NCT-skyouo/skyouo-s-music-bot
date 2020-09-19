module.exports = {
  "databases": {
    "normal": require(__dirname + "/DatabaseType/NormalDatabase.js"),
    "hakka":  require(__dirname + "/DatabaseType/HakkaDatabase.js"),
    "memory": require(__dirname + "/DatabaseType/MemoryDatabase.js")
  }
}