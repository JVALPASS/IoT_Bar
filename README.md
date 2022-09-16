## IoT_Bar
IoT_Bar is a project that wants to show the potential of the IoT and the Serverless approach for make our lives easier, the goal is built an IOT system that monitor the Temperature and the CO (carbon monoxide), and modify them when they do not meet the requirements <br/>
The idea is to simulate 
 * A temperature sensor placed in the bar to warn the user when the temperature of the eneviroment is too low or too high. When the user is notified, he can choose        what to do from a Telegram bot, which is one thing among the following:
    * Enable actuator that automatic decrease temperature
    * Warn someone to adjust temperature
  * A GAS sensor placed in the bar to warn the user when the CO in the enviroment is too high. When the user is notified, will be enabled an an actuator that will         clean the air and so decrease the CO.

Obviously, all these things are simulated because, right now, I am not in possession of any Iot devices.


This project is designed for building a computing architecture, based on open-source software, that exploit Function-as-service model in the context of IoT. The idea is provides a system which allows as in Amazon Aws or Microsoft Azure, and so on, to deploy functions that are trigged by events generated from small devices such as sensors and mobile (IoT devices), commonly these devices communicates using message-passing, in particular on dedicated protocol such MQTT.<br/>
## Prerequisites
* OS:
    * Ubuntu 18.04 LTS or more recent
* Software:
    * Docker and Docker Compose (Application containers engine)
    * Nuclio (Serverless computing provider)
    * RabbitMQ (AMQP and MQTT message broker)
    * Node.js
## Installation
This project is made on top of one local machine an Linux Ubuntu 20.04 LTS LTS machine.
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
## Nuclio
Nuclio (High-Performance Serverless event and data processing platform) is a new "serverless" project, derived from Iguazio's elastic data life-cycle management service for high-performance events and data processing. The simplest way to explore Nuclio is to run its graphical user interface (GUI) of the Nuclio dashboard.
**TIP** The Nuclio documentation is available at this [link].

Start [Nuclio](https://github.com/nuclio/nuclio) using a docker container.
```
$ docker run -p 8070:8070 -v /var/run/docker.sock:/var/run/docker.sock -v /tmp:/tmp nuclio/dashboard:stable-amd64
```
## RabbitMQ
RabbitMQ is lightweight and easy to deploy on premises and in the cloud. It supports multiple messaging protocols. RabbitMQ can be deployed in distributed and federated configurations to meet high-scale, high-availability requirements.

Start [RabbitMQ](https://www.rabbitmq.com/) instance with MQTT enabled using docker.
```
$ docker run -p 9000:15672  -p 1883:1883 -p 5672:5672  cyrilix/rabbitmq-mqtt 
```
## IFTTT MESSAGE TRIGGER
Create an [IFTT](https://ifttt.com/) account.
Then you need to create a new Applet:</br>
- Set this name to Event Name: **"Magnet disconnected"**
- Use WebHooks in **if** and select **"receive a web request with a JSON paylod"** section:</br>
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/webhooks.png" width="500" height="300"></br>
- Select **"SMS"** in **then** :</br>
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/overviewWebhooks.png" width="500" height="350"></br>
- Set the parameter in the SMS:</br>
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/smsWebhooks.png" width="500" height="350"></br>
- Remember to connect the service:</br>
<img src="https://github.com/JVALPASS/Secure_Child_Seat/blob/main/assets/resultsWebooks.png" width="500" height="350"></br>
