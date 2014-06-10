lucifer
=======

A daemon/process manager.

Configuration:

```js
{
  "nameofprogram": {       // name of the program.
    "cmd": "...",          // command to execute. Required.
    "args": [],            // array of string arguments.
    "cwd": "...",          // working directory.
    "logfile": "...",      // path to lucifer log file.
    "stdout": "...",       // path to stdout file
    "stderr": "...",       // path to stderr file
    "pidfile": "...",      // path to pid file
    "console": true,       // also log to console
    "append": false,       // append files (instead of overwriting)
    "restart": true,       // restart the application when it crashes
    "uid": ...,            // User ID (number)
    "gid": ...,            // Group ID (number)
    "env": {               // environment variables
      "VARNAME": "VALUE"
    }
  },
  "anotherprogram" {       // add as many programs as you want
    ...
  }
}
```
Examples:

* [qbittorrent-nox](examples/qbittorrent.json)
