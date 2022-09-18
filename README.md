## IoT_Bar
IoT_Bar is a project that wants to show the potential of the IoT and the Serverless approach for make our lives easier, the goal is built an IOT system that monitor the Temperature and the CO (carbon monoxide), and modify them when they do not meet the requirements <br/>

The idea is to simulate :
 * **Temperature sensor** placed in the bar to warn the user when the temperature of the eneviroment is too low or too high. When the user is notified, he can choose        what to do from a Telegram bot, which is one thing among the following:
    * Enable actuator that automatic decrease temperature
    * Warn someone to adjust temperature
  * **GAS sensor** placed in the bar to warn the user when the CO in the enviroment is too high. When the user is notified, will be enabled an an actuator that will         clean the air and so decrease the CO. <br/>

Obviously, all these things are simulated because, right now, I am not in possession of these Iot devices.
This project is designed for building a computing architecture, based on open-source software, that exploit Function-as-service model in the context of IoT. The idea is provides a system which allows as in Amazon Aws or Microsoft Azure, and so on, to deploy functions that are trigged by events generated from small devices such as sensors and mobile (IoT devices), commonly these devices communicates using message-passing, in particular on dedicated protocol such as MQTT.<br/>
## Architeture
As previously mentioned, one of the phases of the project is to simulate the sending of data by the Iot sensors (in this case a temperature sensor, and a CO sensor).

<img src="https://github.com/JVALPASS/IoT_Bar/blob/main/doc/architeture_IoT_Bar.png"></br>

### Temperature sensor 
Can be simulated in this way:
  * Using the Node-Red in particular using Inject Node plus Javascript function Node, they permit to generate random Temperature value every 10 seconds
     *  The data is an integer value between 0 and 40 the temperature of the Bar. This value is published in these queues **iot/sensors/temperature** and               **iot/logs/temp** of RabbitMQ.
     
When a value is published in this queue, a function on Nuclio (consumetemperature) is triggered, which processes this value. This function checks if the temperature is ≤16 or > 25 and, if so, publish a new message in the queue **iot/alerts/temp**.
At this point, inside telegram_bot.js the publication in **iot/alerts/temp** is intercepted and a message is sent to the user thanks to a Telegram bot.
The user chooses what to do:
 * Enable actuator that automatic decrease temperature
 * Send someone to adjust temperature, publishing a message Boolean with value true to the Topic **iot/logs/handle**
The result of the changing of temperature are sent on Topic **iot/logs/temp**
### CO sensor 
Can be simulated in this way:
  * Using the Node-Red in particular using Inject Node plus Javascript function Node, they permit to generate random CO (carbon monoxide) value every 5 seconds
     *  The data is an integer value between 0 and 40 the temperature of the Bar. This value is published in these queues **iot/sensors/CO** and **iot/logs/CO**                   of RabbitMQ.
   
When a value is published in this queue, a function on Nuclio (consumeco) is triggered, which processes this value. This function checks if the CO is > 25 and, if so, publish a new message in the queue **iot/alerts/CO**.
At this point, inside telegram_bot.js the publication in **iot/alerts/CO** is intercepted and a message is sent to the user thanks to a Telegram bot.
The message advertise the user that an air-cleaner is enabled, will automatically decrease the CO
The result of the changing of CO are sent on Topic **iot/logs/CO**

## Prerequisites
* OS:
    * Ubuntu 25.04 LTS or more recent
* Software:
    * Docker and Docker Compose (Application containers engine)
    * Nuclio (Serverless computing provider)
    * RabbitMQ (AMQP and MQTT message broker)
    * Node.js
    * Node-Red
