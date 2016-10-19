const fs = require('fs');
const net = require('net');
const util = require('util');
const SSHClient = require('ssh2').Client;

try {
	const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
} catch (err) {
	console.log('Error reading settings', err);
	process.exit();
}

function onRlogin(client, rlogin) {

	var str = rlogin.toString().split(/\x00/);
	if (str.length < 5) {
		client.close();
		return;
	}

	var sshTunnel = new SSHClient();

	function onStream(err, stream) {

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
			'data', (data) => { stream.write(data, 'binary'); }
		);
		
		stream.on(
			'error', (err) => { console.log('Stream error', err); }
		);
		
		stream.on(
			'data', (data) => { client.write(data, 'binary'); }
		);
		
		stream.on('close', () => { sshTunnel.end(); });

		console.log(
			util.format(
				'Connecting %s to %s:%s via SSH tunnel',
				str[2], settings.RLoginServer, settings.RLoginPort
			)
		);
		
		stream.write(rlogin, 'binary');		

	}

	function onTunnel() {
		sshTunnel.forwardOut(
			settings.interface, settings.SSHPort,
			settings.RLoginServer, settings.RLoginPort,
			onStream
		);		
	}

	client.on(
		'close', () => {
			console.log('Client session for ' + str[2] + ' closed');
			sshTunnel.end();
		}
	);

	sshTunnel.on(
		'error', (err) => {
			console.log('SSH tunnel for ' + str[2] + ' error', err);
		}
	);
	
	sshTunnel.on(
		'close', () => {
			console.log('SSH Tunnel for ' + str[2] + ' closed');
			client.end();
		}
	);
	
	sshTunnel.on('ready', onTunnel);
	
	sshTunnel.connect(
		{	host: settings.SSHServer,
			port: settings.SSHPort,
			username: settings.username,
			password: settings.password
		}
	);

}

function onClient(client) {
	client.on('error', (err) => { console.log('Client error', err); });
	client.once('data', (data) => { onRlogin(client, data); });
	console.log('Client connected');
}

const server = net.createServer(onClient);
server.on('error', (err) => { console.log('Server error', err); });
server.listen(
	{ host : settings.interface, port : settings.port },
	() => {
		console.log('Listening on ' + settings.interface + ':' + settings.port);
	}
);