    const board = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const bestDisplay = document.getElementById('best');
    const popup = document.getElementById('losePopup');

    let grid, score = 0, best = localStorage.getItem('bestScore') || 0;
    bestDisplay.textContent = best;

    function initGame() {
      grid = Array(4).fill().map(() => Array(4).fill(0));
      score = 0;
      popup.classList.remove('show');
      addTile(); addTile();
      updateBoard();
    }

    function restartGame() { initGame(); }

    function addTile() {
      let emptyCells = [];
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (!grid[i][j]) emptyCells.push({i,j});
      if (!emptyCells.length) return;
      const {i,j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }

    function updateBoard() {
      board.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          const tile = document.createElement('div');
          tile.className = 'tile';
          const value = grid[i][j];
          if (value) { tile.textContent = value; tile.style.background = getTileColor(value); tile.classList.add('new'); }
          board.appendChild(tile);
        }
      }
      scoreDisplay.textContent = score;
      if(checkLose()) popup.classList.add('show');
    }

    function getTileColor(value) {
      const colors = {2:'#eee4da',4:'#ede0c8',8:'#f2b179',16:'#f59563',32:'#f67c5f',64:'#f65e3b',128:'#edcf72',256:'#edcc61',512:'#edc850',1024:'#edc53f',2048:'#edc22e'};
      return colors[value]||'#3c3a32';
    }

    document.addEventListener('keydown', handleInput);
    function handleInput(e){
  // Only arrow keys
  const arrowKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
  if (!arrowKeys.includes(e.key)) return;

  e.preventDefault(); // <-- prevent page scrolling

  let moved=false;
  switch(e.key){
    case 'ArrowUp': moved=moveUp(); break;
    case 'ArrowDown': moved=moveDown(); break;
    case 'ArrowLeft': moved=moveLeft(); break;
    case 'ArrowRight': moved=moveRight(); break;
  }
  if(moved) updateAfterMove();
}


    function updateAfterMove(){
      addTile(); updateBoard();
      if(score>best){ best=score; localStorage.setItem('bestScore',best); bestDisplay.textContent=best; }
    }

    function slide(row){ 
      row=row.filter(v=>v); 
      for(let i=0;i<row.length-1;i++){ if(row[i]===row[i+1]){ row[i]*=2; score+=row[i]; row[i+1]=0; } } 
      row=row.filter(v=>v); while(row.length<4) row.push(0); return row; 
    }

    function moveLeft(){let moved=false; for(let i=0;i<4;i++){ let original=[...grid[i]]; let newRow=slide(grid[i]); grid[i]=newRow; if(original.toString()!==newRow.toString()) moved=true; } return moved;}
    function moveRight(){let moved=false; for(let i=0;i<4;i++){ let original=[...grid[i]]; let newRow=slide(grid[i].reverse()).reverse(); grid[i]=newRow; if(original.toString()!==newRow.toString()) moved=true; } return moved;}
    function moveUp(){let moved=false; for(let j=0;j<4;j++){ let col=[grid[0][j],grid[1][j],grid[2][j],grid[3][j]]; let original=[...col]; let newCol=slide(col); for(let i=0;i<4;i++) grid[i][j]=newCol[i]; if(original.toString()!==newCol.toString()) moved=true; } return moved;}
    function moveDown(){let moved=false; for(let j=0;j<4;j++){ let col=[grid[0][j],grid[1][j],grid[2][j],grid[3][j]]; let original=[...col]; let newCol=slide(col.reverse()).reverse(); for(let i=0;i<4;i++) grid[i][j]=newCol[i]; if(original.toString()!==newCol.toString()) moved=true; } return moved;}

    // --- Touch Support (swipe only) ---
    let touchStartX=0, touchStartY=0;
    const minSwipe = 30;
    board.addEventListener('touchstart', e => {
      const touch = e.touches[0]; touchStartX = touch.clientX; touchStartY = touch.clientY;
    });
    board.addEventListener('touchmove', e => { e.preventDefault(); }, {passive:false}); // prevent scroll while swiping
    board.addEventListener('touchend', e => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if(Math.abs(deltaX)<minSwipe && Math.abs(deltaY)<minSwipe) return; // ignore taps
      if(Math.abs(deltaX) > Math.abs(deltaY)) { if(deltaX>0) moveRight(); else moveLeft(); }
      else { if(deltaY>0) moveDown(); else moveUp(); }
      updateAfterMove();
    });

    function checkLose(){
      for(let i=0;i<4;i++) for(let j=0;j<4;j++) if(grid[i][j]===0) return false;
      for(let i=0;i<4;i++) for(let j=0;j<3;j++) if(grid[i][j]===grid[i][j+1]) return false;
      for(let j=0;j<4;j++) for(let i=0;i<3;i++) if(grid[i][j]===grid[i+1][j]) return false;
      return true;
    }

    initGame();