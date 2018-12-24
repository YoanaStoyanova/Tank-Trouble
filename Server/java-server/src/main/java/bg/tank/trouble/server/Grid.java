package bg.tank.trouble.server;

import java.util.Random;

public class Grid {

	private static final int HEIGTH = 500;
	private static final int WIDTH = 800;
	private static final double WALL_DENSITY = 0.55;

	private static final int MAX_H_LINES = 6;
	private static final int MAX_V_LINES = 9;

	private Random RNG;
	
	private boolean horizontalGrid[][];
	private boolean verticalGrid[][];
	

	
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
	
	Grid() {
		horizontalGrid = new boolean[MAX_H_LINES][MAX_V_LINES];
		verticalGrid = new boolean[MAX_H_LINES][MAX_V_LINES];
		
		
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
