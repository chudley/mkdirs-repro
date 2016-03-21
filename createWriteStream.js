var assert = require('assert');
var fs = require('fs');

var manta = require('manta');
var crypto = require('crypto');
var MemoryStream = require('memorystream');
var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'mkdirs',
    stream: process.stdout,
    level: 'trace'
});

var client = manta.createClient({
    sign: manta.privateKeySigner({
        key: fs.readFileSync(process.env.HOME + '/.ssh/id_rsa', 'utf8'),
        keyId: process.env.MANTA_KEY_ID,
        user: process.env.MANTA_USER
    }),
    user: process.env.MANTA_USER,
    url: process.env.MANTA_URL,
    log: log
});
log.info('manta ready: %s', client.toString());

var message = 'mkdirs\n';
var opts = {
    md5: crypto.createHash('md5').update(message).digest('base64'),
    size: Buffer.byteLength(message),
    type: 'text/plain',
    mkdirs: true
};
var read_stream = new MemoryStream();
var write_stream = client.createWriteStream('~~/stor/mkdirs/file.txt', opts);

read_stream.pipe(write_stream);

write_stream.once('close', function (res) {
    log.info('done');
    client.close();
});

read_stream.end(message);
