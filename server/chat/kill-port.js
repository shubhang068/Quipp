const kill = require("kill-port")

var pid = 4000

kill(pid, "tcp")