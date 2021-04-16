let cluster = require('cluster');
let http = require('http');



let numCPUs = require('os').cpus().length;

// console.log(numCPUs);


if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);  

    let numReqs = 0;

    setInterval(() => {
      console.log(`numReqs = ${numReqs}`);
    }, 1000);
  
    // Count requests
    function messageHandler(msg) {
      if (msg.cmd && msg.cmd === 'notifyRequest') {
        numReqs += 1;
      }
    }    
 
 
    for (let i = 0; i < numCPUs; i++){
        cluster.fork();
    };

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', messageHandler);
    }    


    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);

        if (signal) {
            console.log(`worker was killed by signal: ${signal}`);
          } else if (code !== 0) {
            console.log(`worker exited with error code: ${code}`);
          } else {
            console.log('worker success!');
          }


    });

    cluster.fork().on('disconnect', () => {
        console.log(`Worker disconnect`);
    });

    cluster.fork().on('listening', (address) => {
        console.log(`Listening addres`);
    });

} else {

  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
    // Notify master about the request
    process.send({ cmd: 'notifyRequest' });
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}