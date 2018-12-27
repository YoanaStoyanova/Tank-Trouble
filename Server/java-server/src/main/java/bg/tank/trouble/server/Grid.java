package bg.tank.trouble.server;

import java.util.Random;
import org.json.JSONObject;


import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "arenaWidth",
        "arenaHeight",
        "horGrid",
        "verGrid",
        "hLines",
        "vLines",
        "widthPerRect",
        "heightPerRect",
        "maxHlines",
        "maxVlines"    
})

public class Grid {

    @JsonProperty("arenaHeight")
	private final int HEIGTH = 500;
    @JsonProperty("arenaWidth")
	private final int WIDTH = 800;
	private final double WALL_DENSITY = 0.55;

    @JsonProperty("maxHlines")
	private final int MAX_H_LINES = 6;
    @JsonProperty("maxVlines")
	private final int MAX_V_LINES = 9;
	
    @JsonProperty("hLines")
	private int hLines [][];
    @JsonProperty("vLines")
	private int vLines [][];
    
    @JsonProperty("widthPerRect")
	private final double widthPerRect = WIDTH / (double) (MAX_V_LINES - 1);
    @JsonProperty("heightPerRect")
	private final double heightPerRect = HEIGTH / (double) (MAX_H_LINES - 1);
	
    @JsonProperty("horGrid")
	private boolean horizontalGrid[][];
	@JsonProperty("verGrid")
	private boolean verticalGrid[][];
	
	
	private String state;
	private Random RNG;
	
	
	
	
	/*
	 * Directly returning a string might not be a good idea
	 * if the string is too big
	 */
//	public JSONObject getGridJSON() {
//
//		
//		JSONObject json = new JSONObject();
//		json.put("arenaWidth", WIDTH);
//		json.put("arenaHeight", HEIGTH);
//		json.put("horGrid", horizontalGrid);
//		json.put("verGrid", verticalGrid);
//		json.put("hLines", hLines);
//		json.put("vLines", vLines);
//		json.put("widthPerRect", widthPerRect);
//		json.put("heightPerRect", heightPerRect);
//		json.put("maxHlines", MAX_H_LINES);
//		json.put("maxVlines", MAX_V_LINES);
//		
//		return json;
//	}
//	
	private boolean shouldPutWall() {
		return RNG.nextDouble() < WALL_DENSITY;
	}
	
	private boolean isPastVerticalBound(int i) {
		return i <= 0 || i >= (MAX_H_LINES - 1);
	}

	private boolean isPastHorizontalBound(int j) {
		return j <= 0 || j >= (MAX_V_LINES - 1);
	}
	
	private boolean checkConnectivity() {
		
		return false;
	}
	private void ensureConnectivity() {
		
		if (checkConnectivity()) {
			return;
		}
		
		/* code to remove walls that impede connectivity */
	}
	 
	public void changeToRunning() {
		state = "running";
	}
	
	Grid() {
		horizontalGrid = new boolean[MAX_H_LINES][MAX_V_LINES];
		verticalGrid = new boolean[MAX_H_LINES][MAX_V_LINES];
		
		hLines = new int[MAX_H_LINES][MAX_V_LINES];
		vLines = new int[MAX_H_LINES][MAX_V_LINES];
		
		state = "waitingPlayers";
		
		RNG = new Random();
		
		
		for (int i = 0; i < MAX_H_LINES; i++) {
			for (int j = 0; j < MAX_V_LINES; j++) {
				horizontalGrid[i][j] = shouldPutWall();
				verticalGrid[i][j] = shouldPutWall();
				
				// now put wall on the edges on the grid
				if (isPastVerticalBound(i)) {
					horizontalGrid[i][j] = true;
				}
				
				if (isPastHorizontalBound(j)) {
					verticalGrid[i][j] = true;
				}
			}
		}

		ensureConnectivity();
	}
}