## Installation
This project is made on top of one local machine an Linux Ubuntu 20.04 LTS machine.
## Docker
Docker is a tool designed to make it easier to create, deploy, and run applications by using containers.
**Install Docker using the Docker CE installation [GUIDE](https://docs.docker.com/engine/install/ubuntu/).**<br/>
```$ sudo apt-get update
$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo apt-key fingerprint 0EBFCD88
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
$ sudo apt-get update
$ sudo apt-get install docker-ce
```
**IMPORTANT FIX** Ubuntu 18.04 changed to use systemd-resolved to generate /etc/resolv.conf. Now by default it uses a local DNS cache 127.0.0.53. That will not work inside a container, so Docker will default to Google's 8.8.8.8 DNS server, which may break for people behind a firewall. Refers to the [Stackoverflow discussion.](https://github.com/spagnuolocarmine/serverless-computing-for-iot#:~:text=Stackoverflow%20discussion.)
```
$ sudo ln -sf /run/systemd/resolve/resolv.conf /etc/resolv.conf
```
## Docker Compose
Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services.

**TIP** Docker compose is the technology used by Nuclio to easily create, build and deploy Docker application containers (the functions in this case).

Install Docker Compose using the Docker Compose installation [guide](https://docs.docker.com/compose/install/#install-compose).
```
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
```
## Node-Red
Node-RED is a programming tool for wiring together hardware devices, APIs and online services in new and interesting ways.
It provides a browser-based editor that makes it easy to wire together flows using the wide range of nodes in the palette that can be deployed to its runtime in a single-click.
Install Node-Red
```
$ curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
$ sudo apt install nodejs
$ sudo npm install -g --unsafe-perm node-red
```
Install Node-RED-Dashboard
Type 'localhost:1880' on your browser to open the homepage of Node-Red, use the Menu - Manage palette option and search for node-red-dashboard and install it

Start [Node-Red](https://nodered.org/docs/getting-started/local).
## Install Other Dependencies
  ```
  cd src/telegram_bot.js
  npm init
  npm install telegraf
  npm install moment
  npm install dotenv
  npm install mqtt
  ```
## Getting started
From two different terminals, start the docker to run RabbitMQ and Nuclio with these following commands:
* Docker RabbitMQ:
   ```
   $ docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt
   ```
* Docker Nuclio:
   ```
   $ docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
   ```
* Update and deploy Functions:
   * Type 'localhost:8070' on your browser to open the homepage of Nuclio;
   * Create new project and call it 'IoT_Bar';
   * Press 'Create function', 'Import' and upload the two functions that are in the yaml_functions folder;
   * In both, change the already present IP with your IP;
   Press 'Deploy'.
* Create personal Telegram Bot:
   * Open Telegram and search for BotFather.
   * Press start and type /newbot.
   * Give it a name and a unique id (BotFather will help you).
   * Copy and paste the Token that BotFather gave you in the Telegraf constructor in .env file;
* Start Telegram Bot's Server:
   Open again .env file and insert your IP address instead of 'INSERT_YOUR_IP'.
   Open terminal and type:
   ```
   node src/telegram_bot.js
   ```
* Start Telegram Bot Client:
   Now, you can go to the bot you've just created on Telegram and run it.
   The bot will warn you not to stop it to continue receiving updates on the Enviromental Parameters.
* Node-Red:
   * Type 'localhost:1880' on your browser to open the homepage of Node-Red
   * Select option in the menu Import -> uploading a flow JSON file in 'Node-Red/flows.json'
   * Double Click on Gas Node and click on enable
   * Double Click on Temperature Node and click on enable
   * Type 'localhost:1880/ui' on your browser to open the UI of Node-Red
 
After all these steps, you are able to send random values about CO and temperature using Node-Red

All the parameters (Temperature, CO, and if someone is sent to adjust temperature) can be seen in real-time on user interface developed with Node-Red

<img src="https://github.com/JVALPASS/IoT_Bar/blob/main/doc/Node_Red_UI.png"></br>





https://user-images.githubusercontent.com/51170999/190876651-dbfd5d0f-e6fa-40fc-b0d6-01a0de9df6a1.mp4






