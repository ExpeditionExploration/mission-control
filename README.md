# Prerequisites

-   pigpiod

```
sudo apt-get update
sudo apt-get install pigpio
```

-   Node js, install via apt not nvm because it causes issues with run as sudo
    https://pimylifeup.com/raspberry-pi-nodejs/

# Deploy

Add your computer ssh key to your raspberry pi if you want to avoid inserting a password all the time.
Computer's public key from `~/.ssh/id_rsa.pub` into the `~/.ssh/authorized_keys` folder on your raspberry pi.
OR
Run `ssh-copy-id remote-user@server-ip`

# Starting

-   sudo DEBUG="MissionControl:\*" node index.js

# Notes

-   Fixing waiting for server log. Run from command shift p window to remove remote ssh from remote. Then reconnect to reinstall.
-   Grant user admin rights: sudo usermod -aG sudo jupiter2

# Ports (Reserved)

-   16500: Device Port
-   16501: Media Stream

# Where I left off:

-   Managed to get something potentially better working with inversify, but I am in a situation where I need a delayed injection on module in user interface but it doesn't want to work.
-   Im trying to figure out if I require all modules to extend a Module class and then use a common module token for injection. This will allow the user interface bootstrapping process to automatically pass the module into the jsx element as a parameter.
