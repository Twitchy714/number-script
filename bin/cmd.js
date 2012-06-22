#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var argv = require('optimist').argv;
var number = require('../');

if (argv.h || argv.help) {
    return fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout)
    ;
}
if (argv.v || argv.version) {
    var v = require('../package.json').version;
    return console.log('NumberScript version ' + v);
}
var outfile = argv.o || argv.output || '-';

if (argv.d || argv.decompile) {
    var file = argv.c || argv.compile || '-';
    readFile(file, function (err, src) {
        if (err) console.error(err)
        else number.decompile(src, function (err, n) {
            if (err) console.error(err)
            else writeFile(outfile, n)
        });
    });
    return;
}

if (argv.i || argv.interactive) {
    var ctx = {
        require : require,
        console : console,
        process : process,
    };
    repl.start(function (n, cb) {
        number.run(n, cb);
    });
}

if (argv.c || argv.compile) {
    var file = argv.c || argv.compile || '-';
    readFile(file, function (err, src) {
        if (err) console.error(err)
        else number.compile(src, function (err, c) {
            if (err) console.error(err)
            else writeFile(outfile, c)
        });
    });
    return;
}

if (true || argv.r || argv.run) {
    var file = argv.r || argv.run || argv._[0] || '-';
    var ctx = {
        require : require,
        console : console,
        process : process,
        __filename : file,
        __dirname : file === '-' ? process.cwd() : path.dirname(file)
    };
    readFile(file, function (err, src) {
        if (err) console.error(err)
        else number.run(src, ctx, function (err) {
            if (err) console.error(err)
        });
    });
    return;
}

function readFile (file, cb) {
    if (file === '-') {
        var data = '';
        process.stdin.on('data', function (buf) { data += buf });
        process.stdin.on('end', function () {
            cb(null, data);
        });
        process.stdin.resume();
    }
    else {
        fs.readFile(file, function (err, src) {
            if (err) cb(err)
            else cb(null, src)
        });
    }
}

function writeFile (file, src) {
    if (file === '-') {
        process.stdout.write(src);
    }
    else fs.writeFile(file, src);
}