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

bbs.rlogin_gate(argv[0], argv[1], argv[2] + user.alias);