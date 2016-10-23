# doorparty-connector

This script listens for connections from RLogin clients, then establishes an SSH
tunnel to a remote server, then connects the RLogin client to a remote RLogin
server via the SSH tunnel.

I can't imagine a use for it other than connecting an RLogin client to
[DoorParty](http://wiki.throwbackbbs.com/doku.php), but it could conceivably be
used with any remote SSH & RLogin server.

##Windows Setup

[An installer is available](https://github.com/echicken/doorparty-connector/blob/master/dpc-installer.exe?raw=true)
for Windows users.  This will download the latest copy of
[doorparty-connector.exe](https://github.com/echicken/doorparty-connector/blob/master/doorparty-connector.exe?raw=true)
and
[settings.json](https://github.com/echicken/doorparty-connector/blob/master/settings.json?raw=true)
and will set the program to launch as a startup item.

If the installer succeeds, DoorParty Connector will be launched immediately. You
can skip the entire *Manual Setup* section in that case.

Note that you will still need to configure your BBS to connect to DoorParty
Connector.  Examples are provided below.

If you make a mistake when entering your settings, or need to change them later
on, you can simply run the installer again, or edit
C:\Program Files (x86)\DoorParty Connector\settings.json
to make changes manually.

An uninstaller is provided at 
C:\Program Files (x86)\DoorParty Connector\uninstall.exe.

##Manual Setup

If you're not running Windows, or if the installer fails for some reason, manual
installation is also possible.

Windows users may be able to get away with simply downloading
[doorparty-connector.exe](https://github.com/echicken/doorparty-connector/blob/master/doorparty-connector.exe?raw=true)
and
[settings.json](https://github.com/echicken/doorparty-connector/blob/master/settings.json?raw=true).
Place them in the same directory, edit *settings.json* as necessary, and then
launch *doorparty-connector.exe*.  Otherwise, follow these next steps:


###Prepare

You'll need to have node.js and npm installed on your system in order to use 
this application.  It should work with node.js versions 4.x and greater, and
should run equally well on Windows, Linux, OS X, or anywhere else that node.js
runs.

If you have *git* installed:
```sh
git clone https://github.com/echicken/doorparty-connector.git
```

If you downloaded [the zip file](https://github.com/echicken/doorparty-connector/archive/master.zip) instead:
```sh
unzip doorparty-connector-master.zip
mv doorparty-connector-master doorparty-connector
```

###Install

Now we can proceed:
```sh
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

In the long term, you may wish to consider using a node.js process manager such as
[forever](https://github.com/foreverjs/forever) or [pm2](http://pm2.keymetrics.io/)
launch DoorParty Connector and keep it running.

## Synchronet Configuration

- Place a copy of [sbbs-dp-rlogin.js](https://github.com/echicken/doorparty-connector/blob/master/sbbs-dp-rlogin.js?raw=true) in your Synchronet 'mods' directory

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

## Mystic Configuration

- Launch the Mystic configuration editor
- Go to Editors
- Pick the theme you wish to edit
- Pick the menu you wish to edit
- Add or modify a menu item
- Select *D3* for the command
- Enter this as the *DATA*, where 'localhost' and 'port' are the address and port that DoorParty Connector is listening on, where '[tag]' is your DoorParty BBS tag, including square brackets, and where 'password' is a random password of your choosing
	- /ADDR=localhost:port /USER=[tag]@USER@ /PASS=password
- Save and exit

## Other Configurations

This software simply accepts connections from RLogin clients, sets up an SSH
tunnel to DoorParty, then connects the client to the DoorParty RLogin server via
the SSH tunnel.

Use whatever method of initiating an RLogin connection your BBS software has to
offer, or use an external program (door) that provides this functionality.  Tell
it to connect to the *interface* and *port* that you have specified in
*settings.json*.

## Disclaimer

This software is provided without any warranty.  By installing it, you agree to
hold the author blameless if it somehow destroys your computer, your BBS, or
causes any other problems for you.  No guarantee is made that there will be
doors or that said doors will be having a party, or that there will be a general
party atmosphere amongst the users of said doors, or indeed that there will be
users at all.  Additionally, no guarantee is made that DoorParty Connector will
connect you to DoorParty or to a door party or a party of doors or a party for
door game players.

The author of this software is not the owner, operator, or administrator of
DoorParty.  If you have questions about DoorParty, contact maskreet on 
[Throwback BBS](http://www.throwbackbbs.com/).
