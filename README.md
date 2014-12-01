# Banana-Node

The Banana project was forked from Kibana, and works with all kinds of time series (and non-time series) data stored in Apache Solr. It uses Kibana's powerful dashboard configuration capabilities, ports key panels to work with Solr, and provides significant additional capabilities, including new panels that leverage D3.js.

The goal is to create a rich and flexible UI, enabling users to rapidly develop end-to-end applications that leverage the power of Apache Solr. Data can be ingested into Solr through a variety of ways, including LogStash, Flume and other connectors.

This version differs from [the original one](https://github.com/LucidWorks/banana) that it contains Node.js Server

To run Banana follow this steps:

* Install Node.js
```
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```
* Clone the repository
```
https://github.com/tarek-salah/banana-node.git
```

* In the terminal run 
```
npm install
```

* Download [Solr](http://lucene.apache.org/solr/) and run it on port 8983

* In the terminal run 
```
npm start
```

* go to localhost:3000
