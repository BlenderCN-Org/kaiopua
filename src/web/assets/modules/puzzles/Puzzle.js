/*
 *
 * Puzzles.js
 * Creates and tracks all puzzles.
 *
 * @author Collin Hover / http://collinhover.com/
 *
 */
(function (main) {
    
    var shared = main.shared = main.shared || {},
		assetPath = "assets/modules/puzzles/Puzzle.js",
		_Puzzle = {},
		_Model,
		_Grid,
		puzzleID = 'Puzzle',
		puzzleCount = 0,
		allPuzzles,
		allPuzzlesCompleted,
		allModules;
	
	/*===================================================
	
	public
	
	=====================================================*/
	
	main.asset_register( assetPath, {
		data: _Puzzle,
		requirements: [
			"assets/modules/core/Model.js",
			"assets/modules/puzzles/Grid.js"
		], 
		callbacksOnReqs: init_internal,
		wait: true
	} );

	/*===================================================
	
	init
	
	=====================================================*/
	
	function init_internal ( m, g ) {
		console.log('internal puzzles', _Puzzle);
		_Model = m;
		_Grid = g;
		
		// properties
		
		allPuzzles = [];
		allPuzzlesCompleted = [];
		
		Object.defineProperty( _Puzzle, 'allPuzzles', { 
			get: function () { return allPuzzles.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allPuzzlesCompleted', { 
			get: function () { return allPuzzlesCompleted.slice( 0 ); }
		});
		
		Object.defineProperty( _Puzzle, 'allModules', { 
			get: function () {
				
				var i, l;
				
				// if puzzles list dirty
				
				if ( this._dirtyPuzzles !== false ) {
					
					allModules = [];
					
					for ( i = 0, l = allPuzzles.length; i < l; i++ ) {
						
						allModules = allModules.concat( allPuzzles[ i ].grid.modules );
						
					}
					
					this._dirtyPuzzles = false;
					
				}
				
				return allModules.slice( 0 );
			
			}
		});
		
		// instance
		
		_Puzzle.Instance = Puzzle;
		_Puzzle.Instance.prototype = new _Model.Instance();
		_Puzzle.Instance.prototype.constructor = _Puzzle.Instance;
		
		_Puzzle.Instance.prototype.reset = reset;
		_Puzzle.Instance.prototype.complete = complete;
		_Puzzle.Instance.prototype.on_state_changed = on_state_changed;
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'isCompleted', { 
			get: function () {
				
				return this.grid.isFull;
			
			}
		});
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'occupants', { 
			get: function () {
				
				return this.grid.occupants;
			
			}
		});
		
		Object.defineProperty( _Puzzle.Instance.prototype, 'elements', { 
			get: function () {
				
				return this.grid.elements;
			
			}
		});
		
	}
	
	/*===================================================
	
	puzzle
	
	=====================================================*/
	
	function Puzzle ( parameters ) {
		
		puzzleCount++;
		
		// handle parameters
		
		parameters = parameters || {};
		
		parameters.grid = parameters.grid || {};
		parameters.grid.puzzle = this;
		
		// prototype constructor
		
		_Model.Instance.call( this, parameters );
		
		// properties
		
		this.id = typeof parameters.id === 'string' ? parameters.id : puzzleID + puzzleCount;
		this.completed = false;
		
		// signals
		
		this.stateChanged = new signals.Signal();
		
		// grid
		
		this.grid = new _Grid.Instance( parameters.grid );
		this.grid.stateChanged.add( this.on_state_changed, this );
		
		this.add( this.grid );
		
		// reset self
		
		this.reset();
		
		shared.signals.gamestop.add( this.reset, this );
		
		// add to global list
		
		if ( this.grid.modules.length > 0 ) {
			
			// add to puzzles list
			
			allPuzzles.push( this );
			
			_Puzzle._dirtyPuzzles = true;
			
		}
		
	}
	
	/*===================================================
	
	reset
	
	=====================================================*/
	
	function reset () {
		
		// grid
		
		this.grid.reset();
		
		// properties
		
		this.completed = false;
		
	}
	
	/*===================================================
	
	completed
	
	=====================================================*/
	
	function complete () {
		
		// set completed
		
		this.completed = this.grid.isFull;
		console.log( 'puzzle complete?', this.completed, this);
		// if completed
		
		if ( this.completed === true ) {
			
			// add to list
			
			if ( allPuzzlesCompleted.indexOf( this ) === -1 ) {
				
				allPuzzlesCompleted.push( this );
				
			}
			
			// complete grid
			
			this.grid.complete();
			
		}
		
	}
	
	/*===================================================
	
	state
	
	=====================================================*/
	
	function on_state_changed ( module ) {
		
		console.log(' PUZZLE GRID STATE CHANGE for ', this.id );
		this.stateChanged.dispatch( module );
		
	}
	
} (KAIOPUA) );