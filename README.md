# doorparty-connector
Connect to DoorParty via RLogin through an SSH tunnel

***Install

```sh
git clone https://github.com/echicken/doorparty-connector.git
cd doorparty-connector
npm install
```

***Configure

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

*** Run

If you're listening to port 513 on the local machine, you'll either need to run
with superuser privileges or work some redirection magic on the back end.

```sh
node index.js
```