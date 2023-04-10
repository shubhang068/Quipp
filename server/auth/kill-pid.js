const kill = require("kill-port")

var pid = 5000

kill(pid, "tcp")