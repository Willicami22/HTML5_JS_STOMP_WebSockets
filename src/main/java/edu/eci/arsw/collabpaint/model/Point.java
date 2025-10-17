/*
 * Copyright (C) 2016 Pivotal Software, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package edu.eci.arsw.collabpaint.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author hcadavid
 */
import java.util.Objects;

public class Point {
    private int x;
    private int y;
    private String drawingId;
    private String timestamp;

    public Point() {
        // Default constructor for JSON deserialization
    }

    @JsonCreator
    public Point(
            @JsonProperty("x") int x, 
            @JsonProperty("y") int y,
            @JsonProperty("drawingId") String drawingId,
            @JsonProperty("timestamp") String timestamp) {
        this.x = x;
        this.y = y;
        this.drawingId = drawingId;
        this.timestamp = timestamp;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    @JsonProperty("drawingId")
    public String getDrawingId() {
        return drawingId;
    }

    public void setDrawingId(String drawingId) {
        this.drawingId = drawingId;
    }

    @JsonProperty("timestamp")
    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point point = (Point) o;
        return x == point.x && 
               y == point.y && 
               Objects.equals(drawingId, point.drawingId) &&
               Objects.equals(timestamp, point.timestamp);
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y, drawingId, timestamp);
    }

    @Override
    public String toString() {
        return "{\"x\":" + x + "," +
               "\"y\":" + y + "," +
               "\"drawingId\":" + (drawingId != null ? "\"" + drawingId + "\"" : "null") + "," +
               "\"timestamp\":" + (timestamp != null ? "\"" + timestamp + "\"" : "null") + 
               "}";
    }
}
