module.exports = function () {
  var mod = {}
  mod.types = ["JSON", "MEMORY", "MYSQL", "REDIS", "MONGO", "REPLIT"]
  mod.provide = { "JSON": require("./src/storing/json"), "MEMORY": require("./src/storing/memory"), "MYSQL": require("./src/storing/mysql"), "REDIS": require("./src/storing/redis"), "MONGO": require("./src/storing/mongo"), "REPLIT": require("./src/storing/replit") }
  mod.nowUsing = null

  mod.getStoringInstance = function () {
    return mod.provide[mod.nowUsing]
  }

  mod.registerType = function () {

  }

  mod.use = function (type) {
    if (!mod.types.includes(type)) throw new Error("Bad type, abort.")
    mod.nowUsing = type
    return mod
  }

  mod.getBulitInMiddle = function () {
    function isJSON(json) {
      try {
        if (!["object", "string"].includes(typeof json)) throw new Error("not a json")
        if (typeof json === "object") JSON.stringify(json)
        if (typeof json === "string") JSON.parse(json)
        return true
      } catch (e) {
        return false
      }
    }

    function startJSON(value) {
      if (!isJSON(value)) return value
      return JSON.stringify(value, null, 2)
    }

    function endJSON(value) {
      if (!isJSON(value)) return value
      return JSON.parse(value)
    }

    return { "isJSON": isJSON, "startJSON": startJSON, "endJSON": endJSON }
  }

  return mod
}