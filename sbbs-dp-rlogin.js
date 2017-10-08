/*	Copy to Synchronet 'mods' directory
	In SCFG, create an external program:

	Name: DoorParty
	Internal Code: DOORPRTY
	Command Line: ?sbbs-dp-rlogin.js localhost password [tag]
	Multiple Concurrent Users: Yes

	In the 'Command Line':
	- Replace 'password' with a random password of your own choosing
	- Replace [tag] with your own DoorParty BBS tag, including square brackets

	All other settings can be left at their default values.
*/

load('sbbsdefs.js');

var attr = console.attributes;
console.clear(LIGHTGRAY);
console.putmsg('Connecting to DoorParty, please wait ...');

try {
	if (file_exists(system.ctrl_dir + 'sbbs-dp-rlogin.ini')) {
		var f = new File(system.ctrl_dir + 'sbbs-dp-rlogin.ini');
		f.open('r');
		var ini = f.iniGetObject();
		f.close();
		bbs.rlogin_gate(
			ini.tunnel_host,
			ini.password,
			format('[%s]%s', ini.system_tag.replace(/[\[\]]/g, ''), user.alias),
			argv[0]
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
