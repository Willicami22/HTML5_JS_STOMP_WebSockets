var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }
    }

    var stompClient = null;
    var connected = false;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    };


    var getMousePosition = function (evt) {
        var canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var onCanvasClick = function (evt) {
        var pos = getMousePosition(evt);
        publishPoint(pos.x, pos.y);
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WebSocket...');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        // Enable debug logging
        stompClient.debug = function(str) {
            console.log('STOMP: ' + str);
        };

        // Connect to the WebSocket server
        stompClient.connect({},
            function (frame) {
                connected = true;
                console.log('Successfully connected to WebSocket: ' + frame);
                
                // Subscribe to the draw topic
                var subscription = stompClient.subscribe('/topic/draw', function (message) {
                    // message.body contains the textual JSON representation of a Point
                    try {
                        var theObject = JSON.parse(message.body);
                        console.log('Received point from broker: x=' + theObject.x + ', y=' + theObject.y);
                        // draw it on the canvas
                        addPointToCanvas(theObject);
                    } catch (e) {
                        console.error('Failed to parse message body:', message.body, e);
                    }
                }, {id: 'points-subscription'});
                
                console.log('Subscribed to /topic/draw with subscription ID: ' + subscription.id);
            },
            function(error) {
                console.error('Error connecting to WebSocket:', error);
                connected = false;
            }
        );

    };

    var publishPoint = function(px, py) {
        if (!connected) {
            console.warn('Not connected to server yet. Please wait a moment and try again.');
            return;
        }

        var x = parseInt(px);
        var y = parseInt(py);
        console.info("Publishing point at x=" + x + ", y=" + y);
        var pt = new Point(x, y);
        
        // Draw the point locally first for immediate feedback
        addPointToCanvas(pt);
        
        // Send the point to the server
        if (stompClient && stompClient.connected) {
            console.log('Sending point to /app/point:', pt);
            stompClient.send(
                '/app/point', 
                {}, 
                JSON.stringify(pt),
                function(message) {
                    console.log('Message acknowledged by server:', message);
                }
            );
        } else {
            console.warn('stompClient is null, cannot publish point.');
        }
    };

    return {

        init: function () {
            var canvas = document.getElementById("canvas");

            //add click listener to canvas
            canvas.addEventListener("click", onCanvasClick);

            //websocket connection
            connectAndSubscribe();
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            console.log("Disconnected");
        }
    };

})();