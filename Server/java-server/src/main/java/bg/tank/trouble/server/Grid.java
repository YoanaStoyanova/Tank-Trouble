package bg.tank.trouble.server;

import java.util.Random;

import org.json.JSONObject;

public class Grid {

	private static final int HEIGTH = 500;
	private static final int WIDTH = 800;
	private static final double WALL_DENSITY = 0.55;

	private static final int MAX_H_LINES = 6;
	private static final int MAX_V_LINES = 9;
	
	private int hLines [][];
	private int vLines [][];
	private String state;
	private Random RNG;
	
	private boolean horizontalGrid[][];
	private boolean verticalGrid[][];
	
	
	/*
	 * Directly returning a string might not be a good idea
	 * if the string is too big
	 */
	public JSONObject getGridJSON() {
		double widthPerRect = WIDTH / MAX_V_LINES;
		double heightPerRect = HEIGTH / MAX_H_LINES;
		
		JSONObject json = new JSONObject();
		json.put("arenaWidth", WIDTH);
		json.put("arenaHeight", HEIGTH);
		json.put("horGrid", horizontalGrid);
		json.put("verGrid", verticalGrid);
		json.put("hLines", hLines);
		json.put("vLines", vLines);
		json.put("widthPerRect", widthPerRect);
		json.put("heightPerRect", heightPerRect);
		json.put("maxHlines", MAX_H_LINES);
		json.put("maxVLines", MAX_V_LINES);
		
		return json;
	}
	
	private boolean shouldPutWall() {
		return RNG.nextDouble() < WALL_DENSITY;
	}
	
	private boolean isPastVerticalBound(int i) {
		return i <= 0 || i >= MAX_H_LINES;
	}

	private boolean isPastHorizontalBound(int j) {
		return j <= 0 || j >= MAX_V_LINES;
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
