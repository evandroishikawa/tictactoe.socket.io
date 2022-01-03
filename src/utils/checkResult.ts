import { TBoard } from '@/types/board';
import { TPlayer } from '@/types/player';

type TPlay = TPlayer | null;

function equals(a: TPlay, b: TPlay, c: TPlay) {
  if (!a || !b || !c) return false;

  if (a === b && b === c) return true;

  return false;
}

export function checkResult(turn: number, board: TBoard) {
  if (turn < 5) return null;

  if (equals(board[0][0], board[1][1], board[2][2])) return board[0][0];

  if (equals(board[0][2], board[1][1], board[2][0])) return board[0][2];

  for (let i = 0; i < board.length; i++) {
    if (equals(board[i][0], board[i][1], board[i][2]))
      return board[i][0];

    if (equals(board[0][i], board[1][i], board[2][i]))
      return board[0][i];
  }

  if (turn === 9) return 'DRAW';

  return null;
}
