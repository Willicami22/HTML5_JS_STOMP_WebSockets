var app = (function () {
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    // Application state
    var stompClient = null;
    var connected = false;
    var currentDrawingId = null;
    var subscription = null;

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


    var connectToDrawing = function(drawingId) {
        if (connected && currentDrawingId === drawingId) {
            console.log('Already connected to drawing ' + drawingId);
            return;
        }

        // Disconnect from previous connection if any
        if (stompClient && connected) {
            disconnectFromDrawing();
        }

        console.info('Connecting to WebSocket for drawing ' + drawingId + '...');
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
                currentDrawingId = drawingId;
                console.log('Successfully connected to WebSocket: ' + frame);
                
                // Update UI
                document.getElementById('connectBtn').textContent = 'Disconnect';
                document.getElementById('connectBtn').classList.remove('btn-primary');
                document.getElementById('connectBtn').classList.add('btn-danger');
                document.getElementById('drawingId').disabled = true;
                
                var status = document.getElementById('connectionStatus');
                status.textContent = 'Connected to drawing ' + drawingId;
                status.className = 'status connected';
                
                // Subscribe to the specific drawing topic
                var topic = '/topic/draw.' + drawingId;
                subscription = stompClient.subscribe(topic, function (message) {
                    try {
                        var point = JSON.parse(message.body);
                        if (point.drawingId === drawingId) {
                            console.log('Received point for drawing ' + drawingId + ': x=' + point.x + ', y=' + point.y);
                            addPointToCanvas(point);
                        }
                    } catch (e) {
                        console.error('Failed to parse message:', e);
                    }
                }, {id: 'drawing-' + drawingId});
                
                console.log('Subscribed to ' + topic);
            },
            function(error) {
                console.error('Error connecting to WebSocket:', error);
                updateConnectionStatus(false);
            }
        );
    };
    
    var disconnectFromDrawing = function() {
        if (subscription) {
            subscription.unsubscribe();
            console.log('Unsubscribed from drawing ' + currentDrawingId);
            subscription = null;
        }
        
        if (stompClient) {
            stompClient.disconnect(function() {
                console.log('Disconnected from WebSocket');
            });
        }
        
        connected = false;
        currentDrawingId = null;
        updateConnectionStatus(false);
    };
    
    var updateConnectionStatus = function(isConnected) {
        var status = document.getElementById('connectionStatus');
        var connectBtn = document.getElementById('connectBtn');
        var drawingIdInput = document.getElementById('drawingId');
        
        if (isConnected) {
            status.textContent = 'Connected to drawing ' + currentDrawingId;
            status.className = 'status connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.classList.remove('btn-primary');
            connectBtn.classList.add('btn-danger');
            drawingIdInput.disabled = true;
        } else {
            status.textContent = 'Disconnected';
            status.className = 'status disconnected';
            connectBtn.textContent = 'Connect';
            connectBtn.classList.remove('btn-danger');
            connectBtn.classList.add('btn-primary');
            drawingIdInput.disabled = false;
        }

    };

    var publishPoint = function(px, py) {
        if (!connected || !currentDrawingId) {
            console.warn('Not connected to a drawing. Please connect first.');
            return;
        }

        var x = parseInt(px);
        var y = parseInt(py);
        console.info("Publishing point at x=" + x + ", y=" + y + " for drawing " + currentDrawingId);
        
        // Create point with drawing ID
        var point = {
            x: x,
            y: y,
            drawingId: currentDrawingId,
            timestamp: new Date().toISOString()
        };
        
        // Draw the point locally first for immediate feedback
        addPointToCanvas(point);
        
        // Send the point to the server
        if (stompClient && stompClient.connected) {
            console.log('Sending point to /app/point for drawing ' + currentDrawingId, point);
            stompClient.send(
                '/app/point', 
                {}, 
                JSON.stringify(point),
                function(message) {
                    console.log('Point acknowledged by server for drawing ' + currentDrawingId);
                }
            );
        } else {
            console.warn('WebSocket not connected. Cannot send point.');
        }
    };

    return {
        init: function () {
            var canvas = document.getElementById("canvas");
            var connectBtn = document.getElementById("connectBtn");
            var drawingIdInput = document.getElementById("drawingId");

            // Add click listener to canvas
            canvas.addEventListener("click", onCanvasClick);
            
            // Handle connect/disconnect button
            connectBtn.addEventListener("click", function() {
                if (connected) {
                    disconnectFromDrawing();
                } else {
                    var drawingId = drawingIdInput.value.trim();
                    if (drawingId) {
                        connectToDrawing(drawingId);
                    } else {
                        alert('Please enter a drawing ID');
                    }
                }
            });
            
            // Allow pressing Enter in the input field to connect
            drawingIdInput.addEventListener("keypress", function(e) {
                if (e.key === 'Enter' && !connected) {
                    var drawingId = drawingIdInput.value.trim();
                    if (drawingId) {
                        connectToDrawing(drawingId);
                    }
                }
            });
            
            // Initial UI state
            updateConnectionStatus(false);
        },
        
        disconnect: function() {
            disconnectFromDrawing();
        },
        
        // For testing
        getCurrentDrawingId: function() {
            return currentDrawingId;
        },
        
        isConnected: function() {
            return connected;
        }
    };

})();