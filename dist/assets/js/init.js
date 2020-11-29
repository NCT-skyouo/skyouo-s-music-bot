if (!socket) var socket = io.connect();
$(document).ready(function () {
  socket.on("connect", () => {
    socket.on("init", (data) => {
      $("#botimg").attr("src", data.avatar)
      $("#botname").html(data.name)
    })
  })
})