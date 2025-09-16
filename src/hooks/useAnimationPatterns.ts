import { useState, useCallback, useRef, useEffect } from 'react';

export type AnimationPattern = 
  | 'gameOfLife'
  | 'ripple'
  | 'wave'
  | 'rain'
  | 'spiral'
  | 'noise'
  | 'rule30'
  | 'image';

export interface AnimationState {
  isRunning: boolean;
  currentPattern: AnimationPattern;
  generation: number;
  patternState: any;
  activeLetterIndex: number | null;
  baselineGrid: number[][] | null;
}

export interface UseAnimationPatternsOptions {
  rows: number;
  cols: number;
  animationSpeed?: number;
  maxGenerations?: number;
  onPatternChange?: (pattern: AnimationPattern) => void;
  onAnimationStart?: (pattern: AnimationPattern) => void;
  onAnimationStop?: () => void;
}

export interface UseAnimationPatternsReturn {
  grid: number[][];
  animationState: AnimationState;
  startAnimation: (pattern: AnimationPattern, letterIndex: number) => void;
  stopAnimation: () => void;
  changePattern: (pattern: AnimationPattern) => void;
  resetGrid: () => void;
  randomizeGrid: () => void;
  createEmptyGrid: () => number[][];
  createRandomGrid: () => number[][];
}

