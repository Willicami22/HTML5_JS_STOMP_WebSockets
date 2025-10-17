var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            // subscribe to the exercise topic where Point JSON messages are published
            stompClient.subscribe('/topic/newpoint', function (message) {
                // message.body contains the textual JSON representation of a Point
                try {
                    var theObject = JSON.parse(message.body);
                    // show an alert with the received coordinates
                    alert('Received point from broker: x=' + theObject.x + ', y=' + theObject.y);
                    // also draw it on the canvas
                    addPointToCanvas(theObject);
                } catch (e) {
                    console.error('Failed to parse message body:', message.body, e);
                }
            });
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            // publicar el evento en el tópico /app/newpoint
            if (stompClient && stompClient.connected) {
                stompClient.send('/app/newpoint', {}, JSON.stringify(pt));
            } else if (stompClient) {
                // stompClient.connected may be undefined depending on STOMP lib version
                // attempt to send anyway (the library will queue or throw)
                try {
                    stompClient.send('/app/newpoint', {}, JSON.stringify(pt));
                } catch (e) {
                    console.warn('Could not send message, client not connected yet.', e);
                }
            } else {
                console.warn('stompClient is null, cannot publish point.');
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };

})();