'use strict';
const fs = require('fs');
const net = require('net');
const path = require('path');
const SSHClient = require('ssh2').Client;

function on_tunnel(settings, tunnel, client, rlogin, user, err, stream) {
  if (err) {
    console.log('SSH tunnel error', err);
    tunnel.end();
    return;
  }
  console.log(`SSH tunnel to ${settings.SSHServer}:${settings.SSHPort} for ${user} established`);
  client.on('data', data => stream.write(data, 'binary'));
  stream.on('error', err => console.log('Stream error', err));
  stream.on('data', data => client.write(data, 'binary'));
  stream.on('close', () => tunnel.end());
  console.log(`Connecting ${user} to ${settings.RLoginServer}:${settings.RLoginPort} via SSH tunnel`);
  stream.write(rlogin, 'binary');
}

function on_rlogin(settings, client, rlogin) {

	let str = rlogin.toString().split(/\x00/);
	if (str.length < 3) {
		client.end();
		return;
	}

	var tunnel = new SSHClient();

	client.on('close', () => {
		console.log(`Client session for ${str[2]} closed`);
		tunnel.end();
	});

	tunnel.on('error', err => console.log(`SSH tunnel for ${str[2]} error`, err));

  tunnel.on('close', () => {
		console.log(`SSH Tunnel for ${str[2]} closed`);
		client.end();
  });

  tunnel.on('ready', () => {
    tunnel.forwardOut(
      settings.interface, settings.SSHPort,
			settings.RLoginServer, settings.RLoginPort,
			(err, stream) => {
        on_tunnel(settings, tunnel, client, rlogin, str[2], err, stream);
      }
    )
  });

  tunnel.connect({
    host: settings.SSHServer,
		port: settings.SSHPort,
		username: settings.username,
		password: settings.password
	});

}

function on_client(settings, client) {
	client.on('error', err => console.log('Client error', err));
	client.once('data', data => on_rlogin(settings, client, data));
	console.log('Client connected');
}

function main() {

  /**
   * Delete 'settings.json' from 'doorparty-connector' directory when building
   * with nexe; this will prevent inclusion of default settings file in the
   * bundle.  'settings.json' must exist in the working directory of the
   * executable, and will be loaded at runtime.
   */
  let settings;
  try {
  	settings = require(path.join(__dirname, './settings.json'));
  } catch (err) {
  	settings = global.require('./settings.json');
  }

  const server = net.createServer(client => on_client(settings, client));
  server.on('error', err => console.log('Server error', err));
  server.listen({ host : settings.interface, port : settings.port }, () => {
  	console.log(`Listening on ${settings.interface}:${settings.port}`);
  });

}

main();
