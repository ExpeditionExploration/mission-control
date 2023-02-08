
# Prerequisites 
- pigpiod
```
sudo apt-get update
sudo apt-get install pigpio
```

- Node js, install via apt not nvm because it causes issues with run as sudo
https://pimylifeup.com/raspberry-pi-nodejs/

# Deploy
Add your computer ssh key to your raspberry pi if you want to avoid inserting a password all the time.
Computer's public key from `~/.ssh/id_rsa.pub` into the `~/.ssh/authorized_keys` folder on your raspberry pi.

# Starting
- sudo DEBUG="MissionControl:*" node index.js


# Notes
- Fixing waiting for server log. Run from command shift p window to remove remote ssh from remote. Then reconnect to reinstall.