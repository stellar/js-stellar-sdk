/**
* Server handles a network connection to a Horizon instance and exposes an
* interface for requests to that instance.
*/
export class Server {
    constructor(config={}) {
        this.hostname = config.hostname || "localhost";
        this.port = config.port || 3000;
    }

    sendTransaction(transaction) {
        var re = request
            .post(this.hostname + ":" + this.port +'/transactions')
            .type('json')
            .send({
                tx: transaction.blob
            });
            console.log(re);
            re.end(function(err, res) {
                console.log(res);
              if (err) {
                console.error(err);
              } else if (res.body.status === 'fail') {
              } else if (res.body.status === 'success') {
              } else {
                // resolver.reject(new errors.UnknownError(JSON.stringify(res.body)));
              }
            });
    }
}