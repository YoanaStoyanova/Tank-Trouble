package bg.tank.trouble.server;

import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "player",
        "coords",
        "angle"
})
public class PlayerMove {

    @JsonProperty("player")
    private String player;
    @JsonProperty("coords")
    private Coords coords;
    @JsonProperty("angle")
    private Double angle;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("player")
    public String getPlayer() {
        return player;
    }

    @JsonProperty("player")
    public void setPlayer(String player) {
        this.player = player;
    }

    @JsonProperty("coords")
    public Coords getCoords() {
        return coords;
    }

    @JsonProperty("coords")
    public void setCoords(Coords coords) {
        this.coords = coords;
    }

    @JsonProperty("angle")
    public Double getAngle() {
        return angle;
    }

    @JsonProperty("angle")
    public void setAngle(Double angle) {
        this.angle = angle;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

}