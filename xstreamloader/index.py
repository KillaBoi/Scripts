import requests
import re
import xml.etree.ElementTree as ET
import subprocess
import time
from pywinauto import Application

# Function to send the web request and extract the key
def fetch_key():
    print("Fetching key from the web request...")
    url = "https://xstreamloader.techweb.at/oc-key/index.php"
    
    # Headers for the request
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Brave\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        "Referer": "https://xstreamloader.techweb.at/oc-key/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    }

    data = {"action": "generate"}
    
    # Send the POST request
    response = requests.post(url, headers=headers, data=data)
    response.raise_for_status()  # Raise an error if the request fails

    # Parse the JSON response
    json_data = response.json()
    raw_key = json_data[0]["key"]

    # Use regex to extract the key from the HTML span tag
    match = re.search(r'id=".*?">(.*?)<', raw_key)
    if match:
        return match.group(1)
    else:
        raise ValueError("Key not found in the response.")

# Function to update the XML configuration file
def update_config(file_path, key):
    print(f"Updating config file: {file_path} with key: {key}")
    # Parse the XML file
    tree = ET.parse(file_path)
    root = tree.getroot()

    # Find the `OnlineCheckKey` setting and update its value
    for setting in root.findall(".//setting[@name='OnlineCheckKey']"):
        value_element = setting.find("value")
        if value_element is not None:
            value_element.text = key
            print(f"Updated OnlineCheckKey with value: {key}")
        else:
            raise ValueError("Value element not found for OnlineCheckKey.")
    
    # Save the updated XML back to the file
    tree.write(file_path, encoding="utf-8", xml_declaration=True)

# Function to open the X-StreamLoader application
def open_application(executable_path):
    print(f"Opening application: {executable_path}")
    try:
        subprocess.Popen(executable_path, shell=True)
        print(f"Opened application: {executable_path}")
    except Exception as e:
        print(f"Failed to open application: {e}")

# Function to interact with the application and click the Start button
def click_start_button():
    print("Interacting with the application...")
    time.sleep(5)  # Wait for the application to fully open

    try:
        # Connect to the application with win32 backend
        app = Application(backend="uia").connect(title="X-StreamLoader")
        window = app.window(title="X-StreamLoader")

        # Ensure the window is active
        window.set_focus()

        # Click the "Start" button using its auto_id
        start_button = window.child_window(auto_id="btnStartOnlineCheck", control_type="Button")
        start_button.click()

        print("Clicked the Start button successfully!")
    except Exception as e:
        print(f"Failed to click Start button: {e}")


def debug_controls():
    try:
        # Connect to the application
        app = Application(backend="uia").connect(path="X-StreamLoader.exe")
        window = app.window(title="X-StreamLoader")

        # Print all controls in the window
        print("Available controls in the window:")
        window.print_control_identifiers()
    except Exception as e:
        print(f"Failed to retrieve control identifiers: {e}")

# Main script logic
if __name__ == "__main__":
    config_file_path = input("Enter the path to the config file: ").strip()
    executable_path = "X-StreamLoader.exe"  # Update with the full path if needed

    try:
        # Fetch the key from the web request
        key = fetch_key()
        
        # Update the config file with the new key
        update_config(config_file_path, key)
        
        # Open the application
        open_application(executable_path)

        # Click the Start button
        click_start_button()

        #debug_controls()
    except Exception as e:
        print(f"An error occurred: {e}")
