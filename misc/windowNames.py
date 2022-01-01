import win32gui, win32process
import wmi

c = wmi.WMI()

#usernames = ["louise", "lewy", "katie", "alma", "kirya", "nitromoto1337", "maggie", "myrtle", "evelyn", "angel"]
def winEnumHandler( hwnd, ctx ):
    #if win32gui.IsWindowVisible( hwnd ):
        print (hex(hwnd), win32gui.GetWindowText( hwnd ))
        for a in usernames:
            if a in win32gui.GetWindowText(hwnd):
                print("Found " + a +" window located at " + str(hex(hwnd)))
                threadid,pid = win32process.GetWindowThreadProcessId(hwnd)
                print("Thread ID: " + str(threadid))
                print("Process ID: " + str(pid))
                for p in c.query('SELECT Name FROM Win32_Process WHERE ProcessId = %s' % str(pid)):
                    exe = p.Name
                print("Process Name: " + exe)

win32gui.EnumWindows( winEnumHandler, None )
