#!/bin/bash

PYTHON_INSTALL_VERSION="3.8.10"
python_version=$(python --version)
installed_version="Python $PYTHON_INSTALL_VERSION"
echo $python_version
echo $installed_version
if [ "${python_version}" != "$installed_version" ] ; then
        sudo mkdir /root/Downloads
	cd /root/Downloads && wget https://www.python.org/ftp/python/$PYTHON_INSTALL_VERSION/Python-$PYTHON_INSTALL_VERSION.tgz &&  tar zxvf Python-$PYTHON_INSTALL_VERSION.tgz && cd Python-$PYTHON_INSTALL_VERSION && ./configure --enable-optimizations &&  make altinstall
fi
update-alternatives --install /usr/bin/python python /usr/local/bin/python3.8 1 && update-alternatives --install /usr/bin/python3 python3 /usr/local/bin/python3.8 1
ln -s /usr/share/pyshared/lsb_release.py /usr/local/lib/python3.8/site-packages/lsb_release.py
python3 -m pip install --user --upgrade pip
python --version
pip3 --version
