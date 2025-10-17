package edu.eci.arsw.collabpaint.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class StompController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/newpoint")
    @SendTo("/topic/newpoint")
    public Point handlePoint(Point pt) throws Exception {
        System.out.println("Point received: x=" + pt.getX() + ", y=" + pt.getY());
        return pt;
    }
}