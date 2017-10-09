/*	- Copy sbbs-dp-rlogin.ini to your Synchronet 'ctrl' directory
	- Edit sbbs-dp-rlogin.ini
		- Set 'password' to a random password of your choosing
		- Set 'system_tag' to the system tag provided by the DoorParty administrator
	- Copy sbbs-dp-rlogin.js to your Synchronet 'mods' directory
	- In SCFG, create an external program:
		- Name: DoorParty
		- Internal Code: DOORPRTY
		- Command Line: ?sbbs-dp-rlogin.js
		- Multiple Concurrent Users: Yes
	    - All other settings can be left at their default values.
	- Optionally create 'direct' entries for particular door games:
		- In SCFG, create an external program:
			- Name: DoorParty LORD
			- Internal Code: DPLORD
			- Command Line: ?sbbs-dp-rlogin.js lord
			- Multiple Concurrent Users: Yes
		    - All other settings can be left at their default values.
		- In 'Command Line' above, 'lord' is a 'door code' that tells DoorParty
		  which game to launch upon connect.  For more door codes, see here:
		  http://wiki.throwbackbbs.com/doku.php?id=doorcode
*/

load('sbbsdefs.js');

var attr = console.attributes;
console.clear(LIGHTGRAY);
console.putmsg('Connecting to DoorParty, please wait ...');

try {
	if (file_exists(system.ctrl_dir + 'sbbs-dp-rlogin.ini')) {
		var dc = (typeof argv[0] === 'undefined' ? '' : argv[0]);
		var f = new File(system.ctrl_dir + 'sbbs-dp-rlogin.ini');
		f.open('r');
		var ini = f.iniGetObject();
		f.close();
		bbs.rlogin_gate(
			ini.tunnel_host,
			ini.password,
			format('[%s]%s', ini.system_tag.replace(/[\[\]]/g, ''), user.alias),
			dc
		);
	} else if (argv.length >= 4) {
		bbs.rlogin_gate(argv[0], argv[1], argv[2] + user.alias, argv[3]);
	} else {
		bbs.rlogin_gate(argv[0], argv[1], argv[2] + user.alias);
	}
} catch (err) {
	log(LOG_ERR, err);
}

console.attributes = attr;
console.clear();
