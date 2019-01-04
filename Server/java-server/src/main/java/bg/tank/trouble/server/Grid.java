package bg.tank.trouble.server;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

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
    private int dfsGrid[][];
    private List<Integer> connectedList;
	
	private boolean shouldPutWall() {
		return RNG.nextDouble() < WALL_DENSITY;
	}
	
	private boolean isPastVerticalBound(int i) {
		return i <= 0 || i >= (MAX_H_LINES - 1);
	}

	private boolean isPastHorizontalBound(int j) {
		return j <= 0 || j >= (MAX_V_LINES - 1);
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

    private void ensureConnectivity() {

        if (checkConnectivity()) {
            return;
        }

        connectedList = new ArrayList<>();
        connectedList.add(-1);
        connectedList.add(0);
        ddfs(0, 0);
    }

    private boolean checkConnectivity() {
        dfsGrid = new int[MAX_H_LINES][MAX_V_LINES];
        for (int i = 0; i < MAX_H_LINES; i++) {
            for (int j = 0; j < MAX_V_LINES; j++) {
                dfsGrid[i][j] = -1;
            }
        }
        int components = 0;
        for (int i = 0; i < MAX_H_LINES; i++) {
            for (int j = 0; j < MAX_V_LINES; j++) {
                if (dfsGrid[i][j] == -1) {
                    dfs(i, j, components);
                    components++;
                }
            }
        }

        return components == 1;
    }

    private void dfs(int i, int j, int k) {
        if (dfsGrid[i][j] != -1) return;
        dfsGrid[i][j] = k;

        if (!isPastVerticalBound(i + 1) && !horizontalGrid[i + 1][j]) {
            dfs(i + 1, j, k);
        }

        if (!isPastVerticalBound(i) && !horizontalGrid[i][j]) {
            dfs(i - 1, j, k);
        }

        if (!isPastHorizontalBound(j + 1) && !verticalGrid[i][j + 1]) {
            dfs(i, j + 1, k);
        }

        if (!isPastHorizontalBound(j) && !verticalGrid[i][j]) {
            dfs(i, j - 1, k);
        }

    }

    private void ddfs(int i, int j) {
        if (dfsGrid[i][j] == -1) return;

        dfsGrid[i][j] = -1;
        if (!isPastVerticalBound(i + 1)) {
            Integer value = dfsGrid[i + 1][j];
            if (horizontalGrid[i + 1][j] && !connectedList.contains(value)) {
                horizontalGrid[i + 1][j] = false;
                connectedList.add(value);
            }
            ddfs(i + 1, j);
        }

        if (!isPastVerticalBound(i)) {
            Integer value = dfsGrid[i - 1][j];
            if (horizontalGrid[i][j] && !connectedList.contains(value)) {
                horizontalGrid[i][j] = false;
                connectedList.add(value);
            }
            ddfs(i - 1, j);
        }

        if (!isPastHorizontalBound(j + 1)) {
            Integer value = dfsGrid[i][j + 1];
            if (verticalGrid[i][j + 1] && !connectedList.contains(value)) {
                verticalGrid[i][j + 1] = false;
                connectedList.add(value);
            }
            ddfs(i, j + 1);
        }

        if (!isPastHorizontalBound(j)) {
            Integer value = dfsGrid[i][j - 1];
            if (verticalGrid[i][j] && !connectedList.contains(value)) {
                verticalGrid[i][j] = false;
                connectedList.add(value);
            }
            ddfs(i, j - 1);
        }
    }
}
