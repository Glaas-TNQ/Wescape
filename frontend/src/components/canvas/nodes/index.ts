import DestinationNode from './DestinationNode';
import ActivityNode from './ActivityNode';
import RestaurantNode from './RestaurantNode';
import HotelNode from './HotelNode';
import TransportNode from './TransportNode';
import NoteNode from './NoteNode';
import DayDividerNode from './DayDividerNode';
import NestedCanvasNode from './NestedCanvasNode';
import ImageNode from './ImageNode';

export const nodeTypes = {
  destination: DestinationNode,
  activity: ActivityNode,
  restaurant: RestaurantNode,
  hotel: HotelNode,
  transport: TransportNode,
  note: NoteNode,
  dayDivider: DayDividerNode,
  nestedCanvas: NestedCanvasNode,
  image: ImageNode
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
  ImageNode
};

export type NodeType = keyof typeof nodeTypes;