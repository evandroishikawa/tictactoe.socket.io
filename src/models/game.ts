import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { v4 as uuid } from 'uuid';

import { TBoard } from '@/types/board';
import { TPlayer, IPlayer } from '@/types/player';
import { TResult } from '@/types/result';

import { checkResult } from '@/utils/checkResult';

interface IPlay {
  x: number;
  y: number;
}

let initialPlayer: TPlayer = 'X';

export default class Game {
  private _board: TBoard;
  private _result: TResult;
  private _turn: number;
  private _players: IPlayer[];
  private _currentPlayer: TPlayer;
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

  constructor(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) {
    this._board = Array(3).fill(Array(3).fill(null));
    this._turn = 0;
    this._result = null;
    this._currentPlayer = initialPlayer;
    this.io = io;
    this._players = [
      { id: uuid(), symbol: 'X' },
      { id: uuid(), symbol: 'O' }
    ];
  }

  get board() {
    return this._board;
  }

  get turn() {
    return this._turn;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  get result() {
    return this._result;
  }

  public setPlayer(socketID: string) {
    if (this._players.filter(({ socketID }) => !!socketID).length > 2) throw new Error('Max players limit reached');

    const [player1, player2] = this._players;

    if (!player1.socketID) {
      player1.socketID = socketID;

      this.io.to(socketID).emit('game.setPlayer', {
        player: player1,
        currentPlayer: this.currentPlayer,
      });
    } else if (!player2.socketID) {
      player2.socketID = socketID;

      this.io.to(socketID).emit('game.setPlayer', {
        player: player2,
        currentPlayer: this.currentPlayer,
      });
    }
  }

  public unsetPlayer(socketId: string) {
    const player = this._players.find(({ socketID }) => socketID === socketId);

    if (!player) return;

    player.socketID = undefined;
  }

  public play({ x, y }: IPlay) {
    this._board = this._board.map((line, xIndex) => xIndex === x
      ? line.map((tile, yIndex) => y === yIndex ? this._currentPlayer : tile)
      : line
    );

    this._turn++;
    this._result = checkResult(this._turn, this._board);
    this._currentPlayer = this._currentPlayer === 'X' ? 'O' : 'X';

    if (this._result) this.io.emit('game.result', this.result);

    this.io.emit('game.changeTurn', this.turn);

    this.io.emit('game.play', {
      board: this.board,
      nextPlayer: this._currentPlayer === 'X' ? 'O' : 'X',
    });
  }

  public resetGame() {
    this._result = null;
    this._board = Array(3).fill(Array(3).fill(null));
    this._turn = 0;
    this._currentPlayer = initialPlayer === 'X' ? 'O' : 'X';
    initialPlayer = initialPlayer === 'X' ? 'O' : 'X';

    this.io.emit('game.result', this._result);
    this.io.emit('game.changeTurn', this._turn);

    this.io.emit('game.reset', {
      board: this.board,
      nextPlayer: this.currentPlayer,
    });
  }
}
