sudo yum install -y httpd php gcc glibc glibc-common perl wget openssl-devel net-snmp-utils unzip

sudo systemctl enable httpd
sudo systemctl start httpd

mkdir /tmp/nagios
cd /tmp/nagios
wget https://assets.nagios.com/downloads/nagioscore/releases/nagios-4.4.6.tar.gz
tar xzf nagios-4.4.6.tar.gz

cd nagios-4.4.6
./configure --with-command-group=nagcmd
make all
sudo make install
sudo make install-init
sudo make install-commandmode
sudo make install-config
sudo make install-webconf

sudo htpasswd -c /usr/local/nagios/etc/htpasswd.users nagiosadmin

sudo systemctl enable nagios
sudo systemctl start nagios
cd /tmp/nagios
wget https://nagios-plugins.org/download/nagios-plugins-2.3.3.tar.gz
tar xzf nagios-plugins-2.3.3.tar.gz
cd nagios-plugins-2.3.3
./configure --with-nagios-user=nagios --with-nagios-group=nagios
make
sudo make install

sudo firewall-cmd --zone=public --add-port=80/tcp --permanent
sudo firewall-cmd --reload

rm -rf /tmp/nagios*
