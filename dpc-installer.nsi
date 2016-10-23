!include nsDialogs.nsh
!include LogicLib.nsh

Name "DoorParty Connector"
OutFile "dpc-installer.exe"

XPStyle on

Var Dialog
Var Username
Var Password
Var RLoginInterface
Var RLoginPort
Var SSHServer
Var SSHPort

Page custom startPage
Page custom installPage
Page custom getUserPage getUserPageLeave
Page custom endPage

Function startPage

	nsDialogs::Create 1018
	Pop $Dialog
	${If} $Dialog == error
		Abort
	${EndIf}

	${NSD_CreateLabel} 0 0 100% 12u "The latest version DoorParty Connector will now be downloaded"
	Pop $0

	nsDialogs::show

FunctionEnd

Function installPage

	StrCpy $INSTDIR "$PROGRAMFILES32\DoorParty Connector"
	IfFileExists $INSTDIR +2 0
		CreateDirectory $INSTDIR

	; Get the latest doorparty-connector.exe from GitHub
	inetc::get /CAPTION "DoorParty Connector" /POPUP "" https://github.com/echicken/doorparty-connector/blob/master/doorparty-connector.exe?raw=true "$INSTDIR\doorparty-connector.exe" /END
	Pop $R0
	StrCmp $R0 "OK" +3
		MessageBox MB_OK "Download of doorparty-connector.exe failed: $R0"
		Quit

	; Get the default settings.json from GitHub if no file currently exists locally
	IfFileExists "$INSTDIR\settings.json" +6 0
		inetc::get /CAPTION "DoorParty Connector" /POPUP "" https://github.com/echicken/doorparty-connector/blob/master/settings.json?raw=true "$INSTDIR\settings.json" /END
		Pop $R0
		StrCmp $R0 "OK" +3
			MessageBox MB_OK "Download of settings.json failed: $R0"
			Quit

	nsJSON::Set /file "$INSTDIR\settings.json"

	; Add the startup-item
	IfFileExists "$SMPROGRAMS\Startup\DoorParty Connector.lnk" +3 0
		SetOutPath $INSTDIR
		CreateShortCut "$SMPROGRAMS\Startup\DoorParty Connector.lnk" "$INSTDIR\doorparty-connector.exe" "" "$INSTDIR"

	WriteUninstaller "$INSTDIR\uninstall.exe"

FunctionEnd

Function getUserPage

	nsDialogs::Create 1018
	Pop $Dialog
	${If} $Dialog == error
		Abort
	${EndIf}

	${NSD_CreateLabel} 0 0 36% 12u "DoorParty SSH Username"
	Pop $0

	nsJSON::Get 'username' /END
	Pop $0
	${NSD_CreateText} 38% 0 60% 12u $0
	Pop $Username

	${NSD_CreateLabel} 0 12% 36% 12u "DoorParty SSH Password"
	Pop $0

	nsJSON::Get 'password' /END
	Pop $0
	${NSD_CreatePassword} 38% 12% 60% 12u $0
	Pop $Password

	${NSD_CreateLabel} 0 24% 100% 12u "Listen for RLogin clients on the following:"
	Pop $0

	${NSD_CreateLabel} 0 36% 36% 12u "RLogin Interface"
	Pop $0

	nsJSON::Get 'interface' /END
	Pop $0
	${NSD_CreateText} 38% 36% 60% 12u $0
	Pop $RLoginInterface

	${NSD_CreateLabel} 0 48% 36% 12u "RLogin Port"
	Pop $0

	nsJSON::Get 'port' /END
	Pop $0
	${NSD_CreateText} 38% 48% 60% 12u $0
	Pop $RLoginPort

	${NSD_CreateLabel} 0 60% 100% 12u "Connect to DoorParty through this SSH server:"

	${NSD_CreateLabel} 0 72% 36% 12u "SSH Server"
	Pop $0

	nsJSON::Get 'SSHServer' /END
	Pop $0
	${NSD_CreateText} 38% 72% 60% 12u $0
	Pop $SSHServer

	${NSD_CreateLabel} 0 84% 36% 12u "SSH Port"
	Pop $0

	nsJSON::Get 'SSHPort' /END
	Pop $0
	${NSD_CreateText} 38% 84% 60% 12u $0
	Pop $SSHPort

	nsDialogs::Show
	
FunctionEnd

Function getUserPageLeave

	${NSD_GetText} $Username $0
	nsJSON::Set 'username' /value '"$0"'

	${NSD_GetText} $Password $0
	nsJSON::Set 'password' /value '"$0"'

	${NSD_GetText} $RLoginInterface $0
	nsJSON::Set 'interface' /value '"$0"'

	${NSD_GetText} $RLoginPort $0
	nsJSON::Set 'port' /value '"$0"'

	${NSD_GetText} $SSHServer $0
	nsJSON::Set 'SSHServer' /value '"$0"'

	${NSD_GetText} $SSHPort $0
	nsJSON::Set 'SSHPort' /value $0

	nsJSON::Serialize /file /format "$INSTDIR\settings.json"

FunctionEnd

Function endPage

	nsDialogs::Create 1018
	Pop $Dialog
	${If} $Dialog == error
		Abort
	${EndIf}

	${NSD_CreateLabel} 0 0 100% 12u "DoorParty Connector has been installed"
	Pop $0

	nsDialogs::show

FunctionEnd

Function .onInstSuccess
	ExecShell "" "$SMPROGRAMS\Startup\DoorParty Connector.lnk"
FunctionEnd

Section
SectionEnd

Section "Uninstall"

	IfFileExists "$SMPROGRAMS\Startup\DoorParty Connector.lnk" 0 +2
		Delete "$SMPROGRAMS\Startup\Doorparty Connector.lnk"

	IfFileExists "$INSTDIR" 0 +2
		RMDir /r /REBOOTOK $INSTDIR

SectionEnd