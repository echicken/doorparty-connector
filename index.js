const fs = require('fs');
const net = require('net');
const util = require('util');
const path = require('path');
const SSHClient = require('ssh2').Client;

/*	Stupid nexe tricks
	Delete 'settings.json' from the 'doorparty-connector' directory when
	building with nexe; this will prevent the default settings file from being
	included in the bundle.  A 'settings.json' file must exist in the working
	directory of the executable, and will then be loaded at runtime. */
try {
	var settings = require(path.join(__dirname, './settings.json'));
} catch (err) {
	var settings = global.require('./settings.json');
}

function onRlogin(client, rlogin) {

	var str = rlogin.toString().split(/\x00/);
	if (str.length < 3) {
		client.end();
		return;
	}

	var sshTunnel = new SSHClient();

	function onTunnel(err, stream) {

		if (err) {
			console.log('SSH tunnel error', err);
			sshTunnel.end();
			return;
		} else {
			console.log(
				util.format(
					'SSH tunnel to %s:%s for %s established',
					settings.SSHServer, settings.SSHPort, str[2]
				)
			);
		}

		client.on(
			'data', function (data) { stream.write(data, 'binary'); }
		);

		stream.on(
			'error', function (err) { console.log('Stream error', err); }
		);

		stream.on(
			'data', function (data) { client.write(data, 'binary'); }
		);

		stream.on('close', function () { sshTunnel.end(); });

		console.log(
			util.format(
				'Connecting %s to %s:%s via SSH tunnel',
				str[2], settings.RLoginServer, settings.RLoginPort
			)
		);

		stream.write(rlogin, 'binary');

	}

	function onReady() {
		sshTunnel.forwardOut(
			settings.interface, settings.SSHPort,
			settings.RLoginServer, settings.RLoginPort,
			onTunnel
		);
	}

	client.on(
		'close', function () {
			console.log('Client session for ' + str[2] + ' closed');
			sshTunnel.end();
		}
	);

	sshTunnel.on(
		'error', function (err) {
			console.log('SSH tunnel for ' + str[2] + ' error', err);
		}
	);

	sshTunnel.on(
		'close', function () {
			console.log('SSH Tunnel for ' + str[2] + ' closed');
			client.end();
		}
	);

	sshTunnel.on('ready', onReady);

	sshTunnel.connect(
		{	host: settings.SSHServer,
			port: settings.SSHPort,
			username: settings.username,
			password: settings.password
		}
	);

}

function onClient(client) {
	client.on('error', function (err) { console.log('Client error', err); });
	client.once('data', function (data) { onRlogin(client, data); });
	console.log('Client connected');
}

const server = net.createServer(onClient);
server.on('error', function (err) { console.log('Server error', err); });
server.listen(
	{ host : settings.interface, port : settings.port },
	function () {
		console.log('Listening on ' + settings.interface + ':' + settings.port);
	}
);
