export type TPlayer = 'X' | 'O';

export interface IPlayer {
  id: string;
  symbol: TPlayer;
  socketID?: string;
}
