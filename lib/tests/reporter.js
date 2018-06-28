const Base = require('mocha/lib/reporters/base');
const color = Base.color;

class EmbarkSpec extends Base {
  constructor(runner, options) {
    super(runner, options);

    const self = this;
    self.embarkEvents = options.reporterOptions.events;
    let indents = 0;
    let n = 0;

    function onContractReceipt(receipt) {
      console.log(receipt.className, receipt.gasUsed);
    }
    self.embarkEvents.on("deploy:contract:receipt", onContractReceipt);

    function indent() {
      return Array(indents).join('  ');
    }

    runner.on('start', function () {
      console.log();
    });

    runner.on('suite', function (suite) {
      ++indents;
      console.log(color('suite', '%s%s'), indent(), suite.title);
    });

    runner.on('suite end', function () {
      --indents;
      if (indents === 1) {
        console.log();
      }
    });

    runner.on('pending', function (test) {
      const fmt = indent() + color('pending', '  - %s');
      console.log(fmt, test.title);
    });

    runner.on('pass', function (test) {
      let fmt;
      if (test.speed === 'fast') {
        fmt =
          indent() +
          color('checkmark', '  ' + Base.symbols.ok) +
          color('pass', ' %s');
        console.log(fmt, test.title);
      } else {
        fmt =
          indent() +
          color('checkmark', '  ' + Base.symbols.ok) +
          color('pass', ' %s') +
          color(test.speed, ' (%dms)');
        console.log(fmt, test.title, test.duration);
      }
    });

    runner.on('fail', function (test) {
      console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
    });

    runner.once('end', function() {
      self.embarkEvents.removeListener("deploy:contract:receipt", onContractReceipt);
      self.epilogue();
    });
  }
}

module.exports = EmbarkSpec;