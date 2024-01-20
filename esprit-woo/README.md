## Setup

### Install XAMPP
1. Download XAMPP in C:\ - https://www.apachefriends.org/
1. go to mysql folder
1. rename data folder as dataold, copy the folder and rename copy as data
1. copy database folders from dataold to data
1. copy log files from dataold to data
1. restart server in control panel
1. ensure port 3306 not used (if you installed MySQL previously)

### Create local WordPress site
#### Set up local project folder
1. download WordPress core (https://wordpress.org/download/)
1. extract wordpress folder into C:\xampp\htdocs
1. copy "wordpress" folder
1. rename folder as project name (“esprit”)
#### Connect project to a database
1. open xampp control and activate apache and mysql
1.click "Admin" next to MySQL
1.click "New" (left menu)
1.Give database a name and click "Create"
1.(one time set up) set username/password
1.username is "root"
1.leave password blank
#### Sign into local Wordpress
1. go to http://localhost/<foldername>
1. choose language
1. enter credentials
1. username: root
1. password: leave empty
1. click "Run the installation"
1. Input settings
* Site Title
* Username
* Password
* Email
8. click "Install Wordpress"
#### login with username and password chosen above
********************************ask Brian for file if you want it*******************************
1. Download your hosted Wordpress website
1. go to plugins > add plugin > install and activate "wp all-in-one migration"
1. Export and download file
********************************************************************************************************
#### Import above file into the local WordPress core
1. Go to http://localhost/<foldername>/wp-admin/. Go to Plugins > add plugin > install and activate "wp all-in-one migration"
1. increase import file site by adding these line to and of .htaccess file (in the project folder)
1. php_value upload_max_filesize 500M
1. php_value post_max_size 500M
1. php_value memory_limit 256M
1. php_value max_execution_time 1800
1. php_value max_input_time 1800
#### In the migration plugin menu, import the file you downloaded in Step 4
#### Install plugin
1. Copy and paste the “esprit-woo” folder (in Github) into c:\xampp\htdocs\<projectfoldername>\wp-content\plugins
#### Activate plugin
1. Go to your local WordPress site at localhost/<projectfoldername>
1. Go to Plugins (left menu) > activate Esprit Pay plugin
1. Go to WooComerce (left menu) > Settings
1. Enter merchant address > save
1. Save
### Test it out
1. Select an item for checkout
1. Click Esprit Pay
1. Scan
