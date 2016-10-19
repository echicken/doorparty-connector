# doorparty-connector
Connect to DoorParty via RLogin through an SSH tunnel

###About

This script listens for connections from RLogin clients, then establishes an SSH
tunnel to a remote server, then connects the RLogin client to a remote RLogin
server via the SSH tunnel.

I can't imagine a use for it other than connecting an RLogin client to
(DoorParty)[http://wiki.throwbackbbs.com/doku.php], but it could conceivably be
used with any remote SSH & RLogin server.

###Install

```sh
git clone https://github.com/echicken/doorparty-connector.git
cd doorparty-connector
npm install
```

###Configure

Open *settings.json* in a text editor, and you'll see something like this:

```js
{
	"username" : "doorparty_ssh_username",
	"password" : "doorparty_ssh_password",
	"interface" : "localhost",
	"port" : 513,
	"SSHServer" : "dp.throwbackbbs.com",
	"SSHPort" : 2022,
	"RLoginServer" : "dp.throwbackbbs.com",
	"RLoginPort" : 513
}
```

- Change *username* and *password* to your DoorParty SSH credentials
- Change *interface* to the local interface to listen on
- Change *port* to whatever port you wish to accept RLogin connections *from your BBS* on
- The other settings can remain the same, unless DoorParty's remote configuration changes at some point

###Run

If you're listening to port 513 on the local machine, you'll either need to run
with superuser privileges or work some redirection magic on the back end.

```sh
node index.js
```

### Synchronet Configuration

- Copy *sbbs-dp-rlogin.js* to your Synchronet 'mods' directory.

- In SCFG, create an external program:

```
	Name: DoorParty
	Internal Code: DOORPRTY
	Command Line: ?sbbs-dp-rlogin.js localhost password [tag]
	Multiple Concurrent Users: Yes
```

- In the *Command Line* field:
	- Replace 'password' with a random password of your own choosing
	- Replace [tag] with your own DoorParty BBS tag, including square brackets
- All other settings can be left at their default values.

Synchronet's RLogin gate feature does not allow us to specify a *port* to
connect to on the RLogin server, so it will always try to connect to port 513.
If your BBS is already listening for RLogin connections on port 513:

- Edit *ctrl/sbbs.ini*
- In the [BBS] section, change the *RLoginInterface* setting from *0.0.0.0* to the actual IP address of your BBS server (must be anything but *0.0.0.0* or *127.0.0.1*)

This will free up port 513 on 127.0.0.1 so that *doorparty-connector* may bind
to it.  Meanwhile your BBS will still be listening for external RLogin clients.

- Restart Synchronet

### Other Configurations

This software can be used with BBS packages other than Synchronet.  It simply
accepts connections from RLogin clients, sets up an SSH tunnel to DoorParty,
then connects the client to the DoorParty RLogin server via the SSH tunnel.

Use whatever method of initiating an RLogin connection your BBS software has to
offer, or use an external program (door) that provides this functionality.  Tell
it to connect to the *interface* and *port* that you have specified in
*settings.json*.