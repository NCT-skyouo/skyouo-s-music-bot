var socket = io.connect()
$(document).ready(function () {
  socket.on('connect', () => {
    setInterval(() => {
      socket.emit("usage_req")
    }, 5000)

    socket.on("init", (data) => {
      $("#botimg").attr("src", data.avatar)
      $("#botname").html(data.name)
    })
    var chart1_data = {
      "type": "line",
      "data": {
        "labels": [],
        "datasets":[
          {
            "label": "Memory",
            "fill": true,
            "data": [],
            "backgroundColor": "rgba(78, 115, 223, 0.05)",
            "borderColor":"rgba(78, 115, 223, 1)"
          },
          {
            "label": "CPU",
            "fill": true,
            "data": [],
            "backgroundColor": "rgba(221, 115, 23, 0.05)",
            "borderColor":"rgba(221, 115, 23, 1)"
          }
        ]
      },
      "options": {
        "maintainAspectRatio": false,
        "legend": {
          "display": false
        },
        "title": {},
        "scales": {
          "xAxes": [
            {
              "gridLines": {
                "color": "rgb(234, 236, 244)",
                "zeroLineColor": "rgb(234, 236, 244)",
                "drawBorder": false,
                "drawTicks": false,
                "borderDash": ["2"],
                "zeroLineBorderDash": ["2"],
                "drawOnChartArea": false
              },
              "ticks": {
                "fontColor": "#858796",
                "padding": 20
              }
            }
          ],
          "yAxes": [
            {
              "gridLines": {
                "color": "rgb(234, 236, 244)",
                "zeroLineColor": "rgb(234, 236, 244)",
                "drawBorder": false,
                "drawTicks": false,
                "borderDash": ["2"],
                "zeroLineBorderDash": ["2"]
              },
              "ticks": {
                "fontColor": "#858796",
                "padding": 20
              }
            }
          ]
        }
      }
    }

    var chart1 = document.getElementById("chart1")

    var canvas1 = new Chart(chart1, chart1_data)

    var chart2_data = {
      "type": "doughnut",
        "data": {
        "labels": ["configDB","songsDB"],
        "datasets": [
          {
          "label": "",
          "backgroundColor": ["#4e73df","#1cc88a"],
          "borderColor": ["#ffffff","#ffffff"],
          "data": ["0","0"]
          }
        ]
      },
      "options": {
        "maintainAspectRatio":false,
        "legend": {
          "display":false
        },
        "title":{}
      }
    }

    var chart2 = document.getElementById("chart2")

    var canvas2 = new Chart(chart2, chart2_data)

    socket.on("usage_rep", (res) => {
      chart1_data = {
        "type": "line",
        "data": {
          "labels": res.datas.labelsHistory,
          "datasets":[
            {
              "label": "Memory",
              "fill": true,
              "data": res.datas.memHistory,
              "backgroundColor": "rgba(78, 115, 223, 0.05)",
              "borderColor":"rgba(78, 115, 223, 1)"
            },
            {
              "label": "CPU",
              "fill": true,
              "data": res.datas.cpuHistory,
              "backgroundColor": "rgba(221, 115, 23, 0.05)",
              "borderColor":"rgba(221, 115, 23, 1)"
            }
          ]
        },
        "options": {
          "maintainAspectRatio": false,
          "legend": {
            "display": false
          },
          "animation": {
            "duration": 1000,
          },
          "hover": {
            "animationDuration": 300,
          },
          "responsiveAnimationDuration": 1000,
          "title": {},
          "scales": {
            "xAxes": [
              {
                "gridLines": {
                  "color": "rgb(234, 236, 244)",
                  "zeroLineColor": "rgb(234, 236, 244)",
                  "drawBorder": false,
                  "drawTicks": false,
                  "borderDash": ["2"],
                  "zeroLineBorderDash": ["2"],
                  "drawOnChartArea": false
                },
                "ticks": {
                  "fontColor": "#858796",
                  "padding": 20
                }
              }
            ],
            "yAxes": [
              {
                "gridLines": {
                  "color": "rgb(234, 236, 244)",
                  "zeroLineColor": "rgb(234, 236, 244)",
                  "drawBorder": false,
                  "drawTicks": false,
                  "borderDash": ["2"],
                  "zeroLineBorderDash": ["2"]
                },
                "ticks": {
                  "fontColor": "#858796",
                  "padding": 20
                }
              }
            ]
          }
        }
      }

      canvas1.data = chart1_data.data

      canvas1.update()

      $('#progress1').width(Math.round(res.memoryPercent)).attr("aria-valuenow", Math.round(res.memoryPercent));
      $('#progress1-text').html(`${Number(res.memoryPercent).toFixed(1)}%`)

      $('#members').html(res.bot.memberCount)

      $('#guilds').html(res.bot.guildCount)

      var chart2_data = {
        "type": "doughnut",
          "data": {
          "labels": ["configDB","songsDB"],
          "datasets": [
            {
            "label": "",
            "backgroundColor": ["#4e73df","#1cc88a"],
            "borderColor": ["#ffffff","#ffffff"],
            "data": [res.db.dbl.toString(), res.db.sdbl.toString()]
            }
          ]
        },
        "options": {
          "maintainAspectRatio":false,
          "legend": {
            "display":false
          },
          "title":{}
        }
      }

      canvas2.data = chart2_data.data

      canvas2.update()
    })
  })
})
