#!/bin/sh -e

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

# update the system
opkg update

# install needed packages
opkg install curl python-light python-pip pyOnionI2C
pip install flask

# add the hackerschool to the site packages
if [ -f /usr/lib/python2.7/site-packages/hackerschool ]; then
    rm /usr/lib/python2.7/site-packages/hackerschool
fi
ln -s "$SCRIPT_DIR/python_lib" /usr/lib/python2.7/site-packages/hackerschool

# add the server to start at boot
sed -i '/start_server.sh/d' /etc/rc.local
sed -i "/^exit 0/i sh $SCRIPT_DIR/start_server.sh >> /tmp/hackerschool.log 2>&1 & " /etc/rc.local
