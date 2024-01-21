# Run the Plugin on a Local WordPress Website

**1. Install XAMPP**

1. Download XAMPP in C:\ - https://www.apachefriends.org/
2. Start Apache and MySQL in XAMPP Control Panel
3. ensure port 3306 not used (if you installed MySQL previously)
4. If MySQL keeps stopping, try:
   - go to `mysql` folder
   - rename `data` folder as `dataold`, copy the folder and rename the copy as `data`
   - copy database folders from `dataold` to `data`
   - copy log files from `dataold` to `data`
   - restart server in control panel

**2. Create local WordPress site**

1. Set up local project folder
   1. download WordPress core (https://wordpress.org/download/)
   2. extract wordpress folder into C:\xampp\htdocs
   3. copy "wordpress" folder
   4. rename folder as project name (e.g., "esprit")
2. Connect project to a database
   1. open xampp control and activate apache and mysql
   2. click "Admin" next to MySQL
   3. click "New" (left menu)
   4. Give database a name and click "Create"
   5. (one time set up) set username/password
      - username is "root"
      - leave password blank
3. Sign into local Wordpress
   1. go to http://localhost/`<foldername>`
   2. choose language
   3. enter credentials
      - username: root
      - password: leave empty
   4. click "Run the installation"
   5. Input settings
      - Site Title
      - Username
      - Password
      - Email
   6. click "Install Wordpress"
   7. login with username and password chosen above

**3. Download your hosted Wordpress website**

1. go to plugins > add plugin > install and activate "wp all-in-one migration"
2. Export and download file

- this requires you have a live WordPress site installed with the WooCommerce Plugin. If you don't have a live site, email jonwayhuang@gmail.com for a file

**4. Import above file into the local WordPress core**

1. Go to http://localhost/<foldername>/wp-admin/. Go to Plugins > add plugin > install and activate "wp all-in-one migration"
2. Increase import file site by adding these line to and of .htaccess file (in the project folder)
   php_value upload_max_filesize 500M
   php_value post_max_size 500M
   php_value memory_limit 256M
   php_value max_execution_time 1800
   php_value max_input_time 1800
3. In the migration plugin menu, import the file you downloaded in Step 4

**5. Install plugin**

1. Copy and paste the “esprit-woo” folder (in Github) into c:\xampp\htdocs\<projectfoldername>\wp-content\plugins
