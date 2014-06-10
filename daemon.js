var PATH = '/path/to/lucifer.json';

var spawn = require('child_process').spawn
  , fs = require('fs')
  , util = require('util');

/**
 * Process class.
 * Handles pretty much everything.
 */
var Process = function (name, conf) {
  if (!name || !conf.cmd) {
    throw new Error('Name and command are required.');
  }

  var self = this;

  self.name = name;
  self.cmd = conf.cmd;
  self.args = conf.args || [];
  self.cwd = conf.cwd;
  self.append = conf.append;
  self.logfile = conf.logfile;
  self.stdout = conf.stdout;
  self.stderr = conf.stderr;
  self.pidfile = conf.pidfile;
  self.uid = conf.uid;
  self.gid = conf.gid;
  self.console = conf.console;
  self.restart = conf.restart;

  if (self.logfile) {
    self.logfilefd = fs.createWriteStream(self.logfile, { flags: self.append ? 'a' : 'w' });
  }

  if (self.stdout) {
    self.stdoutfd = fs.createWriteStream(self.stdout, { flags: self.append ? 'a' : 'w' });
  }

  if (conf.stderr) {
    self.stderrfd = fs.createWriteStream(self.stderr, { flags: self.append ? 'a' : 'w' });
  }

  /**
   * Start the child process and listens to its events.
   */
  self.start = function () {
    self.handle = spawn(self.cmd, self.args, {
      cwd: self.cwd,
      detached: false,
      uid: self.uid,
      gid: self.gid
    });

    self.handle.on('error', self.onError);
    self.handle.on('exit', self.onExit);
    self.handle.on('close', self.onClose);

    if (self.stdout) {
      self.handle.stdout.on('data', self.onStdOutData);
    }

    if (self.stderr) {
      self.handle.stderr.on('data', self.onStdErrData);
    }

    self.pid = self.handle.pid;
    self.log('Started process %d.', self.pid);

    if (self.pidfile) {
      fs.writeFileSync(self.pidfile, self.pid.toString(10));
    }
  };

  /**
   * Callback for when the child process emits an error.
   */
  self.onError = function (err) {
    self.log(err.toString(err));
  };

  /**
   * Callback for when the child process exists.
   */
  self.onExit = function (code, signal) {
    self.log('Process %d exited with (%d, %s).', self.pid, code, signal);
    if (self.restart) {
      self.log('Restarting.');
      self.start();
    }
  };

  /**
   * Callback for when the child process's streams are closed.
   */
  self.onClose = function () {
    if (!self.restart) {
      if (self.logfilefd) self.logfilefd.close();
      if (self.stdoutfd) self.stdoutfd.close();
      if (self.stderrfd) self.stderrfd.close();
    }
  };

  /**
   * Callback for stdout data.
   */
  self.onStdOutData = function (chunk) {
    self.stdoutfd.write(chunk);
  };

  /**
   * Callback for stderr data.
   */
  self.onStdErrData = function (chunk) {
    self.stderrfd.write(chunk);
  };

  /**
   * Wrapper around util.format that logs to the
   * console and the logfile.
   */
  self.log = function () {
    var formatted = self.name + ' : ' + util.format.apply(null, arguments);

    if (self.console) {
      console.log(formatted);
    }

    if (self.logfilefd) {
      self.logfilefd.write(formatted + '\n');
    }
  };
};

var config = require(PATH);

var names = Object.keys(config);

names.forEach(function (name) {
  var conf = config[name];
  var proc = new Process(name, conf);
  proc.start();
});
