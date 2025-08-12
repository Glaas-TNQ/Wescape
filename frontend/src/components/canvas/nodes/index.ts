import DestinationNode from './DestinationNode';
import ActivityNode from './ActivityNode';
import RestaurantNode from './RestaurantNode';
import HotelNode from './HotelNode';
import TransportNode from './TransportNode';
import NoteNode from './NoteNode';
import DayDividerNode from './DayDividerNode';
import NestedCanvasNode from './NestedCanvasNode';
import ImageNode from './ImageNode';
import PinterestPinNode from './PinterestPinNode';
import PinterestBoardNode from './PinterestBoardNode';

export const nodeTypes = {
  destination: DestinationNode,
  activity: ActivityNode,
  restaurant: RestaurantNode,
  hotel: HotelNode,
  transport: TransportNode,
  note: NoteNode,
  dayDivider: DayDividerNode,
  nestedCanvas: NestedCanvasNode,
  image: ImageNode,
  pinterestPin: PinterestPinNode,
  pinterestBoard: PinterestBoardNode,
};

export {
  DestinationNode,
  ActivityNode,
  RestaurantNode,
  HotelNode,
  TransportNode,
  NoteNode,
  DayDividerNode,
  NestedCanvasNode,
  ImageNode,
  PinterestPinNode,
  PinterestBoardNode,
};

export type NodeType = keyof typeof nodeTypes;