export const useAnimationPatterns = ({
  rows,
  cols,
  animationSpeed = 150,
  maxGenerations = 500,
  onPatternChange,
  onAnimationStart,
  onAnimationStop
}: UseAnimationPatternsOptions): UseAnimationPatternsReturn => {
  const [grid, setGrid] = useState<number[][]>(() => 
    new Array(rows).fill(0).map(() => new Array(cols).fill(0))
  );
  
  const [animationState, setAnimationState] = useState<AnimationState>({
    isRunning: false,
    currentPattern: 'gameOfLife',
    generation: 0,
    patternState: {},
    activeLetterIndex: null,
    baselineGrid: null
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Create empty grid
  const createEmptyGrid = useCallback(() => {
    return new Array(rows).fill(0).map(() => new Array(cols).fill(0));
  }, [rows, cols]);

  // Create random grid
  const createRandomGrid = useCallback(() => {
    return new Array(rows).fill(0).map(() => 
      new Array(cols).fill(0).map(() => (Math.random() > 0.7 ? 1 : 0))
    );
  }, [rows, cols]);

  // Count neighbors for Game of Life
  const countNeighbors = useCallback((currentGrid: number[][], row: number, col: number) => {
    let count = 0;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        count += currentGrid[newRow][newCol];
      }
    }
    return count;
  }, [rows, cols]);

  // Game of Life step
  const gameOfLifeStep = useCallback((currentGrid: number[][]) => {
    const newGrid = createEmptyGrid();
    let hasChanged = false;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const neighbors = countNeighbors(currentGrid, row, col);
        const currentCell = currentGrid[row][col];

        if (currentCell === 1) {
          newGrid[row][col] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          newGrid[row][col] = neighbors === 3 ? 1 : 0;
        }
        
        if (newGrid[row][col] !== currentCell) {
          hasChanged = true;
        }
      }
    }
    return { newGrid, hasChanged };
  }, [rows, cols, countNeighbors, createEmptyGrid]);

  // Ripple step
  const rippleStep = useCallback((currentGrid: number[][], state: any) => {
    const newGrid = createEmptyGrid();
    const { ripples = [] } = state;

    // Add new ripple occasionally
    const newRipples = [...ripples];
    if (Math.random() < 0.05) {
      newRipples.push({
        centerRow: Math.floor(Math.random() * rows),
        centerCol: Math.floor(Math.random() * cols),
        radius: 0,
        maxRadius: Math.random() * 15 + 5,
      });
    }

    // Update existing ripples
    for (let i = newRipples.length - 1; i >= 0; i--) {
      const ripple = newRipples[i];
      ripple.radius += 0.5;

      if (ripple.radius > ripple.maxRadius) {
        newRipples.splice(i, 1);
        continue;
      }

      // Draw ripple
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const distance = Math.sqrt(
            Math.pow(row - ripple.centerRow, 2) + Math.pow(col - ripple.centerCol, 2)
          );

          if (Math.abs(distance - ripple.radius) < 1) {
            newGrid[row][col] = 1;
          }
        }
      }
    }

    return { newGrid, hasChanged: true, patternState: { ripples: newRipples } };
  }, [rows, cols, createEmptyGrid]);

  // Wave step
  const waveStep = useCallback((currentGrid: number[][], state: any) => {
    const newGrid = createEmptyGrid();
    const time = state.time || 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const wave1 = Math.sin(col * 0.2 + time * 0.1);
        const wave2 = Math.sin(row * 0.3 + time * 0.15);
        const combined = (wave1 + wave2) / 2;

        newGrid[row][col] = combined > 0.3 ? 1 : 0;
      }
    }

    return { newGrid, hasChanged: true, patternState: { time: time + 1 } };
  }, [rows, cols, createEmptyGrid]);

  // Rain step
  const rainStep = useCallback((currentGrid: number[][]) => {
    const newGrid = [...currentGrid.map((row) => [...row])];

    // Add new raindrops at top
    for (let col = 0; col < cols; col++) {
      if (Math.random() < 0.05) {
        newGrid[0][col] = 1;
      }
    }

    // Move existing drops down
    for (let row = rows - 1; row > 0; row--) {
      for (let col = 0; col < cols; col++) {
        if (currentGrid[row - 1][col] === 1) {
          newGrid[row][col] = 1;
          newGrid[row - 1][col] = 0;
        }
      }
    }

    // Clear bottom row
    for (let col = 0; col < cols; col++) {
      if (Math.random() < 0.3) {
        newGrid[rows - 1][col] = 0;
      }
    }

    return { newGrid, hasChanged: true };
  }, [rows, cols]);

  // Spiral step
  const spiralStep = useCallback((currentGrid: number[][], state: any) => {
    const newGrid = createEmptyGrid();
    const time = state.time || 0;
    const centerRow = rows / 2;
    const centerCol = cols / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = col - centerCol;
        const dy = row - centerRow;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);

        const spiralValue = Math.sin(angle * 3 + distance * 0.5 - time * 0.2);
        newGrid[row][col] = spiralValue > 0.5 ? 1 : 0;
      }
    }

    return { newGrid, hasChanged: true, patternState: { time: time + 1 } };
  }, [rows, cols, createEmptyGrid]);

  // Noise step
  const noiseStep = useCallback((currentGrid: number[][]) => {
    const newGrid = createEmptyGrid();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newGrid[row][col] = Math.random() > 0.8 ? 1 : 0;
      }
    }

    return { newGrid, hasChanged: true };
  }, [rows, cols, createEmptyGrid]);

  // Rule 30 step
  const rule30Step = useCallback((currentGrid: number[][]) => {
    const newGrid = [...currentGrid.map((row) => [...row])];

    // Apply Rule 30 to middle row
    const middleRow = Math.floor(rows / 2);
    const currentRow = currentGrid[middleRow];

    for (let col = 1; col < cols - 1; col++) {
      const left = currentRow[col - 1];
      const center = currentRow[col];
      const right = currentRow[col + 1];

      // Rule 30: 111->0, 110->0, 101->0, 100->1, 011->1, 010->1, 001->1, 000->0
      const pattern = (left << 2) | (center << 1) | right;
      newGrid[middleRow][col] = [0, 1, 1, 1, 1, 0, 0, 0][pattern];
    }

    // Shift other rows
    for (let row = 0; row < rows; row++) {
      if (row !== middleRow) {
        for (let col = cols - 1; col > 0; col--) {
          newGrid[row][col] = currentGrid[row][col - 1];
        }
        newGrid[row][0] = 0;
      }
    }

    return { newGrid, hasChanged: true };
  }, [rows, cols]);

  // Execute pattern
  const executePattern = useCallback((
    currentGrid: number[][], 
    pattern: AnimationPattern, 
    state: any
  ): { newGrid: number[][]; hasChanged: boolean; patternState?: any } => {
    switch (pattern) {
      case 'gameOfLife':
        return gameOfLifeStep(currentGrid);
      case 'ripple':
        return rippleStep(currentGrid, state);
      case 'wave':
        return waveStep(currentGrid, state);
      case 'rain':
        return rainStep(currentGrid);
      case 'spiral':
        return spiralStep(currentGrid, state);
      case 'noise':
        return noiseStep(currentGrid);
      case 'rule30':
        return rule30Step(currentGrid);
      default:
        return { newGrid: currentGrid, hasChanged: false };
    }
  }, [gameOfLifeStep, rippleStep, waveStep, rainStep, spiralStep, noiseStep, rule30Step]);

  // Animation loop
  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastUpdateTimeRef.current;

    if (elapsed > animationSpeed) {
      lastUpdateTimeRef.current = now - (elapsed % animationSpeed);

      // Compute next grid from the current snapshot and update state in the same tick
      setGrid((currentGrid) => {
        let returnedGrid = currentGrid;

        setAnimationState((prevState) => {
          if (!prevState.isRunning) return prevState;

          const { newGrid, hasChanged, patternState } = executePattern(
            currentGrid,
            prevState.currentPattern,
            prevState.patternState
          );

          // Decide stop or continue and set the grid to reflect the same frame
          if (prevState.currentPattern === 'gameOfLife' && !hasChanged) {
            onAnimationStop?.();
            returnedGrid = currentGrid; // keep grid as-is when stopping
            return { ...prevState, isRunning: false };
          }

          if (prevState.generation >= maxGenerations) {
            onAnimationStop?.();
            returnedGrid = currentGrid; // keep grid as-is when stopping
            return { ...prevState, isRunning: false };
          }

          // Continue running: advance grid immediately and bump state
          returnedGrid = newGrid;
          return {
            ...prevState,
            generation: prevState.generation + 1,
            patternState: patternState ?? prevState.patternState,
          };
        });

        return returnedGrid;
      });
    }

    setAnimationState((prevState) => {
      if (prevState.isRunning) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
      return prevState;
    });
  }, [animationSpeed, executePattern, maxGenerations, onAnimationStop]);

  // Start animation
  const startAnimation = useCallback((pattern: AnimationPattern, letterIndex: number) => {
    setAnimationState(prev => ({
      ...prev,
      isRunning: true,
      currentPattern: pattern,
      generation: 0,
      patternState: {},
      activeLetterIndex: letterIndex,
      baselineGrid: prev.baselineGrid || grid.map(row => [...row])
    }));
    onAnimationStart?.(pattern);
  }, [onAnimationStart]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    setAnimationState(prev => {
      // Restore baseline if present
      if (prev.baselineGrid) {
        setGrid(prev.baselineGrid.map(row => [...row]));
      }
      
      return {
        ...prev,
        isRunning: false,
        activeLetterIndex: null
      };
    });
    
    onAnimationStop?.();
  }, [onAnimationStop]);

  // Change pattern
  const changePattern = useCallback((pattern: AnimationPattern) => {
    setAnimationState(prev => ({
      ...prev,
      currentPattern: pattern,
      generation: 0,
      patternState: {}
    }));
    onPatternChange?.(pattern);

    // Set appropriate initial state for each pattern
    if (pattern === 'gameOfLife' || pattern === 'noise') {
      setGrid(createRandomGrid());
    } else if (pattern === 'rule30') {
      const newGrid = createEmptyGrid();
      newGrid[Math.floor(rows / 2)][Math.floor(cols / 2)] = 1;
      setGrid(newGrid);
    } else {
      setGrid(createEmptyGrid());
    }
  }, [createRandomGrid, createEmptyGrid, rows, cols, onPatternChange]);

  // Reset grid
  const resetGrid = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      isRunning: false,
      generation: 0,
      patternState: {},
      activeLetterIndex: null
    }));
    setGrid(createEmptyGrid());
  }, [createEmptyGrid]);

  // Randomize grid
  const randomizeGrid = useCallback(() => {
    setAnimationState(prev => ({
      ...prev,
      isRunning: false,
      generation: 0,
      patternState: {},
      activeLetterIndex: null
    }));
    setGrid(createRandomGrid());
  }, [createRandomGrid]);

  // Animation effect
  useEffect(() => {
    if (animationState.isRunning) {
      lastUpdateTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationState.isRunning, animate]);

  return {
    grid,
    animationState,
    startAnimation,
    stopAnimation,
    changePattern,
    resetGrid,
    randomizeGrid,
    createEmptyGrid,
    createRandomGrid
  };
};
